import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

function frequencyToPostCount(frequency: string, userPostCount: number): number {
  switch (frequency) {
    case "WEEKLY":  return Math.max(userPostCount, 50);
    case "MONTHLY": return Math.max(userPostCount, 100);
    default:        return userPostCount;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [userPreference, userTopics] = await Promise.all([
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.userTopic.findMany({
        where: { userId, status: "ACTIVE" },
        include: { topic: true },
      }),
    ]);

    const frequency = userPreference?.frequency ?? "DAILY";
    const postCount = frequencyToPostCount(
      frequency,
      userPreference?.postCount ?? 20
    );
    const topicIds = userTopics.map((ut) => ut.topicId);

    if (topicIds.length === 0) {
      return NextResponse.json({ articles: [], preferences: {} });
    }

    const articles = await prisma.content.findMany({
      where: {
        topicId: { in: topicIds },
      },
      orderBy: { publishedAt: "desc" },
      take: postCount,
      include: { topic: true },
    });

    return NextResponse.json({
      articles,
      preferences: {
        postCount,
        frequency,
        topics: userTopics.map((ut) => ut.topic.name),
      },
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}