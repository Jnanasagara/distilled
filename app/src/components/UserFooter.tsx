export default function UserFooter() {
  return (
    <>
      <style>{`
        .user-footer {
          border-top: 1px solid var(--border-divider);
          background: var(--bg-page);
          margin-top: 32px;
        }
        .user-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 18px 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }
        .user-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-subtle);
        }
        .user-footer-logo {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .user-footer-logo img { width: 100%; height: 100%; display: block; }
        .user-footer-disclaimer {
          font-size: 12px;
          color: var(--text-subtle);
          line-height: 1.6;
          max-width: 520px;
        }
        .user-footer-links {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }
        .user-footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
        }
        .user-footer-links a:hover { color: var(--text-heading); }

        @media (max-width: 640px) {
          .user-footer-inner { padding: 16px; }
        }
      `}</style>

      <footer className="user-footer">
        <div className="user-footer-inner">
          <div className="user-footer-brand">
            <div className="user-footer-logo">
              <img src="/android-chrome-192x192.png" alt="Distilled" />
            </div>
            <span>Distilled · © 2026</span>
          </div>
          <div className="user-footer-disclaimer">
            Content is sourced from third-party publishers. Summaries are AI-generated for informational purposes. All trademarks and copyrights belong to their respective owners.
          </div>
          <div className="user-footer-links">
            <a href="mailto:support@distilled.blog">Support</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
