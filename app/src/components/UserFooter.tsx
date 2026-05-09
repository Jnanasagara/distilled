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
          padding: 20px 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .user-footer-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .user-footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-footer-logo {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #fff;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .user-footer-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .user-footer-name {
          font-size: 13px;
          font-weight: 700;
          background: linear-gradient(135deg,#f97316,#ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .user-footer-copy {
          font-size: 12px;
          color: var(--text-subtle);
        }
        .user-footer-disclaimer {
          flex: 2;
          font-size: 11.5px;
          color: var(--text-subtle);
          line-height: 1.6;
          text-align: center;
          opacity: 0.75;
          padding: 0 24px;
        }
        .user-footer-links {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex: 1;
        }
        .user-footer-links-row {
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
        .user-footer-links a:hover { color: var(--primary); }

        @media (max-width: 768px) {
          .user-footer-inner { flex-direction: column; align-items: flex-start; gap: 14px; padding: 16px; }
          .user-footer-disclaimer { text-align: left; padding: 0; }
          .user-footer-links { align-items: flex-start; }
        }
      `}</style>

      <footer className="user-footer">
        <div className="user-footer-inner">
          <div className="user-footer-left">
            <div className="user-footer-brand">
              <div className="user-footer-logo">
                <img src="/logo.jpeg" alt="Distilled" />
              </div>
              <span className="user-footer-name">Distilled</span>
            </div>
            <span className="user-footer-copy">© {new Date().getFullYear()} Distilled.</span>
          </div>

          <div className="user-footer-disclaimer">
            Content is sourced from third-party publishers. Summaries are AI-generated for informational purposes. All trademarks and copyrights belong to their respective owners.
          </div>

          <div className="user-footer-links">
            <div className="user-footer-links-row">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:support@distilled.blog">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
