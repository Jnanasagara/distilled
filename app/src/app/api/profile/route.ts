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

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().slice(0, 10);

    const [user, stats, userTopics, usageRecords, totalUsage, recentInteractions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true, avatarSeed: true },
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

      // Usage records for last 14 days
      prisma.dailyUsage.findMany({
        where: { userId, date: { gte: fourteenDaysAgoStr } },
        orderBy: { date: "asc" },
      }),

      // All-time total seconds
      prisma.dailyUsage.aggregate({
        where: { userId },
        _sum: { seconds: true },
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

    // Build 14-day usage chart (fill in missing days with 0)
    const usageMap = new Map(usageRecords.map((r) => [r.date, r.seconds]));
    const usageChart: { date: string; minutes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      usageChart.push({
        date: key.slice(5), // MM-DD
        minutes: Math.round((usageMap.get(key) ?? 0) / 60),
      });
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const todaySeconds = usageMap.get(todayKey) ?? 0;
    const totalSeconds = totalUsage._sum.seconds ?? 0;
    const daysWithData = usageRecords.filter((r) => r.seconds > 0).length;
    const avgSeconds = daysWithData > 0
      ? Math.round(usageRecords.reduce((s, r) => s + r.seconds, 0) / daysWithData)
      : 0;

    return NextResponse.json({
      user: { ...user, avatarSeed: user?.avatarSeed ?? null },
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
      usage: {
        totalSeconds,
        todaySeconds,
        avgSeconds,
        chart: usageChart,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
