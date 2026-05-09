"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STORAGE_KEY = "distilled_welcome_v2";

const STEPS = [
  {
    title: "Welcome to Distilled",
    subtitle: "Your AI-curated news reader",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
          Distilled reads thousands of articles every day and surfaces only what matters
          to <strong style={{ color: "var(--text-heading)" }}>you</strong> - with AI summaries
          and plain-English impact analysis on every card.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: "AI summaries on every article" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: "Feed ranked by your interests" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: "Daily, weekly, or monthly digest" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: "Always know why it appeared" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 12px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border-divider)" }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
              <span style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Reading your feed",
    subtitle: "How each article card works",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
            title: "Like articles",
            desc: "Tap the heart to like an article. This trains your feed to show more of what you enjoy.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
            title: "Bookmark for later",
            desc: "Save any article with the bookmark button. Find everything saved in your Saved tab.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
            title: "Why this article?",
            desc: "Tap the ? button on any card to see exactly why it appeared in your personalised feed.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
            title: "Read the full article",
            desc: "Tap Read or the title to open the original article. Your reading history is tracked automatically.",
          },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-heading)", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Personalise your experience",
    subtitle: "Make Distilled work for you",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
            title: "Adjust your topics anytime",
            desc: "Go to Profile → Preferences to add or remove topic interests. Your feed reranks instantly.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            title: "Choose your digest frequency",
            desc: "Receive a curated email digest daily, weekly, or monthly - only the highlights that matter.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
            title: "Feed gets smarter over time",
            desc: "Every like, save, and read trains the ranking algorithm. The more you use it, the better it gets.",
          },
          {
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
            title: "Light & dark mode",
            desc: "Toggle the theme using the sun/moon button in the top navigation bar.",
          },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-heading)", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "wm-fadeIn 0.22s ease",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Distilled"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div style={{
        background: "var(--bg-card)", borderRadius: 20,
        border: "1px solid var(--border-default)",
        padding: "30px 28px 24px",
        maxWidth: 480, width: "100%",
        boxShadow: "0 32px 96px rgba(0,0,0,0.38)",
        animation: "wm-slideUp 0.25s ease",
        display: "flex", flexDirection: "column", gap: 0,
        maxHeight: "90vh", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(249,115,22,0.25)" }}>
            <Image src="/logo.jpeg" alt="Distilled" width={42} height={42} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.4px" }}>{current.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 1 }}>{current.subtitle}</div>
          </div>
          <button
            onClick={dismiss}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--bg-elevated)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
            aria-label="Close"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                height: 4, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                width: i === step ? 28 : 8,
                background: i === step ? "#f97316" : "var(--border-default)",
                transition: "all 0.25s ease",
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-subtle)", alignSelf: "center", fontWeight: 600 }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 20, paddingRight: 2 }}>
          {current.content}
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {step > 0 ? (
            <button
              onClick={prev}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid var(--border-default)", background: "var(--bg-elevated)", color: "var(--text-muted)", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={dismiss}
              style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-subtle)", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Skip tour
            </button>
          )}
          <button
            onClick={next}
            style={{
              flex: 2, padding: "11px", borderRadius: 10, border: "none",
              background: isLast ? "linear-gradient(135deg, #f97316, #ea6f0f)" : "var(--btn-dark)",
              color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: isLast ? "0 4px 16px rgba(249,115,22,0.40)" : "none",
            }}
          >
            {isLast ? "Start reading →" : "Next →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wm-slideUp { from { opacity: 0; transform: translateY(18px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
