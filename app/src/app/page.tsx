import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";
import LandingInstallButton from "@/components/LandingInstallButton";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/feed");

  return (
    <main style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      overflowX: "hidden",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── NAV ── */
        .lp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 58px;
          border-bottom: 1px solid #181818;
          position: sticky; top: 0; z-index: 50;
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
        .lp-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .lp-logo-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          overflow: hidden;
        }
        .lp-logo-icon img { width: 100%; height: 100%; display: block; }
        .lp-logo-name { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .lp-nav-right { display: flex; align-items: center; gap: 6px; }
        .lp-nav-signin {
          font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.45);
          text-decoration: none; padding: 7px 12px; border-radius: 7px; transition: color 0.15s;
        }
        .lp-nav-signin:hover { color: rgba(255,255,255,0.85); }
        .lp-nav-cta {
          font-size: 13px; font-weight: 600; color: #fff; text-decoration: none;
          padding: 7px 16px; background: #1c1c1c; border: 1px solid #2e2e2e;
          border-radius: 8px; transition: background 0.15s, border-color 0.15s;
        }
        .lp-nav-cta:hover { background: #252525; border-color: #3a3a3a; }

        /* ── HERO ── */
        .lp-hero {
          display: grid; grid-template-columns: 55fr 45fr;
          align-items: center; gap: 56px;
          max-width: 1100px; margin: 0 auto;
          padding: 88px 40px 72px;
        }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 999px;
          background: #131313; border: 1px solid #282828;
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 26px;
        }
        .lp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #f97316; }
        .lp-h1 {
          font-size: clamp(38px, 5vw, 60px); font-weight: 800;
          line-height: 1.06; letter-spacing: -2px; color: #fff; margin-bottom: 18px;
        }
        .lp-h1-dim { color: rgba(255,255,255,0.28); }
        .lp-hero-sub {
          font-size: 15.5px; line-height: 1.65; color: rgba(255,255,255,0.48);
          max-width: 400px; margin-bottom: 36px;
        }
        .lp-hero-sub strong { color: rgba(255,255,255,0.72); font-weight: 500; }
        .lp-hero-actions { display: flex; align-items: center; gap: 10px; margin-bottom: 44px; flex-wrap: wrap; }
        .lp-btn-white {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 11px 22px; background: #fff; color: #0a0a0a;
          border-radius: 8px; font-size: 14px; font-weight: 700;
          text-decoration: none; letter-spacing: -0.2px; transition: background 0.15s;
        }
        .lp-btn-white:hover { background: #ededed; }
        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 11px 16px; color: rgba(255,255,255,0.45);
          border-radius: 8px; font-size: 14px; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .lp-btn-ghost:hover { color: rgba(255,255,255,0.8); }
        .lp-hero-proof {
          display: flex; align-items: center; gap: 0;
          font-size: 11.5px; color: rgba(255,255,255,0.25); flex-wrap: wrap;
        }
        .lp-proof-item {
          display: flex; align-items: center; gap: 5px;
          padding-right: 14px; margin-right: 14px;
          border-right: 1px solid #222; white-space: nowrap;
        }
        .lp-proof-item:last-child { border-right: none; }

        /* ── HERO CARDS ── */
        .lp-hero-right { position: relative; }
        .lp-cards-wrap {
          display: flex; flex-direction: column; gap: 10px;
          position: relative;
        }
        .lp-cards-wrap::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 100px;
          background: linear-gradient(to top, #0a0a0a, transparent);
          pointer-events: none; z-index: 2;
        }
        .lp-mock-card {
          background: #111; border: 1px solid #222;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04);
        }
        .lp-mock-card-img {
          height: 110px; background: #181818;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-mock-img-inner {
          position: absolute; inset: 0;
          opacity: 0.6;
        }
        .lp-mock-source-pill {
          position: absolute; top: 10px; left: 10px;
          padding: 3px 9px; border-radius: 999px;
          font-size: 10px; font-weight: 700; color: #fff;
        }
        .lp-mock-time {
          position: absolute; top: 10px; right: 10px;
          font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 500;
        }
        .lp-mock-body { padding: 14px 16px 16px; }
        .lp-mock-topic { font-size: 11px; font-weight: 600; color: #f97316; margin-bottom: 5px; }
        .lp-mock-title { font-size: 14px; font-weight: 700; color: #f0f0f0; line-height: 1.38; margin-bottom: 8px; }
        .lp-mock-summary { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.55; margin-bottom: 10px; }
        .lp-mock-impact {
          background: rgba(249,115,22,0.07); border-left: 2px solid #f97316;
          border-radius: 0 5px 5px 0; padding: 7px 10px; margin-bottom: 12px;
        }
        .lp-mock-impact-label {
          font-size: 9px; font-weight: 700; color: #fb923c;
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 3px;
        }
        .lp-mock-impact-text { font-size: 11.5px; color: rgba(255,255,255,0.5); line-height: 1.45; }
        .lp-mock-actions {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1px solid #1c1c1c;
        }
        .lp-mock-btns { display: flex; gap: 2px; }
        .lp-mock-btn {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.25); font-size: 13px;
        }
        .lp-mock-read {
          font-size: 12px; font-weight: 600; color: #fff;
          background: #1e1e1e; border: 1px solid #2c2c2c;
          padding: 5px 12px; border-radius: 6px;
        }

        /* ── SOURCES STRIP ── */
        .lp-sources {
          border-top: 1px solid #141414; border-bottom: 1px solid #141414;
          background: #0d0d0d; padding: 16px 40px;
        }
        .lp-sources-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .lp-sources-label { font-size: 11.5px; color: rgba(255,255,255,0.22); font-weight: 500; flex-shrink: 0; }
        .lp-source-sep { color: #282828; font-size: 14px; }
        .lp-source-tag {
          font-size: 11.5px; font-weight: 600; padding: 4px 11px;
          border-radius: 999px; border: 1px solid #242424; background: #141414;
          white-space: nowrap; letter-spacing: 0.01em;
        }

        /* ── FEATURE SECTIONS ── */
        .lp-section { max-width: 1100px; margin: 0 auto; padding: 96px 40px; }
        .lp-section-sm { max-width: 1100px; margin: 0 auto; padding: 0 40px 96px; }
        .lp-overline {
          font-size: 11px; font-weight: 700; color: #f97316;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
        }
        .lp-h2 {
          font-size: clamp(26px, 3.5vw, 40px); font-weight: 800;
          letter-spacing: -1.2px; color: #fff; line-height: 1.08; margin-bottom: 14px;
        }
        .lp-h2-sub {
          font-size: 15px; color: rgba(255,255,255,0.42); line-height: 1.65;
          max-width: 420px;
        }

        .lp-feat-split {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .lp-feat-visual {
          background: #0f0f0f; border: 1px solid #1e1e1e;
          border-radius: 14px; padding: 28px; overflow: hidden;
        }

        /* Impact feature visual */
        .lp-impact-demo {
          display: flex; flex-direction: column; gap: 10px;
        }
        .lp-impact-demo-card {
          background: #161616; border: 1px solid #242424;
          border-radius: 10px; padding: 14px 16px;
        }
        .lp-impact-demo-title {
          font-size: 13px; font-weight: 700; color: #e8e8e8; margin-bottom: 8px; line-height: 1.35;
        }
        .lp-impact-demo-text {
          font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.55; margin-bottom: 10px;
        }
        .lp-impact-demo-block {
          background: rgba(249,115,22,0.08); border-left: 2px solid #f97316;
          border-radius: 0 6px 6px 0; padding: 8px 11px;
        }
        .lp-impact-demo-block-label {
          font-size: 9px; font-weight: 700; color: #f97316;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;
        }
        .lp-impact-demo-block-text {
          font-size: 11.5px; color: rgba(255,255,255,0.5); line-height: 1.45;
        }

        /* Personalization visual */
        .lp-topics-demo { display: flex; flex-wrap: wrap; gap: 8px; }
        .lp-topic-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid #2a2a2a; background: #161616;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7);
          cursor: default;
        }
        .lp-topic-chip.active {
          border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.09);
          color: #fb923c;
        }
        .lp-topic-check {
          width: 15px; height: 15px; border-radius: 4px;
          border: 1.5px solid #3a3a3a; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-topic-check.checked {
          background: #f97316; border-color: #f97316;
          font-size: 9px; color: #fff; font-weight: 800;
        }
        .lp-feed-preview {
          margin-top: 20px; display: flex; flex-direction: column; gap: 8px;
        }
        .lp-feed-row {
          background: #161616; border: 1px solid #242424;
          border-radius: 8px; padding: 11px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .lp-feed-row-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .lp-feed-row-text { font-size: 12.5px; color: rgba(255,255,255,0.55); font-weight: 500; flex: 1; }
        .lp-feed-row-source { font-size: 10.5px; color: rgba(255,255,255,0.2); }

        /* ── HOW IT WORKS ── */
        .lp-hiw-bg { background: #080808; border-top: 1px solid #141414; border-bottom: 1px solid #141414; }
        .lp-hiw { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
        .lp-hiw-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 48px; }
        .lp-step {
          padding: 32px 32px 32px 0;
          border-right: 1px solid #1a1a1a;
          padding-right: 32px; margin-right: 32px;
        }
        .lp-step:last-child { border-right: none; padding-right: 0; margin-right: 0; }
        .lp-step-num {
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: 0.04em; margin-bottom: 14px; font-variant-numeric: tabular-nums;
        }
        .lp-step-title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; letter-spacing: -0.3px; }
        .lp-step-desc { font-size: 13.5px; color: rgba(255,255,255,0.38); line-height: 1.65; }

        /* ── SECONDARY FEATURES GRID ── */
        .lp-grid { display: grid; grid-template-columns: 5fr 4fr 4fr; gap: 14px; }
        .lp-grid-card {
          background: #0f0f0f; border: 1px solid #1e1e1e;
          border-radius: 12px; padding: 28px 24px;
          transition: border-color 0.2s;
        }
        .lp-grid-card:hover { border-color: #2c2c2c; }
        .lp-grid-card-icon { font-size: 20px; margin-bottom: 14px; display: block; }
        .lp-grid-card-title { font-size: 14.5px; font-weight: 700; color: #f0f0f0; margin-bottom: 8px; letter-spacing: -0.2px; }
        .lp-grid-card-desc { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.6; }

        /* Email digest visual */
        .lp-digest-demo { margin-top: 20px; }
        .lp-digest-header {
          background: #1a1a1a; border: 1px solid #2a2a2a;
          border-radius: 8px 8px 0 0; padding: 10px 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-digest-from { font-size: 11px; color: rgba(255,255,255,0.3); }
        .lp-digest-from strong { color: rgba(255,255,255,0.6); }
        .lp-digest-body {
          background: #161616; border: 1px solid #2a2a2a; border-top: none;
          border-radius: 0 0 8px 8px; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .lp-digest-item { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.4; display: flex; gap: 8px; }
        .lp-digest-item-num { color: #f97316; font-weight: 700; flex-shrink: 0; }

        /* ── CTA ── */
        .lp-cta { padding: 100px 40px; text-align: center; border-top: 1px solid #141414; }
        .lp-cta-inner { max-width: 520px; margin: 0 auto; }
        .lp-cta-h2 {
          font-size: clamp(28px, 4vw, 44px); font-weight: 800;
          letter-spacing: -1.5px; color: #fff; margin-bottom: 14px; line-height: 1.1;
        }
        .lp-cta-sub { font-size: 15px; color: rgba(255,255,255,0.38); margin-bottom: 32px; line-height: 1.6; }
        .lp-cta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 13px 28px; background: #fff; color: #0a0a0a;
          border-radius: 8px; font-size: 14.5px; font-weight: 700;
          text-decoration: none; letter-spacing: -0.2px; transition: background 0.15s;
        }
        .lp-cta-btn:hover { background: #ebebeb; }
        .lp-cta-note { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 14px; }

        /* ── FOOTER ── */
        .lp-footer-wrap { border-top: 1px solid #141414; }
        .lp-footer {
          max-width: 1100px; margin: 0 auto; padding: 24px 40px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; color: rgba(255,255,255,0.2);
        }
        .lp-footer a { color: rgba(255,255,255,0.2); text-decoration: none; transition: color 0.15s; }
        .lp-footer a:hover { color: rgba(255,255,255,0.5); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; padding: 60px 24px 48px; gap: 40px; min-height: auto; }
          .lp-hero-sub { max-width: 100%; }
          .lp-feat-split { grid-template-columns: 1fr; gap: 36px; }
          .lp-grid { grid-template-columns: 1fr; }
          .lp-hiw-steps { grid-template-columns: 1fr; gap: 0; }
          .lp-step { border-right: none; border-bottom: 1px solid #1a1a1a; padding: 24px 0; margin: 0; }
          .lp-step:last-child { border-bottom: none; }
          .lp-section { padding: 60px 24px; }
          .lp-section-sm { padding: 0 24px 60px; }
          .lp-hiw { padding: 60px 24px; }
          .lp-cta { padding: 60px 24px; }
        }
        @media (max-width: 640px) {
          .lp-nav { padding: 0 20px; }
          .lp-nav-signin { display: none; }
          .lp-h1 { letter-spacing: -1.5px; }
          .lp-hero-actions { flex-direction: column; align-items: flex-start; }
          .lp-sources { padding: 14px 20px; }
          .lp-footer { flex-direction: column; gap: 8px; text-align: center; padding: 20px; }
          .lp-hero-proof { gap: 8px; }
          .lp-proof-item { border-right: none; padding-right: 0; margin-right: 0; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <Link href="/" className="lp-logo">
          <div className="lp-logo-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
          <span className="lp-logo-name">Distilled</span>
        </Link>
        <div className="lp-nav-right">
          <Link href="/auth" className="lp-nav-signin">Sign in</Link>
          <Link href="/auth" className="lp-nav-cta">Get started free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Personalized news aggregator
          </div>

          <h1 className="lp-h1">
            Read less.<br />
            <span className="lp-h1-dim">Know more.</span>
          </h1>

          <p className="lp-hero-sub">
            Distilled pulls from <strong>Reddit, Hacker News, Dev.to, and RSS</strong>, then ranks, filters, and summarizes everything based on topics you actually care about.
          </p>

          <div className="lp-hero-actions">
            <Link href="/auth" className="lp-btn-white">
              Start for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </Link>
            <a href="#how-it-works" className="lp-btn-ghost">
              See how it works
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
            </a>
            <LandingInstallButton />
          </div>

          <div className="lp-hero-proof">
            <span className="lp-proof-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              AI summaries on every article
            </span>
            <span className="lp-proof-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Daily, weekly, or monthly digest
            </span>
            <span className="lp-proof-item" style={{ borderRight: "none" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Why each article was shown
            </span>
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="lp-cards-wrap">
            {/* Card 1 */}
            <div className="lp-mock-card">
              <div className="lp-mock-card-img">
                <div className="lp-mock-img-inner" style={{ background: "linear-gradient(135deg, #1c2333 0%, #0d1117 100%)" }} />
                <span className="lp-mock-source-pill" style={{ background: "#FF6600" }}>Hacker News</span>
                <span className="lp-mock-time">2h ago</span>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-topic">🤖 AI & Machine Learning</div>
                <div className="lp-mock-title">OpenAI's o3 achieves 87.7% on ARC-AGI, a 25-point jump over GPT-4</div>
                <div className="lp-mock-summary">The new reasoning model surpasses prior benchmarks by a wide margin, with particularly strong gains in abstract problem-solving and code tasks.</div>
                <div className="lp-mock-impact">
                  <div className="lp-mock-impact-label">How this affects you</div>
                  <div className="lp-mock-impact-text">Developers building AI-native products will see cheaper, faster inference for complex reasoning tasks within 60 days of GA release.</div>
                </div>
                <div className="lp-mock-actions">
                  <div className="lp-mock-btns">
                    <span className="lp-mock-btn">♡</span>
                    <span className="lp-mock-btn">⊹</span>
                    <span className="lp-mock-btn">?</span>
                    <span className="lp-mock-btn">↗</span>
                  </div>
                  <span className="lp-mock-read">Read →</span>
                </div>
              </div>
            </div>

            {/* Card 2 (partial) */}
            <div className="lp-mock-card">
              <div className="lp-mock-card-img">
                <div className="lp-mock-img-inner" style={{ background: "linear-gradient(135deg, #1a1f2e 0%, #0e1117 100%)" }} />
                <span className="lp-mock-source-pill" style={{ background: "#FF4500" }}>Reddit</span>
                <span className="lp-mock-time">5h ago</span>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-topic">💻 Software Engineering</div>
                <div className="lp-mock-title">Bun 1.2 ships with a native PostgreSQL client and 3x faster cold starts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOURCES ── */}
      <div className="lp-sources">
        <div className="lp-sources-inner">
          <span className="lp-sources-label">Curated from</span>
          <span className="lp-source-sep">·</span>
          <span className="lp-source-tag" style={{ color: "#FF6600" }}>Hacker News</span>
          <span className="lp-source-tag" style={{ color: "#FF4500" }}>Reddit</span>
          <span className="lp-source-tag" style={{ color: "#5B73E8" }}>Dev.to</span>
          <span className="lp-source-tag" style={{ color: "#FFA500" }}>RSS Feeds</span>
          <span className="lp-sources-label" style={{ marginLeft: "auto" }}>More sources coming soon</span>
        </div>
      </div>

      {/* ── FEATURE 1: AI Summaries ── */}
      <section className="lp-section">
        <div className="lp-feat-split">
          <div>
            <p className="lp-overline">AI intelligence</p>
            <h2 className="lp-h2">Stop skimming.<br />Read what matters.</h2>
            <p className="lp-h2-sub" style={{ marginBottom: 32 }}>
              Every article gets a two-sentence summary and a plain-English explanation of how it affects you: developers, investors, or consumers, specifically.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "2–3 sentence neutral summary of the article",
                "\"How this affects you\": direct, no fluff",
                "Tap ? on any card to see exactly why it was shown",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 8 }} />
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-feat-visual">
            <div className="lp-impact-demo">
              <div className="lp-impact-demo-card">
                <div className="lp-impact-demo-title">Rust's async runtime Tokio hits 1.0 stable with breaking API cleanup</div>
                <div className="lp-impact-demo-text">The Tokio team officially stabilized several long-awaited APIs and removed deprecated patterns that had accumulated since 2019, marking a turning point for the async ecosystem.</div>
                <div className="lp-impact-demo-block">
                  <div className="lp-impact-demo-block-label">How this affects you</div>
                  <div className="lp-impact-demo-block-text">Rust developers using async I/O will need to update 1-2 call sites per project. Migration is straightforward and worth the improved ergonomics.</div>
                </div>
              </div>
              <div className="lp-impact-demo-card" style={{ opacity: 0.5 }}>
                <div className="lp-impact-demo-title">EU passes Digital Markets Act enforcement deadline for major platforms</div>
                <div className="lp-impact-demo-text" style={{ marginBottom: 0 }}>New compliance requirements take effect March 7th...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 2: Personalization ── */}
      <section className="lp-section-sm">
        <div className="lp-feat-split" style={{ direction: "rtl" }}>
          <div style={{ direction: "ltr" }}>
            <p className="lp-overline">Smart ranking</p>
            <h2 className="lp-h2">A feed that learns<br />what you care about.</h2>
            <p className="lp-h2-sub" style={{ marginBottom: 32 }}>
              Pick your topics on day one. As you like, save, and click articles, Distilled re-weights its ranking to surface more of what you actually engage with.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "No black-box algorithm. You can see and adjust topic weights",
                "New articles re-ranked every few hours from fresh sources",
                "Trending articles from across your topics surface automatically",
              ].map((text) => (
                <div key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-feat-visual" style={{ direction: "ltr" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Your topics</div>
              <div className="lp-topics-demo">
                {[
                  { label: "AI", active: true },
                  { label: "Programming", active: true },
                  { label: "Finance", active: true },
                  { label: "Security", active: false },
                  { label: "Startups", active: true },
                  { label: "Cloud", active: false },
                  { label: "Climate", active: false },
                  { label: "Gaming", active: true },
                ].map((t) => (
                  <div key={t.label} className={`lp-topic-chip ${t.active ? "active" : ""}`}>
                    <div className={`lp-topic-check ${t.active ? "checked" : ""}`}>
                      {t.active && "✓"}
                    </div>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: "#1e1e1e", margin: "16px 0" }} />
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Your ranked feed</div>
              <div className="lp-feed-preview">
                {[
                  { dot: "#f97316", text: "OpenAI releases o3 for API access, pricing details inside", src: "HN" },
                  { dot: "#0ea5e9", text: "Bun 1.2 ships built-in PostgreSQL driver", src: "Dev.to" },
                  { dot: "#10b981", text: "S&P 500 closes 2.4% up on Fed minutes release", src: "RSS" },
                ].map((row) => (
                  <div key={row.text} className="lp-feed-row">
                    <div className="lp-feed-row-dot" style={{ background: row.dot }} />
                    <div className="lp-feed-row-text">{row.text}</div>
                    <div className="lp-feed-row-source">{row.src}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="lp-hiw-bg" id="how-it-works">
        <div className="lp-hiw">
          <div style={{ maxWidth: 480 }}>
            <p className="lp-overline">How it works</p>
            <h2 className="lp-h2" style={{ marginBottom: 0 }}>Up and running<br />in three steps.</h2>
          </div>
          <div className="lp-hiw-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <div className="lp-step-title">Pick your topics</div>
              <div className="lp-step-desc">Choose from 20+ categories: AI, Finance, Security, Gaming, and more. Your feed is built around what you select.</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <div className="lp-step-title">Get your feed</div>
              <div className="lp-step-desc">Distilled ingests articles every few hours and ranks them by relevance to your interests. AI summaries generate automatically.</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <div className="lp-step-title">Read on your schedule</div>
              <div className="lp-step-desc">Open the feed when you want. Or get a curated digest by email: daily, weekly, or monthly, with just the highlights.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECONDARY FEATURES ── */}
      <section className="lp-section">
        <div style={{ marginBottom: 36 }}>
          <p className="lp-overline">Everything else</p>
          <h2 className="lp-h2" style={{ marginBottom: 8 }}>Built for daily use.</h2>
          <p className="lp-h2-sub">The details that make a reading habit actually stick.</p>
        </div>
        <div className="lp-grid">
          <div className="lp-grid-card">
            <div className="lp-grid-card-title">Email digests that don't suck</div>
            <div className="lp-grid-card-desc">Choose daily, weekly, or monthly delivery. Each digest includes your top articles with summaries. No need to click through if you don't want to.</div>
            <div className="lp-digest-demo">
              <div className="lp-digest-header">
                <div className="lp-digest-from">From: <strong>Distilled Weekly</strong> · Your 5 top stories</div>
              </div>
              <div className="lp-digest-body">
                {[
                  "OpenAI o3 achieves human-level scores on ARC benchmark",
                  "Rust async stabilization: what changes in your code",
                  "Fed signals two cuts in Q3 as CPI drops to 2.1%",
                ].map((text, i) => (
                  <div key={text} className="lp-digest-item">
                    <span className="lp-digest-item-num">{i + 1}.</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-grid-card">
            <div className="lp-grid-card-title">Save for later</div>
            <div className="lp-grid-card-desc">Bookmark any article with one tap. Your saved list is always there, synced and searchable, organized by when you saved it.</div>
          </div>
          <div className="lp-grid-card">
            <div className="lp-grid-card-title">Light and dark mode</div>
            <div className="lp-grid-card-desc">Toggle between modes manually or follow your system preference. Both are carefully designed, not just an inverted palette.</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-h2">Start reading smarter today.</h2>
          <p className="lp-cta-sub">Free to use. No credit card required. Takes 60 seconds to set up.</p>
          <Link href="/auth" className="lp-cta-btn">
            Create your free account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </Link>
          <p className="lp-cta-note">No spam. Unsubscribe from digests anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="lp-footer-wrap">
        <div className="lp-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, overflow: "hidden", flexShrink: 0 }}><img src="/android-chrome-192x192.png" alt="Distilled" style={{ width: "100%", height: "100%", display: "block" }} /></div>
            <span>Distilled · © 2026</span>
          </div>
          <a href="mailto:support@distilled.blog">support@distilled.blog</a>
        </div>
      </div>
    </main>
  );
}
