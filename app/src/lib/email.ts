import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Distilled <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Verify your email — Distilled",
    html: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; text-align: center; line-height: 44px;">D</div>
          <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Distilled</span>
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; letter-spacing: -0.5px;">Verify your email</h1>
        <p style="font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.6;">
          Thanks for signing up. Click the button below to verify your email address and get started.
        </p>

        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: -0.2px;">
          Verify my email →
        </a>

        <p style="font-size: 13px; color: #94a3b8; margin: 28px 0 0; line-height: 1.6;">
          This link expires in 24 hours. If you didn't sign up for Distilled, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }
}

export async function sendDigestEmail(
  email: string,
  name: string | null,
  articles: { title: string; url: string; source: string; topicName: string | null; topicEmoji: string | null }[],
  frequency: "DAILY" | "WEEKLY" | "MONTHLY",
  unsubscribeUrl: string
) {
  const frequencyLabel = frequency === "DAILY" ? "Daily" : frequency === "WEEKLY" ? "Weekly" : "Monthly";
  const greeting = name ? `Hi ${name.split(" ")[0]}` : "Hi there";

  const articleRows = articles
    .map(
      (a) => `
      <div style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">
          ${a.topicEmoji ? a.topicEmoji + " " : ""}${a.topicName ?? a.source}
        </div>
        <a href="${a.url}" style="font-size: 15px; font-weight: 700; color: #0f172a; text-decoration: none; line-height: 1.4; display: block; margin-bottom: 8px;">
          ${a.title}
        </a>
        <a href="${a.url}" style="font-size: 13px; color: #6366f1; text-decoration: none; font-weight: 600;">
          Read article →
        </a>
      </div>`
    )
    .join("");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `Your ${frequencyLabel} Digest — Distilled`,
    html: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; text-align: center; line-height: 44px;">D</div>
          <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Distilled</span>
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: -0.5px;">
          Your ${frequencyLabel} Digest
        </h1>
        <p style="font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.6;">
          ${greeting}, here are the top stories picked just for you.
        </p>

        <div style="margin-bottom: 32px;">
          ${articleRows}
        </div>

        <a href="${process.env.NEXTAUTH_URL}/feed" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: -0.2px;">
          Open your full feed →
        </a>

        <p style="font-size: 12px; color: #94a3b8; margin: 28px 0 0; line-height: 1.6;">
          You're receiving this because you set your digest frequency to ${frequencyLabel.toLowerCase()} in Distilled.
          <a href="${process.env.NEXTAUTH_URL}/preferences" style="color: #6366f1;">Change preferences</a> ·
          <a href="${unsubscribeUrl}" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error(`Failed to send digest email to ${email}:`, error);
    throw new Error("Failed to send digest email.");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Reset your password — Distilled",
    html: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; text-align: center; line-height: 44px;">D</div>
          <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Distilled</span>
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; letter-spacing: -0.5px;">Reset your password</h1>
        <p style="font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>

        <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: -0.2px;">
          Reset my password →
        </a>

        <p style="font-size: 13px; color: #94a3b8; margin: 28px 0 0; line-height: 1.6;">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email. Please try again.");
  }
}
