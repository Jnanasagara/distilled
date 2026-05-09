import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const adminNote = (body.adminNote ?? "").trim() || null;

  const report = await prisma.report.update({
    where: { id },
    data: {
      status: "RESOLVED",
      adminNote,
      resolvedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, report });
}
