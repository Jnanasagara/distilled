import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  greedyDiverseSelect,
  applyWeightDecay,
  suppressRedundancy,
  injectTrendSlots,
  enforceSourceSpacing,
  generateReason,
  computeSourceAffinity,
  computeTopicHotScores,
} from "@/lib/algorithm";
import { redis } from "@/lib/redis";

const CACHE_TTL = 60 * 15; // 15 minutes

// Weekly/monthly users check less often so we serve a larger batch.
// We floor at 60/100 so infrequent users always get a full reading session,
// even if they set a low postCount when they were a daily user.
function frequencyToPostCount(frequency: string, userPostCount: number): number {
  switch (frequency) {
    case "WEEKLY":  return Math.max(userPostCount, 60);
    case "MONTHLY": return Math.max(userPostCount, 100);
    default:        return userPostCount; // DAILY — respect user's setting directly
  }
}

// Recency decay window per frequency — weekly/monthly users shouldn't see
// old articles heavily penalized just because they check infrequently.
function frequencyToDecayWindow(frequency: string): number {
  switch (frequency) {
    case "WEEKLY":  return 168;  // 7 days
    case "MONTHLY": return 720;  // 30 days
    default:        return 72;   // 3 days (daily)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `feed:${userId}`;

    // Check Redis cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch {
      // Redis unavailable — continue without cache
    }

    // Apply weight decay
    await applyWeightDecay(userId);

    const [userPreference, userTopics, sourceAffinityMap, topicHotMap] = await Promise.all([
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.userTopic.findMany({
        where: { userId, status: "ACTIVE" },
        include: { topic: true },
      }),
      computeSourceAffinity(userId).catch(() => new Map<string, number>()),
      computeTopicHotScores(userId).catch(() => new Map<string, number>()),
    ]);

    const frequency = userPreference?.frequency ?? "DAILY";
    const postCount = frequencyToPostCount(frequency, userPreference?.postCount ?? 20);
    const decayWindowHours = frequencyToDecayWindow(frequency);
    const showTrending = userPreference?.showTrending ?? true;
    const topicIds = userTopics.map((ut) => ut.topicId);

    if (topicIds.length === 0) {
      return NextResponse.json({ articles: [], preferences: {} });
    }

    // Build topic weight map
    const topicWeightMap = new Map(
      userTopics.map((ut) => [ut.topicId, ut.weight])
    );

    // Session digest — get articles user already clicked or dismissed, plus blocked sources
    const [excludedInteractions, blockedSources] = await Promise.all([
      prisma.interaction.findMany({
        where: { userId, type: { in: ["CLICK", "DISMISS"] } },
        select: { contentId: true },
      }),
      prisma.blockedSource.findMany({
        where: { userId },
        select: { source: true },
      }),
    ]);
    const excludedSet = new Set(excludedInteractions.map((i) => i.contentId));
    const blockedSourceSet = new Set(blockedSources.map((b) => b.source));

    // Candidate window: only consider articles within the user's decay window so weekly/monthly
    // users always see the full period (not just the most-recent N regardless of date).
    const candidateCutoff = new Date(Date.now() - decayWindowHours * 60 * 60 * 1000);

    // Fetch candidate articles — exclude already clicked/dismissed, blocked sources, and hidden content
    const rawArticles = await prisma.content.findMany({
      where: {
        topicId: { in: topicIds },
        id: { notIn: Array.from(excludedSet) },
        isHidden: false,
        OR: [{ publishedAt: { gte: candidateCutoff } }, { publishedAt: null }],
        ...(blockedSourceSet.size > 0 ? { source: { notIn: Array.from(blockedSourceSet) } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: postCount * 4,
      include: { topic: true },
    });

    // Redundancy suppression
    const dedupedArticles = suppressRedundancy(rawArticles);

    // Greedy diversity-aware selection with source affinity + topic hot score signals
    const diversified = greedyDiverseSelect(
      dedupedArticles, topicWeightMap, postCount, sourceAffinityMap, topicHotMap, decayWindowHours
    );

    // Enforce source spacing — no 3+ consecutive articles from the same source
    const spaced = enforceSourceSpacing(diversified);

    // Fetch liked/saved interactions
    const articleIds = spaced.map((a) => a.id);
    const interactions = await prisma.interaction.findMany({
      where: {
        userId,
        contentId: { in: articleIds },
        type: { in: ["LIKE", "SAVE"] },
      },
    });

    const likedSet = new Set(
      interactions.filter((i) => i.type === "LIKE").map((i) => i.contentId)
    );
    const savedSet = new Set(
      interactions.filter((i) => i.type === "SAVE").map((i) => i.contentId)
    );

    // Attach interaction state + reason
    const articlesWithState = spaced.map((a) => ({
      ...a,
      isLiked: likedSet.has(a.id),
      isSaved: savedSet.has(a.id),
      _reason: generateReason(a, topicWeightMap, a._isTrending ?? false, sourceAffinityMap, topicHotMap),
    }));

    // Trend slot injection (skipped if user disabled trending)
    const finalArticles = showTrending
      ? await injectTrendSlots(articlesWithState, topicIds)
      : articlesWithState;

    const response = {
      articles: finalArticles,
      preferences: {
        postCount,
        frequency,
        topics: userTopics.map((ut) => ut.topic.name),
      },
    };

    // Cache the response in Redis
    try {
      await redis.set(cacheKey, JSON.stringify(response), "EX", CACHE_TTL);
    } catch {
      // Redis unavailable — skip caching
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}