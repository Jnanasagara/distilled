import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";

function verifyToken(userId: string, token: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  const expected = createHmac("sha256", secret).update(userId).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("uid");
  const token = searchParams.get("token");

  if (!userId || !token || !verifyToken(userId, token)) {
    return new Response("Invalid or expired unsubscribe link.", { status: 400 });
  }

  try {
    await prisma.userPreference.update({
      where: { userId },
      data: { digestUnsubscribed: true },
    });
  } catch {
    // Preference row may not exist yet — create it
    await prisma.userPreference.upsert({
      where: { userId },
      update: { digestUnsubscribed: true },
      create: { userId, digestUnsubscribed: true },
    });
  }

  // Redirect to a simple confirmation page
  return Response.redirect(`${process.env.NEXTAUTH_URL}/unsubscribed`, 302);
}
