"use client";

export default function UserFooter() {
  return (
    <>
      <style>{`
        .user-footer {
          border-top: 1px solid var(--border-default);
          background: var(--bg-page);
          padding: 32px 0 24px;
          margin-top: 48px;
        }
        .user-footer-inner {
          max-width: 100%;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .user-footer-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          font-size: 12px;
          color: var(--text-subtle);
          line-height: 1.65;
        }
        .user-footer-disclaimer-icon {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .user-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .user-footer-copy {
          font-size: 12px;
          color: var(--text-subtle);
        }
        .user-footer-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-footer-links a {
          font-size: 12px;
          color: var(--text-subtle);
          text-decoration: none;
          transition: color 0.15s;
        }
        .user-footer-links a:hover {
          color: var(--text-heading);
        }
        @media (max-width: 640px) {
          .user-footer-inner { padding: 0 16px; }
          .user-footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
      <footer className="user-footer">
        <div className="user-footer-inner">
          <div className="user-footer-disclaimer">
            <span className="user-footer-disclaimer-icon">ℹ️</span>
            <span>
              <strong>Content disclaimer:</strong> Articles displayed on Distilled are aggregated from third-party sources including Reddit, Hacker News, Dev.to, and RSS feeds. Distilled does not claim ownership of any third-party content. All articles link directly to their original publishers. Distilled is not responsible for the accuracy or opinions expressed in third-party content.
            </span>
          </div>
          <div className="user-footer-bottom">
            <span className="user-footer-copy">© 2026 Distilled. All rights reserved.</span>
            <div className="user-footer-links">
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="mailto:support@distilled.blog">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
