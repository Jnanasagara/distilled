import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [
      totalUsers,
      totalContent,
      totalInteractions,
      recentSignups,
      recentInteractions,
      topSources,
      activeUsersRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
      prisma.interaction.count(),

      // Signups per day last 30 days
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // Interactions per day last 30 days
      prisma.interaction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, type: true },
        orderBy: { createdAt: "asc" },
      }),

      // Top sources
      prisma.content.groupBy({
        by: ["source"],
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
      }),

      // Active users last 7 days (had at least one interaction)
      prisma.interaction.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);

    // Build daily signup chart
    const signupMap = new Map<string, number>();
    for (const u of recentSignups) {
      const key = u.createdAt.toISOString().slice(0, 10);
      signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
    }

    // Build daily interaction chart
    const interactionMap = new Map<string, number>();
    for (const i of recentInteractions) {
      const key = i.createdAt.toISOString().slice(0, 10);
      interactionMap.set(key, (interactionMap.get(key) ?? 0) + 1);
    }

    const dailyChart: { date: string; signups: number; interactions: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyChart.push({
        date: key.slice(5),
        signups: signupMap.get(key) ?? 0,
        interactions: interactionMap.get(key) ?? 0,
      });
    }

    return NextResponse.json({
      totals: {
        users: totalUsers,
        content: totalContent,
        interactions: totalInteractions,
        activeUsers7d: activeUsersRaw.length,
      },
      dailyChart,
      topSources: topSources.map((s) => ({ source: s.source, count: s._count.source })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
