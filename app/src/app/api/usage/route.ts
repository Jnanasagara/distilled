import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seconds } = body as { seconds: number };

    if (typeof seconds !== "number" || seconds <= 0 || seconds > 86400) {
      return NextResponse.json({ error: "Invalid seconds value" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      update: { seconds: { increment: Math.floor(seconds) } },
      create: { userId: session.user.id, date: today, seconds: Math.floor(seconds) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/usage error:", error);
    return NextResponse.json({ error: "Failed to record usage" }, { status: 500 });
  }
}
