import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit, getIp, rateLimitedResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getIp(req);
  const { limited } = await rateLimit(`reports:${ip}`, 5, 3600);
  if (limited) return rateLimitedResponse(3600);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const message = (body.message ?? "").trim();

  if (!message || message.length < 10) {
    return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      message,
    },
  });

  return NextResponse.json({ success: true, id: report.id });
}
