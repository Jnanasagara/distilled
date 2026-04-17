import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { password } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // OAuth users may have no password — allow deletion without password check
    if (user.password) {
      if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
