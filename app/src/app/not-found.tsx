import Link from "next/link";

export default function NotFound() {
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
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
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
        .error-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .error-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px;
          background: var(--btn-dark, #09090b); color: #ffffff;
          font-size: 14px; font-weight: 700; text-decoration: none;
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

        <div className="error-icon">🔍</div>
        <div className="error-code">404</div>
        <div className="error-title">Page not found</div>
        <p className="error-subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="error-actions">
          <Link href="/feed" className="error-btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Feed
          </Link>
          <Link href="/auth" className="error-btn-secondary">
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
