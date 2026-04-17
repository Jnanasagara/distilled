import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Distilled <onboarding@resend.dev>";

// Shared header used across all emails
function emailHeader() {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${process.env.NEXTAUTH_URL}/android-chrome-192x192.png" alt="Distilled" width="34" height="34" style="border-radius:8px;display:block;" />
              </td>
              <td style="vertical-align:middle;padding-left:9px;">
                <span style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;">Distilled</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Verify your email | Distilled",
    html: `
      <div style="background:#f8fafc;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;">
            ${emailHeader()}
          </div>
          <div style="padding:32px;">
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;letter-spacing:-0.5px;">Verify your email</h1>
            <p style="font-size:15px;color:#64748b;margin:0 0 28px;line-height:1.6;">
              Thanks for signing up. Click the button below to confirm your email address and start reading.
            </p>
            <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">
              Verify my email
            </a>
            <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
              This link expires in 24 hours. If you didn't sign up for Distilled, you can ignore this email.
            </p>
          </div>
        </div>
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
  const firstName = name ? name.split(" ")[0] : null;
  const timeLabel = frequency === "DAILY" ? "today" : frequency === "WEEKLY" ? "this week" : "this month";
  const count = articles.length;

  // Preheader: shows in inbox preview next to subject
  const previewTitles = articles.slice(0, 2).map(a => a.title).join(" · ");
  const preheader = `${count} stories for ${timeLabel} — ${previewTitles}`;

  const articleRows = articles
    .map((a, i) => {
      const topic = (a.topicName ?? a.source).toUpperCase();
      return `
        <tr>
          <td style="padding:20px 0;border-bottom:1px solid #f1f5f9;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width:28px;vertical-align:top;padding-top:2px;">
                  <span style="font-size:11px;font-weight:800;color:#cbd5e1;font-variant-numeric:tabular-nums;">
                    ${String(i + 1).padStart(2, "0")}
                  </span>
                </td>
                <td style="padding-left:4px;">
                  <div style="font-size:10px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${topic}</div>
                  <a href="${a.url}" style="font-size:15px;font-weight:700;color:#0f172a;text-decoration:none;line-height:1.45;display:block;margin-bottom:10px;">${a.title}</a>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td>
                        <span style="font-size:12px;color:#94a3b8;font-weight:500;">via ${a.source}</span>
                      </td>
                      <td style="text-align:right;">
                        <a href="${a.url}" style="font-size:12px;font-weight:700;color:#f97316;text-decoration:none;">Read &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `Your ${frequencyLabel} Digest | Distilled`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;">

        <!-- Preheader text -->
        <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f5f9;padding:32px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">

                <!-- Header -->
                <tr>
                  <td style="background:#0f172a;border-radius:14px 14px 0 0;padding:28px 32px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align:middle;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;">
                                <img src="${process.env.NEXTAUTH_URL}/android-chrome-192x192.png" alt="Distilled" width="34" height="34" style="border-radius:8px;display:block;" />
                              </td>
                              <td style="vertical-align:middle;padding-left:9px;">
                                <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.4px;">Distilled</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="text-align:right;vertical-align:middle;">
                          <span style="font-size:11px;color:rgba(255,255,255,0.35);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${frequencyLabel} Digest</span>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top:22px;">
                      <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;margin-bottom:6px;">
                        ${firstName ? `${firstName},` : "Your reads,"}
                      </div>
                      <div style="font-size:14px;color:rgba(255,255,255,0.45);line-height:1.5;">
                        ${count} ${count === 1 ? "story" : "stories"} picked for ${timeLabel}.
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Articles -->
                <tr>
                  <td style="background:#ffffff;padding:4px 32px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${articleRows}
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="background:#ffffff;padding:24px 32px 32px;">
                    <a href="${process.env.NEXTAUTH_URL}/feed" style="display:block;padding:14px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;text-align:center;letter-spacing:-0.2px;">
                      Open your full feed
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 14px 14px;padding:18px 32px;">
                    <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.7;text-align:center;">
                      You're getting this because your digest is set to ${frequencyLabel.toLowerCase()} in Distilled.&nbsp;
                      <a href="${process.env.NEXTAUTH_URL}/preferences" style="color:#64748b;text-decoration:none;font-weight:600;">Preferences</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:none;font-weight:600;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
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
    subject: "Reset your password | Distilled",
    html: `
      <div style="background:#f8fafc;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;">
            ${emailHeader()}
          </div>
          <div style="padding:32px;">
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;letter-spacing:-0.5px;">Reset your password</h1>
            <p style="font-size:15px;color:#64748b;margin:0 0 28px;line-height:1.6;">
              We got a request to reset your Distilled password. Click below to choose a new one.
            </p>
            <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">
              Reset my password
            </a>
            <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore it.
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email. Please try again.");
  }
}

export async function sendAnnouncementEmail(
  email: string,
  name: string | null,
  title: string,
  message: string
) {
  const firstName = name ? name.split(" ")[0] : null;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${title} | Distilled`,
    html: `
      <div style="background:#f8fafc;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;">
            ${emailHeader()}
          </div>
          <div style="padding:32px;">
            ${firstName ? `<p style="font-size:14px;color:#64748b;margin:0 0 12px;">Hi ${firstName},</p>` : ""}
            <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 12px;letter-spacing:-0.4px;">${title}</h1>
            <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.7;white-space:pre-wrap;">${message}</p>
            <a href="${process.env.NEXTAUTH_URL}/feed" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">
              Open Distilled
            </a>
          </div>
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;">
            <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;line-height:1.6;">
              You received this because you have an account on Distilled.&nbsp;
              <a href="${process.env.NEXTAUTH_URL}/preferences" style="color:#64748b;text-decoration:none;font-weight:600;">Preferences</a>
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error(`Failed to send announcement email to ${email}:`, error);
    throw new Error("Failed to send announcement email.");
  }
}
