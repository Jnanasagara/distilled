import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { topicId, paused } = await req.json();

    await prisma.userTopic.update({
      where: { userId_topicId: { userId, topicId } },
      data: { status: paused ? "PAUSED" : "ACTIVE" },
    });

    try {
      await redis.del(`feed:${userId}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pause topic error:", error);
    return NextResponse.json({ error: "Failed to pause topic" }, { status: 500 });
  }
}