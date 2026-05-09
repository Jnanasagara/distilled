"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "distilled_pwa_prompt_dismissed";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 35000; // 35 seconds

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

function isDismissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const deferredPrompt = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    if (isInStandaloneMode() || isDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as typeof deferredPrompt.current;
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = setTimeout(() => {
      if (isInStandaloneMode() || isDismissed()) return;
      const iosDevice = isIOS();
      // Only show iOS prompt on mobile Safari (not already in standalone)
      if (iosDevice) {
        setIos(true);
        setShow(true);
      } else if (deferredPrompt.current) {
        // Android/Chrome: native prompt available
        setIos(false);
        setShow(true);
      }
      // Desktop or unsupported: do nothing
    }, SHOW_DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setShow(false);
  }

  async function handleInstall() {
    if (!deferredPrompt.current) { dismiss(); return; }
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === "accepted") {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      <div className="pwa-prompt">
        <div className="pwa-icon">
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            <img src="/android-chrome-192x192.png" alt="Distilled" style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        </div>
        <div className="pwa-text">
          <div className="pwa-title">Add Distilled to your home screen</div>
          {ios ? (
            <div className="pwa-sub">
              Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
            </div>
          ) : (
            <div className="pwa-sub">Get the full app experience, offline-ready.</div>
          )}
        </div>
        {ios ? (
          <button className="pwa-close" onClick={dismiss} title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button className="pwa-install-btn" onClick={handleInstall}>Install</button>
            <button className="pwa-dismiss-link" onClick={dismiss}>Not now</button>
          </div>
        )}
      </div>

      <style>{`
        .pwa-prompt {
          position: fixed; bottom: 80px; right: 20px; z-index: 300;
          background: var(--bg-card);
          border: 1.5px solid var(--border-default);
          border-left: 4px solid #f97316;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: var(--shadow-lg);
          max-width: 320px;
          animation: pwaIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pwa-text { flex: 1; min-width: 0; }
        .pwa-title { font-size: 13px; font-weight: 700; color: var(--text-heading); margin-bottom: 3px; }
        .pwa-sub { font-size: 12px; color: var(--text-muted); line-height: 1.45; }
        .pwa-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px;
        }
        .pwa-close:hover { color: var(--text-body); background: var(--bg-elevated); }
        .pwa-install-btn {
          padding: 6px 12px; border-radius: 7px; border: none; cursor: pointer;
          background: #f97316; color: #fff;
          font-size: 12px; font-weight: 700; letter-spacing: -0.1px;
          white-space: nowrap;
        }
        .pwa-install-btn:hover { background: #ea6c10; }
        .pwa-dismiss-link {
          background: none; border: none; cursor: pointer;
          font-size: 11px; color: var(--text-muted); text-align: center;
          padding: 0; font-weight: 500;
        }
        .pwa-dismiss-link:hover { color: var(--text-body); }
        @media (max-width: 640px) {
          .pwa-prompt { bottom: 72px; right: 12px; left: 12px; max-width: unset; }
        }
        @keyframes pwaIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
