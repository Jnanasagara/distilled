import { prisma } from "@/lib/prisma";

// Exponential decay — reduces topic weights over time if not engaged
export async function applyWeightDecay(userId: string) {
  const userTopics = await prisma.userTopic.findMany({
    where: { userId, status: "ACTIVE" },
  });

  for (const ut of userTopics) {
    if (!ut.lastEngagedAt) continue;
    const daysSinceEngaged =
      (Date.now() - ut.lastEngagedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEngaged > 3) {
      const decayFactor = Math.exp(-0.05 * daysSinceEngaged);
      const newWeight = Math.max(ut.weight * decayFactor, 0.1);
      await prisma.userTopic.update({
        where: { id: ut.id },
        data: { weight: newWeight },
      });
    }
  }
}

// Source diversity bonus — reward variety of sources
function sourceBonus(source: string, seenSources: Map<string, number>): number {
  const count = seenSources.get(source) ?? 0;
  // Each repeated source gets a 10% penalty
  return Math.pow(0.9, count);
}

// Composite scoring pipeline
export function scoreArticle(
  article: any,
  topicWeightMap: Map<string, number>,
  seenSources: Map<string, number>,
  seenTopics: Map<string, number>
): number {
  // 1. Topic weight score
  const weight = article.topicId
    ? (topicWeightMap.get(article.topicId) ?? 1.0)
    : 1.0;

  // 2. Recency score — decays over 72 hours
  const ageMs = Date.now() - new Date(article.publishedAt ?? article.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / 72);

  // 3. Source diversity bonus
  const srcBonus = sourceBonus(article.source, seenSources);

  // 4. Topic diversity bonus — penalize same topic appearing too much
  const topicCount = article.topicId ? (seenTopics.get(article.topicId) ?? 0) : 0;
  const topicBonus = Math.pow(0.85, topicCount);

  // 5. Image bonus — articles with images get a small boost
  const imageBonus = article.imageUrl ? 1.05 : 1.0;

  // Composite score
  return weight * recencyScore * srcBonus * topicBonus * imageBonus;
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