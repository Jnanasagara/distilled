"use client";

import { useEffect, useState, useRef } from "react";
import NavBar from "./NavBar";

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
  readAt: string;
  topic: { name: string; emoji: string | null } | null;
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500", hackernews: "#FF6600", devto: "#3B49DF", rss: "#FFA500", aljazeera: "#007A5E", atlas: "#6366F1",
};
const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit", hackernews: "Hacker News", devto: "Dev.to", rss: "RSS", aljazeera: "Al Jazeera", atlas: "Atlas",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HistoryCard({ article, index }: { article: Article; index: number }) {
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sourceColor = SOURCE_COLORS[article.source] ?? "#888";
  const sourceLabel = SOURCE_LABELS[article.source] ?? article.source;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("hc-visible"); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="hc-card" style={{ animationDelay: `${index * 40}ms` }}>
      {article.imageUrl && !imgError && (
        <div className="hc-img-wrap">
          <img src={article.imageUrl} alt="" className="hc-img" loading="lazy" onError={() => setImgError(true)} />
          <span className="hc-source-pill" style={{ background: sourceColor }}>{sourceLabel}</span>
        </div>
      )}
      <div className="hc-body">
        <div className="hc-meta-top">
          {(!article.imageUrl || imgError) && (
            <span className="hc-source-inline" style={{ background: sourceColor }}>{sourceLabel}</span>
          )}
          {article.topic && <span className="hc-topic">{article.topic.emoji} {article.topic.name}</span>}
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hc-title">
          {article.title}
        </a>
        {article.summary && <p className="hc-summary">{article.summary}</p>}
        <div className="hc-footer">
          <span className="hc-read-at">Read {timeAgo(article.readAt)}</span>
          {article.author && <span className="hc-author">by {article.author}</span>}
          {article.sourceUrl && (
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hc-discussion">
              Discussion
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setArticles(d.articles ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  const searchLower = search.toLowerCase();
  const filtered = articles.filter((a) =>
    !searchLower ||
    a.title.toLowerCase().includes(searchLower) ||
    (a.topic?.name ?? "").toLowerCase().includes(searchLower) ||
    a.source.toLowerCase().includes(searchLower)
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }

        .hist-container { max-width: 900px; margin: 0 auto; padding: 24px 24px 80px; }
        .hist-hero { margin-bottom: 28px; }
        .hist-heading { font-size: 28px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
        .hist-count { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 999px; background: var(--primary); color: var(--text-inverse); font-size: 13px; font-weight: 700; }
        .hist-subtitle { font-size: 15px; color: var(--text-subtle); }

        .hist-search-wrap { position: relative; margin-bottom: 20px; }
        .hist-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); pointer-events: none; display: flex; align-items: center; }
        .hist-search { width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid var(--border-default); border-radius: 12px; background: var(--bg-input); color: var(--text-heading); font-family: inherit; font-size: 14px; outline: none; transition: all 0.2s; }
        .hist-search::placeholder { color: var(--text-subtle); }
        .hist-search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .hist-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-subtle); display: flex; align-items: center; padding: 2px; border-radius: 6px; }
        .hist-search-clear:hover { color: var(--text-heading); }

        .hc-list { display: flex; flex-direction: column; gap: 12px; }
        .hc-card {
          background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-default);
          box-shadow: var(--shadow-sm); overflow: hidden;
          display: flex; gap: 0; transition: all 0.25s ease;
          opacity: 0; transform: translateY(8px);
        }
        .hc-card.hc-visible { animation: hcIn 0.35s ease forwards; }
        @keyframes hcIn { to { opacity: 1; transform: translateY(0); } }
        .hc-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-hover); }

        .hc-img-wrap { position: relative; width: 140px; flex-shrink: 0; overflow: hidden; }
        .hc-img { width: 100%; height: 100%; object-fit: cover; }
        .hc-source-pill { position: absolute; top: 8px; left: 8px; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: white; }

        .hc-body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .hc-meta-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .hc-source-inline { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: white; }
        .hc-topic { font-size: 11px; font-weight: 600; color: var(--primary); }
        .hc-title { font-size: 15px; font-weight: 700; color: var(--text-heading); line-height: 1.4; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hc-title:hover { color: var(--primary); }
        .hc-summary { font-size: 13px; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
        .hc-footer { display: flex; align-items: center; gap: 10px; margin-top: auto; flex-wrap: wrap; }
        .hc-read-at { font-size: 11px; color: var(--text-subtle); font-weight: 500; }
        .hc-author { font-size: 11px; color: var(--text-subtle); }
        .hc-discussion { font-size: 11px; color: var(--primary); font-weight: 600; text-decoration: none; }
        .hc-discussion:hover { text-decoration: underline; }

        .hist-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 32px; }
        .hist-page-btn { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .hist-page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .hist-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .hist-page-btn.active { background: var(--primary); border-color: var(--primary); color: var(--text-inverse); }
        .hist-page-arrow { width: auto; padding: 0 14px; font-size: 13px; }

        .hist-empty { text-align: center; padding: 80px 20px; }
        .hist-empty-icon { width: 72px; height: 72px; border-radius: 18px; background: var(--bg-accent); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
        .hist-empty-title { font-size: 18px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px; }
        .hist-empty-text { font-size: 14px; color: var(--text-subtle); line-height: 1.6; }

        .shimmer { background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .hist-skel { height: 100px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-default); }

        @media (max-width: 640px) {
          .hist-container { padding: 16px 16px 60px; }
          .hist-heading { font-size: 22px; }
          .hc-img-wrap { width: 100px; }
          .hc-title { font-size: 14px; }
        }
      `}</style>

      <NavBar currentPage="history" />

      <div className="hist-container">
        {loading ? (
          <>
            <div className="hist-hero">
              <div className="shimmer" style={{ width: 200, height: 28, marginBottom: 8 }} />
              <div className="shimmer" style={{ width: 260, height: 16 }} />
            </div>
            <div className="hc-list">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="hist-skel shimmer" />)}
            </div>
          </>
        ) : total === 0 ? (
          <div className="hist-empty">
            <div className="hist-empty-icon">📖</div>
            <div className="hist-empty-title">No reading history yet</div>
            <p className="hist-empty-text">Articles you open from your feed will appear here.</p>
          </div>
        ) : (
          <>
            <div className="hist-hero">
              <h1 className="hist-heading">
                Reading History
                <span className="hist-count">{total}</span>
              </h1>
              <p className="hist-subtitle">All articles you&apos;ve opened from your feed.</p>
            </div>

            <div className="hist-search-wrap">
              <span className="hist-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                className="hist-search"
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="hist-search-clear" onClick={() => setSearch("")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className="hc-list">
              {filtered.map((article, i) => (
                <HistoryCard key={article.id} article={article} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="hist-pagination">
                <button
                  className="hist-page-btn hist-page-arrow"
                  onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                >←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} style={{ color: "var(--text-subtle)", fontSize: 13 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`hist-page-btn ${page === p ? "active" : ""}`}
                        onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >{p}</button>
                    )
                  )}
                <button
                  className="hist-page-btn hist-page-arrow"
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                >→</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
