import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Reset all topic weights to 1.0
    await prisma.userTopic.updateMany({
      where: { userId },
      data: {
        weight: 1.0,
        lastEngagedAt: null,
      },
    });

    // Clear feed cache so next load reflects reset
    try {
      await redis.del(`feed:${userId}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset weights error:", error);
    return NextResponse.json({ error: "Failed to reset weights" }, { status: 500 });
  }
}