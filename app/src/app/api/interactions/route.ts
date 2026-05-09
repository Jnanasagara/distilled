import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { parseJsonBody, validateOrigin } from "@/lib/rate-limit";

const WEIGHT_DELTA: Record<string, number> = {
  LIKE:    0.15,
  CLICK:   0.05,
  SAVE:    0.20,
  DISMISS: -0.10,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!validateOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = await parseJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const { contentId, type } = parsed.data;

    if (!contentId || typeof contentId !== "string" || !["LIKE", "CLICK", "SAVE", "DISMISS"].includes(type)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.interaction.upsert({
      where: { userId_contentId_type: { userId, contentId, type } },
      update: {},
      create: { userId, contentId, type },
    });

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { topicId: true },
    });

    if (content?.topicId) {
      const userTopic = await prisma.userTopic.findUnique({
        where: { userId_topicId: { userId, topicId: content.topicId } },
      });

      if (userTopic) {
        const delta = WEIGHT_DELTA[type] ?? 0;
        const newWeight = type === "DISMISS"
          ? Math.max(userTopic.weight + delta, 0.1)
          : Math.min(userTopic.weight + delta, 5.0);
        await prisma.userTopic.update({
          where: { id: userTopic.id },
          data: {
            weight: newWeight,
            ...(type !== "DISMISS" ? { lastEngagedAt: new Date() } : {}),
          },
        });
      }
    }

    // Invalidate feed cache so next load reflects new interaction
    try {
      await redis.del(`feed:${userId}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Interaction error:", error);
    return NextResponse.json({ error: "Failed to record interaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!validateOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed2 = await parseJsonBody(req);
    if ("error" in parsed2) return parsed2.error;
    const { contentId, type } = parsed2.data;

    if (!contentId || typeof contentId !== "string" || !["LIKE", "CLICK", "SAVE"].includes(type)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.interaction.deleteMany({
      where: { userId, contentId, type },
    });

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { topicId: true },
    });

    if (content?.topicId) {
      const userTopic = await prisma.userTopic.findUnique({
        where: { userId_topicId: { userId, topicId: content.topicId } },
      });

      if (userTopic) {
        const delta = Math.abs(WEIGHT_DELTA[type] ?? 0.05);
        const newWeight = Math.max(userTopic.weight - delta, 0.1);
        await prisma.userTopic.update({
          where: { id: userTopic.id },
          data: { weight: newWeight },
        });
      }
    }

    // Invalidate feed cache
    try {
      await redis.del(`feed:${userId}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Interaction delete error:", error);
    return NextResponse.json({ error: "Failed to remove interaction" }, { status: 500 });
  }
}