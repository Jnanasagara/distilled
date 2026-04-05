"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

type Article = {
  id: string;
  title: string;
  url: string;
  sourceUrl: string | null;
  summary: string | null;
  imageUrl: string | null;
  source: string;
  author: string | null;
  publishedAt: string | null;
  isLiked: boolean;
  isSaved: boolean;
  _isTrending?: boolean;
  _reason?: string;
  topic: { name: string; emoji: string | null } | null;
};

type FeedData = {
  articles: Article[];
  preferences: {
    postCount: number;
    frequency: string;
    topics: string[];
  };
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  devto: "#3B49DF",
  rss: "#FFA500",
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  devto: "Dev.to",
  rss: "RSS",
};

const SOURCE_EMOJI: Record<string, string> = {
  hackernews: "🔶",
  reddit: "🔴",
  devto: "💻",
  rss: "📰",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-badges">
          <div className="skeleton-badge shimmer" />
          <div className="skeleton-badge shimmer" style={{ width: 80 }} />
        </div>
        <div className="skeleton-title shimmer" />
        <div className="skeleton-title shimmer" style={{ width: "60%" }} />
        <div className="skeleton-summary shimmer" />
        <div className="skeleton-summary shimmer" style={{ width: "80%" }} />
        <div className="skeleton-footer">
          <div className="skeleton-meta shimmer" />
        </div>
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  onLike,
  onSave,
  index,
}: {
  article: Article;
  onLike: (id: string, liked: boolean) => void;
  onSave: (id: string, saved: boolean) => void;
  index: number;
}) {
  const [showReason, setShowReason] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sourceColor = SOURCE_COLORS[article.source] ?? "#888";
  const sourceLabel = SOURCE_LABELS[article.source] ?? article.source;
  const sourceEmoji = SOURCE_EMOJI[article.source] ?? "📰";

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("card-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasImage = article.imageUrl && !imgError;

  return (
    <div
      ref={cardRef}
      className={`article-card card-enter ${article._isTrending ? "trending-card" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card-image-wrapper">
        {hasImage ? (
          <>
            {!imgLoaded && <div className="card-image-skeleton shimmer" />}
            <img
              src={article.imageUrl!}
              alt={article.title}
              className={`card-image ${imgLoaded ? "loaded" : ""}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="card-image-fallback">
            <span className="fallback-emoji">{sourceEmoji}</span>
            <span className="fallback-source">{sourceLabel}</span>
          </div>
        )}
        <div className="card-image-overlay">
          <span className="source-pill" style={{ background: sourceColor }}>
            {sourceLabel}
          </span>
          {article._isTrending && (
            <span className="trending-pill">📈 Trending</span>
          )}
        </div>
      </div>

      <div className="card-content">
        {article.topic && (
          <div className="card-topic">
            {article.topic.emoji} {article.topic.name}
          </div>
        )}
        <h3 className="card-title">{article.title}</h3>
        {article.summary && (
          <p className="card-summary">{article.summary}</p>
        )}

        {showReason && article._reason && (
          <div className="card-reason">
            <span className="reason-label">Why this post?</span>
            <span className="reason-text">{article._reason}</span>
          </div>
        )}

        <div className="card-meta">
          <span className="meta-text">
            {article.author && <span className="meta-author">{article.author}</span>}
            {article.author && article.publishedAt && " · "}
            {article.publishedAt && <span className="meta-time">{timeAgo(article.publishedAt)}</span>}
          </span>
        </div>

        <div className="card-actions">
          <div className="actions-left">
            <button
              className={`action-btn ${article.isLiked ? "active-like" : ""}`}
              onClick={() => onLike(article.id, article.isLiked)}
              title={article.isLiked ? "Unlike" : "Like"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={article.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              className={`action-btn ${article.isSaved ? "active-save" : ""}`}
              onClick={() => onSave(article.id, article.isSaved)}
              title={article.isSaved ? "Unsave" : "Save"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={article.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              className="action-btn reason-btn"
              onClick={() => setShowReason((p) => !p)}
              title="Why this post?"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn discussion-btn"
                title="Discussion"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            )}
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-link"
            onClick={() => {
              fetch("/api/interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId: article.id, type: "CLICK" }),
              });
            }}
          >
            Read
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function FeedClient() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        setFeed(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLike(articleId: string, isLiked: boolean) {
    const method = isLiked ? "DELETE" : "POST";
    // Optimistic update
    setFeed((prev) =>
      prev ? {
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === articleId ? { ...a, isLiked: !isLiked } : a
        ),
      } : prev
    );
    try {
      const res = await fetch("/api/interactions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: articleId, type: "LIKE" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback on failure
      setFeed((prev) =>
        prev ? {
          ...prev,
          articles: prev.articles.map((a) =>
            a.id === articleId ? { ...a, isLiked } : a
          ),
        } : prev
      );
    }
  }

  async function handleSave(articleId: string, isSaved: boolean) {
    const method = isSaved ? "DELETE" : "POST";
    // Optimistic update
    setFeed((prev) =>
      prev ? {
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === articleId ? { ...a, isSaved: !isSaved } : a
        ),
      } : prev
    );
    try {
      const res = await fetch("/api/interactions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: articleId, type: "SAVE" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback on failure
      setFeed((prev) =>
        prev ? {
          ...prev,
          articles: prev.articles.map((a) =>
            a.id === articleId ? { ...a, isSaved } : a
          ),
        } : prev
      );
    }
  }

  const sources = ["all", "hackernews", "reddit", "devto", "rss"];

  const filtered =
    filter === "all"
      ? feed?.articles ?? []
      : (feed?.articles ?? []).filter((a) => a.source === filter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(s: string) {
    setFilter(s);
    setPage(1);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        /* ===== HEADER ===== */
        .feed-navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--bg-navbar);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .feed-navbar.scrolled {
          border-bottom-color: var(--border-default);
          box-shadow: var(--shadow-navbar);
        }
        .navbar-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px;
        }
        .brand-name {
          font-size: 22px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px;
        }
        .nav-actions { display: flex; gap: 8px; align-items: center; }
        .nav-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .nav-btn.primary { background: var(--primary); border-color: var(--primary); color: var(--text-inverse); }
        .nav-btn.primary:hover { background: var(--primary-hover); }

        /* Theme toggle */
        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* ===== MAIN LAYOUT ===== */
        .feed-container { max-width: 1200px; margin: 0 auto; padding: 24px 24px 80px; }

        /* ===== FEED META ===== */
        .feed-hero { margin-bottom: 28px; }
        .feed-greeting {
          font-size: 28px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .feed-subtitle { font-size: 15px; color: var(--text-subtle); line-height: 1.5; }
        .feed-subtitle strong { color: var(--primary); font-weight: 600; }

        /* ===== FILTER BAR ===== */
        .filter-bar {
          display: flex; gap: 6px; margin-bottom: 28px;
          overflow-x: auto; padding-bottom: 4px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .filter-bar::-webkit-scrollbar { display: none; }
        .filter-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 999px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap; flex-shrink: 0;
        }
        .filter-chip:hover { border-color: var(--primary); color: var(--primary); }
        .filter-chip.active {
          background: var(--primary); border-color: var(--primary); color: var(--text-inverse);
          box-shadow: 0 2px 8px var(--primary-shadow);
        }
        .filter-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ===== ARTICLES GRID ===== */
        .articles-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .articles-grid { grid-template-columns: 1fr; } }

        /* ===== ARTICLE CARD ===== */
        .article-card {
          background: var(--bg-card); border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
          opacity: 0; transform: translateY(16px);
        }
        .article-card.card-visible { animation: cardIn 0.5s ease forwards; }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        .article-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
        .article-card.card-visible:hover { transform: translateY(-4px); }
        .trending-card { border: 2px solid #fbbf24; box-shadow: 0 2px 12px rgba(251,191,36,0.15); }

        /* Image wrapper */
        .card-image-wrapper {
          position: relative; width: 100%;
          aspect-ratio: 16 / 9; overflow: hidden;
          background: var(--bg-elevated);
        }
        .card-image { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.4s ease; }
        .card-image.loaded { opacity: 1; }
        .card-image-skeleton { position: absolute; inset: 0; background: var(--bg-skeleton); }
        .card-image-fallback {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, var(--bg-fallback-start) 0%, var(--bg-fallback-end) 100%);
        }
        .fallback-emoji { font-size: 36px; }
        .fallback-source { font-size: 12px; font-weight: 600; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.05em; }

        .card-image-overlay { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
        .source-pill {
          padding: 4px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700; color: white;
          letter-spacing: 0.02em; backdrop-filter: blur(4px);
        }
        .trending-pill {
          padding: 4px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700;
          background: rgba(251,191,36,0.9); color: #92400e;
        }

        /* Card Content */
        .card-content { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
        .card-topic { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 8px; }
        .card-title {
          font-size: 16px; font-weight: 700; color: var(--text-heading);
          line-height: 1.4; margin: 0 0 8px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .card-summary {
          font-size: 13.5px; color: var(--text-muted); line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          margin: 0 0 12px;
        }
        .card-reason {
          background: var(--bg-accent); border-left: 3px solid var(--primary);
          border-radius: 0 8px 8px 0;
          padding: 10px 12px; margin-bottom: 12px;
          display: flex; flex-direction: column; gap: 3px;
          animation: reasonIn 0.25s ease;
        }
        @keyframes reasonIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reason-label { font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.06em; }
        .reason-text { font-size: 12.5px; color: var(--text-body); line-height: 1.4; }

        /* Meta */
        .card-meta { margin-top: auto; margin-bottom: 12px; }
        .meta-text { font-size: 12px; color: var(--text-subtle); }
        .meta-author { font-weight: 500; }

        /* Actions */
        .card-actions {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 12px; border-top: 1px solid var(--border-divider);
        }
        .actions-left { display: flex; gap: 2px; }
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-subtle);
          transition: all 0.2s ease;
        }
        .action-btn:hover { background: var(--bg-elevated); color: var(--text-muted); }
        .action-btn.active-like { color: #ef4444; }
        .action-btn.active-like:hover { background: var(--bg-error); color: #ef4444; }
        .action-btn.active-save { color: var(--primary); }
        .action-btn.active-save:hover { background: var(--bg-accent); color: var(--primary); }
        .discussion-btn { text-decoration: none; }
        .discussion-btn:hover { background: var(--bg-success); color: var(--text-success); }

        .read-link {
          display: flex; align-items: center; gap: 4px;
          padding: 8px 16px; border-radius: 10px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-size: 13px; font-weight: 600;
          text-decoration: none; transition: all 0.2s ease;
        }
        .read-link:hover { background: var(--btn-dark-hover); }

        /* ===== PAGINATION ===== */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 40px; }
        .page-btn {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .page-btn.active {
          background: var(--primary); border-color: var(--primary); color: var(--text-inverse);
          box-shadow: 0 2px 8px var(--primary-shadow);
        }
        .page-arrow { padding: 8px 16px; width: auto; font-size: 13px; gap: 4px; }

        /* ===== SKELETON ===== */
        .skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .skeleton-grid { grid-template-columns: 1fr; } }
        .skeleton-card { background: var(--bg-card); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); }
        .skeleton-image { aspect-ratio: 16/9; background: var(--bg-skeleton); }
        .skeleton-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-badges { display: flex; gap: 8px; }
        .skeleton-badge { width: 60px; height: 20px; border-radius: 999px; background: var(--bg-skeleton); }
        .skeleton-title { height: 16px; border-radius: 6px; background: var(--bg-skeleton); }
        .skeleton-summary { height: 12px; border-radius: 4px; background: var(--bg-skeleton); }
        .skeleton-footer { margin-top: 8px; }
        .skeleton-meta { width: 120px; height: 12px; border-radius: 4px; background: var(--bg-skeleton); }

        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ===== EMPTY STATE ===== */
        .empty-state { text-align: center; padding: 80px 20px; max-width: 400px; margin: 0 auto; }
        .empty-icon {
          width: 80px; height: 80px; border-radius: 20px;
          background: var(--bg-accent); margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px;
        }
        .empty-title { font-size: 20px; font-weight: 700; color: var(--text-heading); margin: 0 0 8px; }
        .empty-text { font-size: 14px; color: var(--text-subtle); line-height: 1.6; margin: 0; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .navbar-inner { padding: 12px 16px; }
          .brand-name { font-size: 18px; }
          .nav-btn span { display: none; }
          .nav-btn { padding: 8px 12px; }
          .feed-container { padding: 16px 16px 60px; }
          .feed-greeting { font-size: 22px; }
          .card-title { font-size: 15px; }
        }
      `}</style>

      <nav className={`feed-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <div className="brand">
            <div className="brand-icon">D</div>
            <span className="brand-name">Distilled</span>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <button className="nav-btn" onClick={() => router.push("/saved")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>Saved</span>
            </button>
            <button className="nav-btn primary" onClick={() => router.push("/preferences")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Preferences</span>
            </button>
            <button className="nav-btn" onClick={() => signOut({ callbackUrl: "/auth" })} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="feed-container">
        {loading ? (
          <>
            <div className="feed-hero">
              <div className="shimmer" style={{ width: 240, height: 28, borderRadius: 8, marginBottom: 8 }} />
              <div className="shimmer" style={{ width: 320, height: 16, borderRadius: 6 }} />
            </div>
            <div className="skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : !feed || feed.articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2 className="empty-title">No articles yet</h2>
            <p className="empty-text">
              Try triggering a content fetch or updating your preferences to start discovering content.
            </p>
          </div>
        ) : (
          <>
            <div className="feed-hero">
              <h1 className="feed-greeting">Your Feed</h1>
              <p className="feed-subtitle">
                <strong>{filtered.filter(a => !a._isTrending).length}</strong> articles
                {(() => { const n = filtered.filter(a => a._isTrending).length; return n > 0 ? <> + <strong>{n} trending</strong></> : null; })()}
                {" "}from{" "}
                <strong>{feed.preferences.topics.join(", ")}</strong>
              </p>
            </div>

            <div className="filter-bar">
              {sources.map((s) => (
                <button
                  key={s}
                  className={`filter-chip ${filter === s ? "active" : ""}`}
                  onClick={() => handleFilterChange(s)}
                >
                  {s !== "all" && (
                    <span className="filter-dot" style={{ background: SOURCE_COLORS[s] }} />
                  )}
                  {s === "all" ? "All Sources" : SOURCE_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="articles-grid">
              {paginated.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onLike={handleLike}
                  onSave={handleSave}
                  index={i}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn page-arrow"
                  onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} style={{ color: "var(--text-subtle)", fontSize: 14 }}>...</span>
                    ) : (
                      <button
                        key={p}
                        className={`page-btn ${page === p ? "active" : ""}`}
                        onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  className="page-btn page-arrow"
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
