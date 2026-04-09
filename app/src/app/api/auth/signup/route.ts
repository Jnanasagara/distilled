import { NextResponse } from "next/server";
import { promises as dns } from "dns";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIp, rateLimitedResponse, parseJsonBody, validateOrigin } from "@/lib/rate-limit";
import bcrypt from "bcrypt";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

async function isEmailDomainValid(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password))
    return "Password must contain at least one special character.";
  return null;
}

export async function POST(req: Request) {
  // 5 signups per hour per IP
  if (!validateOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { limited } = await rateLimit(`signup:${getIp(req)}`, 5, 3600);
  if (limited) return rateLimitedResponse(3600);

  try {
    const parsed = await parseJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const { name, email, password } = parsed.data;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const domainValid = await isEmailDomainValid(email);
    if (!domainValid) {
      return NextResponse.json(
        { error: "Email domain does not exist. Please use a real email address." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Generate a verification token valid for 24 hours
    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Still return success since the account was created — user can try resending
      return NextResponse.json({
        message: "Account created, but we couldn't send the verification email. Please contact support or try again.",
        emailFailed: true,
      });
    }

    return NextResponse.json({ message: "Check your email to verify your account." });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
