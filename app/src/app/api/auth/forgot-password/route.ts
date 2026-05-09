import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIp, rateLimitedResponse, parseJsonBody, validateOrigin } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!validateOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // 3 reset requests per hour per IP — prevents email spam and enumeration floods
  const { limited } = await rateLimit(`forgot:${getIp(req)}`, 3, 3600);
  if (limited) return rateLimitedResponse(3600);

  try {
    const parsed = await parseJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const { email } = parsed.data;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    // Use constant-time response to prevent timing attacks
    if (!user || !user.emailVerified) {
      await new Promise((r) => setTimeout(r, 200)); // constant-time delay
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { identifier: email } });

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: { identifier: email, token, expires },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error("Failed to send reset email:", err);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
