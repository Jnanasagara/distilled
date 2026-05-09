import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const PAGE_SIZE = 20;

    const [total, clicks] = await Promise.all([
      prisma.interaction.count({ where: { userId: session.user.id, type: "CLICK" } }),
      prisma.interaction.findMany({
        where: { userId: session.user.id, type: "CLICK" },
        include: { content: { include: { topic: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const articles = clicks.map((i) => ({
      ...i.content,
      readAt: i.createdAt,
    }));

    return NextResponse.json({ articles, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
