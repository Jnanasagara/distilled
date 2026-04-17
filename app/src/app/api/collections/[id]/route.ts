import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, color } = await req.json();

    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.collection.update({
      where: { id },
      data: {
        ...(name?.trim() ? { name: name.trim().slice(0, 50) } : {}),
        ...(color !== undefined ? { color } : {}),
      },
      include: { items: { include: { content: { include: { topic: true } } } } },
    });

    return NextResponse.json({ collection: updated });
  } catch (error) {
    console.error("PATCH collection error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await prisma.collection.deleteMany({ where: { id, userId: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE collection error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
