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
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", maxWidth: 1100, margin: "0 auto",
      }}>
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
          <Link href="/auth" style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)",
            textDecoration: "none", padding: "8px 16px",
          }}>Sign in</Link>
          <Link href="/auth" style={{
            fontSize: 14, fontWeight: 700, color: "white",
            textDecoration: "none", padding: "10px 20px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 10,
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "80px 40px 60px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 999,
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          fontSize: 13, fontWeight: 600, color: "#a5b4fc", marginBottom: 28,
        }}>
          AI-powered · Personalized · Mindful
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24,
        }}>
          The internet,{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            distilled.
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.6)",
          maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          Distilled curates articles from Reddit, Hacker News, Dev.to, and RSS, ranked by what you actually care about. No noise, no algorithms you can't control.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth" style={{
            padding: "16px 36px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white", textDecoration: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.2px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}>
            Start reading free →
          </Link>
          <a href="#features" style={{
            padding: "16px 36px", background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)", textDecoration: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 600,
          }}>
            See how it works
          </a>
        </div>
      </div>

      {/* Preview Card Strip */}
      <div style={{
        maxWidth: 900, margin: "0 auto 80px", padding: "0 40px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16,
      }}>
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
      <div id="features" style={{
        maxWidth: 1100, margin: "0 auto", padding: "60px 40px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
          textAlign: "center", marginBottom: 12, letterSpacing: "-1px",
        }}>Everything you need, nothing you don&apos;t</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 56 }}>
          Built for people who want to stay informed without being overwhelmed.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { icon: "🎯", title: "Personalized feed", desc: "Pick your topics. The algorithm learns what you engage with and surfaces more of it over time." },
            { icon: "🤖", title: "AI summaries", desc: "Every article comes with a 2-3 sentence summary and a 'how this affects you' insight, powered by Gemini." },
            { icon: "📬", title: "Email digests", desc: "Get your top articles delivered daily, weekly, or monthly. Read on your own schedule." },
            { icon: "🔍", title: "Multi-source", desc: "Reddit, Hacker News, Dev.to, and RSS feeds, all in one place, deduplicated and ranked." },
            { icon: "📌", title: "Save for later", desc: "Bookmark articles to your saved list and come back to them anytime." },
            { icon: "🌗", title: "Light & dark mode", desc: "Looks great in both. Follows your system preference or switch manually." },
          ].map((f) => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "28px 24px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: "center", padding: "80px 40px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
        borderTop: "1px solid rgba(99,102,241,0.15)",
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-1px" }}>
          Ready to read smarter?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 32 }}>
          Free to use. No credit card required.
        </p>
        <Link href="/auth" style={{
          padding: "16px 40px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white", textDecoration: "none", borderRadius: 14,
          fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
        }}>
          Create your free account →
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "24px 40px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.3)", fontSize: 13,
      }}>
        © 2026 Distilled · <a href="mailto:support@distilled.blog" style={{ color: "rgba(255,255,255,0.3)" }}>support@distilled.blog</a>
      </div>
    </div>
  );
}
