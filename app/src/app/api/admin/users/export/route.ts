import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        emailVerified: true,
        onboarded: true,
        createdAt: true,
        _count: { select: { interactions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["id", "name", "email", "role", "banned", "verified", "onboarded", "joined", "interactions"];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

    const rows = [
      headers.join(","),
      ...users.map((u) =>
        [
          u.id,
          u.name ?? "",
          u.email,
          u.role,
          u.isBanned ? "yes" : "no",
          u.emailVerified ? "yes" : "no",
          u.onboarded ? "yes" : "no",
          u.createdAt.toISOString().slice(0, 10),
          u._count.interactions,
        ]
          .map((v) => escape(String(v)))
          .join(",")
      ),
    ];

    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="distilled-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Users export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
