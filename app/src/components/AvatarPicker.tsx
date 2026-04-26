"use client";

import { useState } from "react";
import { AVATAR_SEEDS, avatarUrl } from "@/lib/avatars";

type Props = {
  currentSeed: string | null;
  onSave: (seed: string) => Promise<void>;
  onCancel?: () => void;
  /** "modal" wraps in overlay. "inline" renders bare (for signup step). */
  mode?: "modal" | "inline";
  saveLabel?: string;
  cancelLabel?: string;
};

export default function AvatarPicker({
  currentSeed,
  onSave,
  onCancel,
  mode = "modal",
  saveLabel = "Save avatar",
  cancelLabel = "Cancel",
}: Props) {
  const [selected, setSelected] = useState<string>(currentSeed ?? AVATAR_SEEDS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
  }

  const inner = (
    <div style={{
      background: "var(--bg-card)",
      border: mode === "modal" ? "1px solid var(--border-default)" : "none",
      borderRadius: mode === "modal" ? 16 : 0,
      padding: mode === "modal" ? "28px 24px" : 0,
      maxWidth: 480, width: "100%",
      boxShadow: mode === "modal" ? "var(--shadow-lg)" : "none",
      animation: mode === "modal" ? "ap-slide 0.22s ease" : "none",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.3px", marginBottom: 4 }}>
          Choose your avatar
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Pick one that feels like you. You can change it anytime from your profile.
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 10,
        marginBottom: 24,
      }}>
        {AVATAR_SEEDS.map((seed) => {
          const isSelected = selected === seed;
          return (
            <button
              key={seed}
              onClick={() => setSelected(seed)}
              title={seed}
              style={{
                padding: 0,
                border: isSelected ? "2.5px solid var(--primary)" : "2px solid transparent",
                borderRadius: 12,
                background: isSelected ? "var(--primary-light)" : "var(--bg-elevated)",
                cursor: "pointer",
                overflow: "hidden",
                aspectRatio: "1",
                transition: "border-color 0.15s ease, background 0.15s ease, transform 0.1s ease",
                transform: isSelected ? "scale(1.08)" : "scale(1)",
                boxShadow: isSelected ? "0 0 0 3px var(--primary-shadow)" : "none",
              }}
            >
              <img
                src={avatarUrl(seed)}
                alt={seed}
                width={56}
                height={56}
                style={{ display: "block", width: "100%", height: "100%" }}
              />
            </button>
          );
        })}
      </div>

      {/* Preview + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, overflow: "hidden",
          border: "2px solid var(--primary)", flexShrink: 0,
        }}>
          <img src={avatarUrl(selected)} alt="preview" width={52} height={52} style={{ display: "block", width: "100%", height: "100%" }} />
        </div>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: "var(--btn-dark)", color: "var(--text-inverse)",
              fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1, letterSpacing: "-0.2px",
            }}
          >
            {saving ? "Saving..." : saveLabel}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              style={{
                padding: "11px 16px", borderRadius: 10,
                border: "1px solid var(--border-default)",
                background: "transparent", color: "var(--text-muted)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ap-slide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 400px) {
          .ap-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );

  if (mode === "inline") return inner;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "ap-fade 0.2s ease",
      }}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget && onCancel) onCancel(); }}
      onKeyDown={(e) => { if (e.key === "Escape" && onCancel) onCancel(); }}
    >
      {inner}
      <style>{`
        @keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
