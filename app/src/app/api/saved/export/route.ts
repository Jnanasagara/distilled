import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const format = url.searchParams.get("format") ?? "json";

    const saved = await prisma.interaction.findMany({
      where: { userId: session.user.id, type: "SAVE" },
      include: { content: { include: { topic: true } } },
      orderBy: { createdAt: "desc" },
    });

    const articles = saved.map((i) => ({
      title: i.content.title,
      url: i.content.url,
      source: i.content.source,
      topic: i.content.topic?.name ?? "",
      author: i.content.author ?? "",
      publishedAt: i.content.publishedAt?.toISOString() ?? "",
      savedAt: i.createdAt.toISOString(),
      summary: i.content.summary ?? "",
    }));

    if (format === "csv") {
      const headers = ["title", "url", "source", "topic", "author", "publishedAt", "savedAt", "summary"];
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const rows = [
        headers.join(","),
        ...articles.map((a) =>
          headers.map((h) => escape(String(a[h as keyof typeof a] ?? ""))).join(",")
        ),
      ];
      return new NextResponse(rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="distilled-saved-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(articles, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="distilled-saved-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Export saved error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
