"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Topic = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
};

type Props = {
  topics: Topic[];
  initialTopicIds?: string[];
  initialPostCount?: number;
  initialFrequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  mode: "onboarding" | "preferences";
  userId: string;
};

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily", description: "Fresh picks every day", icon: "☀️" },
  { value: "WEEKLY", label: "Weekly", description: "Best of the week", icon: "📅" },
  { value: "MONTHLY", label: "Monthly", description: "Deep monthly digest", icon: "🗓️" },
] as const;

export default function PreferencesForm({
  topics,
  initialTopicIds = [],
  initialPostCount = 20,
  initialFrequency = "DAILY",
  mode,
  userId,
}: Props) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(initialTopicIds));
  const [pausedTopics, setPausedTopics] = useState<Set<string>>(new Set());
  const [postCount, setPostCount] = useState(initialPostCount);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">(initialFrequency);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState("");

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
      togglePause(topicId); // revert on error
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2f8; font-family: 'DM Sans', sans-serif; }
        .pref-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 48px 24px 80px; background: #f0f2f8; }
        .pref-header { text-align: center; margin-bottom: 40px; }
        .logo { font-family: 'Sora', sans-serif; font-size: 36px; font-weight: 800; color: #0f1132; margin: 0 0 8px; }
        .pref-title { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700; color: #0f1132; margin: 0 0 8px; }
        .pref-subtitle { color: #6b7280; font-size: 15px; margin: 0; }
        .section { width: 100%; max-width: 680px; background: #fff; border-radius: 20px; padding: 28px; margin-bottom: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .section-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: #0f1132; margin: 0; }
        .section-desc { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }
        .topics-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .topic-chip { display: flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 999px; border: 1.5px solid #e5e7eb; background: #fafafa; color: #374151; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; user-select: none; }
        .topic-chip:hover { border-color: #4f52d3; color: #4f52d3; background: #f0f0fc; }
        .topic-chip.selected { background: linear-gradient(135deg, #4f52d3, #3b82f6); border-color: transparent; color: #fff; box-shadow: 0 2px 10px rgba(79,82,211,0.3); }
        .topic-chip.paused { opacity: 0.5; background: #f3f4f6; border-color: #e5e7eb; color: #9ca3af; }
        .freq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .freq-card { border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.15s ease; text-align: center; background: #fafafa; }
        .freq-card:hover { border-color: #4f52d3; background: #f0f0fc; }
        .freq-card.selected { border-color: #4f52d3; background: linear-gradient(135deg, #f0f0fc, #e8f0fe); box-shadow: 0 2px 12px rgba(79,82,211,0.15); }
        .freq-icon { font-size: 24px; margin-bottom: 6px; }
        .freq-label { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0f1132; margin-bottom: 4px; }
        .freq-desc { font-size: 12px; color: #9ca3af; }
        .slider-row { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
        .slider { flex: 1; -webkit-appearance: none; height: 6px; border-radius: 3px; background: linear-gradient(to right, #4f52d3 0%, #4f52d3 var(--fill), #e5e7eb var(--fill), #e5e7eb 100%); outline: none; cursor: pointer; }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #4f52d3; box-shadow: 0 2px 8px rgba(79,82,211,0.4); cursor: pointer; }
        .slider-value { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #4f52d3; min-width: 44px; text-align: right; }
        .slider-hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }
        .error-msg { color: #ef4444; font-size: 13px; text-align: center; margin-bottom: 12px; }
        .submit-btn { width: 100%; max-width: 680px; padding: 16px; border: none; border-radius: 14px; background: linear-gradient(135deg, #4f52d3 0%, #06b6d4 100%); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; margin-top: 4px; }
        .submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .selected-count { font-size: 13px; color: #4f52d3; font-weight: 600; margin-bottom: 12px; }
        .reset-btn { padding: 7px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font-size: 12px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .reset-btn:hover { border-color: #ef4444; color: #ef4444; }
        .reset-btn.done { border-color: #10b981; color: #10b981; }
        .pause-list { display: flex; flex-direction: column; gap: 10px; }
        .pause-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 12px; background: #fafafa; border: 1.5px solid #e5e7eb; }
        .pause-topic-name { font-size: 14px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 6px; }
        .pause-toggle { padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid; transition: all 0.15s; }
        .pause-toggle.active { background: #ededf8; border-color: #4f52d3; color: #4f52d3; }
        .pause-toggle.paused { background: #fef3c7; border-color: #d97706; color: #d97706; }
      `}</style>

      <div className="pref-page">
        <div className="pref-header">
          {mode === "onboarding" && <p className="logo">Distilled</p>}
          <h1 className="pref-title">{mode === "onboarding" ? "Set up your feed" : "Your Preferences"}</h1>
          <p className="pref-subtitle">
            {mode === "onboarding"
              ? "Choose your interests and how you'd like to receive content."
              : "Update your topics, post count, and delivery frequency."}
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Your Interests</h2>
          <p className="section-desc">Select all topics you want in your feed. You can change these anytime.</p>
          {selectedTopics.size > 0 && (
            <p className="selected-count">{selectedTopics.size} topic{selectedTopics.size !== 1 ? "s" : ""} selected</p>
          )}
          <div className="topics-grid">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={`topic-chip ${selectedTopics.has(topic.id) ? "selected" : ""} ${pausedTopics.has(topic.id) ? "paused" : ""}`}
                onClick={() => toggleTopic(topic.id)}
              >
                {topic.emoji && <span>{topic.emoji}</span>}
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
                      {topic.emoji} {topic.name}
                    </span>
                    <button
                      className={`pause-toggle ${pausedTopics.has(topic.id) ? "paused" : "active"}`}
                      onClick={() => handlePauseToggle(topic.id)}
                    >
                      {pausedTopics.has(topic.id) ? "⏸ Paused" : "▶ Active"}
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
                <div className="freq-icon">{opt.icon}</div>
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
            <div className="section-header">
              <div>
                <h2 className="section-title">Reset Feed Weights</h2>
                <p className="section-desc" style={{ marginBottom: 0 }}>
                  Reset the algorithm's topic weights back to default. Your feed will start fresh.
                </p>
              </div>
              <button
                className={`reset-btn ${resetDone ? "done" : ""}`}
                onClick={handleResetWeights}
                disabled={resetting}
              >
                {resetting ? "Resetting…" : resetDone ? "✓ Reset!" : "🔄 Reset Weights"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : mode === "onboarding" ? "Take me to my feed →" : "Save Preferences"}
        </button>
      </div>
    </>
  );
}