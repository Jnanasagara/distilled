import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: collectionId } = await params;
    const { contentId } = await req.json();
    if (!contentId) return NextResponse.json({ error: "contentId required" }, { status: 400 });

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    await prisma.collectionItem.upsert({
      where: { collectionId_contentId: { collectionId, contentId } },
      update: {},
      create: { collectionId, contentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST collection item error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: collectionId } = await params;
    const { contentId } = await req.json();
    if (!contentId) return NextResponse.json({ error: "contentId required" }, { status: 400 });

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    await prisma.collectionItem.deleteMany({ where: { collectionId, contentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE collection item error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
