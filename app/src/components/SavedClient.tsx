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
  savedAt: string;
  topic: { name: string; emoji: string | null } | null;
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  devto: "#3B49DF",
  rss: "#FFA500",
};

const FALLBACK_GRADIENTS: Record<string, string> = {
  reddit:     "linear-gradient(135deg, #FF4500 0%, #FF6534 100%)",
  hackernews: "linear-gradient(135deg, #FF6600 0%, #FF8C33 100%)",
  devto:      "linear-gradient(135deg, #3B49DF 0%, #6470F0 100%)",
  rss:        "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
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

function SavedCard({
  article,
  onUnsave,
  index,
}: {
  article: Article;
  onUnsave: (id: string) => void;
  index: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [removing, setRemoving] = useState(false);
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

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => onUnsave(article.id), 300);
  }

  return (
    <div
      ref={cardRef}
      className={`saved-card card-enter ${removing ? "card-removing" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="saved-card-image-wrapper">
        {hasImage ? (
          <>
            {!imgLoaded && <div className="saved-card-img-skeleton shimmer" />}
            <img
              src={article.imageUrl!}
              alt={article.title}
              className={`saved-card-img ${imgLoaded ? "loaded" : ""}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div
            className="saved-card-img-fallback"
            style={{ background: FALLBACK_GRADIENTS[article.source] ?? "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <span className="saved-fallback-emoji" style={{ fontSize: 44 }}>
              {article.topic?.emoji ?? sourceEmoji}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
              {article.topic?.name ?? sourceLabel}
            </span>
          </div>
        )}
        <span className="saved-source-pill" style={{ background: sourceColor }}>
          {sourceLabel}
        </span>
      </div>

      <div className="saved-card-content">
        {article.topic && (
          <div className="saved-card-topic">
            {article.topic.emoji} {article.topic.name}
          </div>
        )}
        <h3 className="saved-card-title">{article.title}</h3>
        {article.summary && (
          <p className="saved-card-summary">{article.summary}</p>
        )}
        <div className="saved-card-meta">
          {article.author && <span>{article.author}</span>}
          {article.author && article.publishedAt && " · "}
          {article.publishedAt && <span>{timeAgo(article.publishedAt)}</span>}
        </div>

        <div className="saved-card-actions">
          <div className="saved-actions-left">
            <button
              className="saved-remove-btn"
              onClick={handleRemove}
              title="Remove from saved"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="saved-discussion-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Discussion
              </a>
            )}
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="saved-read-link"
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

export default function SavedClient() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function unsave(articleId: string) {
    await fetch("/api/interactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: articleId, type: "SAVE" }),
    });
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        /* Navbar */
        .saved-navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--bg-navbar);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .saved-navbar.scrolled { border-bottom-color: var(--border-default); box-shadow: var(--shadow-navbar); }
        .saved-navbar-inner {
          max-width: 1200px; margin: 0 auto; padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .saved-brand { display: flex; align-items: center; gap: 10px; }
        .saved-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px;
        }
        .saved-brand-name { font-size: 22px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .saved-nav-right { display: flex; align-items: center; gap: 8px; }
        .saved-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .saved-back-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* Theme toggle */
        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* Main */
        .saved-container { max-width: 1200px; margin: 0 auto; padding: 24px 24px 80px; }
        .saved-hero { margin-bottom: 28px; }
        .saved-heading {
          font-size: 28px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px; margin-bottom: 6px;
          display: flex; align-items: center; gap: 10px;
        }
        .saved-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 28px; height: 28px; padding: 0 8px;
          border-radius: 999px; background: var(--primary); color: var(--text-inverse);
          font-size: 13px; font-weight: 700;
        }
        .saved-subtitle { font-size: 15px; color: var(--text-subtle); line-height: 1.5; }

        /* Grid */
        .saved-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .saved-grid { grid-template-columns: 1fr; } }

        /* Card */
        .saved-card {
          background: var(--bg-card); border-radius: 16px; overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
          opacity: 0; transform: translateY(16px);
        }
        .saved-card.card-visible { animation: cardIn 0.5s ease forwards; }
        .saved-card.card-removing { animation: cardOut 0.3s ease forwards; }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes cardOut { to { opacity: 0; transform: scale(0.95) translateY(8px); } }
        .saved-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
        .saved-card.card-visible:hover { transform: translateY(-4px); }

        .saved-card-image-wrapper {
          position: relative; width: 100%;
          aspect-ratio: 16 / 9; overflow: hidden;
          background: var(--bg-elevated);
        }
        .saved-card-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.4s ease; }
        .saved-card-img.loaded { opacity: 1; }
        .saved-card-img-skeleton { position: absolute; inset: 0; background: var(--bg-skeleton); }
        .saved-card-img-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-fallback-start) 0%, var(--bg-fallback-end) 100%);
        }
        .saved-fallback-emoji { font-size: 36px; }
        .saved-source-pill {
          position: absolute; top: 12px; left: 12px;
          padding: 4px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700; color: white;
        }

        .saved-card-content { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
        .saved-card-topic { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 8px; }
        .saved-card-title {
          font-size: 16px; font-weight: 700; color: var(--text-heading);
          line-height: 1.4; margin: 0 0 8px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .saved-card-summary {
          font-size: 13.5px; color: var(--text-muted); line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          margin: 0 0 12px;
        }
        .saved-card-meta { font-size: 12px; color: var(--text-subtle); margin-top: auto; margin-bottom: 12px; }
        .saved-card-actions {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 12px; border-top: 1px solid var(--border-divider);
        }
        .saved-actions-left { display: flex; gap: 8px; }
        .saved-remove-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          border: 1.5px solid var(--border-error); background: var(--bg-error);
          font-family: inherit; font-size: 12px; font-weight: 600;
          color: var(--text-error); cursor: pointer; transition: all 0.2s ease;
        }
        .saved-remove-btn:hover { background: var(--bg-error); border-color: var(--text-error); }
        .saved-discussion-link {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          text-decoration: none; transition: all 0.2s ease;
        }
        .saved-discussion-link:hover { border-color: var(--primary); color: var(--primary); }
        .saved-read-link {
          display: flex; align-items: center; gap: 4px;
          padding: 8px 16px; border-radius: 10px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-size: 13px; font-weight: 600;
          text-decoration: none; transition: all 0.2s ease;
        }
        .saved-read-link:hover { background: var(--btn-dark-hover); }

        /* Skeleton */
        .saved-skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .saved-skeleton-grid { grid-template-columns: 1fr; } }
        .saved-skeleton-card { background: var(--bg-card); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); }
        .saved-skeleton-img { aspect-ratio: 16/9; background: var(--bg-skeleton); }
        .saved-skeleton-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; }
        .saved-skeleton-line { height: 14px; border-radius: 6px; background: var(--bg-skeleton); }

        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s ease infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Empty State */
        .saved-empty { text-align: center; padding: 80px 20px; max-width: 400px; margin: 0 auto; }
        .saved-empty-icon {
          width: 80px; height: 80px; border-radius: 20px;
          background: var(--bg-accent); margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center; font-size: 36px;
        }
        .saved-empty-title { font-size: 20px; font-weight: 700; color: var(--text-heading); margin: 0 0 8px; }
        .saved-empty-text { font-size: 14px; color: var(--text-subtle); line-height: 1.6; margin: 0; }

        @media (max-width: 640px) {
          .saved-navbar-inner { padding: 12px 16px; }
          .saved-brand-name { font-size: 18px; }
          .saved-container { padding: 16px 16px 60px; }
          .saved-heading { font-size: 22px; }
        }
      `}</style>

      <nav className={`saved-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="saved-navbar-inner">
          <div className="saved-brand">
            <div className="saved-brand-icon">D</div>
            <span className="saved-brand-name">Distilled</span>
          </div>
          <div className="saved-nav-right">
            <ThemeToggle />
            <button className="saved-back-btn" onClick={() => router.push("/feed")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Feed
            </button>
            <button className="saved-back-btn" onClick={() => signOut({ callbackUrl: `${window.location.origin}/auth` })} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="saved-container">
        {loading ? (
          <>
            <div className="saved-hero">
              <div className="shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
              <div className="shimmer" style={{ width: 280, height: 16, borderRadius: 6 }} />
            </div>
            <div className="saved-skeleton-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="saved-skeleton-card">
                  <div className="saved-skeleton-img shimmer" />
                  <div className="saved-skeleton-body">
                    <div className="saved-skeleton-line shimmer" style={{ width: "80%" }} />
                    <div className="saved-skeleton-line shimmer" style={{ width: "60%" }} />
                    <div className="saved-skeleton-line shimmer" style={{ width: 100, height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : articles.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔖</div>
            <h2 className="saved-empty-title">Nothing saved yet</h2>
            <p className="saved-empty-text">
              Bookmark articles from your feed to read them later.
            </p>
          </div>
        ) : (
          <>
            <div className="saved-hero">
              <h1 className="saved-heading">
                Saved Articles
                <span className="saved-count">{articles.length}</span>
              </h1>
              <p className="saved-subtitle">Your bookmarked articles for later reading.</p>
            </div>
            <div className="saved-grid">
              {articles.map((article, i) => (
                <SavedCard
                  key={article.id}
                  article={article}
                  onUnsave={unsave}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
