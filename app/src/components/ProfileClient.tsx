"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import NavBar from "./NavBar";
import AvatarPicker from "./AvatarPicker";
import { avatarUrl } from "@/lib/avatars";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";

const TOPIC_COLORS = [
  "#f97316","#0ea5e9","#10b981","#f59e0b",
  "#3b82f6","#ef4444","#14b8a6","#84cc16",
];

type ProfileData = {
  user: { name: string | null; email: string; createdAt: string; avatarSeed: string | null };
  stats: { likes: number; saves: number; clicks: number };
  topicWeights: { name: string; emoji: string; weight: number; status: string }[];
  weeklyActivity: Record<string, string | number>[];
  weeklyTopicNames: string[];
  usage: {
    totalSeconds: number; todaySeconds: number; avgSeconds: number;
    chart: { date: string; minutes: number }[];
    currentStreak: number; longestStreak: number;
  };
};

type Topic = { id: string; slug: string; name: string; emoji: string | null };

type PrefData = {
  topics: Topic[];
  selectedIds: Set<string>;
  pausedIds: Set<string>;
  postCount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  showTrending: boolean;
  blockedSources: Set<string>;
};

type ChangePwForm = { currentPassword: string; newPassword: string; confirmPassword: string };

type Tab = "overview" | "preferences" | "security";

const FREQ_OPTIONS = [
  { value: "DAILY" as const, label: "Daily", desc: "Fresh picks every day" },
  { value: "WEEKLY" as const, label: "Weekly", desc: "Best of the week" },
  { value: "MONTHLY" as const, label: "Monthly", desc: "Deep monthly digest" },
];

const SOURCE_OPTIONS = [
  { value: "hackernews", label: "Hacker News", color: "#FF6600" },
  { value: "reddit",     label: "Reddit",       color: "#FF4500" },
  { value: "devto",      label: "Dev.to",        color: "#3B49DF" },
  { value: "rss",        label: "RSS",           color: "#FFA500" },
  { value: "aljazeera",  label: "Al Jazeera",    color: "#007A5E" },
  { value: "atlas",      label: "Atlas",         color: "#6366F1" },
];

function formatTime(seconds: number): string {
  if (seconds < 60) return seconds > 0 ? `${seconds}s` : "0m";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

function memberSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""}`;
}

export default function ProfileClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Profile data
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Avatar
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // Preferences
  const [pref, setPref] = useState<PrefData | null>(null);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefError, setPrefError] = useState("");
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [resetConfirming, setResetConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  type RssSource = { id: string; name: string; url: string };
  const [rssSources, setRssSources] = useState<RssSource[]>([]);
  const [rssUrl, setRssUrl] = useState("");
  const [rssName, setRssName] = useState("");
  const [rssAdding, setRssAdding] = useState(false);
  const [rssError, setRssError] = useState("");
  const [removingRssId, setRemovingRssId] = useState<string | null>(null);

  // Security
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState<ChangePwForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const pwRules = [
    { label: "At least 8 characters", met: pwForm.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwForm.newPassword) },
  ];

  // Fetch profile data
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Push notification check
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      fetch("/api/user/push-subscription")
        .then((r) => r.json())
        .then((d) => setPushSubscribed(d.subscribed ?? false))
        .catch(() => {});
    }
  }, []);

  // Fetch preferences when tab is selected
  useEffect(() => {
    if (activeTab !== "preferences" || pref) return;
    setPrefLoading(true);
    Promise.all([
      fetch("/api/topics").then((r) => r.json()),
      fetch("/api/preferences").then((r) => r.json()),
      fetch("/api/user/rss-sources").then((r) => r.json()),
      fetch("/api/user/blocked-sources").then((r) => r.json()).catch(() => ({ sources: [] })),
    ])
      .then(([topicsData, prefData, rssData, blockedData]) => {
        const allTopics: Topic[] = topicsData.topics ?? [];
        const selectedIds = new Set<string>((prefData.topics ?? []).map((t: { id: string }) => t.id));
        const pausedIds = new Set<string>(
          (prefData.topics ?? []).filter((t: { status: string }) => t.status === "PAUSED").map((t: { id: string }) => t.id)
        );
        setPref({
          topics: allTopics,
          selectedIds,
          pausedIds,
          postCount: prefData.preferences?.postCount ?? 20,
          frequency: prefData.preferences?.frequency ?? "DAILY",
          showTrending: prefData.preferences?.showTrending ?? true,
          blockedSources: new Set<string>((blockedData.sources ?? []).map((b: { source: string }) => b.source)),
        });
        setRssSources(rssData.sources ?? []);
        setPrefLoading(false);
      })
      .catch(() => setPrefLoading(false));
  }, [activeTab, pref]);

  // Handlers
  async function handleSaveName() {
    setNameError("");
    if (!nameValue.trim()) { setNameError("Name cannot be empty."); return; }
    setNameSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
      const d = await res.json();
      if (!res.ok) { setNameError(d.error ?? "Failed to update name."); }
      else { setData((prev) => prev ? { ...prev, user: { ...prev.user, name: d.name } } : prev); setEditingName(false); }
    } catch { setNameError("Network error."); }
    finally { setNameSaving(false); }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault(); setPwError(""); setPwSuccess("");
    if (pwRules.some((r) => !r.met)) { setPwError("Please meet all password requirements."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const d = await res.json();
      if (!res.ok) setPwError(d.error);
      else { setPwSuccess("Password changed successfully!"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    } catch { setPwError("Network error."); }
    finally { setPwLoading(false); }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault(); setReportError(""); setReportSuccess(false);
    if (reportMsg.trim().length < 10) { setReportError("Please describe the issue (at least 10 characters)."); return; }
    setReportLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reportMsg }),
      });
      const d = await res.json();
      if (!res.ok) setReportError(d.error ?? "Something went wrong.");
      else { setReportSuccess(true); setReportMsg(""); }
    } catch { setReportError("Network error."); }
    finally { setReportLoading(false); }
  }

  async function handlePushToggle() {
    setPushLoading(true); setPushError("");
    try {
      if (pushSubscribed) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        await fetch("/api/user/push-subscription", { method: "DELETE" });
        setPushSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") { setPushError("Permission denied. Enable notifications in browser settings."); return; }
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) { setPushError("Push notifications are not configured yet."); return; }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
        const json = sub.toJSON();
        await fetch("/api/user/push-subscription", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
        });
        setPushSubscribed(true);
      }
    } catch (e: unknown) {
      setPushError((e as Error)?.message ?? "Something went wrong.");
    } finally { setPushLoading(false); }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") { setDeleteError('Type "DELETE" to confirm.'); return; }
    setDeleting(true); setDeleteError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword || undefined }),
      });
      const d = await res.json();
      if (!res.ok) setDeleteError(d.error ?? "Failed to delete account.");
      else window.location.href = "/auth?deleted=1";
    } catch { setDeleteError("Network error."); }
    finally { setDeleting(false); }
  }

  async function handleSavePrefs() {
    if (!pref) return;
    if (pref.selectedIds.size === 0) { setPrefError("Select at least one topic."); return; }
    setPrefSaving(true); setPrefError(""); setPrefSuccess(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicIds: Array.from(pref.selectedIds),
          postCount: pref.postCount,
          frequency: pref.frequency,
          showTrending: pref.showTrending,
          userId: session?.user?.id,
        }),
      });
      if (!res.ok) { const d = await res.json(); setPrefError(d.error ?? "Failed to save."); }
      else { setPrefSuccess(true); setTimeout(() => setPrefSuccess(false), 3000); }
    } catch { setPrefError("Network error."); }
    finally { setPrefSaving(false); }
  }

  async function handlePauseToggle(topicId: string) {
    if (!pref) return;
    const isPaused = pref.pausedIds.has(topicId);
    setPref((p) => {
      if (!p) return p;
      const next = new Set(p.pausedIds);
      if (isPaused) next.delete(topicId); else next.add(topicId);
      return { ...p, pausedIds: next };
    });
    try {
      await fetch("/api/preferences/pause", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, paused: !isPaused }),
      });
    } catch {
      setPref((p) => {
        if (!p) return p;
        const next = new Set(p.pausedIds);
        if (isPaused) next.add(topicId); else next.delete(topicId);
        return { ...p, pausedIds: next };
      });
    }
  }

  async function handleBlockedSourceToggle(source: string) {
    if (!pref) return;
    const isBlocked = pref.blockedSources.has(source);
    setPref((p) => {
      if (!p) return p;
      const next = new Set(p.blockedSources);
      if (isBlocked) next.delete(source); else next.add(source);
      return { ...p, blockedSources: next };
    });
    try {
      await fetch("/api/user/blocked-sources", {
        method: isBlocked ? "DELETE" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
    } catch {
      setPref((p) => {
        if (!p) return p;
        const next = new Set(p.blockedSources);
        if (isBlocked) next.add(source); else next.delete(source);
        return { ...p, blockedSources: next };
      });
    }
  }

  async function handleAddRss(e: React.FormEvent) {
    e.preventDefault(); setRssError("");
    if (!rssUrl.trim()) { setRssError("Enter a feed URL."); return; }
    setRssAdding(true);
    try {
      const res = await fetch("/api/user/rss-sources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl.trim(), name: rssName.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) setRssError(d.error ?? "Failed to add source.");
      else { setRssSources((prev) => [...prev, d.source]); setRssUrl(""); setRssName(""); }
    } catch { setRssError("Network error."); }
    finally { setRssAdding(false); }
  }

  async function handleRemoveRss(id: string) {
    setRemovingRssId(id);
    try {
      await fetch(`/api/user/rss-sources?id=${id}`, { method: "DELETE" });
      setRssSources((prev) => prev.filter((s) => s.id !== id));
    } finally { setRemovingRssId(null); }
  }

  async function handleResetWeights() {
    setResetting(true);
    try {
      await fetch("/api/preferences/reset", { method: "POST" });
      setResetDone(true); setTimeout(() => setResetDone(false), 3000);
    } catch { setPrefError("Failed to reset weights."); }
    finally { setResetting(false); setResetConfirming(false); }
  }

  const maxPosts = pref?.frequency === "MONTHLY" ? 100 : pref?.frequency === "WEEKLY" ? 60 : 30;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }

        .prof-container { max-width: 1280px; margin: 0 auto; padding: 28px 32px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* ===== TABS ===== */
        .prof-tabbar {
          background: var(--bg-card); border-radius: 16px;
          border: 1px solid var(--border-default);
          padding: 6px; display: flex; gap: 4px;
          box-shadow: var(--shadow-sm);
        }
        .prof-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px; border-radius: 11px;
          border: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .prof-tab:hover { background: var(--bg-elevated); color: var(--text-heading); }
        .prof-tab.active {
          background: var(--gradient-brand); color: white; font-weight: 600;
          box-shadow: 0 2px 10px var(--primary-shadow);
        }
        @media (max-width: 480px) {
          .prof-tab { padding: 9px 10px; font-size: 12px; gap: 5px; }
          .prof-tab-label { display: none; }
        }

        /* ===== HERO ===== */
        .prof-hero {
          background: var(--bg-card); border-radius: 16px;
          border: 1px solid var(--border-default);
          padding: 24px; box-shadow: var(--shadow-sm);
          display: flex; align-items: center; gap: 20px;
        }
        .prof-avatar {
          width: 72px; height: 72px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #f97316, #ea580c);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: white; letter-spacing: -1px;
          cursor: pointer; overflow: hidden; position: relative;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .prof-avatar:hover { box-shadow: 0 0 0 3px var(--primary-light), 0 0 0 5px var(--primary); transform: scale(1.04); }
        .prof-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .prof-avatar-overlay {
          position: absolute; inset: 0; border-radius: 14px;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.15s;
          color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
        }
        .prof-avatar:hover .prof-avatar-overlay { opacity: 1; }
        .prof-info { flex: 1; min-width: 0; }
        .prof-name { font-size: 20px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.4px; margin-bottom: 3px; }
        .prof-email { font-size: 13px; color: var(--text-subtle); margin-bottom: 10px; }
        .prof-since {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 999px;
          background: var(--bg-accent); color: var(--primary);
          font-size: 12px; font-weight: 600;
        }
        .prof-name-row { display: flex; align-items: center; gap: 7px; margin-bottom: 3px; }
        .prof-name-edit-btn {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--text-subtle); border-radius: 6px;
          display: flex; align-items: center; transition: color 0.15s;
        }
        .prof-name-edit-btn:hover { color: var(--primary); }
        .prof-name-input-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; flex-wrap: wrap; }
        .prof-name-input {
          padding: 7px 12px; border: 1.5px solid var(--primary); border-radius: 10px;
          font-family: inherit; font-size: 15px; font-weight: 700; color: var(--text-heading);
          background: var(--bg-input); outline: none; min-width: 0; flex: 1;
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        .prof-name-save {
          padding: 7px 14px; border: none; border-radius: 10px;
          background: var(--primary); color: white;
          font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .prof-name-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-name-cancel {
          padding: 7px 14px; border: 1.5px solid var(--border-default); border-radius: 10px;
          background: transparent; color: var(--text-muted);
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
        }
        .prof-name-err { font-size: 12px; color: var(--text-error); margin-top: 2px; }

        /* ===== STAT CARDS ===== */
        .prof-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .prof-stat {
          background: var(--bg-card); border-radius: 14px;
          border: 1px solid var(--border-default);
          padding: 18px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .prof-stat-value { font-size: 30px; font-weight: 800; color: var(--primary); letter-spacing: -1px; }
        .prof-stat-label { font-size: 12px; color: var(--text-subtle); margin-top: 4px; font-weight: 500; }

        /* ===== CARD ===== */
        .prof-card {
          background: var(--bg-card); border-radius: 16px;
          border: 1px solid var(--border-default);
          padding: 22px; box-shadow: var(--shadow-sm);
        }
        .prof-card-title { font-size: 15px; font-weight: 700; color: var(--text-heading); margin-bottom: 3px; }
        .prof-card-desc { font-size: 13px; color: var(--text-subtle); margin-bottom: 18px; line-height: 1.5; }

        /* ===== READING HABITS ===== */
        .prof-habits-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
        .prof-habit-stat {
          background: var(--bg-elevated); border-radius: 10px;
          border: 1px solid var(--border-divider); padding: 14px; text-align: center;
        }
        .prof-habit-value { font-size: 22px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .prof-habit-label { font-size: 10px; color: var(--text-subtle); margin-top: 3px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .prof-streak-row {
          display: flex; background: var(--bg-elevated); border-radius: 12px;
          border: 1px solid var(--border-divider); margin-top: 14px; overflow: hidden;
        }
        .prof-streak-item { flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px 18px; }
        .prof-streak-icon { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg,#f97316,#ea580c); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .prof-streak-value { font-size: 17px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .prof-streak-label { font-size: 10px; color: var(--text-subtle); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }
        .prof-streak-divider { width: 1px; background: var(--border-divider); align-self: stretch; flex-shrink: 0; }

        /* ===== TOPICS CHART ===== */
        .topic-weight-list { display: flex; flex-direction: column; gap: 9px; }
        .topic-weight-row { display: flex; align-items: center; gap: 10px; }
        .topic-weight-label { font-size: 12px; font-weight: 600; color: var(--text-body); width: 130px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topic-weight-bar-bg { flex: 1; height: 7px; border-radius: 4px; background: var(--bg-elevated); overflow: hidden; }
        .topic-weight-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .topic-weight-val { font-size: 11px; color: var(--text-subtle); width: 28px; text-align: right; font-weight: 600; }

        /* ===== PREFERENCES TAB ===== */
        .pref-section { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-default); padding: 22px; box-shadow: var(--shadow-sm); }
        .pref-section-title { font-size: 15px; font-weight: 700; color: var(--text-heading); margin-bottom: 3px; }
        .pref-section-desc { font-size: 13px; color: var(--text-subtle); margin-bottom: 16px; line-height: 1.5; }
        .pref-section + .pref-section { margin-top: 16px; }

        .topics-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .topic-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          color: var(--text-body); font-family: inherit;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; user-select: none;
        }
        .topic-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .topic-chip.selected { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 2px 8px var(--primary-shadow); }
        .topic-chip.paused { opacity: 0.45; }
        .selected-count { font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 10px; }

        .freq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .freq-card {
          border: 1.5px solid var(--border-default); border-radius: 12px;
          padding: 16px 12px; cursor: pointer; transition: all 0.2s; text-align: center;
          background: var(--bg-card);
        }
        .freq-card:hover { border-color: var(--primary); background: var(--bg-accent); }
        .freq-card.selected { border-color: var(--primary); background: var(--bg-accent); box-shadow: 0 2px 10px var(--primary-shadow); }
        .freq-label { font-size: 14px; font-weight: 700; color: var(--text-heading); margin-bottom: 3px; }
        .freq-desc { font-size: 11px; color: var(--text-subtle); }

        .slider-row { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
        .slider {
          flex: 1; -webkit-appearance: none; height: 6px; border-radius: 3px;
          background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--fill), var(--border-default) var(--fill), var(--border-default) 100%);
          outline: none; cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: var(--primary);
          box-shadow: 0 2px 8px var(--primary-shadow); cursor: pointer;
        }
        .slider-value { font-size: 22px; font-weight: 800; color: var(--primary); min-width: 40px; text-align: right; }
        .slider-hint { font-size: 11px; color: var(--text-subtle); margin-top: 6px; }

        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
        .toggle-row + .toggle-row { border-top: 1px solid var(--border-divider); }
        .toggle-label { font-size: 14px; font-weight: 600; color: var(--text-body); }
        .toggle-desc { font-size: 12px; color: var(--text-subtle); margin-top: 1px; }
        .toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-track {
          position: absolute; inset: 0; border-radius: 999px;
          background: var(--border-default); cursor: pointer; transition: background 0.2s;
        }
        .toggle-track::after {
          content: ""; position: absolute; width: 18px; height: 18px; border-radius: 50%;
          background: white; top: 3px; left: 3px; transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input:checked + .toggle-track { background: var(--primary); }
        input:checked + .toggle-track::after { transform: translateX(20px); }

        .pause-list { display: flex; flex-direction: column; gap: 7px; }
        .pause-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; border-radius: 10px;
          background: var(--bg-elevated); border: 1px solid var(--border-divider);
        }
        .pause-topic-name { font-size: 13px; font-weight: 500; color: var(--text-body); }
        .pause-toggle {
          padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid; transition: all 0.2s; font-family: inherit;
        }
        .pause-toggle.active { background: var(--bg-success, #dcfce7); border-color: var(--border-success, #86efac); color: var(--text-success, #16a34a); }
        .pause-toggle.paused { background: rgba(245,158,11,0.1); border-color: #fcd34d; color: #d97706; }

        .source-block-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .source-block-chip {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--text-body); cursor: pointer; transition: all 0.2s;
        }
        .source-block-chip:hover { border-color: #fca5a5; color: #dc2626; background: #fee2e2; }
        .source-block-chip.blocked { background: #fee2e2; border-color: #fca5a5; color: #dc2626; opacity: 0.85; }
        [data-theme="dark"] .source-block-chip:hover { border-color: #f87171; color: #f87171; background: rgba(239,68,68,0.1); }
        [data-theme="dark"] .source-block-chip.blocked { background: rgba(239,68,68,0.1); border-color: #f87171; color: #f87171; }
        .source-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .rss-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .rss-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; background: var(--bg-elevated); border: 1px solid var(--border-divider); }
        .rss-item-name { font-size: 13px; font-weight: 600; color: var(--text-heading); }
        .rss-item-url { font-size: 11px; color: var(--text-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
        .rss-remove-btn { flex-shrink: 0; padding: 4px 10px; border-radius: 8px; border: 1.5px solid #fca5a5; color: #dc2626; background: transparent; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .rss-remove-btn:hover { background: #fee2e2; }
        .rss-remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rss-form { display: flex; flex-direction: column; gap: 8px; }
        .rss-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-default); border-radius: 10px; font-family: inherit; font-size: 13px; color: var(--text-heading); background: var(--bg-input); outline: none; transition: border-color 0.2s; }
        .rss-input::placeholder { color: var(--text-subtle); }
        .rss-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .rss-add-btn { align-self: flex-start; padding: 9px 18px; border: none; border-radius: 10px; background: var(--primary); color: white; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .rss-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rss-error { font-size: 12px; color: #dc2626; background: #fee2e2; padding: 8px 12px; border-radius: 8px; }

        .pref-save-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          background: var(--gradient-brand); color: white;
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; margin-top: 4px;
          box-shadow: 0 4px 14px var(--primary-shadow);
        }
        .pref-save-btn:hover { box-shadow: 0 6px 20px var(--primary-shadow); transform: translateY(-1px); }
        .pref-save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .pref-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        .pref-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; padding: 10px 14px; border-radius: 10px; }
        [data-theme="dark"] .pref-success { background: rgba(34,197,94,0.1); color: #4ade80; }
        [data-theme="dark"] .pref-error { color: #f87171; }

        .reset-btn {
          padding: 7px 14px; border-radius: 10px; background: var(--bg-card);
          font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s; border: 1.5px solid var(--border-default);
        }
        .reset-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fee2e2; }
        .reset-btn.done { border-color: #86efac; color: #16a34a; background: #dcfce7; }

        /* ===== SECURITY TAB ===== */
        .sec-toggle-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .sec-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        .pw-form { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; max-width: 400px; }
        .pw-field {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s; background: var(--bg-input);
        }
        .pw-field::placeholder { color: var(--text-subtle); }
        .pw-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .pw-wrap { position: relative; }
        .pw-wrap .pw-field { padding-right: 46px; }
        .pw-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-subtle);
          display: flex; align-items: center; padding: 0;
        }
        .pw-eye:hover { color: var(--text-heading); }
        .pw-rules { display: flex; flex-direction: column; gap: 4px; margin-top: 5px; }
        .pw-rule { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-subtle); }
        .pw-rule.met { color: #16a34a; }
        .pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; }
        .pw-rule.met .pw-rule-dot { background: #16a34a; }
        .pw-submit {
          padding: 12px 22px; border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; width: fit-content;
        }
        .pw-submit:hover { background: var(--btn-dark-hover); }
        .pw-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .pw-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; padding: 10px 14px; border-radius: 10px; }
        .pw-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        [data-theme="dark"] .pw-success { background: rgba(34,197,94,0.1); color: #4ade80; }
        .pw-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

        .report-form { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
        .report-textarea {
          width: 100%; min-height: 100px; padding: 12px 14px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; background: var(--bg-input); resize: vertical; line-height: 1.5;
        }
        .report-textarea::placeholder { color: var(--text-subtle); }
        .report-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .report-char { font-size: 11px; color: var(--text-subtle); text-align: right; }
        .report-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        [data-theme="dark"] .report-success { background: rgba(34,197,94,0.1); color: #4ade80; }

        .push-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .push-info { flex: 1; }
        .push-title { font-size: 14px; font-weight: 600; color: var(--text-heading); margin-bottom: 2px; }
        .push-desc { font-size: 12px; color: var(--text-subtle); line-height: 1.5; }
        .push-toggle {
          position: relative; width: 46px; height: 26px; flex-shrink: 0;
          background: var(--border-default); border-radius: 999px;
          border: none; cursor: pointer; transition: background 0.2s;
        }
        .push-toggle.on { background: var(--primary); }
        .push-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
        .push-knob {
          position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%; background: white;
          transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .push-toggle.on .push-knob { transform: translateX(20px); }

        .danger-zone {
          background: var(--bg-card); border-radius: 16px;
          border: 1.5px solid #fca5a5; padding: 22px; box-shadow: var(--shadow-sm);
        }
        .danger-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .danger-title { font-size: 15px; font-weight: 700; color: #dc2626; }
        .danger-desc { font-size: 13px; color: var(--text-subtle); margin-top: 2px; }
        .danger-toggle {
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid #fca5a5; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: #dc2626; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .danger-toggle:hover { background: #fee2e2; }
        .danger-form { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
        .danger-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--border-default); border-radius: 10px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          background: var(--bg-input); outline: none;
        }
        .danger-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px #fee2e2; }
        .danger-submit {
          padding: 12px 22px; border: none; border-radius: 10px;
          background: #dc2626; color: white;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.2s; width: fit-content;
        }
        .danger-submit:hover { background: #b91c1c; }
        .danger-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .danger-error { font-size: 13px; color: #dc2626; background: #fee2e2; padding: 10px 14px; border-radius: 10px; font-weight: 500; }
        .danger-warn { font-size: 12px; color: var(--text-subtle); line-height: 1.6; background: var(--bg-elevated); padding: 12px 14px; border-radius: 10px; }
        .danger-warn strong { color: var(--text-heading); }

        /* ===== MISC ===== */
        .prof-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
        .prof-empty { text-align: center; padding: 32px 20px; color: var(--text-subtle); font-size: 14px; }
        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ===== FOOTER ===== */
        .app-footer {
          border-top: 1px solid var(--border-divider); margin-top: 48px; padding: 24px 0 0;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .app-footer-brand { display: flex; align-items: center; gap: 8px; }
        .app-footer-logo { width: 22px; height: 22px; border-radius: 6px; background: #fff; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
        .app-footer-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .app-footer-name { font-size: 13px; font-weight: 700; background: linear-gradient(135deg,#f97316,#ea580c); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .app-footer-copy { font-size: 12px; color: var(--text-subtle); }
        .app-footer-links { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .app-footer-link { font-size: 12px; color: var(--text-subtle); text-decoration: none; transition: color 0.15s; }
        .app-footer-link:hover { color: var(--primary); }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .prof-container { padding: 16px 14px 60px; }
          .prof-hero { flex-direction: column; text-align: center; }
          .prof-stats { grid-template-columns: 1fr; }
          .prof-habits-stats { grid-template-columns: 1fr; }
          .freq-grid { grid-template-columns: 1fr; }
          .prof-tabbar { gap: 2px; }
          .app-footer { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      <NavBar currentPage="profile" />

      <div className="prof-container">
        {loading ? (
          <>
            <div className="shimmer" style={{ height: 110 }} />
            <div className="prof-stats">{[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 85 }} />)}</div>
            <div className="shimmer" style={{ height: 240 }} />
          </>
        ) : !data ? (
          <div className="prof-empty">Failed to load profile.</div>
        ) : (
          <>
            {/* Avatar picker modal */}
            {showAvatarPicker && (
              <AvatarPicker
                mode="modal"
                currentSeed={data.user.avatarSeed}
                saveLabel={avatarSaving ? "Saving..." : "Save avatar"}
                onCancel={() => setShowAvatarPicker(false)}
                onSave={async (seed) => {
                  setAvatarSaving(true);
                  try {
                    const res = await fetch("/api/profile/avatar", {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ seed }),
                    });
                    if (res.ok) {
                      setData((prev) => prev ? { ...prev, user: { ...prev.user, avatarSeed: seed } } : prev);
                      setShowAvatarPicker(false);
                    }
                  } finally { setAvatarSaving(false); }
                }}
              />
            )}

            {/* Hero card (always visible) */}
            <div className="prof-hero">
              <div
                className="prof-avatar"
                onClick={() => setShowAvatarPicker(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowAvatarPicker(true); }}
                role="button" tabIndex={0} title="Change avatar"
              >
                {data.user.avatarSeed
                  ? <img src={avatarUrl(data.user.avatarSeed)} alt="avatar" />
                  : (data.user.name ?? data.user.email).slice(0, 2).toUpperCase()}
                <span className="prof-avatar-overlay">Edit</span>
              </div>
              <div className="prof-info">
                {editingName ? (
                  <>
                    <div className="prof-name-input-row">
                      <input
                        className="prof-name-input"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                        maxLength={64} autoFocus
                      />
                      <button className="prof-name-save" onClick={handleSaveName} disabled={nameSaving}>
                        {nameSaving ? "Saving..." : "Save"}
                      </button>
                      <button className="prof-name-cancel" onClick={() => { setEditingName(false); setNameError(""); }}>Cancel</button>
                    </div>
                    {nameError && <div className="prof-name-err">{nameError}</div>}
                  </>
                ) : (
                  <div className="prof-name-row">
                    <div className="prof-name">{data.user.name ?? "No name set"}</div>
                    <button
                      className="prof-name-edit-btn" title="Edit name"
                      onClick={() => { setNameValue(data.user.name ?? ""); setEditingName(true); setNameError(""); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="prof-email">{data.user.email}</div>
                <span className="prof-since">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Member for {memberSince(data.user.createdAt)}
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <div className="prof-tabbar">
              {([
                { id: "overview" as Tab, label: "Overview", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                { id: "preferences" as Tab, label: "Preferences", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                { id: "security" as Tab, label: "Security", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((tab) => (
                <button
                  key={tab.id}
                  className={`prof-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="prof-tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="prof-stats">
                  <div className="prof-stat">
                    <div className="prof-stat-value">{data.stats.likes}</div>
                    <div className="prof-stat-label">Liked</div>
                  </div>
                  <div className="prof-stat">
                    <div className="prof-stat-value">{data.stats.saves}</div>
                    <div className="prof-stat-label">Saved</div>
                  </div>
                  <div className="prof-stat">
                    <div className="prof-stat-value">{data.stats.clicks}</div>
                    <div className="prof-stat-label">Read</div>
                  </div>
                </div>

                {/* Reading Habits */}
                <div className="prof-card">
                  <div className="prof-card-title">Reading Habits</div>
                  <div className="prof-card-desc">Time spent on Distilled. Only counts when the tab is active.</div>
                  <div className="prof-habits-stats">
                    <div className="prof-habit-stat">
                      <div className="prof-habit-value">{formatTime(data.usage.totalSeconds)}</div>
                      <div className="prof-habit-label">Total time</div>
                    </div>
                    <div className="prof-habit-stat">
                      <div className="prof-habit-value">{formatTime(data.usage.todaySeconds)}</div>
                      <div className="prof-habit-label">Today</div>
                    </div>
                    <div className="prof-habit-stat">
                      <div className="prof-habit-value">{formatTime(data.usage.avgSeconds)}</div>
                      <div className="prof-habit-label">Daily avg</div>
                    </div>
                  </div>

                  {(data.usage.currentStreak > 0 || data.usage.longestStreak > 0) && (
                    <div className="prof-streak-row">
                      <div className="prof-streak-item">
                        <div className="prof-streak-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                            <path d="M12 2C9.5 6 8 9 8 12a4 4 0 0 0 8 0c0-1.5-.5-3-2-5 0 2-1 3-2 4-1-2-1-4.5 0-9z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="prof-streak-value">{data.usage.currentStreak}d</div>
                          <div className="prof-streak-label">Current streak</div>
                        </div>
                      </div>
                      <div className="prof-streak-divider" />
                      <div className="prof-streak-item">
                        <div className="prof-streak-icon" style={{ background: "var(--bg-elevated)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </div>
                        <div>
                          <div className="prof-streak-value">{data.usage.longestStreak}d</div>
                          <div className="prof-streak-label">Longest streak</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!data.usage.chart.every((d) => d.minutes === 0) && (
                    <div style={{ marginTop: 16 }}>
                      <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={data.usage.chart} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} interval={1} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} allowDecimals={false} unit="m" />
                          <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 12 }}
                            formatter={(val) => [`${val ?? 0} min`, "Time spent"]}
                            cursor={{ fill: "var(--primary-light)" }}
                          />
                          <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Topic interest chart */}
                <div className="prof-card">
                  <div className="prof-card-title">Your Interests</div>
                  <div className="prof-card-desc">Topic weights — higher means you engage more with this topic.</div>
                  {data.topicWeights.length === 0 ? (
                    <div className="prof-empty">No topics selected yet.</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.topicWeights} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} domain={[0, 5]} />
                          <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 13 }}
                            formatter={(val, _, props: { payload?: { name?: string } }) => [`${val} weight`, props.payload?.name ?? ""]}
                            labelFormatter={() => ""}
                          />
                          <Bar
                            dataKey="weight"
                            shape={(props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => (
                              <rect
                                x={props.x} y={props.y}
                                width={props.width} height={props.height}
                                fill={TOPIC_COLORS[(props.index ?? 0) % TOPIC_COLORS.length]}
                                rx={5} ry={5}
                              />
                            )}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="topic-weight-list" style={{ marginTop: 14 }}>
                        {data.topicWeights.map((t, i) => (
                          <div key={t.name} className="topic-weight-row">
                            <span className="topic-weight-label">{t.name}</span>
                            <div className="topic-weight-bar-bg">
                              <div className="topic-weight-bar-fill" style={{ width: `${(t.weight / 5) * 100}%`, background: TOPIC_COLORS[i % TOPIC_COLORS.length] }} />
                            </div>
                            <span className="topic-weight-val">{t.weight}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Weekly activity */}
                {data.weeklyActivity.length > 0 && (
                  <div className="prof-card">
                    <div className="prof-card-title">Activity Over Time</div>
                    <div className="prof-card-desc">Articles engaged with per topic each week (last 8 weeks).</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={data.weeklyActivity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 13 }} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        {data.weeklyTopicNames.map((topic, i) => (
                          <Line key={topic} type="monotone" dataKey={topic} stroke={TOPIC_COLORS[i % TOPIC_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* ===== PREFERENCES TAB ===== */}
            {activeTab === "preferences" && (
              <>
                {prefLoading ? (
                  <>
                    <div className="shimmer" style={{ height: 180 }} />
                    <div className="shimmer" style={{ height: 140 }} />
                    <div className="shimmer" style={{ height: 120 }} />
                  </>
                ) : !pref ? (
                  <div className="prof-empty">Failed to load preferences.</div>
                ) : (
                  <>
                    {/* Topics */}
                    <div className="pref-section">
                      <div className="pref-section-title">Your Interests</div>
                      <div className="pref-section-desc">Select all topics you want in your feed.</div>
                      {pref.selectedIds.size > 0 && (
                        <div className="selected-count">{pref.selectedIds.size} topic{pref.selectedIds.size !== 1 ? "s" : ""} selected</div>
                      )}
                      <div className="topics-grid">
                        {pref.topics.map((topic) => (
                          <button
                            key={topic.id} type="button"
                            className={`topic-chip ${pref.selectedIds.has(topic.id) ? "selected" : ""} ${pref.pausedIds.has(topic.id) ? "paused" : ""}`}
                            onClick={() => setPref((p) => {
                              if (!p) return p;
                              const next = new Set(p.selectedIds);
                              if (next.has(topic.id)) next.delete(topic.id); else next.add(topic.id);
                              return { ...p, selectedIds: next };
                            })}
                          >
                            {topic.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pause topics */}
                    {pref.selectedIds.size > 0 && (
                      <div className="pref-section">
                        <div className="pref-section-title">Pause Topics</div>
                        <div className="pref-section-desc">Temporarily hide a topic from your feed without removing it.</div>
                        <div className="pause-list">
                          {pref.topics.filter((t) => pref.selectedIds.has(t.id)).map((topic) => (
                            <div key={topic.id} className="pause-row">
                              <span className="pause-topic-name">{topic.name}</span>
                              <button
                                className={`pause-toggle ${pref.pausedIds.has(topic.id) ? "paused" : "active"}`}
                                onClick={() => handlePauseToggle(topic.id)}
                              >
                                {pref.pausedIds.has(topic.id) ? "Paused" : "Active"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Frequency */}
                    <div className="pref-section">
                      <div className="pref-section-title">Curation Frequency</div>
                      <div className="pref-section-desc">How often do you want your feed refreshed?</div>
                      <div className="freq-grid">
                        {FREQ_OPTIONS.map((opt) => (
                          <div
                            key={opt.value}
                            className={`freq-card ${pref.frequency === opt.value ? "selected" : ""}`}
                            role="button" tabIndex={0}
                            onClick={() => setPref((p) => {
                              if (!p) return p;
                              const newCount = opt.value === "DAILY" && p.postCount > 30 ? 30
                                : opt.value === "WEEKLY" && p.postCount > 60 ? 60 : p.postCount;
                              return { ...p, frequency: opt.value, postCount: newCount };
                            })}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setPref((p) => p ? { ...p, frequency: opt.value } : p); }}
                          >
                            <div className="freq-label">{opt.label}</div>
                            <div className="freq-desc">{opt.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Post count */}
                    <div className="pref-section">
                      <div className="pref-section-title">Posts Per Session</div>
                      <div className="pref-section-desc">How many articles do you want per session?</div>
                      <div className="slider-row">
                        <input
                          type="range" className="slider" min={10} max={maxPosts}
                          value={pref.postCount}
                          onChange={(e) => setPref((p) => p ? { ...p, postCount: Number(e.target.value) } : p)}
                          style={{ "--fill": `${((pref.postCount - 10) / (maxPosts - 10)) * 100}%` } as React.CSSProperties}
                        />
                        <span className="slider-value">{pref.postCount}</span>
                      </div>
                      <p className="slider-hint">10 minimum · {maxPosts} maximum for {pref.frequency.toLowerCase()} feeds</p>
                    </div>

                    {/* Feed options */}
                    <div className="pref-section">
                      <div className="pref-section-title">Feed Options</div>
                      <div className="toggle-row">
                        <div>
                          <div className="toggle-label">Show trending posts</div>
                          <div className="toggle-desc">Includes trending articles from across all topics.</div>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox" checked={pref.showTrending}
                            onChange={(e) => setPref((p) => p ? { ...p, showTrending: e.target.checked } : p)}
                          />
                          <span className="toggle-track" />
                        </label>
                      </div>
                    </div>

                    {/* Blocked sources */}
                    <div className="pref-section">
                      <div className="pref-section-title">Blocked Sources</div>
                      <div className="pref-section-desc">Click a source to block it from your feed. Click again to unblock.</div>
                      <div className="source-block-grid">
                        {SOURCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value} type="button"
                            className={`source-block-chip ${pref.blockedSources.has(opt.value) ? "blocked" : ""}`}
                            onClick={() => handleBlockedSourceToggle(opt.value)}
                          >
                            <span className="source-dot" style={{ background: opt.color }} />
                            {opt.label}
                            {pref.blockedSources.has(opt.value) && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom RSS */}
                    <div className="pref-section">
                      <div className="pref-section-title">Custom RSS Feeds</div>
                      <div className="pref-section-desc">Add your own RSS/Atom feeds. Maximum 20 sources.</div>
                      {rssSources.length > 0 && (
                        <div className="rss-list">
                          {rssSources.map((s) => (
                            <div key={s.id} className="rss-item">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="rss-item-name">{s.name || "Unnamed feed"}</div>
                                <div className="rss-item-url">{s.url}</div>
                              </div>
                              <button className="rss-remove-btn" disabled={removingRssId === s.id} onClick={() => handleRemoveRss(s.id)}>
                                {removingRssId === s.id ? "..." : "Remove"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {rssSources.length < 20 && (
                        <form className="rss-form" onSubmit={handleAddRss}>
                          <input className="rss-input" type="url" placeholder="Feed URL (https://example.com/feed.xml)" value={rssUrl} onChange={(e) => setRssUrl(e.target.value)} required />
                          <input className="rss-input" type="text" placeholder="Display name (optional)" value={rssName} onChange={(e) => setRssName(e.target.value)} maxLength={80} />
                          {rssError && <div className="rss-error">{rssError}</div>}
                          <button type="submit" className="rss-add-btn" disabled={rssAdding}>{rssAdding ? "Adding..." : "+ Add Feed"}</button>
                        </form>
                      )}
                    </div>

                    {/* Reset weights */}
                    <div className="pref-section">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div className="pref-section-title">Reset Feed Weights</div>
                          <div className="pref-section-desc" style={{ marginBottom: 0 }}>Reset the algorithm's topic weights back to default.</div>
                        </div>
                        {!resetConfirming && (
                          <button className={`reset-btn ${resetDone ? "done" : ""}`} onClick={() => setResetConfirming(true)} disabled={resetting}>
                            {resetting ? "Resetting..." : resetDone ? "Done!" : "Reset Weights"}
                          </button>
                        )}
                      </div>
                      {resetConfirming && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Are you sure? This cannot be undone.</span>
                          <button className="reset-btn" style={{ borderColor: "#fca5a5", color: "#dc2626" }} onClick={handleResetWeights} disabled={resetting}>Yes, reset</button>
                          <button className="reset-btn" onClick={() => setResetConfirming(false)}>Cancel</button>
                        </div>
                      )}
                    </div>

                    {prefError && <div className="pref-error">{prefError}</div>}
                    {prefSuccess && <div className="pref-success">Preferences saved successfully!</div>}
                    <button className="pref-save-btn" onClick={handleSavePrefs} disabled={prefSaving}>
                      {prefSaving ? "Saving..." : "Save Preferences"}
                    </button>
                  </>
                )}
              </>
            )}

            {/* ===== SECURITY TAB ===== */}
            {activeTab === "security" && (
              <>
                {/* Change password */}
                <div className="prof-card">
                  <div className="prof-section-header">
                    <div>
                      <div className="prof-card-title">Password</div>
                      <div className="prof-card-desc" style={{ marginBottom: 0 }}>Update your account password.</div>
                    </div>
                    <button className="sec-toggle-btn" onClick={() => { setShowChangePw((v) => !v); setPwError(""); setPwSuccess(""); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      {showChangePw ? "Cancel" : "Change password"}
                    </button>
                  </div>
                  {showChangePw && (
                    <form className="pw-form" onSubmit={handleChangePw}>
                      <div className="pw-wrap">
                        <input className="pw-field" type={showPw ? "text" : "password"} placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required autoComplete="current-password" />
                        <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)}>
                          {showPw ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                      <div>
                        <input className="pw-field" type={showPw ? "text" : "password"} placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required autoComplete="new-password" />
                        {pwForm.newPassword.length > 0 && (
                          <div className="pw-rules">
                            {pwRules.map((r) => (
                              <div key={r.label} className={`pw-rule ${r.met ? "met" : ""}`}>
                                <span className="pw-rule-dot" />{r.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input className="pw-field" type={showPw ? "text" : "password"} placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} required autoComplete="new-password" />
                      {pwError && <div className="pw-error">{pwError}</div>}
                      {pwSuccess && <div className="pw-success">{pwSuccess}</div>}
                      <button type="submit" className="pw-submit" disabled={pwLoading}>
                        {pwLoading ? <span className="pw-spinner" /> : "Update password"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Push notifications */}
                {pushSupported && (
                  <div className="prof-card">
                    <div className="prof-card-title">Push Notifications</div>
                    <div className="prof-card-desc">Get notified about new articles matching your interests.</div>
                    <div className="push-row">
                      <div className="push-info">
                        <div className="push-title">{pushSubscribed ? "Notifications enabled" : "Notifications disabled"}</div>
                        <div className="push-desc">
                          {pushSubscribed ? "You will receive push notifications when new content arrives." : "Enable to get alerts for new articles."}
                        </div>
                      </div>
                      <button className={`push-toggle ${pushSubscribed ? "on" : ""}`} disabled={pushLoading} onClick={handlePushToggle}>
                        <span className="push-knob" />
                      </button>
                    </div>
                    {pushError && <div style={{ fontSize: 12, color: "var(--text-error)", marginTop: 8 }}>{pushError}</div>}
                  </div>
                )}

                {/* Report issue */}
                <div className="prof-card">
                  <div className="prof-section-header">
                    <div>
                      <div className="prof-card-title">Report an Issue</div>
                      <div className="prof-card-desc" style={{ marginBottom: 0 }}>Found a bug or have feedback? Let us know.</div>
                    </div>
                    <button className="sec-toggle-btn" onClick={() => { setShowReport((v) => !v); setReportError(""); setReportSuccess(false); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {showReport ? "Cancel" : "Report issue"}
                    </button>
                  </div>
                  {showReport && (
                    <form className="report-form" onSubmit={handleReport}>
                      <div>
                        <textarea className="report-textarea" placeholder="Describe your issue or feedback in detail..." value={reportMsg} onChange={(e) => { setReportMsg(e.target.value); setReportSuccess(false); }} maxLength={2000} required />
                        <div className="report-char">{reportMsg.length}/2000</div>
                      </div>
                      {reportError && <div className="pw-error">{reportError}</div>}
                      {reportSuccess && <div className="report-success">Report sent! We&apos;ll look into it soon.</div>}
                      {!reportSuccess && (
                        <button type="submit" className="pw-submit" disabled={reportLoading}>
                          {reportLoading ? <span className="pw-spinner" /> : "Send Report"}
                        </button>
                      )}
                    </form>
                  )}
                </div>

                {/* Danger zone */}
                <div className="danger-zone">
                  <div className="danger-header">
                    <div>
                      <div className="danger-title">Delete Account</div>
                      <div className="danger-desc">Permanently remove your account and all data. This cannot be undone.</div>
                    </div>
                    <button className="danger-toggle" onClick={() => { setShowDeleteZone((v) => !v); setDeleteError(""); setDeleteConfirm(""); setDeletePassword(""); }}>
                      {showDeleteZone ? "Cancel" : "Delete account"}
                    </button>
                  </div>
                  {showDeleteZone && (
                    <div className="danger-form">
                      <div className="danger-warn">
                        <strong>This will permanently delete:</strong> your profile, preferences, reading history, saved articles, and collections. <strong>Cannot be undone.</strong>
                      </div>
                      <input className="danger-input" type="password" placeholder="Your current password (if you have one)" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoComplete="current-password" />
                      <input className="danger-input" type="text" placeholder='Type "DELETE" to confirm' value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} autoComplete="off" />
                      {deleteError && <div className="danger-error">{deleteError}</div>}
                      <button className="danger-submit" disabled={deleting || deleteConfirm !== "DELETE"} onClick={handleDeleteAccount}>
                        {deleting ? "Deleting..." : "Permanently delete account"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sign out */}
                <div style={{ textAlign: "center", paddingTop: 4 }}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth" })}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-subtle)", textDecoration: "underline", fontFamily: "inherit" }}
                  >
                    Sign out of this account
                  </button>
                </div>
              </>
            )}

            {/* Footer */}
            <footer className="app-footer">
              <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                <div className="app-footer-brand">
                  <div className="app-footer-logo"><img src="/logo.jpeg" alt="Distilled" /></div>
                  <span className="app-footer-name">Distilled</span>
                </div>
                <span className="app-footer-copy">© {new Date().getFullYear()} Distilled. All rights reserved.</span>
              </div>
              <div className="app-footer-links">
                <a href="/feed" className="app-footer-link">Feed</a>
                <a href="/saved" className="app-footer-link">Saved</a>
                <a href="/history" className="app-footer-link">History</a>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
}
