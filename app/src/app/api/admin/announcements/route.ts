import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendAnnouncementEmail } from "@/lib/email";

async function broadcastEmails(title: string, message: string) {
  const users = await prisma.user.findMany({
    where: { emailVerified: { not: null }, isBanned: false, onboarded: true },
    select: { email: true, name: true },
  });
  for (const user of users) {
    try {
      await sendAnnouncementEmail(user.email, user.name, title, message);
    } catch (err) {
      console.error(`Failed to send announcement to ${user.email}:`, err);
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("GET announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, message, type, expiresAt } = await req.json();
    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    if (!["BANNER", "EMAIL", "BOTH"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim().slice(0, 120),
        message: message.trim().slice(0, 1000),
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Fire-and-forget email broadcast for Railway (process stays alive)
    if (type === "EMAIL" || type === "BOTH") {
      broadcastEmails(announcement.title, announcement.message).catch(console.error);
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("POST announcement error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
