import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const content = await prisma.content.findUnique({ where: { id }, select: { isHidden: true } });
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.content.update({
      where: { id },
      data: { isHidden: !content.isHidden },
      select: { id: true, isHidden: true },
    });

    return NextResponse.json({ isHidden: updated.isHidden });
  } catch (error) {
    console.error("Toggle hide content error:", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
