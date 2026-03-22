import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUserId } from "@/lib/mock-auth";

export async function GET(req: Request) {
  try {
    const userId = await getMockUserId();
    if (!userId || userId === "MOCK_USER_PLACEHOLDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [preferences, userTopics] = await Promise.all([
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.userTopic.findMany({
        where: { userId, status: "ACTIVE" },
        include: { topic: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
    return NextResponse.json({
      preferences: preferences ?? { postCount: 20, frequency: "DAILY" },
      topics: userTopics.map((ut) => ({
        id: ut.topic.id,
        slug: ut.topic.slug,
        name: ut.topic.name,
        emoji: ut.topic.emoji,
        weight: ut.weight,
        status: ut.status,
      })),
    });
  } catch (error) {
    console.error("GET /api/preferences error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getMockUserId();
    if (!userId || userId === "MOCK_USER_PLACEHOLDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { topicIds, postCount, frequency, userId: bodyUserId } = body as {
      topicIds: string[];
      postCount: number;
      frequency: "DAILY" | "WEEKLY" | "MONTHLY";
      userId: string;
    };

    // Use userId from body (passed by PreferencesForm) until NextAuth is ready
    const resolvedUserId = bodyUserId || userId;

    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      return NextResponse.json({ error: "Select at least one topic" }, { status: 400 });
    }
    if (postCount < 10 || postCount > 50) {
      return NextResponse.json({ error: "Post count must be between 10 and 50" }, { status: 400 });
    }
    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    await prisma.userPreference.upsert({
      where: { userId: resolvedUserId },
      update: { postCount, frequency },
      create: { userId: resolvedUserId, postCount, frequency },
    });

    const existingUserTopics = await prisma.userTopic.findMany({ where: { userId: resolvedUserId } });
    const existingMap = new Map(existingUserTopics.map((ut) => [ut.topicId, ut]));

    for (const topicId of topicIds) {
      const existing = existingMap.get(topicId);
      if (existing) {
        await prisma.userTopic.update({ where: { id: existing.id }, data: { status: "ACTIVE" } });
      } else {
        await prisma.userTopic.create({ data: { userId: resolvedUserId, topicId, weight: 1.0, status: "ACTIVE" } });
      }
      existingMap.delete(topicId);
    }

    for (const [, ut] of existingMap.entries()) {
      if (ut.status === "ACTIVE") {
        await prisma.userTopic.update({ where: { id: ut.id }, data: { status: "INACTIVE" } });
      }
    }

    await prisma.user.update({ where: { id: resolvedUserId }, data: { onboarded: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/preferences error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}