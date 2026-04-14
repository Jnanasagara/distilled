import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/feed");

  return (
    <div style={{
      fontFamily: "Inter, -apple-system, sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      color: "#ffffff",
      overflowX: "hidden",
    }}>
      <style>{`
        .lp-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; max-width: 1100px; margin: 0 auto; }
        .lp-nav-signin { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; }
        .lp-nav-cta { font-size: 14px; font-weight: 700; color: white; text-decoration: none; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; white-space: nowrap; }
        .lp-hero { max-width: 1100px; margin: 0 auto; padding: 80px 40px 60px; text-align: center; }
        .lp-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lp-btn-primary { padding: 16px 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 14px; font-size: 16px; font-weight: 700; letter-spacing: -0.2px; box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
        .lp-btn-secondary { padding: 16px 36px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); text-decoration: none; border-radius: 14px; font-size: 16px; font-weight: 600; }
        .lp-preview { max-width: 900px; margin: 0 auto 80px; padding: 0 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .lp-features { max-width: 1100px; margin: 0 auto; padding: 60px 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .lp-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .lp-feature-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px 24px; }
        .lp-cta { text-align: center; padding: 80px 40px; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-top: 1px solid rgba(99,102,241,0.15); }
        .lp-cta-btn { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 14px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
        .lp-footer { text-align: center; padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); font-size: 13px; }

        @media (max-width: 640px) {
          .lp-nav { padding: 16px 20px; }
          .lp-nav-signin { display: none; }
          .lp-hero { padding: 48px 20px 40px; }
          .lp-hero-btns { flex-direction: column; align-items: stretch; gap: 10px; }
          .lp-btn-primary, .lp-btn-secondary { text-align: center; padding: 15px 24px; font-size: 15px; }
          .lp-preview { padding: 0 20px; grid-template-columns: 1fr; margin-bottom: 48px; }
          .lp-features { padding: 40px 20px; }
          .lp-features-grid { grid-template-columns: 1fr; gap: 16px; }
          .lp-feature-card { padding: 20px 18px; }
          .lp-cta { padding: 56px 20px; }
          .lp-cta-btn { display: block; text-align: center; padding: 15px 24px; font-size: 15px; }
          .lp-footer { padding: 20px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="lp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 18, color: "white",
          }}>D</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Distilled</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/auth" className="lp-nav-signin">Sign in</Link>
          <Link href="/auth" className="lp-nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="lp-hero">
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 999,
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          fontSize: 13, fontWeight: 600, color: "#a5b4fc", marginBottom: 28,
        }}>
          AI-powered · Personalized · Mindful
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 20,
        }}>
          The internet,{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            distilled.
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 20px)", color: "rgba(255,255,255,0.6)",
          maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7,
        }}>
          Distilled curates articles from Reddit, Hacker News, Dev.to, and RSS, ranked by what you actually care about. No noise, no algorithms you can&apos;t control.
        </p>

        <div className="lp-hero-btns">
          <Link href="/auth" className="lp-btn-primary">Start reading free →</Link>
          <a href="#features" className="lp-btn-secondary">See how it works</a>
        </div>
      </div>

      {/* Preview Card Strip */}
      <div className="lp-preview">
        {[
          { emoji: "🤖", topic: "AI", title: "OpenAI releases new reasoning model with 10x improvement", source: "Hacker News" },
          { emoji: "💻", topic: "Tech", title: "Rust overtakes Python in backend performance benchmarks", source: "Dev.to" },
          { emoji: "📈", topic: "Finance", title: "Fed signals rate cuts as inflation drops to 2.1%", source: "RSS" },
        ].map((card) => (
          <div key={card.title} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "20px",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {card.emoji} {card.topic} · {card.source}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, marginBottom: 12 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(99,102,241,0.15)", borderRadius: 8, padding: "8px 12px" }}>
              💡 How this affects you: This could impact your workflow and tooling choices in the next 12 months.
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div id="features" className="lp-features">
        <h2 style={{
          fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800,
          textAlign: "center", marginBottom: 12, letterSpacing: "-1px",
        }}>Everything you need, nothing you don&apos;t</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 40 }}>
          Built for people who want to stay informed without being overwhelmed.
        </p>

        <div className="lp-features-grid">
          {[
            { icon: "🎯", title: "Personalized feed", desc: "Pick your topics. The algorithm learns what you engage with and surfaces more of it over time." },
            { icon: "🤖", title: "AI summaries", desc: "Every article comes with a 2-3 sentence summary and a 'how this affects you' insight, powered by Gemini." },
            { icon: "📬", title: "Email digests", desc: "Get your top articles delivered daily, weekly, or monthly. Read on your own schedule." },
            { icon: "🔍", title: "Multi-source", desc: "Reddit, Hacker News, Dev.to, and RSS feeds, all in one place, deduplicated and ranked." },
            { icon: "📌", title: "Save for later", desc: "Bookmark articles to your saved list and come back to them anytime." },
            { icon: "🌗", title: "Light & dark mode", desc: "Looks great in both. Follows your system preference or switch manually." },
          ].map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="lp-cta">
        <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-1px" }}>
          Ready to read smarter?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 32 }}>
          Free to use. No credit card required.
        </p>
        <Link href="/auth" className="lp-cta-btn">
          Create your free account →
        </Link>
      </div>

      {/* Footer */}
      <div className="lp-footer">
        © 2026 Distilled · <a href="mailto:support@distilled.blog" style={{ color: "rgba(255,255,255,0.3)" }}>support@distilled.blog</a>
      </div>
    </div>
  );
}
