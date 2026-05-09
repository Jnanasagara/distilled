"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page, #e8e8e8); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
        .error-page {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px; text-align: center;
        }
        .error-icon {
          font-size: 64px; margin-bottom: 24px;
          animation: shake 2.5s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 90%, 100% { transform: rotate(0deg); }
          92% { transform: rotate(-6deg); }
          96% { transform: rotate(6deg); }
        }
        .error-code {
          font-size: 96px; font-weight: 800;
          color: var(--primary, #f97316);
          letter-spacing: -4px; line-height: 1;
          margin-bottom: 12px;
        }
        .error-title {
          font-size: 24px; font-weight: 700;
          color: var(--text-heading, #09090b);
          letter-spacing: -0.4px; margin-bottom: 10px;
        }
        .error-subtitle {
          font-size: 15px; color: var(--text-muted, #71717a);
          line-height: 1.6; max-width: 380px; margin-bottom: 36px;
        }
        .error-digest {
          font-size: 11px; color: var(--text-subtle, #a1a1aa);
          font-family: monospace; margin-top: -24px; margin-bottom: 32px;
        }
        .error-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .error-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px;
          background: var(--btn-dark, #09090b); color: #ffffff;
          font-size: 14px; font-weight: 700; text-decoration: none;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.2s; letter-spacing: -0.2px;
        }
        .error-btn-primary:hover { background: var(--btn-dark-hover, #18181b); }
        .error-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px;
          border: 1.5px solid var(--border-default, #d4d4d8);
          background: var(--bg-card, #ffffff);
          color: var(--text-muted, #71717a);
          font-size: 14px; font-weight: 600; text-decoration: none;
          transition: all 0.2s;
        }
        .error-btn-secondary:hover { border-color: var(--primary, #f97316); color: var(--primary, #f97316); }
        .error-brand {
          position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .error-brand-icon { width: 32px; height: 32px; border-radius: 7px; overflow: hidden; }
        .error-brand-icon img { width: 100%; height: 100%; display: block; }
        .error-brand-name { font-size: 17px; font-weight: 700; color: var(--text-heading, #09090b); letter-spacing: -0.3px; }
      `}</style>

      <div className="error-page">
        <Link href="/feed" className="error-brand">
          <div className="error-brand-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
          <span className="error-brand-name">Distilled</span>
        </Link>

        <div className="error-icon">⚠️</div>
        <div className="error-code">500</div>
        <div className="error-title">Something went wrong</div>
        <p className="error-subtitle">
          An unexpected error occurred. Try refreshing the page — if it keeps happening, check back shortly.
        </p>
        {error.digest && (
          <p className="error-digest">Error ID: {error.digest}</p>
        )}

        <div className="error-actions">
          <button className="error-btn-primary" onClick={reset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Try again
          </button>
          <Link href="/feed" className="error-btn-secondary">
            Back to Feed
          </Link>
        </div>
      </div>
    </>
  );
}
