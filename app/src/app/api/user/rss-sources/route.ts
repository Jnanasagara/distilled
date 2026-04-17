import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { fetchRSS } from "@/lib/fetchers/rss";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sources = await prisma.userRssSource.findMany({
      where: { userId: session.user.id },
      include: { topic: { select: { id: true, name: true, emoji: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("GET rss-sources error:", error);
    return NextResponse.json({ error: "Failed to fetch RSS sources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url, name, topicId } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }

    const count = await prisma.userRssSource.count({ where: { userId: session.user.id } });
    if (count >= 20) {
      return NextResponse.json({ error: "Maximum 20 RSS sources allowed" }, { status: 400 });
    }

    // Test-fetch to validate URL
    const items = await fetchRSS(normalized, 5);
    if (items.length === 0) {
      return NextResponse.json({ error: "Could not fetch articles from this URL. Please check the RSS feed URL." }, { status: 400 });
    }

    const source = await prisma.userRssSource.create({
      data: {
        userId: session.user.id,
        url: normalized,
        name: name?.trim() || null,
        topicId: topicId || null,
      },
      include: { topic: { select: { id: true, name: true, emoji: true } } },
    });

    // Ingest articles if a topic was assigned
    if (topicId) {
      const allItems = await fetchRSS(normalized, 20);
      for (const item of allItems) {
        if (!item.url || !item.title) continue;
        try {
          await prisma.content.upsert({
            where: { url: item.url },
            update: { sourceUrl: item.sourceUrl ?? null },
            create: {
              title: item.title,
              url: item.url,
              sourceUrl: item.sourceUrl ?? null,
              source: "rss",
              author: item.author ?? null,
              publishedAt: item.publishedAt ?? null,
              imageUrl: item.imageUrl ?? null,
              topicId,
            },
          });
        } catch { /* duplicate url — skip */ }
      }
      // Invalidate feed cache
      try { await redis.del(`feed:${session.user.id}`); } catch {}
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error("POST rss-sources error:", error);
    return NextResponse.json({ error: "Failed to add RSS source" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.userRssSource.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE rss-sources error:", error);
    return NextResponse.json({ error: "Failed to remove RSS source" }, { status: 500 });
  }
}
