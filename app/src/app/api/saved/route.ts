import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const saved = await prisma.interaction.findMany({
      where: { userId, type: "SAVE" },
      include: {
        content: {
          include: { topic: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const articles = saved.map((i) => ({
      ...i.content,
      savedAt: i.createdAt,
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Saved API error:", error);
    return NextResponse.json({ error: "Failed to fetch saved articles" }, { status: 500 });
  }
}