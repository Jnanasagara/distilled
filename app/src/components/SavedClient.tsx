"use client";

import { useEffect, useState, useRef } from "react";
import NavBar from "./NavBar";

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
  savedAt: string;
  topic: { name: string; emoji: string | null } | null;
};

type Collection = {
  id: string;
  name: string;
  color: string | null;
  items: { contentId: string; content: Article & { topic: { name: string; emoji: string | null } | null } }[];
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500", hackernews: "#FF6600", devto: "#3B49DF", rss: "#FFA500",
};
const FALLBACK_GRADIENTS: Record<string, string> = {
  reddit: "linear-gradient(135deg, #FF4500 0%, #FF6534 100%)",
  hackernews: "linear-gradient(135deg, #FF6600 0%, #FF8C33 100%)",
  devto: "linear-gradient(135deg, #374151 0%, #4B5563 100%)",
  rss: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
};
const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit", hackernews: "Hacker News", devto: "Dev.to", rss: "RSS",
};
const SOURCE_EMOJI: Record<string, string> = {
  hackernews: "🔶", reddit: "🔴", devto: "💻", rss: "📰",
};
const COLLECTION_COLORS = ["#f97316","#3b82f6","#10b981","#8b5cf6","#ef4444","#f59e0b","#06b6d4","#ec4899"];

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
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function SavedCard({
  article, onUnsave, index, collections, onAddToCollection, onRemoveFromCollection,
}: {
  article: Article;
  onUnsave: (id: string) => void;
  index: number;
  collections: Collection[];
  onAddToCollection: (collectionId: string, contentId: string) => void;
  onRemoveFromCollection: (collectionId: string, contentId: string) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showCollPicker, setShowCollPicker] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const sourceColor = SOURCE_COLORS[article.source] ?? "#888";
  const sourceLabel = SOURCE_LABELS[article.source] ?? article.source;
  const sourceEmoji = SOURCE_EMOJI[article.source] ?? "📰";

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("card-visible"); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showCollPicker) return;
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowCollPicker(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showCollPicker]);

  const hasImage = article.imageUrl && !imgError;
  const inCollections = new Set(
    collections.filter((c) => c.items.some((it) => it.contentId === article.id)).map((c) => c.id)
  );

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => onUnsave(article.id), 300);
  }

  return (
    <div ref={cardRef} className={`saved-card card-enter ${removing ? "card-removing" : ""}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="saved-card-image-wrapper">
        {hasImage ? (
          <>
            {!imgLoaded && <div className="saved-card-img-skeleton shimmer" />}
            <img src={article.imageUrl!} alt={article.title} className={`saved-card-img ${imgLoaded ? "loaded" : ""}`} loading="lazy"
              onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} />
          </>
        ) : (
          <div className="saved-card-img-fallback" style={{ background: FALLBACK_GRADIENTS[article.source] ?? "linear-gradient(135deg, #374151 0%, #4B5563 100%)" }}>
            <span className="saved-fallback-emoji">{article.topic?.emoji ?? sourceEmoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{article.topic?.name ?? sourceLabel}</span>
          </div>
        )}
        <span className="saved-source-pill" style={{ background: sourceColor }}>{sourceLabel}</span>
      </div>

      <div className="saved-card-content">
        {article.topic && <div className="saved-card-topic">{article.topic.emoji} {article.topic.name}</div>}
        <h3 className="saved-card-title">{article.title}</h3>
        {article.summary && <p className="saved-card-summary">{article.summary}</p>}
        {article.impact && (
          <div className="saved-card-impact">
            <span className="saved-impact-label">How this affects you</span>
            <p className="saved-impact-text">{article.impact}</p>
          </div>
        )}
        <div className="saved-card-meta">
          {article.author && <span>{article.author}</span>}
          {article.author && article.publishedAt && " · "}
          {article.publishedAt && <span>{timeAgo(article.publishedAt)}</span>}
          {(article.author || article.publishedAt) && " · "}
          <span>{readingTime(article.title, article.summary)}</span>
        </div>

        <div className="saved-card-actions">
          <div className="saved-actions-left">
            <button className="saved-remove-btn" onClick={handleRemove} title="Remove from saved">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="saved-discussion-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Discussion
              </a>
            )}
            {collections.length > 0 && (
              <div className="coll-picker-wrap" ref={pickerRef}>
                <button
                  className={`saved-coll-btn ${inCollections.size > 0 ? "in-coll" : ""}`}
                  onClick={() => setShowCollPicker((v) => !v)}
                  title="Add to collection"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {inCollections.size > 0 ? inCollections.size : ""}
                </button>
                {showCollPicker && (
                  <div className="coll-dropdown">
                    <div className="coll-dropdown-title">Add to collection</div>
                    {collections.map((c) => {
                      const isIn = inCollections.has(c.id);
                      return (
                        <button
                          key={c.id}
                          className={`coll-dropdown-item ${isIn ? "checked" : ""}`}
                          onClick={() => {
                            if (isIn) onRemoveFromCollection(c.id, article.id);
                            else onAddToCollection(c.id, article.id);
                          }}
                        >
                          <span className="coll-dropdown-dot" style={{ background: c.color ?? "#f97316" }} />
                          {c.name}
                          {isIn && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="saved-read-link">
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null); // null = all
  const [showNewColl, setShowNewColl] = useState(false);
  const [newCollName, setNewCollName] = useState("");
  const [newCollColor, setNewCollColor] = useState(COLLECTION_COLORS[0]);
  const [creatingColl, setCreatingColl] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/saved").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ])
      .then(([savedData, collData]) => {
        setArticles(savedData.articles ?? []);
        setCollections(collData.collections ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showExport) return;
    function handle(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showExport]);

  async function unsave(articleId: string) {
    await fetch("/api/interactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: articleId, type: "SAVE" }),
    });
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    // Also remove from all collections locally
    setCollections((prev) =>
      prev.map((c) => ({ ...c, items: c.items.filter((it) => it.contentId !== articleId) }))
    );
  }

  async function handleAddToCollection(collectionId: string, contentId: string) {
    await fetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId }),
    });
    const article = articles.find((a) => a.id === contentId);
    if (!article) return;
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId && !c.items.some((it) => it.contentId === contentId)
          ? { ...c, items: [...c.items, { contentId, content: article as any }] }
          : c
      )
    );
  }

  async function handleRemoveFromCollection(collectionId: string, contentId: string) {
    await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId }),
    });
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, items: c.items.filter((it) => it.contentId !== contentId) }
          : c
      )
    );
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollName.trim()) return;
    setCreatingColl(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollName, color: newCollColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setCollections((prev) => [...prev, { ...data.collection, items: [] }]);
        setNewCollName("");
        setShowNewColl(false);
      }
    } finally {
      setCreatingColl(false);
    }
  }

  async function handleDeleteCollection(id: string) {
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (activeCollection === id) setActiveCollection(null);
  }

  function handleExport(format: "csv" | "json") {
    window.open(`/api/saved/export?format=${format}`, "_blank");
    setShowExport(false);
  }

  // Filter articles by active collection
  let displayArticles = articles;
  if (activeCollection) {
    const coll = collections.find((c) => c.id === activeCollection);
    const ids = new Set(coll?.items.map((it) => it.contentId) ?? []);
    displayArticles = articles.filter((a) => ids.has(a.id));
  }

  const searchLower = search.toLowerCase();
  const filtered = displayArticles.filter((a) =>
    !searchLower ||
    a.title.toLowerCase().includes(searchLower) ||
    (a.topic?.name ?? "").toLowerCase().includes(searchLower) ||
    a.source.toLowerCase().includes(searchLower)
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        .saved-container { max-width: 1200px; margin: 0 auto; padding: 24px 24px 80px; }
        .saved-hero { margin-bottom: 20px; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .saved-hero-left {}
        .saved-heading { font-size: 28px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
        .saved-count { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 999px; background: var(--primary); color: var(--text-inverse); font-size: 13px; font-weight: 700; }
        .saved-subtitle { font-size: 15px; color: var(--text-subtle); line-height: 1.5; }

        /* Export */
        .export-wrap { position: relative; }
        .export-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .export-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .export-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: var(--bg-card); border: 1.5px solid var(--border-default); border-radius: 12px; padding: 4px; box-shadow: var(--shadow-lg); z-index: 50; min-width: 150px; }
        .export-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: none; background: none; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text-body); cursor: pointer; border-radius: 8px; transition: background 0.15s; text-align: left; }
        .export-option:hover { background: var(--bg-elevated); }

        /* Collections tabs */
        .coll-tabs-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px; -ms-overflow-style: none; scrollbar-width: none; }
        .coll-tabs-row::-webkit-scrollbar { display: none; }
        .coll-tab { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .coll-tab:hover { border-color: var(--primary); color: var(--primary); }
        .coll-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
        .coll-tab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .coll-tab-count { font-size: 11px; font-weight: 700; opacity: 0.8; }
        .coll-tab-del { display: none; margin-left: 2px; background: none; border: none; cursor: pointer; color: inherit; padding: 0; line-height: 1; }
        .coll-tab.active .coll-tab-del { display: flex; align-items: center; }
        .coll-new-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 999px; border: 1.5px dashed var(--border-default); background: transparent; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text-subtle); cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .coll-new-btn:hover { border-color: var(--primary); color: var(--primary); border-style: solid; background: var(--bg-accent); }

        /* New collection form */
        .coll-new-form { background: var(--bg-card); border: 1.5px solid var(--border-default); border-radius: 14px; padding: 18px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .coll-new-form-title { font-size: 14px; font-weight: 700; color: var(--text-heading); margin-bottom: 12px; }
        .coll-new-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .coll-new-input { flex: 1; min-width: 160px; padding: 9px 14px; border: 1.5px solid var(--border-default); border-radius: 10px; background: var(--bg-input); color: var(--text-heading); font-family: inherit; font-size: 14px; outline: none; transition: all 0.2s; }
        .coll-new-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .coll-new-input::placeholder { color: var(--text-subtle); }
        .coll-colors { display: flex; gap: 6px; flex-wrap: wrap; }
        .coll-color-btn { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s; flex-shrink: 0; }
        .coll-color-btn:hover { transform: scale(1.2); }
        .coll-color-btn.selected { border-color: white; box-shadow: 0 0 0 2px var(--border-default); transform: scale(1.15); }
        .coll-new-actions { display: flex; gap: 8px; margin-top: 12px; }
        .coll-new-save { padding: 8px 18px; border: none; border-radius: 10px; background: var(--primary); color: white; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .coll-new-save:hover { background: var(--primary-hover); }
        .coll-new-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .coll-new-cancel { padding: 8px 16px; border: 1.5px solid var(--border-default); border-radius: 10px; background: transparent; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .coll-new-cancel:hover { border-color: var(--text-muted); color: var(--text-heading); }

        /* Collection picker on card */
        .coll-picker-wrap { position: relative; }
        .saved-coll-btn { display: flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 8px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .saved-coll-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .saved-coll-btn.in-coll { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .coll-dropdown { position: absolute; bottom: calc(100% + 6px); left: 0; background: var(--bg-card); border: 1.5px solid var(--border-default); border-radius: 12px; padding: 6px; box-shadow: var(--shadow-lg); z-index: 50; min-width: 180px; }
        .coll-dropdown-title { font-size: 10px; font-weight: 700; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.06em; padding: 4px 10px 6px; }
        .coll-dropdown-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; border: none; background: none; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text-body); cursor: pointer; border-radius: 8px; transition: background 0.15s; text-align: left; }
        .coll-dropdown-item:hover { background: var(--bg-elevated); }
        .coll-dropdown-item.checked { color: var(--primary); }
        .coll-dropdown-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        /* Grid */
        .saved-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .saved-grid { grid-template-columns: 1fr; } }

        /* Card */
        .saved-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-default); box-shadow: var(--shadow-sm); transition: all 0.25s ease; display: flex; flex-direction: column; opacity: 0; transform: translateY(12px); }
        .saved-card.card-visible { animation: cardIn 0.4s ease forwards; }
        .saved-card.card-removing { animation: cardOut 0.3s ease forwards; }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes cardOut { to { opacity: 0; transform: scale(0.95) translateY(8px); } }
        .saved-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-hover); transform: translateY(-2px); }
        .saved-card.card-visible:hover { transform: translateY(-2px); }

        .saved-card-image-wrapper { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; background: var(--bg-elevated); }
        .saved-card-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.4s ease; }
        .saved-card-img.loaded { opacity: 1; }
        .saved-card-img-skeleton { position: absolute; inset: 0; background: var(--bg-skeleton); }
        .saved-card-img-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: var(--bg-elevated); }
        .saved-fallback-emoji { font-size: 36px; }
        .saved-source-pill { position: absolute; top: 12px; left: 12px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; color: white; }

        .saved-card-content { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
        .saved-card-topic { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 8px; }
        .saved-card-title { font-size: 16px; font-weight: 700; color: var(--text-heading); line-height: 1.4; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .saved-card-summary { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 12px; }
        .saved-card-impact { background: var(--primary-light); border-left: 3px solid var(--primary); border-radius: 0 6px 6px 0; padding: 10px 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 3px; }
        .saved-impact-label { font-size: 10px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.06em; }
        .saved-impact-text { font-size: 12.5px; color: var(--text-body); line-height: 1.4; margin: 0; }
        .saved-card-meta { font-size: 12px; color: var(--text-subtle); margin-top: auto; margin-bottom: 12px; }
        .saved-card-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-divider); flex-wrap: wrap; gap: 8px; }
        .saved-actions-left { display: flex; gap: 6px; flex-wrap: wrap; }
        .saved-remove-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; border: 1.5px solid var(--border-error); background: var(--bg-error); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-error); cursor: pointer; transition: all 0.2s ease; }
        .saved-remove-btn:hover { border-color: var(--text-error); }
        .saved-discussion-link { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-size: 12px; font-weight: 600; color: var(--text-muted); text-decoration: none; transition: all 0.2s; }
        .saved-discussion-link:hover { border-color: var(--primary); color: var(--primary); }
        .saved-read-link { display: flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 10px; background: var(--btn-dark); color: var(--text-inverse); font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .saved-read-link:hover { background: var(--btn-dark-hover); }

        /* Skeleton */
        .saved-skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .saved-skeleton-grid { grid-template-columns: 1fr; } }
        .saved-skeleton-card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-default); overflow: hidden; box-shadow: var(--shadow-sm); }
        .saved-skeleton-img { aspect-ratio: 16/9; background: var(--bg-skeleton); }
        .saved-skeleton-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; }
        .saved-skeleton-line { height: 14px; border-radius: 6px; background: var(--bg-skeleton); }
        .shimmer { background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Empty */
        .saved-empty { text-align: center; padding: 80px 20px; max-width: 400px; margin: 0 auto; }
        .saved-empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--bg-accent); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
        .saved-empty-title { font-size: 20px; font-weight: 700; color: var(--text-heading); margin: 0 0 8px; }
        .saved-empty-text { font-size: 14px; color: var(--text-subtle); line-height: 1.6; margin: 0; }

        /* Search */
        .saved-search-wrap { position: relative; margin-bottom: 20px; }
        .saved-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); pointer-events: none; display: flex; align-items: center; }
        .saved-search { width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid var(--border-default); border-radius: 12px; background: var(--bg-input); color: var(--text-heading); font-family: inherit; font-size: 14px; outline: none; transition: all 0.2s; }
        .saved-search::placeholder { color: var(--text-subtle); }
        .saved-search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: var(--bg-input-focus); }
        .saved-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-subtle); display: flex; align-items: center; padding: 2px; border-radius: 6px; }
        .saved-search-clear:hover { color: var(--text-heading); }
        .saved-search-empty { text-align: center; padding: 40px 20px; color: var(--text-subtle); font-size: 14px; line-height: 1.6; }
        .saved-search-empty strong { color: var(--text-muted); display: block; font-size: 16px; font-weight: 700; margin-bottom: 4px; }

        @media (max-width: 640px) {
          .saved-container { padding: 16px 16px 60px; }
          .saved-heading { font-size: 22px; }
          .saved-card-actions { flex-direction: column; align-items: stretch; }
          .saved-read-link { justify-content: center; }
        }
      `}</style>

      <NavBar currentPage="saved" />

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
            <p className="saved-empty-text">Bookmark articles from your feed to read them later.</p>
          </div>
        ) : (
          <>
            <div className="saved-hero">
              <div className="saved-hero-left">
                <h1 className="saved-heading">
                  Saved Articles
                  <span className="saved-count">{articles.length}</span>
                </h1>
                <p className="saved-subtitle">Your bookmarked articles for later reading.</p>
              </div>
              <div className="export-wrap" ref={exportRef}>
                <button className="export-btn" onClick={() => setShowExport((v) => !v)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showExport && (
                  <div className="export-dropdown">
                    <button className="export-option" onClick={() => handleExport("json")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      Export as JSON
                    </button>
                    <button className="export-option" onClick={() => handleExport("csv")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Collections tabs */}
            <div className="coll-tabs-row">
              <button
                className={`coll-tab ${activeCollection === null ? "active" : ""}`}
                onClick={() => setActiveCollection(null)}
              >
                All Saved
                <span className="coll-tab-count">{articles.length}</span>
              </button>
              {collections.map((c) => (
                <button
                  key={c.id}
                  className={`coll-tab ${activeCollection === c.id ? "active" : ""}`}
                  onClick={() => setActiveCollection(c.id)}
                >
                  <span className="coll-tab-dot" style={{ background: c.color ?? "#f97316" }} />
                  {c.name}
                  <span className="coll-tab-count">{c.items.length}</span>
                  <button
                    className="coll-tab-del"
                    title="Delete collection"
                    onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id); }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </button>
              ))}
              <button className="coll-new-btn" onClick={() => setShowNewColl((v) => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New
              </button>
            </div>

            {showNewColl && (
              <form className="coll-new-form" onSubmit={handleCreateCollection}>
                <div className="coll-new-form-title">New Collection</div>
                <div className="coll-new-row">
                  <input
                    className="coll-new-input"
                    placeholder="Collection name"
                    value={newCollName}
                    onChange={(e) => setNewCollName(e.target.value)}
                    maxLength={50}
                    autoFocus
                  />
                  <div className="coll-colors">
                    {COLLECTION_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        className={`coll-color-btn ${newCollColor === col ? "selected" : ""}`}
                        style={{ background: col }}
                        onClick={() => setNewCollColor(col)}
                      />
                    ))}
                  </div>
                </div>
                <div className="coll-new-actions">
                  <button type="submit" className="coll-new-save" disabled={!newCollName.trim() || creatingColl}>
                    {creatingColl ? "Creating…" : "Create"}
                  </button>
                  <button type="button" className="coll-new-cancel" onClick={() => { setShowNewColl(false); setNewCollName(""); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="saved-search-wrap">
              <span className="saved-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                className="saved-search"
                type="text"
                placeholder="Search saved articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="saved-search-clear" onClick={() => setSearch("")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="saved-search-empty">
                {search
                  ? <><strong>No results for &ldquo;{search}&rdquo;</strong>Try a different keyword.</>
                  : <><strong>No articles in this collection</strong>Add articles by clicking the folder icon on saved cards.</>
                }
              </div>
            ) : (
              <div className="saved-grid">
                {filtered.map((article, i) => (
                  <SavedCard
                    key={article.id}
                    article={article}
                    onUnsave={unsave}
                    index={i}
                    collections={collections}
                    onAddToCollection={handleAddToCollection}
                    onRemoveFromCollection={handleRemoveFromCollection}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
