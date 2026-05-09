import Link from "next/link";

export const metadata = { title: "Terms of Service – Distilled" };

export default function TermsPage() {
  return (
    <main style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      background: "var(--bg-page, #fff)",
      color: "var(--text-heading, #111)",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .legal-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 56px;
          border-bottom: 1px solid var(--border-default, #e5e7eb);
          position: sticky; top: 0; z-index: 50;
          background: var(--bg-page, #fff);
        }
        .legal-nav-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .legal-nav-brand-icon { width: 30px; height: 30px; border-radius: 7px; overflow: hidden; }
        .legal-nav-brand-icon img { width: 100%; height: 100%; display: block; }
        .legal-nav-brand-name { font-size: 16px; font-weight: 700; color: var(--text-heading, #111); letter-spacing: -0.3px; }
        .legal-nav-back {
          font-size: 13px; color: var(--text-muted, #6b7280); text-decoration: none;
          display: flex; align-items: center; gap: 5px; transition: color 0.15s;
        }
        .legal-nav-back:hover { color: var(--text-heading, #111); }

        .legal-page { width: 100%; padding: 56px 40px 80px; }
        .legal-header { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid var(--border-default, #e5e7eb); }
        .legal-tag {
          display: inline-block; font-size: 11px; font-weight: 700;
          color: #f97316; background: rgba(249,115,22,0.08);
          padding: 4px 10px; border-radius: 999px; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .legal-title { font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1.2px; margin-bottom: 12px; }
        .legal-meta { font-size: 13.5px; color: var(--text-muted, #6b7280); }

        .legal-body { width: 100%; }
        .legal-section { margin-bottom: 40px; }
        .legal-section h2 {
          font-size: 18px; font-weight: 700; margin-bottom: 14px;
          color: var(--text-heading, #111); letter-spacing: -0.3px;
        }
        .legal-section p, .legal-section li {
          font-size: 15px; color: var(--text-muted, #374151);
          line-height: 1.75; margin-bottom: 12px;
        }
        .legal-section ul { padding-left: 20px; }
        .legal-section li { margin-bottom: 8px; }
        .legal-section a { color: #f97316; text-decoration: none; }
        .legal-section a:hover { text-decoration: underline; }
        .legal-divider { height: 1px; background: var(--border-default, #e5e7eb); margin: 32px 0; }

        .legal-footer-bar {
          border-top: 1px solid var(--border-default, #e5e7eb);
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 13px; color: var(--text-muted, #6b7280);
          flex-wrap: wrap; gap: 10px;
        }
        .legal-footer-bar a { color: var(--text-muted, #6b7280); text-decoration: none; transition: color 0.15s; }
        .legal-footer-bar a:hover { color: var(--text-heading, #111); }
        .legal-footer-links { display: flex; gap: 18px; }
        @media (max-width: 640px) {
          .legal-nav { padding: 0 20px; }
          .legal-page { padding: 40px 20px 60px; }
          .legal-footer-bar { padding: 16px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Nav */}
      <nav className="legal-nav">
        <Link href="/" className="legal-nav-brand">
          <div className="legal-nav-brand-icon">
            <img src="/android-chrome-192x192.png" alt="Distilled" />
          </div>
          <span className="legal-nav-brand-name">Distilled</span>
        </Link>
        <Link href="/" className="legal-nav-back">
          ← Back to home
        </Link>
      </nav>

      {/* Content */}
      <div className="legal-page">
        <div className="legal-header">
          <div className="legal-tag">Legal</div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last updated: May 2026 · Effective immediately upon account creation</p>
        </div>

        <div className="legal-body">

          <div className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Distilled ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service constitutes acceptance of the updated terms.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>2. Description of Service</h2>
            <p>Distilled is a personalized content aggregation platform that pulls, ranks, and summarizes publicly available articles from third-party sources including Reddit, Hacker News, Dev.to, and custom RSS feeds. We provide AI-generated summaries and personalized feeds based on your topic preferences and engagement behavior.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>3. Third-Party Content Disclaimer</h2>
            <p>Distilled aggregates content from publicly available third-party sources. We do not create, endorse, or claim ownership of any third-party content displayed on the platform. All articles are attributed to and link back to their original publishers.</p>
            <ul>
              <li>Distilled is not responsible for the accuracy, completeness, or legality of third-party content.</li>
              <li>Opinions expressed in third-party articles are those of the original authors and do not represent the views of Distilled.</li>
              <li>Third-party content is displayed for informational and discovery purposes only.</li>
              <li>If you believe content infringes your rights, please contact us at <a href="mailto:support@distilled.blog">support@distilled.blog</a>.</li>
            </ul>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>4. User Accounts</h2>
            <p>You must create an account to use Distilled. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activity that occurs under your account.</li>
              <li>Providing accurate and complete registration information.</li>
              <li>Notifying us immediately of any unauthorized account use.</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or compromise the security or integrity of the platform.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use Distilled to:</p>
            <ul>
              <li>Violate any applicable laws or regulations.</li>
              <li>Attempt to reverse-engineer, scrape, or systematically download content from the platform.</li>
              <li>Submit false reports or abuse the reporting system.</li>
              <li>Attempt to gain unauthorized access to other accounts or systems.</li>
              <li>Distribute spam, malware, or harmful content through any feature of the Service.</li>
            </ul>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>6. Email Digests & Notifications</h2>
            <p>By enabling email digests or push notifications, you consent to receive communications from Distilled. You can unsubscribe from email digests at any time via the unsubscribe link in any digest email or through your account preferences. Push notification subscriptions can be managed from your preferences page.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>The Distilled platform, including its UI, design, algorithms, and AI summaries, is the intellectual property of Distilled. Third-party article titles, excerpts, and content belong to their respective owners. AI-generated summaries are created by Distilled and are provided under fair use principles for informational purposes.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>8. Limitation of Liability</h2>
            <p>Distilled is provided "as is" without warranty of any kind. To the fullest extent permitted by law, Distilled shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service or reliance on any content displayed therein.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>9. Termination</h2>
            <p>You may delete your account at any time from the profile settings page. We reserve the right to terminate or suspend access to the Service at our discretion, with or without notice, for conduct that violates these terms or is otherwise harmful to the platform or its users.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>10. Contact</h2>
            <p>Questions about these Terms? Contact us at <a href="mailto:support@distilled.blog">support@distilled.blog</a>.</p>
          </div>

        </div>
      </div>

      <div className="legal-footer-bar">
        <span>© 2026 Distilled. All rights reserved.</span>
        <div className="legal-footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="mailto:support@distilled.blog">Contact</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </main>
  );
}
