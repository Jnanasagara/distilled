"use client";

import { useEffect, useState } from "react";

type Announcement = { id: string; title: string; message: string };

const STORAGE_KEY = "dismissed_announcements";

function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function dismiss(id: string) {
  try {
    const prev = getDismissed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...prev, id])]));
  } catch {}
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        const dismissed = getDismissed();
        const active = (d.announcements ?? []).find(
          (a: Announcement) => !dismissed.includes(a.id)
        );
        if (active) setAnnouncement(active);
      })
      .catch(() => {});
  }, []);

  if (!announcement) return null;

  return (
    <>
      <style>{`
        .ann-banner {
          background: var(--bg-accent);
          border-bottom: 1px solid var(--primary-light, #e0e7ff);
          padding: 10px 20px;
          display: flex; align-items: flex-start; gap: 12px;
          animation: annSlide 0.3s ease;
        }
        @keyframes annSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .ann-icon { flex-shrink: 0; font-size: 15px; margin-top: 1px; }
        .ann-content { flex: 1; min-width: 0; }
        .ann-title { font-size: 13px; font-weight: 700; color: var(--text-heading); margin-bottom: 2px; }
        .ann-message { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        .ann-close {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          color: var(--text-subtle); padding: 2px; border-radius: 6px;
          display: flex; align-items: center; transition: color 0.15s;
          margin-top: 1px;
        }
        .ann-close:hover { color: var(--text-heading); }
      `}</style>
      <div className="ann-banner" role="status">
        <span className="ann-icon">📢</span>
        <div className="ann-content">
          <div className="ann-title">{announcement.title}</div>
          <div className="ann-message">{announcement.message}</div>
        </div>
        <button
          className="ann-close"
          aria-label="Dismiss"
          onClick={() => { dismiss(announcement.id); setAnnouncement(null); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </>
  );
}
