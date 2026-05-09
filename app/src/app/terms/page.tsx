import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = { title: "Terms of Service - Distilled", description: "The rules for using Distilled, our AI-curated news reader." };

export default function TermsPage() {
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
          <h1 className="legal-h1">Terms of Service</h1>
          <p className="legal-meta">Last updated: May 7, 2026 · Effective date: January 1, 2026</p>

          <div className="legal-toc">
            <div className="legal-toc-title">Table of contents</div>
            <ol className="legal-toc-list">
              {[
                "Acceptance of terms",
                "The service",
                "Account registration",
                "Acceptable use",
                "Intellectual property",
                "Content from third-party sources",
                "Disclaimer of warranties",
                "Limitation of liability",
                "Termination",
                "Changes to these terms",
                "Governing law",
                "Contact",
              ].map((t, i) => (
                <li key={t}><a href={`#t-section-${i + 1}`}><span className="legal-toc-num">{String(i + 1).padStart(2, "0")}</span>{t}</a></li>
              ))}
            </ol>
          </div>

          <div className="legal-highlight">
            <p className="legal-p" style={{ marginBottom: 0 }}>
              <strong>Short version:</strong> Use Distilled for personal, lawful purposes. Don&apos;t scrape, abuse, or impersonate others. Your content stays yours. We can suspend accounts that violate these terms. This is a free service provided as-is.
            </p>
          </div>

          <div id="t-section-1" className="legal-section">
            <h2 className="legal-h2">1. Acceptance of terms</h2>
            <p className="legal-p">By creating an account or using Distilled (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
            <p className="legal-p">These Terms form a binding agreement between you and Distilled ("we", "us", "our"). We reserve the right to update these Terms at any time. Continued use after an update constitutes acceptance of the revised Terms.</p>
          </div>

          <div id="t-section-2" className="legal-section">
            <h2 className="legal-h2">2. The service</h2>
            <p className="legal-p">Distilled is an AI-curated news aggregation service that collects publicly available articles from third-party sources, generates summaries using large language models, and personalises a ranked feed for registered users.</p>
            <p className="legal-p">The Service is provided free of charge. We reserve the right to introduce optional paid features in the future, but all current core features will remain free.</p>
          </div>

          <div id="t-section-3" className="legal-section">
            <h2 className="legal-h2">3. Account registration</h2>
            <p className="legal-p">You must be at least 13 years old to create an account. By registering, you confirm that all information you provide is accurate and that you will keep it up to date.</p>
            <p className="legal-p">You are responsible for maintaining the security of your account credentials. Do not share your password. Notify us immediately at <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a> if you suspect unauthorised access to your account.</p>
            <p className="legal-p">One person may register only one account unless we explicitly permit otherwise.</p>
          </div>

          <div id="t-section-4" className="legal-section">
            <h2 className="legal-h2">4. Acceptable use</h2>
            <p className="legal-p">You agree not to:</p>
            <ul className="legal-ul">
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations</li>
              <li>Scrape, crawl, or systematically download content from the Service without written permission</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
              <li>Submit false reports, spam the support system, or abuse any feedback mechanism</li>
              <li>Use the Service in a way that could damage, disable, overburden, or impair it</li>
            </ul>
          </div>

          <div id="t-section-5" className="legal-section">
            <h2 className="legal-h2">5. Intellectual property</h2>
            <p className="legal-p">The Distilled name, logo, UI design, and original software code are owned by Distilled and protected by applicable intellectual property laws.</p>
            <p className="legal-p">Article summaries generated by our AI are derived from third-party source material and are provided for informational purposes only. We do not claim ownership of underlying article content.</p>
            <p className="legal-p">Any feedback or suggestions you submit may be used by us without obligation to you.</p>
          </div>

          <div id="t-section-6" className="legal-section">
            <h2 className="legal-h2">6. Content from third-party sources</h2>
            <p className="legal-p">Distilled aggregates content from sources including Hacker News, Reddit, Dev.to, Al Jazeera, Atlas News, and custom RSS feeds. Each source retains full copyright over its original content.</p>
            <p className="legal-p">We link to original articles and display short excerpts or AI-generated summaries. We are not responsible for the accuracy, completeness, or legality of third-party content.</p>
            <p className="legal-p">If you are a publisher and believe your content is being used in a way that infringes your rights, please contact <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a> and we will respond promptly.</p>
          </div>

          <div id="t-section-7" className="legal-section">
            <h2 className="legal-h2">7. Disclaimer of warranties</h2>
            <p className="legal-p">The Service is provided "as is" and "as available" without any warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            <p className="legal-p">We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. AI-generated summaries may contain inaccuracies - always verify important information from the original source.</p>
          </div>

          <div id="t-section-8" className="legal-section">
            <h2 className="legal-h2">8. Limitation of liability</h2>
            <p className="legal-p">To the maximum extent permitted by law, Distilled shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service, even if we have been advised of the possibility of such damages.</p>
            <p className="legal-p">Our total liability to you for any claims under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim (which, for the free service, is zero).</p>
          </div>

          <div id="t-section-9" className="legal-section">
            <h2 className="legal-h2">9. Termination</h2>
            <p className="legal-p">You may delete your account at any time from Profile → Security → Danger Zone. Deletion is permanent and irreversible.</p>
            <p className="legal-p">We reserve the right to suspend or terminate your account if you violate these Terms, with or without notice. We will make reasonable efforts to notify you by email prior to termination except in cases of serious violations.</p>
          </div>

          <div id="t-section-10" className="legal-section">
            <h2 className="legal-h2">10. Changes to these terms</h2>
            <p className="legal-p">We may revise these Terms from time to time. We will notify registered users by email of material changes at least 14 days before they take effect. The updated Terms will be posted at this URL with a new effective date.</p>
          </div>

          <div id="t-section-11" className="legal-section">
            <h2 className="legal-h2">11. Governing law</h2>
            <p className="legal-p">These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Coimbatore, Tamil Nadu, India.</p>
          </div>

          <div id="t-section-12" className="legal-section">
            <h2 className="legal-h2">12. Contact</h2>
            <p className="legal-p">For any questions about these Terms, please contact us:</p>
            <ul className="legal-ul">
              <li>Email: <a href="mailto:support@distilled.blog" style={{ color: "#f97316" }}>support@distilled.blog</a></li>
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
