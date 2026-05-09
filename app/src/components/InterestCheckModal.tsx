"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Topic = {
  id: string;
  name: string;
  emoji: string | null;
  slug: string;
};

const POST_COUNT_OPTIONS = [10, 15, 20, 25, 30];

export default function InterestCheckModal({ onSaved }: { onSaved?: () => void } = {}) {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [postCount, setPostCount] = useState(20);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [showTrending, setShowTrending] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    const sessionKey = `interest_prompt_skipped_${session.user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    Promise.all([
      fetch("/api/preferences").then((r) => r.json()),
      fetch("/api/auth/topics").then((r) => r.json()),
    ]).then(([prefData, topicData]) => {
      if (prefData.preferences?.hideInterestPrompt) return;

      setAllTopics(topicData.topics ?? []);
      setSelectedIds(new Set((prefData.topics ?? []).map((t: Topic) => t.id)));
      setPostCount(prefData.preferences?.postCount ?? 20);
      setFrequency(prefData.preferences?.frequency ?? "DAILY");
      setShowTrending(prefData.preferences?.showTrending ?? true);
      setVisible(true);
    });
  }, [session?.user?.id]);

  function toggleTopic(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // keep at least one
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function save(hideForever: boolean) {
    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicIds: Array.from(selectedIds),
          postCount,
          frequency,
          showTrending,
          ...(hideForever && { hideInterestPrompt: true }),
        }),
      });
    } catch {}
    setSaving(false);
  }

  async function handleLooksGood() {
    await save(false);
    if (session?.user?.id) {
      sessionStorage.setItem(`interest_prompt_skipped_${session.user.id}`, "1");
    }
    setVisible(false);
    onSaved?.();
  }

  async function handleDontAskAgain() {
    await save(true);
    setVisible(false);
    onSaved?.();
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, animation: "icm-fade 0.2s ease",
      }}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) handleLooksGood(); }}
      onKeyDown={(e) => { if (e.key === "Escape") handleLooksGood(); }}
    >
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 16,
        padding: "32px 28px",
        maxWidth: 520, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "var(--shadow-lg)",
        animation: "icm-slide 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
            <img src="/android-chrome-192x192.png" alt="Distilled" style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.3px" }}>
              Quick check-in
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Update your interests and feed settings
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-divider)", margin: "20px 0" }} />

        {/* Topics */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
            Your interests
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allTopics.map((topic) => {
              const active = selectedIds.has(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 13px", borderRadius: 8, cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    border: active ? "1.5px solid var(--primary)" : "1.5px solid var(--border-default)",
                    background: active ? "var(--primary-light)" : "var(--bg-elevated)",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {topic.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post count */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
            Articles per feed
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {POST_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setPostCount(n)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  border: postCount === n ? "1.5px solid var(--primary)" : "1.5px solid var(--border-default)",
                  background: postCount === n ? "var(--primary-light)" : "var(--bg-elevated)",
                  color: postCount === n ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "all 0.15s ease",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Trending toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0", borderTop: "1px solid var(--border-divider)", marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-body)" }}>Show trending posts</div>
            <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2 }}>2 trending articles from outside your topics</div>
          </div>
          <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={showTrending}
              onChange={(e) => setShowTrending(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
            />
            <span style={{
              position: "absolute", inset: 0, borderRadius: 999,
              background: showTrending ? "var(--primary)" : "var(--bg-toggle)",
              cursor: "pointer", transition: "background 0.2s ease",
            }}>
              <span style={{
                position: "absolute",
                width: 18, height: 18, borderRadius: "50%",
                background: "white", top: 3,
                left: showTrending ? 23 : 3,
                transition: "left 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleLooksGood}
            disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: "var(--btn-dark)", color: "var(--text-inverse)",
              fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1, letterSpacing: "-0.2px",
            }}
          >
            {saving ? "Saving..." : "Looks good"}
          </button>
          <button
            onClick={handleDontAskAgain}
            disabled={saving}
            style={{
              padding: "12px 16px", borderRadius: 10,
              border: "1px solid var(--border-default)",
              background: "transparent", color: "var(--text-muted)",
              fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1, whiteSpace: "nowrap",
            }}
          >
            Don&apos;t ask again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes icm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes icm-slide { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
