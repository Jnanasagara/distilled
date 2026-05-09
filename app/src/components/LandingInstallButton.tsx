"use client";

import { useEffect, useRef, useState } from "react";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function LandingInstallButton() {
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const deferredPrompt = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const iosDevice = isIOS();
    if (iosDevice) {
      setIos(true);
      setReady(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as typeof deferredPrompt.current;
      setReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!ready) return null;

  async function handleClick() {
    if (ios) {
      setShowIOSHint((v) => !v);
      return;
    }
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    deferredPrompt.current = null;
    setReady(false);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleClick}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "11px 18px",
          background: "transparent",
          border: "1px solid rgba(249,115,22,0.45)",
          color: "#fb923c",
          borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: "pointer", letterSpacing: "-0.1px",
          transition: "border-color 0.15s, background 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.8)";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.45)";
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
        Install app
      </button>

      {ios && showIOSHint && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", left: 0,
          background: "#1a1a1a", border: "1px solid #2e2e2e",
          borderRadius: 10, padding: "12px 16px",
          fontSize: 12.5, color: "rgba(255,255,255,0.65)",
          lineHeight: 1.6, whiteSpace: "nowrap", zIndex: 100,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          Tap <strong style={{ color: "#fff" }}>Share</strong> then{" "}
          <strong style={{ color: "#fff" }}>&ldquo;Add to Home Screen&rdquo;</strong>
        </div>
      )}
    </div>
  );
}
