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

    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot ban your own account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot ban another admin" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: !user.isBanned },
      select: { id: true, isBanned: true },
    });

    return NextResponse.json({ isBanned: updated.isBanned });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
