import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const VALID_SOURCES = ["reddit", "hackernews", "devto", "rss"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blocked = await prisma.blockedSource.findMany({
      where: { userId: session.user.id },
      select: { source: true },
    });

    return NextResponse.json({ blockedSources: blocked.map((b) => b.source) });
  } catch (error) {
    console.error("Blocked sources GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source } = await req.json();
    if (!source || !VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    await prisma.blockedSource.upsert({
      where: { userId_source: { userId: session.user.id, source } },
      update: {},
      create: { userId: session.user.id, source },
    });

    try { await redis.del(`feed:${session.user.id}`); } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blocked sources POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source } = await req.json();
    if (!source || !VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    await prisma.blockedSource.deleteMany({
      where: { userId: session.user.id, source },
    });

    try { await redis.del(`feed:${session.user.id}`); } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blocked sources DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
