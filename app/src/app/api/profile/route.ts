import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, stats, userTopics, recentInteractions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
      }),

      // Total interaction counts
      prisma.interaction.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
      }),

      // Current topic weights
      prisma.userTopic.findMany({
        where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
        include: { topic: true },
        orderBy: { weight: "desc" },
      }),

      // Interactions over the last 8 weeks joined with topic
      prisma.interaction.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 56) }, // 8 weeks
        },
        include: { content: { include: { topic: true } } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Build weekly activity buckets
    const weeklyMap = new Map<string, Map<string, number>>();

    for (const interaction of recentInteractions) {
      const topicName = interaction.content.topic?.name;
      if (!topicName) continue;

      const date = new Date(interaction.createdAt);
      // ISO week label e.g. "2026-W14"
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Sunday
      const weekLabel = weekStart.toISOString().slice(0, 10);

      if (!weeklyMap.has(weekLabel)) weeklyMap.set(weekLabel, new Map());
      const topicMap = weeklyMap.get(weekLabel)!;
      topicMap.set(topicName, (topicMap.get(topicName) ?? 0) + 1);
    }

    // Convert to array sorted by week
    const weeklyActivity = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, topicMap]) => ({
        week,
        ...Object.fromEntries(topicMap),
      }));

    // All topic names that appear in weekly data
    const weeklyTopicNames = Array.from(
      new Set(recentInteractions.map((i) => i.content.topic?.name).filter(Boolean))
    );

    const statMap = Object.fromEntries(stats.map((s) => [s.type, s._count.type]));

    return NextResponse.json({
      user,
      stats: {
        likes: statMap["LIKE"] ?? 0,
        saves: statMap["SAVE"] ?? 0,
        clicks: statMap["CLICK"] ?? 0,
      },
      topicWeights: userTopics.map((ut) => ({
        name: ut.topic.name,
        emoji: ut.topic.emoji ?? "",
        weight: parseFloat(ut.weight.toFixed(2)),
        status: ut.status,
      })),
      weeklyActivity,
      weeklyTopicNames,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
