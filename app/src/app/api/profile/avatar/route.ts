import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AVATAR_SEEDS } from "@/lib/avatars";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seed } = body as { seed: string };

    if (typeof seed !== "string" || !AVATAR_SEEDS.includes(seed)) {
      return NextResponse.json({ error: "Invalid avatar seed" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarSeed: seed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/profile/avatar error:", error);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
