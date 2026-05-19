import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = { title: "Privacy Policy - Distilled", description: "How Distilled collects, uses, and protects your data." };

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        .legal-root { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-page); color: var(--text-heading); font-family: var(--font-geist-sans), 'Inter', -apple-system, sans-serif; }
        .legal-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 64px; border-bottom: 1px solid var(--border-divider); position: sticky; top: 0; background: var(--bg-page); backdrop-filter: blur(12px); z-index: 50; flex-shrink: 0; }
        .legal-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .legal-logo-img { width: 30px; height: 30px; border-radius: 7px; overflow: hidden; background: #fff; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .legal-logo-name { font-size: 16px; font-weight: 800; letter-spacing: -0.4px; background: linear-gradient(135deg, #fb923c, #f97316, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .legal-body { max-width: 760px; margin: 0 auto; padding: 64px 40px; flex: 1; width: 100%; }
        .legal-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(249,115,22,0.10); border: 1px solid rgba(249,115,22,0.25); font-size: 11px; font-weight: 700; color: #f97316; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
        .legal-h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 900; letter-spacing: -1.5px; color: var(--text-heading); margin-bottom: 12px; line-height: 1.08; }
        .legal-meta { font-size: 13px; color: var(--text-muted); margin-bottom: 48px; }
        .legal-toc { background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 14px; padding: 22px 26px; margin-bottom: 52px; }
        .legal-toc-title { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.10em; margin-bottom: 14px; }
        .legal-toc-list { display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0; margin: 0; }
        .legal-toc-list a { font-size: 13.5px; color: var(--text-muted); text-decoration: none; display: flex; align-items: center; gap: 8px; transition: color 0.15s; }
        .legal-toc-list a:hover { color: var(--primary); }
        .legal-toc-num { font-size: 11px; font-weight: 700; color: #f97316; min-width: 20px; }
        .legal-section { margin-bottom: 52px; }
        .legal-h2 { font-size: 20px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.4px; border-top: 1px solid var(--border-divider); padding-top: 24px; margin-bottom: 14px; }
        .legal-p { font-size: 14.5px; color: var(--text-muted); line-height: 1.80; margin-bottom: 14px; }
        .legal-ul { margin: 0 0 16px 0; padding-left: 22px; }
        .legal-ul li { font-size: 14.5px; color: var(--text-muted); line-height: 1.80; margin-bottom: 8px; }
        .legal-highlight { background: var(--bg-elevated); border-left: 3px solid #f97316; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 20px 0; }
        .legal-highlight p { margin: 0; }
        .legal-footer { text-align: center; padding: 32px 40px; border-top: 1px solid var(--border-divider); font-size: 12.5px; color: var(--text-subtle); flex-shrink: 0; }
        .legal-footer a { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
        .legal-footer a:hover { color: var(--primary); }
        @media (max-width: 640px) { .legal-nav { padding: 0 20px; } .legal-body { padding: 40px 20px; } }
      `}</style>

      <div className="legal-root">
        <nav className="legal-nav">
          <Link href="/" className="legal-logo">
            <div className="legal-logo-img">
              <Image src="/logo.jpeg" alt="Distilled" width={30} height={30} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
            </div>
            <span className="legal-logo-name">Distilled</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Back to home</Link>
          </div>
        </nav>

        <div className="legal-body">
          <span className="legal-badge">Legal</span>
          <h1 className="legal-h1">Privacy Policy</h1>
          <p className="legal-meta">Last updated: May 7, 2026 · Effective date: January 1, 2026</p>

          <div className="legal-toc">
            <div className="legal-toc-title">Table of contents</div>
            <ol className="legal-toc-list">
              {[
                "Information we collect",
                "How we use your information",
                "Information sharing",
                "Data retention",
                "Your rights",
                "Cookies",
                "GDPR - European users",
                "Children's privacy",
                "Security",
                "Changes to this policy",
                "Contact us",
              ].map((t, i) => (
                <li key={t}><a href={`#section-${i + 1}`}><span className="legal-toc-num">{String(i + 1).padStart(2, "0")}</span>{t}</a></li>
              ))}
            </ol>
          </div>

          <div className="legal-highlight">
            <p className="legal-p" style={{ marginBottom: 0 }}>
              <strong>Short version:</strong> Distilled collects only what is necessary to run the service. We do not sell your data. We do not run ads. You can delete your account and all associated data at any time.
            </p>
          </div>

          <div id="section-1" className="legal-section">
            <h2 className="legal-h2">1. Information we collect</h2>
            <p className="legal-p">We collect information you provide directly and information generated by your use of the service.</p>
            <p className="legal-p"><strong>Account information:</strong> When you create an account, we collect your name, email address, and (if you set one) a password. If you sign in with Google, we receive your name and email from Google&apos;s OAuth service.</p>
            <p className="legal-p"><strong>Usage data:</strong> We record which articles you read, like, save, and skip. This data powers the ranking algorithm that personalises your feed. It is never sold or shared externally.</p>
            <p className="legal-p"><strong>Preferences:</strong> Topic selections, digest frequency, blocked sources, and any custom RSS feeds you add.</p>
            <p className="legal-p"><strong>Technical data:</strong> IP address (logged transiently for rate-limiting), browser user-agent, and approximate timezone (derived from browser locale, not GPS).</p>
          </div>

          <div id="section-2" className="legal-section">
            <h2 className="legal-h2">2. How we use your information</h2>
            <ul className="legal-ul">
              <li>To personalise and rank your article feed based on your stated interests and engagement history</li>
              <li>To send email digests at the frequency you select (you may unsubscribe at any time)</li>
              <li>To send transactional emails: account verification, password reset, and security notices</li>
              <li>To improve the service - we analyse aggregate, anonymised usage patterns to prioritise features</li>
              <li>To detect and prevent abuse, fraud, and policy violations</li>
            </ul>
            <p className="legal-p">We do not use your data to train third-party AI models. AI summaries are generated by calling the Anthropic Claude API on article text; your personal data is not sent to Anthropic.</p>
          </div>

          <div id="section-3" className="legal-section">
            <h2 className="legal-h2">3. Information sharing</h2>
            <p className="legal-p">We do not sell, rent, or trade your personal information. We share data only in the following limited circumstances:</p>
            <ul className="legal-ul">
              <li><strong>Service providers:</strong> We use Vercel (hosting), Neon/Supabase (database), and Resend (email delivery). Each provider is bound by data processing agreements and may only process data to provide their service to us.</li>
              <li><strong>Legal obligations:</strong> We may disclose information if required by law, court order, or to protect the safety of users or the public.</li>
              <li><strong>Business transfers:</strong> If Distilled is acquired or merges, your information may transfer to the new entity, which will be bound by this policy or a substantially similar one.</li>
            </ul>
          </div>

          <div id="section-4" className="legal-section">
            <h2 className="legal-h2">4. Data retention</h2>
            <p className="legal-p">We retain your account data for as long as your account is active. If you delete your account, we permanently delete all associated personal data within 30 days, except where we are required to retain it for legal reasons (e.g., tax records).</p>
            <p className="legal-p">Anonymised, aggregated analytics data (e.g., "X% of users preferred daily digests") is retained indefinitely as it cannot be linked back to you.</p>
          </div>

          <div id="section-5" className="legal-section">
            <h2 className="legal-h2">5. Your rights</h2>
            <p className="legal-p">You have the following rights regarding your personal data:</p>
            <ul className="legal-ul">
              <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
              <li><strong>Correction:</strong> Update inaccurate data via your Profile settings</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data from your Profile → Security tab</li>
              <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
              <li><strong>Opt-out of digests:</strong> Click "Unsubscribe" in any digest email, or change frequency to "None" in Preferences</li>
            </ul>
            <p className="legal-p">To exercise any right, email <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a>. We will respond within 30 days.</p>
          </div>

          <div id="section-6" className="legal-section">
            <h2 className="legal-h2">6. Cookies</h2>
            <p className="legal-p">We use a minimal set of cookies necessary to operate the service:</p>
            <ul className="legal-ul">
              <li><strong>Session cookie:</strong> A secure, HttpOnly cookie used to maintain your login session. Expires in 30 days (or when you sign out).</li>
              <li><strong>Theme preference:</strong> A localStorage key (not a cookie) storing your light/dark mode preference. Never transmitted to our servers.</li>
            </ul>
            <p className="legal-p">We do not use analytics cookies, advertising cookies, or any third-party tracking pixels. There is no cookie banner because we only use strictly necessary cookies.</p>
          </div>

          <div id="section-7" className="legal-section">
            <h2 className="legal-h2">7. GDPR - European users</h2>
            <p className="legal-p">If you are located in the European Economic Area (EEA), UK, or Switzerland, the following applies:</p>
            <p className="legal-p"><strong>Legal basis for processing:</strong></p>
            <ul className="legal-ul">
              <li>Contract performance - to provide the service you signed up for</li>
              <li>Legitimate interests - to improve the product and detect abuse</li>
              <li>Consent - for optional digest emails (you can withdraw at any time)</li>
            </ul>
            <p className="legal-p"><strong>Data transfers:</strong> Our servers are located in the US and EU. Cross-border transfers are covered by Standard Contractual Clauses (SCCs) with our service providers.</p>
            <p className="legal-p"><strong>Supervisory authority:</strong> You have the right to lodge a complaint with your local data protection authority.</p>
          </div>

          <div id="section-8" className="legal-section">
            <h2 className="legal-h2">8. Children&apos;s privacy</h2>
            <p className="legal-p">Distilled is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If we learn we have collected such information, we will delete it immediately. If you believe a child has provided us with their data, please contact us.</p>
          </div>

          <div id="section-9" className="legal-section">
            <h2 className="legal-h2">9. Security</h2>
            <p className="legal-p">We implement industry-standard security measures including:</p>
            <ul className="legal-ul">
              <li>Passwords hashed with bcrypt (cost factor 12)</li>
              <li>All data transmitted over TLS 1.2+</li>
              <li>Database access restricted to application servers via private networking</li>
              <li>Regular dependency audits and security patches</li>
            </ul>
            <p className="legal-p">No system is 100% secure. If you discover a security vulnerability, please disclose it responsibly to <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a>.</p>
          </div>

          <div id="section-10" className="legal-section">
            <h2 className="legal-h2">10. Changes to this policy</h2>
            <p className="legal-p">We may update this policy occasionally. When we make material changes, we will notify you by email (if you have an account) and update the "Last updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </div>

          <div id="section-11" className="legal-section">
            <h2 className="legal-h2">11. Contact us</h2>
            <p className="legal-p">For privacy questions, data requests, or concerns:</p>
            <ul className="legal-ul">
              <li>Email: <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a></li>
              <li>Response time: within 30 days for GDPR requests, typically within 5 business days for general enquiries</li>
            </ul>
          </div>
        </div>

        <footer className="legal-footer">
          <span>© 2026 Distilled. &nbsp;·&nbsp; </span>
          <Link href="/privacy">Privacy Policy</Link>
          <span> &nbsp;·&nbsp; </span>
          <Link href="/terms">Terms of Service</Link>
          <span> &nbsp;·&nbsp; </span>
          <a href="mailto:support@distilled.blog">support@distilled.blog</a>
        </footer>
      </div>
    </>
  );
}
