import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [preferences, userTopics] = await Promise.all([
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.userTopic.findMany({
        where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { topicIds, postCount, frequency } = body as {
      topicIds: string[];
      postCount: number;
      frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    };

    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      return NextResponse.json({ error: "Select at least one topic" }, { status: 400 });
    }

    // Prevent sending an arbitrarily large topic list
    if (topicIds.length > 50) {
      return NextResponse.json({ error: "Too many topics selected" }, { status: 400 });
    }

    // Ensure all submitted IDs are strings (not injected objects)
    if (topicIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "Invalid topic IDs" }, { status: 400 });
    }

    // Validate every submitted topicId actually exists in the database
    const validTopics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true },
    });
    if (validTopics.length !== topicIds.length) {
      return NextResponse.json({ error: "One or more topics are invalid" }, { status: 400 });
    }

    const maxPostCount = frequency === "MONTHLY" ? 100 : frequency === "WEEKLY" ? 60 : 30;
    if (typeof postCount !== "number" || postCount < 10 || postCount > maxPostCount) {
      return NextResponse.json(
        { error: `Post count must be between 10 and ${maxPostCount}` },
        { status: 400 }
      );
    }

    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    await prisma.userPreference.upsert({
      where: { userId },
      update: { postCount, frequency },
      create: { userId, postCount, frequency },
    });

    const existingUserTopics = await prisma.userTopic.findMany({ where: { userId } });
    const existingMap = new Map(existingUserTopics.map((ut) => [ut.topicId, ut]));

    for (const topicId of topicIds) {
      const existing = existingMap.get(topicId);
      if (existing) {
        // Only change to ACTIVE if it was INACTIVE — preserve PAUSED state
        if (existing.status === "INACTIVE") {
          await prisma.userTopic.update({ where: { id: existing.id }, data: { status: "ACTIVE" } });
        }
      } else {
        await prisma.userTopic.create({ data: { userId, topicId, weight: 1.0, status: "ACTIVE" } });
      }
      existingMap.delete(topicId);
    }

    // Topics not in the new selection → mark INACTIVE
    for (const [, ut] of existingMap.entries()) {
      if (ut.status === "ACTIVE" || ut.status === "PAUSED") {
        await prisma.userTopic.update({ where: { id: ut.id }, data: { status: "INACTIVE" } });
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { onboarded: true } });

    // Invalidate feed cache so next load reflects the new preferences
    try {
      await redis.del(`feed:${userId}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/preferences error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
