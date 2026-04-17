"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import AnnouncementBanner from "./AnnouncementBanner";
import { avatarUrl } from "@/lib/avatars";

type Page = "feed" | "saved" | "history" | "profile" | "preferences";

const NAV_ITEMS: { page: Page; label: string; href: string; icon: React.ReactNode }[] = [
  {
    page: "feed",
    label: "Feed",
    href: "/feed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    page: "history",
    label: "History",
    href: "/history",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
      </svg>
    ),
  },
  {
    page: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function NavBar({ currentPage }: { currentPage: Page }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const [installIOS, setInstallIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const deferredInstall = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
    if (standalone) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) { setInstallIOS(true); setInstallReady(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredInstall.current = e as typeof deferredInstall.current;
      setInstallReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleLogout() {
    setOpen(false);
    signOut({ callbackUrl: `${window.location.origin}/auth` });
  }

  async function handleInstall() {
    if (installIOS) { setShowIOSHint((v) => !v); return; }
    if (!deferredInstall.current) return;
    await deferredInstall.current.prompt();
    deferredInstall.current = null;
    setInstallReady(false);
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
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease;
        }
        .app-navbar.scrolled { border-bottom-color: var(--border-default); }

        .app-navbar-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px; height: 56px;
          display: flex; justify-content: space-between; align-items: center;
        }

        .app-brand {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; text-decoration: none; user-select: none;
        }
        .app-brand-icon {
          width: 32px; height: 32px; border-radius: 7px;
          overflow: hidden; flex-shrink: 0;
        }
        .app-brand-icon img { width: 100%; height: 100%; display: block; }
        .app-brand-name {
          font-size: 17px; font-weight: 700;
          color: var(--text-heading); letter-spacing: -0.3px;
        }

        .app-nav-desktop {
          display: flex; align-items: center; gap: 2px;
        }
        .app-nav-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 6px;
          border: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--text-muted); cursor: pointer;
          transition: color 0.15s ease, background 0.15s ease;
          white-space: nowrap;
        }
        .app-nav-btn:hover { color: var(--text-heading); background: var(--bg-elevated); }
        .app-nav-btn.active { color: var(--primary); background: var(--primary-light); font-weight: 600; }
        .app-nav-btn.active:hover { background: var(--primary-light); }
        .app-nav-divider {
          width: 1px; height: 20px;
          background: var(--border-default); margin: 0 6px;
        }
        .app-nav-btn.danger { color: var(--text-muted); }
        .app-nav-btn.danger:hover { color: #ef4444; background: #fef2f2; }

        .app-nav-mobile { display: none; align-items: center; gap: 8px; }
        .app-hamburger {
          width: 36px; height: 36px; border-radius: 6px;
          border: 1px solid var(--border-default); background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted);
          transition: all 0.15s ease;
        }
        .app-hamburger:hover { color: var(--text-heading); border-color: var(--text-muted); }

        @media (max-width: 768px) {
          .app-nav-desktop { display: none; }
          .app-nav-mobile { display: flex; }
          .app-navbar-inner { padding: 0 16px; }
        }

        /* ===== DRAWER ===== */
        .app-drawer-backdrop {
          position: fixed; inset: 0; z-index: 198;
          background: rgba(0,0,0,0.5);
          animation: backdropIn 0.2s ease;
        }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }

        .app-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 272px; z-index: 199;
          background: var(--bg-card);
          border-left: 1px solid var(--border-default);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-drawer.open { transform: translateX(0); }

        .drawer-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-default);
          display: flex; align-items: center; gap: 12px;
        }
        .drawer-avatar {
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #fff;
          flex-shrink: 0; overflow: hidden;
        }
        .drawer-avatar img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .drawer-user-info { flex: 1; min-width: 0; }
        .drawer-user-name {
          font-size: 14px; font-weight: 600; color: var(--text-heading);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .drawer-user-email {
          font-size: 12px; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 1px;
        }
        .drawer-close {
          width: 28px; height: 28px; border-radius: 6px;
          border: 1px solid var(--border-default); background: transparent;
          color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease; flex-shrink: 0;
        }
        .drawer-close:hover { color: var(--text-heading); border-color: var(--text-muted); }

        .drawer-nav {
          flex: 1; padding: 8px;
          display: flex; flex-direction: column; gap: 1px;
          overflow-y: auto;
        }
        .drawer-nav-label {
          font-size: 11px; font-weight: 600; color: var(--text-subtle);
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 12px 10px 4px;
        }
        .drawer-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 6px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.15s ease; text-align: left; width: 100%;
        }
        .drawer-nav-item:hover { background: var(--bg-elevated); color: var(--text-heading); }
        .drawer-nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
        .drawer-active-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--primary); margin-left: auto; flex-shrink: 0;
        }

        .drawer-footer {
          padding: 8px;
          border-top: 1px solid var(--border-default);
        }
        .drawer-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 6px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: #ef4444; cursor: pointer;
          transition: all 0.15s ease; width: 100%;
        }
        .drawer-logout:hover { background: #fef2f2; }
        .drawer-install {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 6px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.15s ease; width: 100%; text-align: left;
        }
        .drawer-install:hover { background: var(--bg-elevated); color: var(--text-heading); }
        .drawer-ios-hint {
          margin: 0 8px 8px; padding: 10px 12px;
          background: var(--bg-elevated); border-radius: 8px;
          font-size: 12px; color: var(--text-muted); line-height: 1.55;
        }
      `}</style>

      <AnnouncementBanner />
      <nav className={`app-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="app-navbar-inner">
          <div className="app-brand" onClick={() => navigate("/feed")} role="button" tabIndex={0}>
            <div className="app-brand-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
            <span className="app-brand-name">Distilled</span>
          </div>

          {/* Desktop */}
          <div className="app-nav-desktop">
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
            <div className="app-nav-divider" />
            <ThemeToggle />
            <button className="app-nav-btn danger" onClick={handleLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {open && <div className="app-drawer-backdrop" onClick={() => setOpen(false)} />}

      <div className={`app-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div className="drawer-avatar">
            {session?.user?.avatarSeed
              ? <img src={avatarUrl(session.user.avatarSeed)} alt="avatar" />
              : initials}
          </div>
          <div className="drawer-user-info">
            <div className="drawer-user-name">{name}</div>
            {session?.user?.email && (
              <div className="drawer-user-email">{session.user.email}</div>
            )}
          </div>
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                {item.icon}
                {item.label}
                {isActive && <span className="drawer-active-dot" />}
              </button>
            );
          })}
        </div>

        <div className="drawer-footer">
          {installReady && (
            <>
              {showIOSHint && (
                <div className="drawer-ios-hint">
                  Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                </div>
              )}
              <button className="drawer-install" onClick={handleInstall}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Install app
              </button>
            </>
          )}
          <button className="drawer-logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
