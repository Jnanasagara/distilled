import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const search = url.searchParams.get("q") ?? "";
    const filter = url.searchParams.get("filter") ?? "all"; // all | hidden | visible

    const where = {
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
      ...(filter === "hidden" ? { isHidden: true } : filter === "visible" ? { isHidden: false } : {}),
    };

    const [total, content] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        select: {
          id: true,
          title: true,
          url: true,
          source: true,
          isHidden: true,
          publishedAt: true,
          createdAt: true,
          topic: { select: { name: true, emoji: true } },
          _count: { select: { interactions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({ items: content, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("Admin content error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
