import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// Exponential decay — reduces topic weights over time if not engaged.
// Rate-limited to once per hour per user via Redis to avoid running expensive
// DB writes on every feed request.
export async function applyWeightDecay(userId: string) {
  const decayKey = `decay:${userId}`;

  try {
    const alreadyRan = await redis.get(decayKey);
    if (alreadyRan) return; // already ran within the last hour
    // Mark as ran; expires in 1 hour
    await redis.set(decayKey, "1", "EX", 60 * 60);
  } catch {
    // Redis unavailable — run decay anyway (fallback)
  }

  const userTopics = await prisma.userTopic.findMany({
    where: { userId, status: "ACTIVE" },
  });

  const updates: Promise<unknown>[] = [];
  for (const ut of userTopics) {
    if (!ut.lastEngagedAt) continue;
    const daysSinceEngaged =
      (Date.now() - ut.lastEngagedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEngaged > 3) {
      const decayFactor = Math.exp(-0.05 * daysSinceEngaged);
      const newWeight = Math.max(ut.weight * decayFactor, 0.1);
      updates.push(
        prisma.userTopic.update({
          where: { id: ut.id },
          data: { weight: parseFloat(newWeight.toFixed(4)) },
        })
      );
    }
  }

  if (updates.length > 0) await Promise.all(updates);
}

// Compute base score for an article (topic weight × recency × image bonus).
// Diversity penalties are applied separately in the greedy selection pass.
export function scoreArticle(
  article: any,
  topicWeightMap: Map<string, number>
): number {
  // 1. Topic weight score
  const weight = article.topicId
    ? (topicWeightMap.get(article.topicId) ?? 1.0)
    : 1.0;

  // 2. Recency score — exponential decay, half-life ~24 hours over 72h window
  const ageMs = Date.now() - new Date(article.publishedAt ?? article.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / 72);

  // 3. Image bonus — small boost for visual articles
  const imageBonus = article.imageUrl ? 1.05 : 1.0;

  return weight * recencyScore * imageBonus;
}

// Greedy diversity-aware selection.
// After ranking by base score, re-score each candidate article using penalties
// based on what has ALREADY been selected — giving accurate diversity bonuses.
export function greedyDiverseSelect(
  candidates: any[],
  topicWeightMap: Map<string, number>,
  limit: number
): any[] {
  const selected: any[] = [];
  const remaining = [...candidates];
  const seenSources = new Map<string, number>();
  const seenTopics = new Map<string, number>();

  while (selected.length < limit && remaining.length > 0) {
    // Score each remaining article against the current seen-state
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const a = remaining[i];
      const base = scoreArticle(a, topicWeightMap);

      // Source penalty: each repeated source gets 10% discount
      const srcCount = seenSources.get(a.source) ?? 0;
      const srcBonus = Math.pow(0.9, srcCount);

      // Topic penalty: penalise same topic clustering
      const topicCount = a.topicId ? (seenTopics.get(a.topicId) ?? 0) : 0;
      const topicBonus = Math.pow(0.85, topicCount);

      const score = base * srcBonus * topicBonus;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }

    const chosen = remaining.splice(bestIdx, 1)[0];
    selected.push({ ...chosen, _score: bestScore });
    seenSources.set(chosen.source, (seenSources.get(chosen.source) ?? 0) + 1);
    if (chosen.topicId) {
      seenTopics.set(chosen.topicId, (seenTopics.get(chosen.topicId) ?? 0) + 1);
    }
  }

  return selected;
}

// Redundancy suppression — remove near-duplicate titles
export function suppressRedundancy(articles: any[]): any[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    // Normalize title: lowercase, remove punctuation, take first 6 words
    const normalized = article.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .slice(0, 6)
      .join(" ");

    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// Trend slot injection — inject trending articles outside user's topics
export async function injectTrendSlots(
  articles: any[],
  userTopicIds: string[],
  count = 2
): Promise<any[]> {
  try {
    // Fetch recent popular content from topics the user hasn't selected
    const trending = await prisma.content.findMany({
      where: {
        topicId: { notIn: userTopicIds },
        publishedAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 48) }, // last 48hrs
        imageUrl: { not: null }, // prefer articles with images
      },
      orderBy: { publishedAt: "desc" },
      take: count,
      include: { topic: true },
    });

    if (trending.length === 0) return articles;

    // Inject trending slots at positions 5 and 15
    const result = [...articles];
    const slots = [4, 14].slice(0, trending.length);
    for (let i = 0; i < slots.length; i++) {
      const pos = Math.min(slots[i], result.length);
      result.splice(pos, 0, {
        ...trending[i],
        isLiked: false,
        isSaved: false,
        _isTrending: true,
      });
    }
    return result;
  } catch {
    return articles;
  }
}

// Diversity pass — interleave topics so feed isn't clustered
export function diversifyFeed(articles: any[]): any[] {
  const byTopic = new Map<string, any[]>();
  for (const article of articles) {
    const key = article.topicId ?? "unknown";
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(article);
  }

  const result: any[] = [];
  const queues = Array.from(byTopic.values());
  let i = 0;
  while (result.length < articles.length) {
    const queue = queues[i % queues.length];
    if (queue && queue.length > 0) result.push(queue.shift());
    i++;
    if (queues.every((q) => q.length === 0)) break;
  }
  return result;
}

// Generate "Why this post?" reason
export function generateReason(
  article: any,
  topicWeightMap: Map<string, number>,
  isTrending: boolean
): string {
  if (isTrending) return "📈 Trending outside your topics";

  const weight = article.topicId
    ? (topicWeightMap.get(article.topicId) ?? 1.0)
    : 1.0;

  const ageMs = Date.now() - new Date(article.publishedAt ?? article.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  const topicName = article.topic?.name ?? "this topic";
  const emoji = article.topic?.emoji ?? "";

  if (weight >= 2.0) return `${emoji} You engage a lot with ${topicName}`;
  if (weight >= 1.5) return `${emoji} You've shown interest in ${topicName}`;
  if (ageHours < 6) return `⚡ Published ${Math.round(ageHours)}h ago — very fresh`;
  if (ageHours < 24) return `🕐 Published today from ${topicName}`;

  const sourceLabels: Record<string, string> = {
    reddit: "trending on Reddit",
    hackernews: "popular on Hacker News",
    devto: "featured on Dev.to",
    rss: "from a trusted source",
  };
  const sourceReason = sourceLabels[article.source] ?? "from your feed";
  return `${emoji} ${topicName} · ${sourceReason}`;
}