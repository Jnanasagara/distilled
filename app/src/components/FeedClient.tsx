"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import NavBar from "./NavBar";
import WelcomeModal from "./WelcomeModal";
import InterestCheckModal from "./InterestCheckModal";

type Article = {
  id: string;
  title: string;
  url: string;
  sourceUrl: string | null;
  summary: string | null;
  impact: string | null;
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

const FALLBACK_GRADIENTS: Record<string, string> = {
  reddit:      "linear-gradient(135deg, #FF4500 0%, #FF6534 100%)",
  hackernews:  "linear-gradient(135deg, #FF6600 0%, #FF8C33 100%)",
  devto:       "linear-gradient(135deg, #374151 0%, #4B5563 100%)",
  rss:         "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
};

// Curated Unsplash images per topic (normalized lowercase key)
const TOPIC_FALLBACK_IMAGES: Record<string, string> = {
  "technology":           "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "ai":                   "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
  "artificial intelligence": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
  "programming":          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  "software":             "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  "web development":      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  "finance":              "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  "investing":            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  "stocks":               "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  "crypto":               "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80",
  "cryptocurrency":       "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80",
  "blockchain":           "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80",
  "science":              "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
  "health":               "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  "healthcare":           "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  "medicine":             "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  "politics":             "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80",
  "business":             "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "startups":             "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "gaming":               "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
  "games":                "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
  "sports":               "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
  "entertainment":        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  "space":                "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
  "astronomy":            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
  "environment":          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  "climate":              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  "food":                 "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "travel":               "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80",
  "design":               "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  "security":             "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "cybersecurity":        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "data":                 "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "machine learning":     "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
  "devops":               "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "cloud":                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
};

// Source-based fallback when topic has no match
const SOURCE_FALLBACK_IMAGES: Record<string, string> = {
  hackernews: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  devto:      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  reddit:     "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80",
  rss:        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
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

function readingTime(title: string, summary: string | null): string {
  const words = ((title ?? "") + " " + (summary ?? "")).trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
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
  onDismiss,
  index,
}: {
  article: Article;
  onLike: (id: string, liked: boolean) => void;
  onSave: (id: string, saved: boolean) => void;
  onDismiss: (id: string) => void;
  index: number;
}) {
  const [showReason, setShowReason] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackImgError, setFallbackImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const shareUrl = article.url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: article.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  }
  function handleDismiss() {
    setDismissing(true);
    setTimeout(() => onDismiss(article.id), 300);
  }

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
  const topicKey = article.topic?.name?.toLowerCase() ?? "";
  const fallbackImgUrl =
    TOPIC_FALLBACK_IMAGES[topicKey] ??
    SOURCE_FALLBACK_IMAGES[article.source] ??
    TOPIC_FALLBACK_IMAGES["technology"];

  return (
    <div
      ref={cardRef}
      className={`article-card card-enter ${article._isTrending ? "trending-card" : ""} ${dismissing ? "card-dismissing" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button className="card-dismiss-btn" onClick={handleDismiss} title="Not interested">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
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
        ) : !fallbackImgError ? (
          <img
            src={fallbackImgUrl}
            alt={article.topic?.name ?? sourceLabel}
            className="card-image loaded"
            loading="lazy"
            onError={() => setFallbackImgError(true)}
          />
        ) : (
          <div
            className="card-image-fallback"
            style={{ background: FALLBACK_GRADIENTS[article.source] ?? "linear-gradient(135deg, #374151 0%, #4B5563 100%)" }}
          >
            <span className="fallback-emoji" style={{ fontSize: 44 }}>
              {article.topic?.emoji ?? sourceEmoji}
            </span>
            <span className="fallback-source" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
              {article.topic?.name ?? sourceLabel}
            </span>
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
        {article.impact && (
          <div className="card-impact">
            <span className="impact-label">How this affects you</span>
            <p className="impact-text">{article.impact}</p>
          </div>
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
            {(article.author || article.publishedAt) && " · "}
            <span className="meta-read-time">{readingTime(article.title, article.summary)}</span>
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
            <div className="share-wrap">
              <button
                className={`action-btn share-btn ${copied ? "share-copied" : ""}`}
                onClick={handleShare}
                title={copied ? "Link copied!" : "Share article"}
              >
                {copied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
              </button>
              {copied && <span className="share-tooltip">Copied!</span>}
            </div>
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
  const { data: session } = useSession();
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [showScreenNudge, setShowScreenNudge] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    if (!session?.user?.id) return;
    const key = `welcomed_${session.user.id}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setWelcomeName(session.user.name ?? session.user.email ?? "");
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(t);
    }
  }, [session?.user?.id]);

  // Screen time nudge — fires once after 30 minutes of continuous reading
  useEffect(() => {
    const THIRTY_MIN = 30 * 60 * 1000;
    const t = setTimeout(() => setShowScreenNudge(true), THIRTY_MIN);
    return () => clearTimeout(t);
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

  async function handleDismiss(articleId: string) {
    // Optimistic remove
    setFeed((prev) =>
      prev ? { ...prev, articles: prev.articles.filter((a) => a.id !== articleId) } : prev
    );
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: articleId, type: "DISMISS" }),
    });
  }

  const sources = ["all", "hackernews", "reddit", "devto", "rss"];

  const searchLower = search.toLowerCase();
  const filtered = (feed?.articles ?? []).filter((a) => {
    const matchesSource = filter === "all" || a.source === filter;
    const matchesSearch =
      !searchLower ||
      a.title.toLowerCase().includes(searchLower) ||
      (a.topic?.name ?? "").toLowerCase().includes(searchLower) ||
      (a.source).toLowerCase().includes(searchLower);
    return matchesSource && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/feed/refresh", { method: "POST" });
      const data = await fetch("/api/feed").then((r) => r.json());
      setFeed(data);
      setPage(1);
      setFilter("all");
      setSearch("");
    } catch {}
    setRefreshing(false);
  }

  function handleFilterChange(s: string) {
    setFilter(s);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <>
      <WelcomeModal />
      <InterestCheckModal />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

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
          background: var(--bg-card); border-radius: 12px;
          border: 1px solid var(--border-default);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s ease;
          display: flex; flex-direction: column;
          opacity: 0; transform: translateY(12px);
        }
        .article-card.card-visible { animation: cardIn 0.4s ease forwards; }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        .article-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-hover); transform: translateY(-2px); }
        .article-card.card-visible:hover { transform: translateY(-2px); }
        .trending-card { border-color: #fbbf24; box-shadow: 0 2px 12px rgba(251,191,36,0.12); }

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
          background: var(--bg-elevated);
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
        .card-impact {
          background: var(--primary-light); border-left: 3px solid var(--primary);
          border-radius: 0 6px 6px 0;
          padding: 10px 12px; margin-bottom: 12px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .impact-label { font-size: 10px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.06em; }
        .impact-text { font-size: 12.5px; color: var(--text-body); line-height: 1.4; margin: 0; }
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
        .share-wrap { position: relative; display: flex; align-items: center; }
        .share-btn:hover { background: var(--bg-accent); color: var(--primary); }
        .share-btn.share-copied { color: #16a34a; }
        .share-btn.share-copied:hover { background: #dcfce7; color: #16a34a; }
        .share-tooltip {
          position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
          background: var(--text-heading); color: var(--bg-page);
          font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
          white-space: nowrap; pointer-events: none;
          animation: tooltipIn 0.15s ease;
        }
        @keyframes tooltipIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

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
        .skeleton-card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-default); overflow: hidden; box-shadow: var(--shadow-sm); }
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

        /* ===== DISMISS BUTTON ===== */
        .article-card { position: relative; }
        .card-dismiss-btn {
          position: absolute; top: 10px; right: 10px; z-index: 10;
          width: 28px; height: 28px; border-radius: 8px;
          border: none; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
          color: rgba(255,255,255,0.85); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s ease, background 0.2s ease;
        }
        .article-card:hover .card-dismiss-btn { opacity: 1; }
        .card-dismiss-btn:hover { background: rgba(239,68,68,0.85); color: white; }
        .card-dismissing { animation: cardDismiss 0.3s ease forwards !important; }
        @keyframes cardDismiss { to { opacity: 0; transform: scale(0.95) translateY(8px); } }

        /* ===== SEARCH BAR ===== */
        .feed-search-wrap {
          position: relative; margin-bottom: 16px;
        }
        .feed-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--text-subtle); pointer-events: none;
          display: flex; align-items: center;
        }
        .feed-search {
          width: 100%; padding: 10px 14px 10px 40px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          background: var(--bg-input); color: var(--text-heading);
          font-family: inherit; font-size: 14px;
          outline: none; transition: all 0.2s ease;
        }
        .feed-search::placeholder { color: var(--text-subtle); }
        .feed-search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: var(--bg-input-focus); }
        .feed-search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); display: flex; align-items: center; padding: 2px;
          border-radius: 6px; transition: color 0.15s;
        }
        .feed-search-clear:hover { color: var(--text-heading); }
        .search-empty {
          text-align: center; padding: 40px 20px;
          color: var(--text-subtle); font-size: 14px; line-height: 1.6;
        }
        .search-empty strong { color: var(--text-muted); display: block; font-size: 16px; font-weight: 700; margin-bottom: 4px; }

        /* ===== FEED END STATE ===== */
        .feed-end {
          text-align: center; padding: 48px 20px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .feed-end-icon {
          font-size: 22px; color: var(--primary);
          margin-bottom: 4px; animation: pulse 2.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .feed-end-title { font-size: 16px; font-weight: 700; color: var(--text-heading); letter-spacing: -0.2px; }
        .feed-end-sub { font-size: 13px; color: var(--text-subtle); line-height: 1.6; max-width: 300px; }

        /* ===== REFRESH BUTTON ===== */
        .feed-refresh-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .feed-refresh-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .feed-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .feed-refresh-btn.refreshing .refresh-icon { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Reading time */
        .meta-read-time { color: var(--text-subtle); font-size: 11px; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .feed-container { padding: 16px 16px 60px; }
          .feed-greeting { font-size: 22px; }
          .card-title { font-size: 15px; }
          /* Dismiss button always visible on touch screens */
          .card-dismiss-btn { opacity: 0.75; }
        }

        /* ===== WELCOME TOAST ===== */
        .welcome-toast {
          position: fixed; top: 76px; right: 20px; z-index: 200;
          background: var(--bg-card);
          border: 1.5px solid var(--border-default);
          border-left: 4px solid var(--primary);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: var(--shadow-lg);
          max-width: 320px;
          animation: welcomeIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .welcome-toast.hiding { animation: welcomeOut 0.3s ease forwards; }
        @keyframes welcomeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes welcomeOut { to { opacity: 0; transform: translateX(20px); } }
        .welcome-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: var(--bg-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .welcome-text { flex: 1; min-width: 0; }
        .welcome-title { font-size: 13px; font-weight: 700; color: var(--text-heading); }
        .welcome-sub { font-size: 12px; color: var(--text-subtle); margin-top: 1px; }
        .welcome-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); padding: 4px; border-radius: 6px;
          display: flex; align-items: center; flex-shrink: 0;
          transition: color 0.15s;
        }
        .welcome-close:hover { color: var(--text-heading); }
        @media (max-width: 640px) {
          .welcome-toast { top: 68px; right: 12px; left: 12px; max-width: unset; }
        }

        /* ===== SCREEN TIME NUDGE TOAST ===== */
        .screen-nudge {
          position: fixed; bottom: 80px; right: 20px; z-index: 200;
          background: var(--bg-card);
          border: 1.5px solid var(--border-default);
          border-left: 4px solid #f59e0b;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: var(--shadow-lg);
          max-width: 300px;
          animation: welcomeIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (max-width: 640px) {
          .screen-nudge { bottom: 72px; right: 12px; left: 12px; max-width: unset; }
        }
      `}</style>

      {showWelcome && (
        <div className="welcome-toast">

          <div className="welcome-text">
            <div className="welcome-title">Welcome back, {welcomeName.split(" ")[0] || welcomeName}!</div>
            <div className="welcome-sub">Your feed is ready.</div>
          </div>
          <button className="welcome-close" onClick={() => setShowWelcome(false)} title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {showScreenNudge && (
        <div className="screen-nudge">
          <div className="welcome-icon">☕</div>
          <div className="welcome-text">
            <div className="welcome-title">You&apos;ve been reading for 30 min</div>
            <div className="welcome-sub">Time for a short break.</div>
          </div>
          <button className="welcome-close" onClick={() => setShowScreenNudge(false)} title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <NavBar currentPage="feed" />

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
            <div className="feed-hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 className="feed-greeting">Your Feed</h1>
              <button
                className={`feed-refresh-btn ${refreshing ? "refreshing" : ""}`}
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh feed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="refresh-icon">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            <div className="feed-search-wrap">
              <span className="feed-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                className="feed-search"
                type="text"
                placeholder="Search articles, topics, sources..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {search && (
                <button className="feed-search-clear" onClick={() => handleSearchChange("")} title="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
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

            {filtered.length === 0 && search ? (
              <div className="search-empty">
                <strong>No results for &quot;{search}&quot;</strong>
                Try a different keyword or clear the search.
              </div>
            ) : (
              <div className="articles-grid">
                {paginated.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onLike={handleLike}
                    onSave={handleSave}
                    onDismiss={handleDismiss}
                    index={i}
                  />
                ))}
              </div>
            )}

            {!search && (page === totalPages || totalPages <= 1) && filtered.length > 0 && (
              <div className="feed-end">
                <div className="feed-end-icon">✦</div>
                <div className="feed-end-title">You&apos;re all caught up</div>
                <div className="feed-end-sub">That&apos;s your curated batch for now. Check back after your next digest.</div>
              </div>
            )}

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
