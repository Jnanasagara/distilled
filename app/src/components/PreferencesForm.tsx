"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

type Topic = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
};

type Props = {
  topics: Topic[];
  initialTopicIds?: string[];
  initialPausedTopicIds?: string[];
  initialPostCount?: number;
  initialFrequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  initialShowTrending?: boolean;
  initialBlockedSources?: string[];
  mode: "onboarding" | "preferences";
  userId: string;
};

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily", description: "Fresh picks every day" },
  { value: "WEEKLY", label: "Weekly", description: "Best of the week" },
  { value: "MONTHLY", label: "Monthly", description: "Deep monthly digest" },
] as const;

const SOURCE_OPTIONS = [
  { value: "hackernews", label: "Hacker News" },
  { value: "reddit",     label: "Reddit" },
  { value: "devto",      label: "Dev.to" },
  { value: "rss",        label: "RSS" },
] as const;

export default function PreferencesForm({
  topics,
  initialTopicIds = [],
  initialPausedTopicIds = [],
  initialPostCount = 20,
  initialFrequency = "DAILY",
  initialShowTrending = true,
  initialBlockedSources = [],
  mode,
  userId,
}: Props) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(initialTopicIds));
  const [pausedTopics, setPausedTopics] = useState<Set<string>>(new Set(initialPausedTopicIds));
  const [postCount, setPostCount] = useState(initialPostCount);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">(initialFrequency);
  const [showTrending, setShowTrending] = useState(initialShowTrending);
  const [blockedSources, setBlockedSources] = useState<Set<string>>(new Set(initialBlockedSources));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetConfirming, setResetConfirming] = useState(false);
  const [error, setError] = useState("");

  type RssSource = { id: string; name: string; url: string; topicId: string | null };
  const [rssSources, setRssSources] = useState<RssSource[]>([]);
  const [rssUrl, setRssUrl] = useState("");
  const [rssName, setRssName] = useState("");
  const [rssTopicId, setRssTopicId] = useState("");
  const [rssAdding, setRssAdding] = useState(false);
  const [rssError, setRssError] = useState("");
  const [removingRssId, setRemovingRssId] = useState<string | null>(null);

  const maxPosts = frequency === "MONTHLY" ? 100 : frequency === "WEEKLY" ? 60 : 30;

  function toggleTopic(id: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePause(id: string) {
    setPausedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFrequencyChange(val: "DAILY" | "WEEKLY" | "MONTHLY") {
    setFrequency(val);
    if (val === "DAILY" && postCount > 30) setPostCount(30);
    if (val === "WEEKLY" && postCount > 60) setPostCount(60);
  }

  async function handleResetWeights() {
    setResetting(true);
    try {
      await fetch("/api/preferences/reset", { method: "POST" });
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    } catch {
      setError("Failed to reset weights.");
    } finally {
      setResetting(false);
    }
  }

  async function handlePauseToggle(topicId: string) {
    const isPaused = pausedTopics.has(topicId);
    togglePause(topicId);
    try {
      await fetch("/api/preferences/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, paused: !isPaused }),
      });
    } catch {
      togglePause(topicId);
    }
  }

  useEffect(() => {
    if (mode !== "preferences") return;
    fetch("/api/user/rss-sources")
      .then((r) => r.json())
      .then((d) => setRssSources(d.sources ?? []))
      .catch(() => {});
  }, [mode]);

  async function handleAddRss(e: React.FormEvent) {
    e.preventDefault();
    setRssError("");
    if (!rssUrl.trim()) { setRssError("Enter a feed URL."); return; }
    setRssAdding(true);
    try {
      const res = await fetch("/api/user/rss-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl.trim(), name: rssName.trim() || undefined, topicId: rssTopicId || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setRssError(d.error ?? "Failed to add source."); }
      else { setRssSources((prev) => [...prev, d.source]); setRssUrl(""); setRssName(""); setRssTopicId(""); }
    } catch { setRssError("Network error. Please try again."); }
    finally { setRssAdding(false); }
  }

  async function handleRemoveRss(id: string) {
    setRemovingRssId(id);
    try {
      await fetch(`/api/user/rss-sources?id=${id}`, { method: "DELETE" });
      setRssSources((prev) => prev.filter((s) => s.id !== id));
    } finally { setRemovingRssId(null); }
  }

  async function handleToggleBlockedSource(source: string) {
    const isBlocked = blockedSources.has(source);
    setBlockedSources((prev) => {
      const next = new Set(prev);
      if (isBlocked) next.delete(source);
      else next.add(source);
      return next;
    });
    try {
      await fetch("/api/user/blocked-sources", {
        method: isBlocked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
    } catch {
      // Rollback on failure
      setBlockedSources((prev) => {
        const next = new Set(prev);
        if (isBlocked) next.add(source);
        else next.delete(source);
        return next;
      });
    }
  }

  async function handleSubmit() {
    if (selectedTopics.size === 0) {
      setError("Please select at least one topic.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicIds: Array.from(selectedTopics),
          postCount,
          frequency,
          showTrending,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      router.push("/feed");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        .pref-page {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 24px 80px;
        }

        /* Theme toggle floating top-right */
        .pref-theme-toggle {
          position: fixed; top: 20px; right: 20px; z-index: 100;
        }
        .theme-toggle-btn {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        /* Header */
        .pref-header { text-align: center; margin-bottom: 40px; }
        .pref-brand {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
        }
        .pref-brand-icon {
          width: 44px; height: 44px; border-radius: 12px;
          overflow: hidden; flex-shrink: 0;
        }
        .pref-brand-icon img { width: 100%; height: 100%; display: block; }
        .pref-brand-name {
          font-size: 28px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px;
        }
        .pref-title {
          font-size: 28px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px; margin: 0 0 8px;
        }
        .pref-subtitle { color: var(--text-subtle); font-size: 15px; margin: 0; line-height: 1.5; }

        /* Sections */
        .section {
          width: 100%; max-width: 680px;
          background: var(--bg-card); border-radius: 16px;
          padding: 24px; margin-bottom: 16px;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease, background 0.3s ease;
        }
        .section:hover { box-shadow: var(--shadow-md); }
        .section-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 6px;
        }
        .section-title {
          font-size: 16px; font-weight: 700; color: var(--text-heading);
          margin: 0; letter-spacing: -0.2px;
        }
        .section-desc {
          font-size: 13px; color: var(--text-subtle); margin: 0 0 18px;
          line-height: 1.5;
        }

        /* Topics Grid */
        .topics-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .topic-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          color: var(--text-body); font-family: inherit;
          font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
          user-select: none;
        }
        .topic-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .topic-chip.selected {
          background: var(--primary); border-color: var(--primary);
          color: var(--text-inverse);
          box-shadow: 0 2px 8px var(--primary-shadow);
        }
        .topic-chip.paused { opacity: 0.45; background: var(--bg-elevated); border-color: var(--border-default); color: var(--text-subtle); }
        .selected-count { font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 12px; }

        /* Frequency Grid */
        .freq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .freq-card {
          border: 1.5px solid var(--border-default); border-radius: 14px;
          padding: 18px 12px; cursor: pointer;
          transition: all 0.2s ease; text-align: center;
          background: var(--bg-card);
        }
        .freq-card:hover { border-color: var(--primary); background: var(--bg-accent); }
        .freq-card.selected {
          border-color: var(--primary);
          background: var(--bg-accent);
          box-shadow: 0 2px 12px var(--primary-shadow);
        }
        .freq-icon { font-size: 28px; margin-bottom: 8px; }
        .freq-label { font-size: 14px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px; }
        .freq-desc { font-size: 12px; color: var(--text-subtle); }

        /* Slider */
        .slider-row { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
        .slider {
          flex: 1; -webkit-appearance: none; height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--fill), var(--border-default) var(--fill), var(--border-default) 100%);
          outline: none; cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: var(--primary);
          box-shadow: 0 2px 8px var(--primary-shadow);
          cursor: pointer; transition: transform 0.15s;
        }
        .slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .slider-value {
          font-size: 24px; font-weight: 800; color: var(--primary);
          min-width: 44px; text-align: right; letter-spacing: -0.5px;
        }
        .slider-hint { font-size: 12px; color: var(--text-subtle); margin-top: 8px; }

        /* Pause List */
        .pause-list { display: flex; flex-direction: column; gap: 8px; }
        .pause-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; border-radius: 12px;
          background: var(--bg-elevated); border: 1.5px solid var(--border-divider);
          transition: border-color 0.2s;
        }
        .pause-row:hover { border-color: var(--border-default); }
        .pause-topic-name {
          font-size: 14px; font-weight: 500; color: var(--text-body);
          display: flex; align-items: center; gap: 6px;
        }
        .pause-toggle {
          padding: 5px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1.5px solid; transition: all 0.2s ease;
          font-family: inherit;
        }
        .pause-toggle.active { background: var(--bg-pause-active); border-color: var(--border-success); color: var(--text-success); }
        .pause-toggle.paused { background: var(--bg-pause-paused); border-color: var(--border-warning); color: var(--text-warning); }

        /* Reset */
        .reset-btn {
          padding: 7px 14px; border-radius: 10px;
          background: var(--bg-card); font-family: inherit;
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s ease;
          white-space: nowrap; border: 1.5px solid var(--border-default);
        }
        .reset-btn:hover { border-color: var(--text-error); color: var(--text-error); background: var(--bg-error); }
        .reset-btn.done { border-color: var(--border-success); color: var(--text-success); background: var(--bg-success); }
        .reset-confirm-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .reset-confirm-label { font-size: 13px; color: var(--text-muted); }
        .reset-confirm-btns { display: flex; gap: 8px; }

        /* Toggle switch */
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0;
        }
        .toggle-row + .toggle-row { border-top: 1px solid var(--border-divider); }
        .toggle-label { font-size: 14px; font-weight: 600; color: var(--text-body); }
        .toggle-desc { font-size: 12px; color: var(--text-subtle); margin-top: 2px; }
        .toggle-switch {
          position: relative; width: 44px; height: 24px; flex-shrink: 0;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-track {
          position: absolute; inset: 0; border-radius: 999px;
          background: var(--bg-toggle); cursor: pointer;
          transition: background 0.2s ease;
        }
        .toggle-track::after {
          content: ""; position: absolute;
          width: 18px; height: 18px; border-radius: 50%;
          background: white; top: 3px; left: 3px;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input:checked + .toggle-track { background: var(--primary); }
        input:checked + .toggle-track::after { transform: translateX(20px); }

        /* Source block chips */
        .source-block-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .source-block-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13.5px; font-weight: 500;
          color: var(--text-body); cursor: pointer;
          transition: all 0.2s ease; user-select: none;
        }
        .source-block-chip:hover { border-color: var(--text-error); color: var(--text-error); background: var(--bg-error); }
        .source-block-chip.blocked {
          background: var(--bg-error); border-color: var(--text-error);
          color: var(--text-error); text-decoration: line-through; opacity: 0.8;
        }
        .source-block-chip.blocked:hover { opacity: 1; border-color: var(--border-default); background: var(--bg-card); color: var(--text-body); text-decoration: none; }
        .source-block-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* RSS sources */
        .rss-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .rss-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; background: var(--bg-elevated); border: 1.5px solid var(--border-divider); }
        .rss-item-info { flex: 1; min-width: 0; }
        .rss-item-name { font-size: 13px; font-weight: 600; color: var(--text-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rss-item-url { font-size: 11px; color: var(--text-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rss-remove-btn { flex-shrink: 0; padding: 4px 10px; border-radius: 8px; border: 1.5px solid #fca5a5; color: #dc2626; background: transparent; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .rss-remove-btn:hover { background: #fee2e2; }
        .rss-remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rss-form { display: flex; flex-direction: column; gap: 8px; }
        .rss-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-default); border-radius: 10px; font-family: inherit; font-size: 13px; color: var(--text-heading); background: var(--bg-input); outline: none; transition: border-color 0.2s; }
        .rss-input::placeholder { color: var(--text-subtle); }
        .rss-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .rss-select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-default); border-radius: 10px; font-family: inherit; font-size: 13px; color: var(--text-heading); background: var(--bg-input); outline: none; transition: border-color 0.2s; cursor: pointer; }
        .rss-select:focus { border-color: var(--primary); }
        .rss-add-btn { align-self: flex-start; padding: 9px 18px; border: none; border-radius: 10px; background: var(--primary); color: white; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .rss-add-btn:hover { background: var(--btn-dark-hover); }
        .rss-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rss-error { font-size: 12px; color: var(--text-error); background: var(--bg-error); padding: 8px 12px; border-radius: 8px; }

        /* Error & Submit */
        .error-msg {
          color: var(--text-error); font-size: 13px; text-align: center;
          margin-bottom: 12px; font-weight: 500;
          background: var(--bg-error); padding: 10px 16px; border-radius: 10px;
          max-width: 680px; width: 100%;
        }
        .submit-btn {
          width: 100%; max-width: 680px;
          padding: 16px; border: none; border-radius: 14px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          margin-top: 4px; letter-spacing: -0.2px;
        }
        .submit-btn:hover { background: var(--btn-dark-hover); transform: translateY(-1px); box-shadow: 0 4px 16px var(--primary-shadow); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        @media (max-width: 640px) {
          .pref-page { padding: 32px 16px 60px; }
          .pref-title { font-size: 22px; }
          .freq-grid { grid-template-columns: 1fr; }
          .section { padding: 20px; }
        }
      `}</style>

      <div className="pref-page">
        <div className="pref-theme-toggle">
          <ThemeToggle />
        </div>

        <div className="pref-header">
          {mode === "onboarding" && (
            <div className="pref-brand">
              <div className="pref-brand-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
              <span className="pref-brand-name">Distilled</span>
            </div>
          )}
          <h1 className="pref-title">
            {mode === "onboarding" ? "Set up your feed" : "Your Preferences"}
          </h1>
          <p className="pref-subtitle">
            {mode === "onboarding"
              ? "Choose your interests and how you'd like to receive content."
              : "Update your topics, post count, and delivery frequency."}
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Your Interests</h2>
          <p className="section-desc">
            Select all topics you want in your feed. You can change these anytime.
          </p>
          {selectedTopics.size > 0 && (
            <p className="selected-count">
              {selectedTopics.size} topic{selectedTopics.size !== 1 ? "s" : ""} selected
            </p>
          )}
          <div className="topics-grid">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={`topic-chip ${selectedTopics.has(topic.id) ? "selected" : ""} ${pausedTopics.has(topic.id) ? "paused" : ""}`}
                onClick={() => toggleTopic(topic.id)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {mode === "preferences" && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Pause Topics</h2>
                <p className="section-desc" style={{ marginBottom: 16 }}>
                  Temporarily hide a topic from your feed without removing it.
                </p>
              </div>
            </div>
            <div className="pause-list">
              {topics
                .filter((t) => selectedTopics.has(t.id))
                .map((topic) => (
                  <div key={topic.id} className="pause-row">
                    <span className="pause-topic-name">
                      {topic.name}
                    </span>
                    <button
                      className={`pause-toggle ${pausedTopics.has(topic.id) ? "paused" : "active"}`}
                      onClick={() => handlePauseToggle(topic.id)}
                    >
                      {pausedTopics.has(topic.id) ? "Paused" : "Active"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2 className="section-title">Curation Frequency</h2>
          <p className="section-desc">How often do you want your feed refreshed?</p>
          <div className="freq-grid">
            {FREQUENCY_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className={`freq-card ${frequency === opt.value ? "selected" : ""}`}
                onClick={() => handleFrequencyChange(opt.value)}
              >
                <div className="freq-label">{opt.label}</div>
                <div className="freq-desc">{opt.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Posts Per Session</h2>
          <p className="section-desc">
            How many posts do you want per session?
            {frequency === "MONTHLY" ? " Up to 100 for monthly." : frequency === "WEEKLY" ? " Up to 60 for weekly." : " Up to 30 for daily."}
          </p>
          <div className="slider-row">
            <input
              type="range"
              className="slider"
              min={10}
              max={maxPosts}
              value={postCount}
              onChange={(e) => setPostCount(Number(e.target.value))}
              style={{ "--fill": `${((postCount - 10) / (maxPosts - 10)) * 100}%` } as React.CSSProperties}
            />
            <span className="slider-value">{postCount}</span>
          </div>
          <p className="slider-hint">10 minimum · {maxPosts} maximum for {frequency.toLowerCase()} feeds</p>
        </div>

        {mode === "preferences" && (
          <div className="section">
            <h2 className="section-title">Feed Options</h2>
            <p className="section-desc">Customize what appears in your feed.</p>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Show trending posts</div>
                <div className="toggle-desc">Includes 2 trending articles from across all topics, not just yours.</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showTrending}
                  onChange={(e) => setShowTrending(e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>
          </div>
        )}

        {mode === "preferences" && (
          <div className="section">
            <h2 className="section-title">Custom RSS Feeds</h2>
            <p className="section-desc">
              Add your own RSS/Atom feeds. Articles will be fetched and included in your feed.
              Maximum 20 sources.
            </p>
            {rssSources.length > 0 && (
              <div className="rss-list">
                {rssSources.map((s) => (
                  <div key={s.id} className="rss-item">
                    <div className="rss-item-info">
                      <div className="rss-item-name">{s.name || "Unnamed feed"}</div>
                      <div className="rss-item-url">{s.url}</div>
                    </div>
                    <button
                      className="rss-remove-btn"
                      disabled={removingRssId === s.id}
                      onClick={() => handleRemoveRss(s.id)}
                    >
                      {removingRssId === s.id ? "..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {rssSources.length < 20 && (
              <form className="rss-form" onSubmit={handleAddRss}>
                <input
                  className="rss-input"
                  type="url"
                  placeholder="Feed URL (https://example.com/feed.xml)"
                  value={rssUrl}
                  onChange={(e) => setRssUrl(e.target.value)}
                  required
                />
                <input
                  className="rss-input"
                  type="text"
                  placeholder="Display name (optional)"
                  value={rssName}
                  onChange={(e) => setRssName(e.target.value)}
                  maxLength={80}
                />
                <select
                  className="rss-select"
                  value={rssTopicId}
                  onChange={(e) => setRssTopicId(e.target.value)}
                >
                  <option value="">No topic (unclassified)</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {rssError && <div className="rss-error">{rssError}</div>}
                <button type="submit" className="rss-add-btn" disabled={rssAdding}>
                  {rssAdding ? "Adding..." : "+ Add Feed"}
                </button>
              </form>
            )}
          </div>
        )}

        {mode === "preferences" && (
          <div className="section">
            <h2 className="section-title">Blocked Sources</h2>
            <p className="section-desc">
              Hide all articles from a source. Blocked sources are greyed out and excluded from your feed.
              Click a source to block it, click again to unblock.
            </p>
            <div className="source-block-grid">
              {SOURCE_OPTIONS.map((opt) => {
                const isBlocked = blockedSources.has(opt.value);
                const dotColors: Record<string, string> = {
                  hackernews: "#FF6600", reddit: "#FF4500", devto: "#3B49DF", rss: "#FFA500",
                };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`source-block-chip ${isBlocked ? "blocked" : ""}`}
                    onClick={() => handleToggleBlockedSource(opt.value)}
                  >
                    <span className="source-block-dot" style={{ background: dotColors[opt.value] }} />
                    {opt.label}
                    {isBlocked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2 }}>
                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "preferences" && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Reset Feed Weights</h2>
                <p className="section-desc" style={{ marginBottom: 0 }}>
                  Reset the algorithm's topic weights back to default. Your feed will start fresh.
                </p>
              </div>
              {!resetConfirming && (
                <button
                  className={`reset-btn ${resetDone ? "done" : ""}`}
                  onClick={() => setResetConfirming(true)}
                  disabled={resetting}
                >
                  {resetting ? "Resetting..." : resetDone ? "Done!" : "Reset Weights"}
                </button>
              )}
            </div>
            {resetConfirming && (
              <div className="reset-confirm-row">
                <span className="reset-confirm-label">Are you sure? This cannot be undone.</span>
                <div className="reset-confirm-btns">
                  <button
                    className="reset-btn"
                    style={{ borderColor: "var(--text-error)", color: "var(--text-error)" }}
                    onClick={() => { setResetConfirming(false); handleResetWeights(); }}
                    disabled={resetting}
                  >
                    Yes, reset
                  </button>
                  <button
                    className="reset-btn"
                    onClick={() => setResetConfirming(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : mode === "onboarding" ? "Take me to my feed →" : "Save Preferences"}
        </button>
      </div>
    </>
  );
}
