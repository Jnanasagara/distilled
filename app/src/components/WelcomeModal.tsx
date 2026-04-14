"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "distilled_welcome_seen";

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div style={{
        background: "var(--bg-card)", borderRadius: 20,
        padding: "36px 32px", maxWidth: 460, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        animation: "slideUp 0.25s ease",
      }}>
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 22, color: "white", flexShrink: 0,
          }}>D</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.4px" }}>
              Welcome to Distilled
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Here&apos;s how to get the most out of it
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {[
            { icon: "🎯", title: "Your feed is personalized", desc: "Articles are ranked by topics you picked. The more you engage, the smarter it gets." },
            { icon: "💡", title: "AI summaries on every card", desc: "Each article has a short summary and a 'how this affects you' insight below the title." },
            { icon: "❓", title: "Why this post?", desc: "Tap the ? button on any card to see exactly why that article was shown to you." },
            { icon: "📌", title: "Save articles for later", desc: "Tap the bookmark on any card. Find them all in your Saved tab." },
            { icon: "📬", title: "Email digests", desc: "You'll get a digest of top articles based on your frequency preference (daily/weekly/monthly)." },
          ].map((step) => (
            <div key={step.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{step.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)", marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
            letterSpacing: "-0.2px",
          }}
        >
          Start reading →
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
