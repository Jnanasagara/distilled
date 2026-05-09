import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// Exponential decay — reduces topic weights over time if not engaged.
// Rate-limited to once per hour per user via Redis.
export async function applyWeightDecay(userId: string) {
  const decayKey = `decay:${userId}`;

  try {
    const alreadyRan = await redis.get(decayKey);
    if (alreadyRan) return;
    await redis.set(decayKey, "1", "EX", 60 * 60);
  } catch {
    // Redis unavailable — run decay anyway
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

// Source affinity — articles from sources the user engages with most get a boost.
// Returns a multiplier per source: 1.0 (neutral) → 1.4 (strong preference).
// Cached in Redis for 2 hours to avoid per-request DB hits.
export async function computeSourceAffinity(
  userId: string
): Promise<Map<string, number>> {
  const cacheKey = `source_affinity:${userId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return new Map(JSON.parse(cached));
  } catch {}

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const interactions = await prisma.interaction.findMany({
    where: {
      userId,
      type: { in: ["CLICK", "LIKE", "SAVE"] },
      createdAt: { gte: cutoff },
    },
    include: { content: { select: { source: true } } },
  });

  // SAVE=3pts, LIKE=2pts, CLICK=1pt — reflects quality of engagement
  const interactionPoints: Record<string, number> = { SAVE: 3, LIKE: 2, CLICK: 1 };
  const sourceTotals = new Map<string, number>();

  for (const i of interactions) {
    const source = i.content?.source;
    if (!source) continue;
    const pts = interactionPoints[i.type] ?? 1;
    sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + pts);
  }

  if (sourceTotals.size === 0) return new Map();

  const maxPts = Math.max(...sourceTotals.values());
  const affinityMap = new Map<string, number>();
  for (const [source, pts] of sourceTotals) {
    affinityMap.set(source, 1.0 + 0.4 * (pts / maxPts));
  }

  try {
    await redis.set(cacheKey, JSON.stringify([...affinityMap]), "EX", 60 * 60 * 2);
  } catch {}

  return affinityMap;
}

// Topic hot score — captures short-term engagement bursts beyond the slowly-moving weight.
// If a user has been saving/liking a topic heavily in the last 2 weeks, boost it temporarily.
// Returns a multiplier per topicId: 1.0 → 1.5.
export async function computeTopicHotScores(
  userId: string
): Promise<Map<string, number>> {
  const cacheKey = `topic_hot:${userId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return new Map(JSON.parse(cached));
  } catch {}

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const interactions = await prisma.interaction.findMany({
    where: {
      userId,
      type: { in: ["SAVE", "LIKE"] },
      createdAt: { gte: cutoff },
    },
    include: { content: { select: { topicId: true } } },
  });

  const topicRaw = new Map<string, number>();
  const now = Date.now();

  for (const i of interactions) {
    const topicId = i.content?.topicId;
    if (!topicId) continue;
    const daysAgo = (now - i.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    // SAVE counts more; exponential decay so recent saves matter most
    const pts = (i.type === "SAVE" ? 1.5 : 1.0) * Math.exp(-0.15 * daysAgo);
    topicRaw.set(topicId, (topicRaw.get(topicId) ?? 0) + pts);
  }

  if (topicRaw.size === 0) return new Map();

  const maxPts = Math.max(...topicRaw.values());
  const hotMap = new Map<string, number>();
  for (const [topicId, pts] of topicRaw) {
    hotMap.set(topicId, 1.0 + 0.5 * (pts / maxPts));
  }

  try {
    await redis.set(cacheKey, JSON.stringify([...hotMap]), "EX", 60 * 60);
  } catch {}

  return hotMap;
}

// Compute base score for an article.
// Accepts optional source affinity + topic hot maps; defaults to neutral (1.0) if absent.
// decayWindowHours controls how quickly old articles lose score — set per user frequency:
//   daily=72h, weekly=168h, monthly=720h.
export function scoreArticle(
  article: any,
  topicWeightMap: Map<string, number>,
  sourceAffinityMap: Map<string, number> = new Map(),
  topicHotMap: Map<string, number> = new Map(),
  decayWindowHours = 72
): number {
  const weight = article.topicId
    ? (topicWeightMap.get(article.topicId) ?? 1.0)
    : 1.0;

  const ageMs = Date.now() - new Date(article.publishedAt ?? article.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / decayWindowHours);

  const imageBonus = article.imageUrl ? 1.05 : 1.0;
  const sourceAffinity = sourceAffinityMap.get(article.source) ?? 1.0;
  const topicHot = article.topicId ? (topicHotMap.get(article.topicId) ?? 1.0) : 1.0;

  return weight * recencyScore * imageBonus * sourceAffinity * topicHot;
}

// Greedy diversity-aware selection.
export function greedyDiverseSelect(
  candidates: any[],
  topicWeightMap: Map<string, number>,
  limit: number,
  sourceAffinityMap: Map<string, number> = new Map(),
  topicHotMap: Map<string, number> = new Map(),
  decayWindowHours = 72
): any[] {
  const selected: any[] = [];
  const remaining = [...candidates];
  const seenSources = new Map<string, number>();
  const seenTopics = new Map<string, number>();

  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const a = remaining[i];
      const base = scoreArticle(a, topicWeightMap, sourceAffinityMap, topicHotMap, decayWindowHours);

      const srcCount = seenSources.get(a.source) ?? 0;
      const srcBonus = Math.pow(0.9, srcCount);

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

// Source spacing — ensure no 3+ consecutive articles from the same source.
// Scans forward and swaps violating articles with the next available different-source article.
export function enforceSourceSpacing(articles: any[], maxConsecutive = 2): any[] {
  if (articles.length <= maxConsecutive) return articles;

  const result = [...articles];

  for (let i = maxConsecutive; i < result.length; i++) {
    const source = result[i].source;
    const allSame = result
      .slice(i - maxConsecutive, i)
      .every((a) => a.source === source);

    if (allSame) {
      // Find next article with a different source to swap in
      const swapIdx = result.findIndex(
        (a, idx) => idx > i && a.source !== source
      );
      if (swapIdx !== -1) {
        [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
      }
      // If no swap candidate found, leave it — can't avoid the run
    }
  }

  return result;
}

// Velocity-aware trending — picks trending content based on cross-user interaction
// count in the last 48h, not just recency. Falls back to recency if no data.
export async function injectTrendSlots(
  articles: any[],
  userTopicIds: string[],
  count = 2
): Promise<any[]> {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Count interactions per content item across all users in last 48h
    const velocity = await prisma.interaction.groupBy({
      by: ["contentId"],
      where: {
        createdAt: { gte: cutoff },
        type: { in: ["LIKE", "SAVE", "CLICK"] },
      },
      _count: { contentId: true },
      orderBy: { _count: { contentId: "desc" } },
      take: 50,
    });

    let trending: any[] = [];

    if (velocity.length > 0) {
      const hotIds = velocity.map((v) => v.contentId);
      const candidates = await prisma.content.findMany({
        where: {
          id: { in: hotIds },
          topicId: { notIn: userTopicIds },
          publishedAt: { gte: cutoff },
          isHidden: false,
        },
        include: { topic: true },
        take: count * 3,
      });

      // Sort by velocity rank
      candidates.sort((a, b) => {
        const aV = velocity.find((v) => v.contentId === a.id)?._count.contentId ?? 0;
        const bV = velocity.find((v) => v.contentId === b.id)?._count.contentId ?? 0;
        return bV - aV;
      });

      trending = candidates.slice(0, count);
    }

    // Fallback: recency-based if velocity data came up empty
    if (trending.length === 0) {
      trending = await prisma.content.findMany({
        where: {
          topicId: { notIn: userTopicIds },
          publishedAt: { gte: cutoff },
          imageUrl: { not: null },
          isHidden: false,
        },
        orderBy: { publishedAt: "desc" },
        take: count,
        include: { topic: true },
      });
    }

    if (trending.length === 0) return articles;

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

// Generate "Why this post?" reason — updated to reflect new signals
export function generateReason(
  article: any,
  topicWeightMap: Map<string, number>,
  isTrending: boolean,
  sourceAffinityMap: Map<string, number> = new Map(),
  topicHotMap: Map<string, number> = new Map()
): string {
  if (isTrending) return "📈 Trending outside your topics";

  const weight = article.topicId
    ? (topicWeightMap.get(article.topicId) ?? 1.0)
    : 1.0;

  const ageMs = Date.now() - new Date(article.publishedAt ?? article.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  const topicName = article.topic?.name ?? "this topic";
  const emoji = article.topic?.emoji ?? "";
  const topicHot = article.topicId ? (topicHotMap.get(article.topicId) ?? 1.0) : 1.0;
  const sourceAffinity = sourceAffinityMap.get(article.source) ?? 1.0;

  const sourceLabels: Record<string, string> = {
    reddit: "Reddit",
    hackernews: "Hacker News",
    devto: "Dev.to",
    rss: "RSS",
    aljazeera: "Al Jazeera",
    atlas: "Atlas",
  };

  // Hot topic — user has been actively saving/liking this topic recently
  if (topicHot >= 1.4) return `🔥 You've been reading a lot of ${topicName} lately`;

  if (weight >= 2.0) return `${emoji} You engage a lot with ${topicName}`;
  if (weight >= 1.5) return `${emoji} You've shown interest in ${topicName}`;

  // Source affinity — user has a clear preference for this source
  if (sourceAffinity >= 1.3) {
    const src = sourceLabels[article.source] ?? article.source;
    return `${emoji} You often read from ${src}`;
  }

  if (ageHours < 6) return `⚡ Published ${Math.round(ageHours)}h ago, very fresh`;
  if (ageHours < 24) return `🕐 Published today from ${topicName}`;

  const sourceReason = sourceLabels[article.source]
    ? `from ${sourceLabels[article.source]}`
    : "from your feed";
  return `${emoji} ${topicName} · ${sourceReason}`;
}
