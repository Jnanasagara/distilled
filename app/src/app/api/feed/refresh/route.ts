import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redis } from "@/lib/redis";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await redis.del(`feed:${session.user.id}`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feed refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
  }
}
