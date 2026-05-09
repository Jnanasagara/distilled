import Link from "next/link";

export const metadata = { title: "Privacy Policy – Distilled" };

export default function PrivacyPage() {
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
          color: #3b82f6; background: rgba(59,130,246,0.08);
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
        .legal-section a { color: #3b82f6; text-decoration: none; }
        .legal-section a:hover { text-decoration: underline; }
        .legal-divider { height: 1px; background: var(--border-default, #e5e7eb); margin: 32px 0; }

        .legal-highlight {
          padding: 16px 20px; border-radius: 10px;
          background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15);
          margin-bottom: 24px;
          font-size: 14px; color: var(--text-muted, #374151); line-height: 1.7;
        }

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
          <div className="legal-tag">Privacy</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: May 2026 · Applies to all Distilled users</p>
        </div>

        <div className="legal-body">

          <div className="legal-highlight">
            <strong>The short version:</strong> We collect only what we need to run the service. We do not sell your data. We do not show you ads. Your reading behavior stays on Distilled and is used solely to improve your personal feed.
          </div>

          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>When you use Distilled, we collect:</p>
            <ul>
              <li><strong>Account information:</strong> your name, email address, and password hash (bcrypt). If you sign in with Google, we receive your Google profile name and email.</li>
              <li><strong>Topic preferences:</strong> the topics you select during onboarding and modify in settings.</li>
              <li><strong>Engagement data:</strong> articles you like, save, dismiss, and click through. This data is used exclusively to personalize your feed ranking.</li>
              <li><strong>Usage data:</strong> time spent on the platform per day, pages visited, and reading history. This is stored per-user and not shared.</li>
              <li><strong>Device data:</strong> push notification subscription tokens if you enable push notifications.</li>
              <li><strong>Communications:</strong> email addresses for digest delivery and support correspondence.</li>
            </ul>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Authenticate your account and maintain your session.</li>
              <li>Personalize your content feed based on topics and engagement signals.</li>
              <li>Send email digests at your chosen frequency (daily, weekly, or monthly).</li>
              <li>Deliver push notifications when your digest is ready, if enabled.</li>
              <li>Send transactional emails (email verification, password reset).</li>
              <li>Improve the platform based on aggregate, anonymized usage patterns.</li>
            </ul>
            <p>We do not use your data for advertising, and we do not sell or rent your personal information to any third party.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>3. Data Storage & Security</h2>
            <p>Your data is stored in a PostgreSQL database hosted on Railway. Passwords are hashed using bcrypt and are never stored in plain text. Sessions are JWT-based with configurable expiry.</p>
            <p>We use industry-standard practices to protect your data, including encrypted connections (HTTPS/TLS) and access-controlled infrastructure. However, no system is perfectly secure — if you suspect unauthorized access to your account, contact us immediately.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>4. Third-Party Services</h2>
            <p>Distilled uses the following third-party services, each with their own privacy policies:</p>
            <ul>
              <li><strong>Resend</strong> — for sending transactional and digest emails.</li>
              <li><strong>Groq / Llama 3.1</strong> — for generating AI article summaries. Article text is sent to Groq's API for processing. No personal user data is sent.</li>
              <li><strong>Google OAuth</strong> — if you choose to sign in with Google.</li>
              <li><strong>Railway</strong> — cloud infrastructure provider hosting our database and server.</li>
            </ul>
            <p>Content is aggregated from Reddit, Hacker News, Dev.to, and RSS feeds. We do not share your personal data with these content sources.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>5. Your Rights & Controls</h2>
            <p>You are in control of your data:</p>
            <ul>
              <li><strong>Access:</strong> Your reading history and saved articles are always accessible in your account.</li>
              <li><strong>Export:</strong> You can export your saved articles as JSON from the Saved page.</li>
              <li><strong>Digest opt-out:</strong> Unsubscribe from email digests at any time via the link in any digest email or through preferences.</li>
              <li><strong>Push notifications:</strong> Manage or revoke push subscriptions from preferences.</li>
              <li><strong>Account deletion:</strong> Delete your account from the profile page. This permanently removes all your data including history, saved articles, interactions, and preferences.</li>
            </ul>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>6. Cookies & Sessions</h2>
            <p>Distilled uses session cookies to keep you logged in. If you select "Remember me" at login, your session persists for 365 days. Otherwise, sessions expire when you close your browser. We do not use tracking cookies or third-party analytics cookies.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>7. Children's Privacy</h2>
            <p>Distilled is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will delete it promptly.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the "last updated" date at the top of this page. For significant changes, we may notify users via email or an in-app announcement.</p>
          </div>

          <div className="legal-divider" />

          <div className="legal-section">
            <h2>9. Contact</h2>
            <p>Questions about privacy? Reach out at <a href="mailto:support@distilled.blog">support@distilled.blog</a>.</p>
          </div>

        </div>
      </div>

      <div className="legal-footer-bar">
        <span>© 2026 Distilled. All rights reserved.</span>
        <div className="legal-footer-links">
          <Link href="/terms">Terms of Service</Link>
          <Link href="mailto:support@distilled.blog">Contact</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </main>
  );
}
