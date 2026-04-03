"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ArticleCard({
  article,
  onLike,
  onSave,
}: {
  article: Article;
  onLike: (id: string, liked: boolean) => void;
  onSave: (id: string, saved: boolean) => void;
}) {
  const [showReason, setShowReason] = useState(false);
  const sourceColor = SOURCE_COLORS[article.source] ?? "#888";
  const sourceLabel = SOURCE_LABELS[article.source] ?? article.source;
  const sourceEmoji = SOURCE_EMOJI[article.source] ?? "📰";

  return (
    <div className={`article-card ${article._isTrending ? "trending-card" : ""}`}>
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="article-image"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="article-image-placeholder">{sourceEmoji}</div>
      )}
      <div className="article-body">
        <div className="article-badges">
          <span className="source-badge" style={{ background: sourceColor }}>
            {sourceLabel}
          </span>
          {article.topic && (
            <span className="topic-badge">
              {article.topic.emoji} {article.topic.name}
            </span>
          )}
          {article._isTrending && (
            <span className="trending-badge">📈 Trending</span>
          )}
        </div>
        <div className="article-title">{article.title}</div>
        {article.summary && (
          <div className="article-summary">{article.summary}</div>
        )}
        {showReason && article._reason && (
          <div className="why-box">
            <span className="why-label">Why this post?</span>
            <span className="why-text">{article._reason}</span>
          </div>
        )}
        <div className="article-footer">
          <span className="article-meta">
            {article.author ? `By ${article.author} · ` : ""}
            {timeAgo(article.publishedAt)}
          </span>
          <div className="article-links">
            <button
              className="why-btn"
              onClick={() => setShowReason((p) => !p)}
              title="Why this post?"
            >
              {showReason ? "✕" : "💡"}
            </button>
            <button
              className={`action-btn ${article.isLiked ? "liked" : ""}`}
              onClick={() => onLike(article.id, article.isLiked)}
              title={article.isLiked ? "Unlike" : "Like"}
            >
              {article.isLiked ? "❤️" : "🤍"}
            </button>
            <button
              className={`action-btn ${article.isSaved ? "saved" : ""}`}
              onClick={() => onSave(article.id, article.isSaved)}
              title={article.isSaved ? "Unsave" : "Save"}
            >
              {article.isSaved ? "🔖" : "🏷️"}
            </button>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="discussion-link"
              >
                💬 Discussion
              </a>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more"
              onClick={() => {
                fetch("/api/interactions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contentId: article.id, type: "CLICK" }),
                });
              }}
            >
              Read more →
            </a>
          </div>
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

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        setFeed(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLike(articleId: string, isLiked: boolean) {
    const method = isLiked ? "DELETE" : "POST";
    await fetch("/api/interactions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: articleId, type: "LIKE" }),
    });
    setFeed((prev) =>
      prev ? {
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === articleId ? { ...a, isLiked: !isLiked } : a
        ),
      } : prev
    );
  }

  async function handleSave(articleId: string, isSaved: boolean) {
    const method = isSaved ? "DELETE" : "POST";
    await fetch("/api/interactions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: articleId, type: "SAVE" }),
    });
    setFeed((prev) =>
      prev ? {
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === articleId ? { ...a, isSaved: !isSaved } : a
        ),
      } : prev
    );
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f8; font-family: 'DM Sans', sans-serif; }
        .feed-container { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }
        .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .feed-logo { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800; color: #0f1132; }
        .header-actions { display: flex; gap: 10px; }
        .pref-btn { padding: 8px 18px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #4f52d3; cursor: pointer; transition: all 0.15s; }
        .pref-btn:hover { background: #f0f0fc; border-color: #4f52d3; }
        .saved-btn { padding: 8px 18px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .saved-btn:hover { background: #f0f0fc; border-color: #4f52d3; color: #4f52d3; }
        .feed-meta { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
        .feed-meta span { color: #4f52d3; font-weight: 600; }
        .filter-bar { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
        .filter-chip { padding: 6px 16px; border-radius: 999px; border: 1.5px solid #e5e7eb; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .filter-chip:hover { border-color: #4f52d3; color: #4f52d3; }
        .filter-chip.active { background: #4f52d3; border-color: #4f52d3; color: #fff; }
        .articles-grid { display: flex; flex-direction: column; gap: 16px; }
        .article-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.06); display: flex; transition: box-shadow 0.2s, transform 0.15s; color: inherit; cursor: default; }
        .article-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .trending-card { border: 1.5px solid #fbbf24; }
        .article-image { width: 180px; min-width: 180px; height: 140px; object-fit: cover; background: #f3f4f6; }
        .article-image-placeholder { width: 180px; min-width: 180px; height: 140px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #f0f0fc, #e8f0fe); }
        .article-body { padding: 18px 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .article-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .source-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; color: #fff; }
        .topic-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; background: #ededf8; color: #4f52d3; }
        .trending-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #d97706; }
        .article-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #0f1132; line-height: 1.4; }
        .article-summary { font-size: 13px; color: #6b7280; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .why-box { background: #f8f9ff; border-left: 3px solid #4f52d3; border-radius: 6px; padding: 8px 12px; font-size: 12px; display: flex; flex-direction: column; gap: 2px; }
        .why-label { font-weight: 700; color: #4f52d3; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        .why-text { color: #374151; }
        .article-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .article-meta { font-size: 12px; color: #9ca3af; }
        .article-links { display: flex; gap: 12px; align-items: center; }
        .why-btn { background: none; border: none; cursor: pointer; font-size: 15px; padding: 2px 4px; border-radius: 6px; transition: transform 0.15s; opacity: 0.6; }
        .why-btn:hover { opacity: 1; transform: scale(1.2); }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; border-radius: 6px; transition: transform 0.15s; }
        .action-btn:hover { transform: scale(1.2); }
        .read-more { font-size: 13px; font-weight: 600; color: #4f52d3; text-decoration: none; }
        .read-more:hover { text-decoration: underline; }
        .discussion-link { font-size: 13px; font-weight: 500; color: #9ca3af; text-decoration: none; }
        .discussion-link:hover { color: #4f52d3; text-decoration: underline; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 32px; }
        .page-btn { padding: 8px 16px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { border-color: #4f52d3; color: #4f52d3; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-btn.active { background: #4f52d3; border-color: #4f52d3; color: #fff; }
        .page-info { font-size: 13px; color: #9ca3af; }
        .loading { text-align: center; padding: 80px 0; color: #9ca3af; font-size: 15px; }
        .empty { text-align: center; padding: 80px 0; color: #9ca3af; }
        .empty h2 { font-family: 'Sora', sans-serif; font-size: 20px; color: #0f1132; margin-bottom: 8px; }
      `}</style>

      <div className="feed-container">
        <div className="feed-header">
          <span className="feed-logo">Distilled</span>
          <div className="header-actions">
            <button className="saved-btn" onClick={() => router.push("/saved")}>
              🔖 Saved
            </button>
            <button className="pref-btn" onClick={() => router.push("/preferences")}>
              ⚙️ Edit Preferences
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading your feed...</div>
        ) : !feed || feed.articles.length === 0 ? (
          <div className="empty">
            <h2>No articles yet</h2>
            <p>Try triggering a content fetch or updating your preferences.</p>
          </div>
        ) : (
          <>
            <p className="feed-meta">
              Showing <span>{filtered.filter(a => !a._isTrending).length}</span> articles
              {filtered.some(a => a._isTrending) && (
                <> + <span>2 trending</span></>
              )} from{" "}
              <span>{feed.preferences.topics.join(", ")}</span>
            </p>
            <div className="filter-bar">
              {sources.map((s) => (
                <button
                  key={s}
                  className={`filter-chip ${filter === s ? "active" : ""}`}
                  onClick={() => handleFilterChange(s)}
                >
                  {s === "all" ? "All" : SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="articles-grid">
              {paginated.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}