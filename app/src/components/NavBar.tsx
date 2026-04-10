"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

type Page = "feed" | "saved" | "profile" | "preferences";

const NAV_ITEMS: { page: Page; label: string; href: string; icon: React.ReactNode }[] = [
  {
    page: "feed",
    label: "Feed",
    href: "/feed",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    page: "saved",
    label: "Saved",
    href: "/saved",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    page: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    page: "preferences",
    label: "Preferences",
    href: "/preferences",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function NavBar({ currentPage }: { currentPage: Page }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => { if (typeof document !== "undefined") document.body.style.overflow = ""; };
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleLogout() {
    setOpen(false);
    signOut({ callbackUrl: `${window.location.origin}/auth` });
  }

  const name = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = (session?.user?.name ?? session?.user?.email ?? "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        .app-navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--bg-navbar);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .app-navbar.scrolled {
          border-bottom-color: var(--border-default);
          box-shadow: var(--shadow-navbar);
        }
        .app-navbar-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }

        /* Brand */
        .app-brand {
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; text-decoration: none;
        }
        .app-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px; flex-shrink: 0;
        }
        .app-brand-name {
          font-size: 22px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px;
        }

        /* Desktop nav — hidden on mobile */
        .app-nav-desktop {
          display: flex; align-items: center; gap: 6px;
        }
        .app-nav-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .app-nav-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .app-nav-btn.active { background: var(--primary); border-color: var(--primary); color: var(--text-inverse); }
        .app-nav-btn.active:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
        .app-nav-btn.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* Mobile right controls — hidden on desktop */
        .app-nav-mobile { display: none; align-items: center; gap: 8px; }
        .app-hamburger {
          width: 40px; height: 40px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .app-hamburger:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* Responsive */
        @media (max-width: 768px) {
          .app-nav-desktop { display: none; }
          .app-nav-mobile { display: flex; }
          .app-navbar-inner { padding: 12px 16px; }
          .app-brand-name { font-size: 20px; }
        }

        /* ===== DRAWER BACKDROP ===== */
        .app-drawer-backdrop {
          position: fixed; inset: 0; z-index: 198;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          animation: backdropIn 0.25s ease;
        }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }

        /* ===== DRAWER ===== */
        .app-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 288px; z-index: 199;
          background: var(--bg-card);
          box-shadow: -8px 0 40px rgba(0, 0, 0, 0.18);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 20px 0 0 20px;
          overflow: hidden;
        }
        .app-drawer.open { transform: translateX(0); }

        /* Drawer header */
        .drawer-header {
          padding: 20px 20px 16px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; gap: 12px;
          position: relative;
        }
        .drawer-avatar {
          width: 46px; height: 46px; border-radius: 14px;
          background: rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 800; color: white;
          flex-shrink: 0; letter-spacing: 0.5px;
          border: 2px solid rgba(255,255,255,0.35);
        }
        .drawer-user-info { flex: 1; min-width: 0; }
        .drawer-user-name {
          font-size: 14px; font-weight: 700; color: white;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .drawer-user-email {
          font-size: 12px; color: rgba(255,255,255,0.75);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 2px;
        }
        .drawer-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 8px;
          border: none; background: rgba(255,255,255,0.2);
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s ease;
        }
        .drawer-close:hover { background: rgba(255,255,255,0.35); }

        /* Drawer nav */
        .drawer-nav {
          flex: 1; padding: 12px 12px 0;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto;
        }
        .drawer-nav-label {
          font-size: 10px; font-weight: 700; color: var(--text-subtle);
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 8px 10px 4px;
        }
        .drawer-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.18s ease; text-align: left; width: 100%;
        }
        .drawer-nav-item:hover { background: var(--bg-elevated); color: var(--text-heading); }
        .drawer-nav-item.active {
          background: var(--bg-accent); color: var(--primary);
        }
        .drawer-nav-item.active svg { color: var(--primary); }
        .drawer-nav-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--bg-elevated);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.18s ease;
        }
        .drawer-nav-item.active .drawer-nav-icon { background: var(--bg-accent); }
        .drawer-nav-item:hover .drawer-nav-icon { background: var(--bg-accent); }
        .drawer-active-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--primary); margin-left: auto; flex-shrink: 0;
        }

        /* Drawer footer */
        .drawer-footer {
          padding: 12px;
          border-top: 1px solid var(--border-divider);
        }
        .drawer-logout {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: #ef4444; cursor: pointer;
          transition: all 0.18s ease; width: 100%;
        }
        .drawer-logout:hover { background: #fef2f2; }
        .drawer-logout-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: #fef2f2;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .drawer-logout:hover .drawer-logout-icon { background: #fee2e2; }
      `}</style>

      <nav className={`app-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="app-navbar-inner">
          <div className="app-brand" onClick={() => navigate("/feed")} role="button" tabIndex={0}>
            <div className="app-brand-icon">D</div>
            <span className="app-brand-name">Distilled</span>
          </div>

          {/* Desktop */}
          <div className="app-nav-desktop">
            <ThemeToggle />
            {NAV_ITEMS.map((item) => (
              <button
                key={item.page}
                className={`app-nav-btn ${currentPage === item.page ? "active" : ""}`}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button className="app-nav-btn danger" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile */}
          <div className="app-nav-mobile">
            <ThemeToggle />
            <button className="app-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {open && <div className="app-drawer-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <div className={`app-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div className="drawer-avatar">{initials}</div>
          <div className="drawer-user-info">
            <div className="drawer-user-name">{name}</div>
            {session?.user?.email && (
              <div className="drawer-user-email">{session.user.email}</div>
            )}
          </div>
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-nav">
          <div className="drawer-nav-label">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                className={`drawer-nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.href)}
              >
                <div className="drawer-nav-icon">{item.icon}</div>
                {item.label}
                {isActive && <span className="drawer-active-dot" />}
              </button>
            );
          })}
        </div>

        <div className="drawer-footer">
          <button className="drawer-logout" onClick={handleLogout}>
            <div className="drawer-logout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
