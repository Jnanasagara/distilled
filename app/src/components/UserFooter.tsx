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
          flex-wrap: wrap;
        }
        .user-footer-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
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
        .user-footer-links {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .user-footer-links a {
          font-size: 12px;
          color: var(--text-subtle);
          text-decoration: none;
          transition: color 0.15s;
        }
        .user-footer-links a:hover { color: var(--primary); }

        @media (max-width: 640px) {
          .user-footer-inner { padding: 16px; flex-direction: column; align-items: flex-start; gap: 12px; }
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
            <span className="user-footer-copy">© {new Date().getFullYear()} Distilled. All rights reserved.</span>
          </div>
          <div className="user-footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:support@distilled.blog">Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}
