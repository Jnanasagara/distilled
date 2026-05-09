import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { content: { include: { topic: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("GET collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, color } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const count = await prisma.collection.count({ where: { userId: session.user.id } });
    if (count >= 30) return NextResponse.json({ error: "Maximum 30 collections allowed" }, { status: 400 });

    const collection = await prisma.collection.create({
      data: { userId: session.user.id, name: name.trim().slice(0, 50), color: color || null },
      include: { items: { include: { content: { include: { topic: true } } } } },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("POST collections error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
