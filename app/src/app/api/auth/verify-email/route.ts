import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIp, rateLimitedResponse } from "@/lib/rate-limit";

export async function GET(req: Request) {
  // 20 attempts per hour per IP — generous for legitimate use, stops automated scanning
  const { limited } = await rateLimit(`verify:${getIp(req)}`, 20, 3600);
  if (limited) return rateLimitedResponse(3600);

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;

    if (!token) {
      return NextResponse.redirect(new URL("/auth?error=missing-token", base));
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.redirect(new URL("/auth?error=invalid-token", base));
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(new URL("/auth?error=expired-token", base));
    }

    // Mark email as verified and clean up the token atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.redirect(new URL("/auth?verified=1", base));
  } catch (error) {
    console.error("Email verification error:", error);
    const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    return NextResponse.redirect(new URL("/auth?error=invalid-token", base));
  }
}
