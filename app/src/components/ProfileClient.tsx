"use client";

import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import AvatarPicker from "./AvatarPicker";
import { avatarUrl } from "@/lib/avatars";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";

const TOPIC_COLORS = [
  "#f97316", "#0ea5e9", "#10b981", "#f59e0b",
  "#3b82f6", "#ef4444", "#14b8a6", "#84cc16",
];

type ProfileData = {
  user: { name: string | null; email: string; createdAt: string; avatarSeed: string | null };
  stats: { likes: number; saves: number; clicks: number };
  topicWeights: { name: string; emoji: string; weight: number; status: string }[];
  weeklyActivity: Record<string, string | number>[];
  weeklyTopicNames: string[];
  usage: {
    totalSeconds: number;
    todaySeconds: number;
    avgSeconds: number;
    chart: { date: string; minutes: number }[];
    currentStreak: number;
    longestStreak: number;
  };
};

function formatTime(seconds: number): string {
  if (seconds < 60) return seconds > 0 ? `${seconds}s` : "0m";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

type ChangePwForm = { currentPassword: string; newPassword: string; confirmPassword: string };

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
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState<ChangePwForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

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

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setReportError(""); setReportSuccess(false);
    if (reportMsg.trim().length < 10) { setReportError("Please describe the issue in at least 10 characters."); return; }
    setReportLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reportMsg }),
      });
      const d = await res.json();
      if (!res.ok) { setReportError(d.error ?? "Something went wrong."); }
      else { setReportSuccess(true); setReportMsg(""); }
    } catch { setReportError("Network error. Please try again."); }
    finally { setReportLoading(false); }
  }

  const pwRules = [
    { label: "At least 8 characters", met: pwForm.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwForm.newPassword) },
  ];

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwRules.some((r) => !r.met)) { setPwError("Please meet all password requirements."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const d = await res.json();
      if (!res.ok) { setPwError(d.error); }
      else { setPwSuccess("Password changed successfully!"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    } catch { setPwError("Network error. Please try again."); }
    finally { setPwLoading(false); }
  }

  async function handleSaveName() {
    setNameError("");
    if (!nameValue.trim()) { setNameError("Name cannot be empty."); return; }
    setNameSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
      const d = await res.json();
      if (!res.ok) { setNameError(d.error ?? "Failed to update name."); }
      else {
        setData((prev) => prev ? { ...prev, user: { ...prev.user, name: d.name } } : prev);
        setEditingName(false);
      }
    } catch { setNameError("Network error. Please try again."); }
    finally { setNameSaving(false); }
  }

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      fetch("/api/user/push-subscription")
        .then((r) => r.json())
        .then((d) => setPushSubscribed(d.subscribed ?? false))
        .catch(() => {});
    }
  }, []);

  async function handlePushToggle() {
    setPushLoading(true);
    setPushError("");
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
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
        const json = sub.toJSON();
        await fetch("/api/user/push-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
        });
        setPushSubscribed(true);
      }
    } catch (e: any) {
      setPushError(e?.message ?? "Something went wrong.");
    } finally {
      setPushLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") { setDeleteError('Type "DELETE" to confirm.'); return; }
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setDeleteError(d.error ?? "Failed to delete account."); }
      else { window.location.href = "/auth?deleted=1"; }
    } catch { setDeleteError("Network error. Please try again."); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        .prof-container { max-width: 900px; margin: 0 auto; padding: 32px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* Avatar + info card */
        .prof-hero {
          background: var(--bg-card); border-radius: 12px;
          border: 1px solid var(--border-default);
          padding: 28px; box-shadow: var(--shadow-sm);
          display: flex; align-items: center; gap: 24px;
        }
        .prof-avatar {
          width: 72px; height: 72px; border-radius: 14px; flex-shrink: 0;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px;
          cursor: pointer; overflow: hidden; position: relative;
          transition: box-shadow 0.2s ease, transform 0.15s ease;
        }
        .prof-avatar:hover { box-shadow: 0 0 0 3px var(--primary-light), 0 0 0 5px var(--primary); transform: scale(1.04); }
        .prof-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .prof-avatar-overlay {
          position: absolute; inset: 0; border-radius: 14px;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.15s ease;
          color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
        }
        .prof-avatar:hover .prof-avatar-overlay { opacity: 1; }
        .prof-info { flex: 1; min-width: 0; }
        .prof-name { font-size: 22px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; margin-bottom: 4px; }
        .prof-email { font-size: 14px; color: var(--text-subtle); margin-bottom: 10px; }
        .prof-since {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 999px;
          background: var(--bg-accent); color: var(--primary);
          font-size: 12px; font-weight: 600;
        }

        /* Stat cards */
        .prof-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .prof-stat {
          background: var(--bg-card); border-radius: 12px;
          border: 1px solid var(--border-default);
          padding: 20px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .prof-stat-value { font-size: 32px; font-weight: 800; color: var(--primary); letter-spacing: -1px; }
        .prof-stat-label { font-size: 13px; color: var(--text-subtle); margin-top: 4px; font-weight: 500; }

        /* Chart cards */
        .prof-card {
          background: var(--bg-card); border-radius: 12px;
          border: 1px solid var(--border-default);
          padding: 24px; box-shadow: var(--shadow-sm);
        }
        .prof-card-title { font-size: 16px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px; }
        .prof-card-desc { font-size: 13px; color: var(--text-subtle); margin-bottom: 20px; }

        /* Topic weight chips */
        .topic-weight-list { display: flex; flex-direction: column; gap: 10px; }
        .topic-weight-row { display: flex; align-items: center; gap: 12px; }
        .topic-weight-label { font-size: 13px; font-weight: 600; color: var(--text-body); width: 140px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topic-weight-bar-bg { flex: 1; height: 8px; border-radius: 4px; background: var(--bg-elevated); overflow: hidden; }
        .topic-weight-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .topic-weight-val { font-size: 12px; color: var(--text-subtle); width: 32px; text-align: right; font-weight: 600; }
        .topic-paused-badge { font-size: 10px; color: var(--text-warning); font-weight: 600; background: var(--bg-warning); padding: 1px 6px; border-radius: 999px; }

        /* Change password */
        .prof-pw-toggle {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
          white-space: nowrap; flex-shrink: 0;
        }
        .prof-pw-toggle:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .prof-pw-form { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; max-width: 400px; }
        .prof-pw-field {
          width: 100%; padding: 13px 16px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s; background: var(--bg-input);
        }
        .prof-pw-field::placeholder { color: var(--text-subtle); }
        .prof-pw-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .prof-pw-wrap { position: relative; }
        .prof-pw-wrap .prof-pw-field { padding-right: 46px; }
        .prof-pw-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-subtle);
          display: flex; align-items: center; padding: 0;
        }
        .prof-pw-eye:hover { color: var(--text-heading); }
        .prof-pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 6px; }
        .prof-pw-rule { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-subtle); }
        .prof-pw-rule.met { color: var(--text-success, #16a34a); }
        .prof-pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; }
        .prof-pw-rule.met .prof-pw-rule-dot { background: var(--text-success, #16a34a); }
        .prof-pw-submit {
          padding: 12px 22px; border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; width: fit-content;
        }
        .prof-pw-submit:hover { background: var(--btn-dark-hover); }
        .prof-pw-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-pw-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 10px; }
        .prof-pw-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        .prof-pw-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

        /* Report issue */
        .prof-report-toggle {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .prof-report-toggle:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .prof-report-form { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
        .prof-report-textarea {
          width: 100%; min-height: 110px; padding: 13px 16px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s; background: var(--bg-input);
          resize: vertical; line-height: 1.5;
        }
        .prof-report-textarea::placeholder { color: var(--text-subtle); }
        .prof-report-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .prof-report-submit {
          padding: 12px 22px; border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; width: fit-content;
        }
        .prof-report-submit:hover { background: var(--btn-dark-hover); }
        .prof-report-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-report-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 10px; }
        .prof-report-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        .prof-report-char { font-size: 11px; color: var(--text-subtle); text-align: right; }

        /* Reading habits */
        .prof-habits-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .prof-habit-stat {
          background: var(--bg-elevated); border-radius: 10px;
          border: 1px solid var(--border-divider);
          padding: 16px; text-align: center;
        }
        .prof-habit-value { font-size: 24px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .prof-habit-label { font-size: 11px; color: var(--text-subtle); margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

        @media (max-width: 480px) {
          .prof-habits-stats { grid-template-columns: 1fr; }
        }

        /* Streaks */
        .prof-streak-row {
          display: flex; align-items: center; gap: 0;
          background: var(--bg-elevated); border-radius: 12px;
          border: 1px solid var(--border-divider);
          margin-top: 16px; overflow: hidden;
        }
        .prof-streak-item {
          flex: 1; display: flex; align-items: center; gap: 12px;
          padding: 16px 20px;
        }
        .prof-streak-fire { font-size: 24px; flex-shrink: 0; }
        .prof-streak-value { font-size: 18px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .prof-streak-label { font-size: 11px; color: var(--text-subtle); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }
        .prof-streak-divider { width: 1px; background: var(--border-divider); align-self: stretch; flex-shrink: 0; }
        @media (max-width: 360px) {
          .prof-streak-item { padding: 12px 14px; gap: 8px; }
          .prof-streak-fire { font-size: 20px; }
          .prof-streak-value { font-size: 15px; }
        }

        /* Name edit */
        .prof-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .prof-name-edit-btn {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--text-subtle); border-radius: 6px;
          display: flex; align-items: center; transition: color 0.15s;
        }
        .prof-name-edit-btn:hover { color: var(--primary); }
        .prof-name-input-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
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
        .prof-name-save:hover { background: var(--btn-dark-hover); }
        .prof-name-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-name-cancel {
          padding: 7px 14px; border: 1.5px solid var(--border-default); border-radius: 10px;
          background: transparent; color: var(--text-muted);
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .prof-name-cancel:hover { border-color: var(--text-muted); color: var(--text-heading); }
        .prof-name-err { font-size: 12px; color: var(--text-error); margin-top: 2px; }

        /* Empty state */
        .prof-empty { text-align: center; padding: 40px 20px; color: var(--text-subtle); font-size: 14px; }

        /* Skeleton */
        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Push notification toggle */
        .prof-push-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .prof-push-info { flex: 1; }
        .prof-push-title { font-size: 14px; font-weight: 600; color: var(--text-heading); margin-bottom: 3px; }
        .prof-push-desc { font-size: 12px; color: var(--text-subtle); line-height: 1.5; }
        .prof-push-toggle {
          position: relative; width: 46px; height: 26px; flex-shrink: 0;
          background: var(--border-default); border-radius: 999px;
          border: none; cursor: pointer; transition: background 0.2s;
        }
        .prof-push-toggle.on { background: var(--primary); }
        .prof-push-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-push-knob {
          position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%; background: white;
          transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .prof-push-toggle.on .prof-push-knob { transform: translateX(20px); }
        .prof-push-error { font-size: 12px; color: var(--text-error); margin-top: 8px; }

        /* Danger zone */
        .prof-danger-zone {
          background: var(--bg-card); border-radius: 12px;
          border: 1.5px solid #fca5a5;
          padding: 24px; box-shadow: var(--shadow-sm);
        }
        .prof-danger-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .prof-danger-title { font-size: 15px; font-weight: 700; color: #dc2626; }
        .prof-danger-desc { font-size: 13px; color: var(--text-subtle); margin-top: 3px; }
        .prof-danger-toggle {
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid #fca5a5; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: #dc2626; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .prof-danger-toggle:hover { background: #fee2e2; }
        .prof-danger-form { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; max-width: 400px; }
        .prof-danger-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid var(--border-default); border-radius: 10px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          background: var(--bg-input); outline: none; transition: border-color 0.2s;
        }
        .prof-danger-input::placeholder { color: var(--text-subtle); }
        .prof-danger-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px #fee2e2; }
        .prof-danger-submit {
          padding: 12px 22px; border: none; border-radius: 10px;
          background: #dc2626; color: white;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.2s; width: fit-content;
        }
        .prof-danger-submit:hover { background: #b91c1c; }
        .prof-danger-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-danger-error { font-size: 13px; color: #dc2626; background: #fee2e2; padding: 10px 14px; border-radius: 10px; font-weight: 500; }
        .prof-danger-warn { font-size: 12px; color: var(--text-subtle); line-height: 1.6; background: var(--bg-elevated); padding: 12px 14px; border-radius: 10px; }
        .prof-danger-warn strong { color: var(--text-heading); }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .prof-hero { flex-direction: column; text-align: center; }
          .prof-stats { grid-template-columns: 1fr; }
          .prof-container { padding: 20px 16px 60px; }
        }
      `}</style>

      <NavBar currentPage="profile" />

      <div className="prof-container">
        {loading ? (
          <>
            <div className="shimmer" style={{ height: 120 }} />
            <div className="prof-stats">
              {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 90 }} />)}
            </div>
            <div className="shimmer" style={{ height: 260 }} />
            <div className="shimmer" style={{ height: 280 }} />
            <div className="shimmer" style={{ height: 280 }} />
          </>
        ) : !data ? (
          <div className="prof-empty">Failed to load profile.</div>
        ) : (
          <>
            {/* Hero */}
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
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ seed }),
                    });
                    if (res.ok) {
                      setData((prev) => prev ? { ...prev, user: { ...prev.user, avatarSeed: seed } } : prev);
                      setShowAvatarPicker(false);
                    }
                  } finally {
                    setAvatarSaving(false);
                  }
                }}
              />
            )}
            <div className="prof-hero">
              <div className="prof-avatar" onClick={() => setShowAvatarPicker(true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowAvatarPicker(true); }} role="button" tabIndex={0} title="Change avatar">
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
                        maxLength={64}
                        autoFocus
                      />
                      <button className="prof-name-save" onClick={handleSaveName} disabled={nameSaving}>
                        {nameSaving ? "Saving..." : "Save"}
                      </button>
                      <button className="prof-name-cancel" onClick={() => { setEditingName(false); setNameError(""); }}>
                        Cancel
                      </button>
                    </div>
                    {nameError && <div className="prof-name-err">{nameError}</div>}
                  </>
                ) : (
                  <div className="prof-name-row">
                    <div className="prof-name">{data.user.name ?? "No name set"}</div>
                    <button
                      className="prof-name-edit-btn"
                      title="Edit name"
                      onClick={() => { setNameValue(data.user.name ?? ""); setEditingName(true); setNameError(""); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="prof-email">{data.user.email}</div>
                <span className="prof-since">
                  Member for {memberSince(data.user.createdAt)}
                </span>
              </div>
            </div>

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
                    <span className="prof-streak-fire">🔥</span>
                    <div>
                      <div className="prof-streak-value">{data.usage.currentStreak} day{data.usage.currentStreak !== 1 ? "s" : ""}</div>
                      <div className="prof-streak-label">Current streak</div>
                    </div>
                  </div>
                  <div className="prof-streak-divider" />
                  <div className="prof-streak-item">
                    <span className="prof-streak-fire" style={{ opacity: 0.5 }}>🏆</span>
                    <div>
                      <div className="prof-streak-value">{data.usage.longestStreak} day{data.usage.longestStreak !== 1 ? "s" : ""}</div>
                      <div className="prof-streak-label">Longest streak</div>
                    </div>
                  </div>
                </div>
              )}

              {data.usage.chart.every((d) => d.minutes === 0) ? (
                <div className="prof-empty" style={{ padding: "24px 0 8px" }}>
                  No data yet. Come back after your first reading session.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.usage.chart} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "var(--text-subtle)" }}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--text-subtle)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      unit="m"
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 12, color: "var(--text-heading)" }}
                      formatter={(val) => [`${val ?? 0} min`, "Time spent"]}
                      cursor={{ fill: "var(--primary-light)" }}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Change Password */}
            <div className="prof-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <div>
                  <div className="prof-card-title">Security</div>
                  <div className="prof-card-desc" style={{ marginBottom: 0 }}>Manage your account password.</div>
                </div>
                <button className="prof-pw-toggle" onClick={() => { setShowChangePw((v) => !v); setPwError(""); setPwSuccess(""); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {showChangePw ? "Cancel" : "Change password"}
                </button>
              </div>

              {showChangePw && (
                <form className="prof-pw-form" onSubmit={handleChangePw}>
                  <div className="prof-pw-wrap">
                    <input
                      className="prof-pw-field"
                      type={showPw ? "text" : "password"}
                      placeholder="Current password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="prof-pw-eye" onClick={() => setShowPw((v) => !v)}>
                      {showPw ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div>
                    <input
                      className="prof-pw-field"
                      type={showPw ? "text" : "password"}
                      placeholder="New password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                      required
                      autoComplete="new-password"
                    />
                    {pwForm.newPassword.length > 0 && (
                      <div className="prof-pw-rules">
                        {pwRules.map((r) => (
                          <div key={r.label} className={`prof-pw-rule ${r.met ? "met" : ""}`}>
                            <span className="prof-pw-rule-dot" />{r.label}
                          </div>
                        ))}
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>
                          Tip: adding numbers and special characters makes your password stronger.
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    className="prof-pw-field"
                    type={showPw ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                  {pwError && <div className="prof-pw-error">{pwError}</div>}
                  {pwSuccess && <div className="prof-pw-success">{pwSuccess}</div>}
                  <button type="submit" className="prof-pw-submit" disabled={pwLoading}>
                    {pwLoading ? <span className="prof-pw-spinner" /> : "Update password"}
                  </button>
                </form>
              )}
            </div>

            {/* Report Issue */}
            <div className="prof-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="prof-card-title">Report an Issue</div>
                  <div className="prof-card-desc" style={{ marginBottom: 0 }}>Found a bug or have feedback? Let us know.</div>
                </div>
                <button
                  className="prof-report-toggle"
                  onClick={() => { setShowReport((v) => !v); setReportError(""); setReportSuccess(false); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {showReport ? "Cancel" : "Report issue"}
                </button>
              </div>

              {showReport && (
                <form className="prof-report-form" onSubmit={handleReport}>
                  <div>
                    <textarea
                      className="prof-report-textarea"
                      placeholder="Describe your issue or feedback in detail..."
                      value={reportMsg}
                      onChange={(e) => { setReportMsg(e.target.value); setReportSuccess(false); }}
                      maxLength={2000}
                      required
                    />
                    <div className="prof-report-char">{reportMsg.length}/2000</div>
                  </div>
                  {reportError && <div className="prof-report-error">{reportError}</div>}
                  {reportSuccess && (
                    <div className="prof-report-success">
                      Your report was sent! We'll look into it soon.
                    </div>
                  )}
                  {!reportSuccess && (
                    <button type="submit" className="prof-report-submit" disabled={reportLoading}>
                      {reportLoading ? <span className="prof-pw-spinner" /> : "Send Report"}
                    </button>
                  )}
                </form>
              )}
            </div>

            {/* Push Notifications */}
            {pushSupported && (
              <div className="prof-card">
                <div className="prof-card-title">Notifications</div>
                <div className="prof-card-desc" style={{ marginBottom: 16 }}>Get notified about new articles matching your interests.</div>
                <div className="prof-push-row">
                  <div className="prof-push-info">
                    <div className="prof-push-title">{pushSubscribed ? "Push notifications enabled" : "Push notifications disabled"}</div>
                    <div className="prof-push-desc">
                      {pushSubscribed
                        ? "You will receive push notifications when new content arrives."
                        : "Enable push notifications to get alerts for new articles."}
                    </div>
                  </div>
                  <button
                    className={`prof-push-toggle ${pushSubscribed ? "on" : ""}`}
                    disabled={pushLoading}
                    onClick={handlePushToggle}
                    aria-label={pushSubscribed ? "Disable notifications" : "Enable notifications"}
                  >
                    <span className="prof-push-knob" />
                  </button>
                </div>
                {pushError && <div className="prof-push-error">{pushError}</div>}
              </div>
            )}

            {/* Topic interest bar chart */}
            <div className="prof-card">
              <div className="prof-card-title">Your Interests</div>
              <div className="prof-card-desc">Topic weights: higher means you engage more with this topic.</div>
              {data.topicWeights.length === 0 ? (
                <div className="prof-empty">No topics selected yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.topicWeights} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} domain={[0, 5]} />
                      <Tooltip
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 13, color: "var(--text-heading)" }}
                        itemStyle={{ color: "var(--text-body)" }}
                        formatter={(val, _, props: any) => [`${val} weight`, props.payload.name]}
                        labelFormatter={() => ""}
                      />
                      <Bar
                        dataKey="weight"
                        shape={(props: any) => (
                          <rect
                            x={props.x} y={props.y}
                            width={props.width} height={props.height}
                            fill={TOPIC_COLORS[props.index % TOPIC_COLORS.length]}
                            rx={6} ry={6}
                          />
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="topic-weight-list" style={{ marginTop: 16 }}>
                    {data.topicWeights.map((t, i) => (
                      <div key={t.name} className="topic-weight-row">
                        <span className="topic-weight-label">
                          {t.name}
                          {t.status === "PAUSED" && <span className="topic-paused-badge" style={{ marginLeft: 6 }}>Paused</span>}
                        </span>
                        <div className="topic-weight-bar-bg">
                          <div
                            className="topic-weight-bar-fill"
                            style={{
                              width: `${(t.weight / 5) * 100}%`,
                              background: TOPIC_COLORS[i % TOPIC_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="topic-weight-val">{t.weight}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Weekly activity line chart */}
            <div className="prof-card">
              <div className="prof-card-title">Activity Over Time</div>
              <div className="prof-card-desc">How many articles you engaged with per topic each week (last 8 weeks).</div>
              {data.weeklyActivity.length === 0 ? (
                <div className="prof-empty">No activity recorded yet. Start reading to see your trends!</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.weeklyActivity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 13 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    {data.weeklyTopicNames.map((topic, i) => (
                      <Line
                        key={topic}
                        type="monotone"
                        dataKey={topic}
                        stroke={TOPIC_COLORS[i % TOPIC_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Danger Zone */}
            <div className="prof-danger-zone">
              <div className="prof-danger-header">
                <div>
                  <div className="prof-danger-title">Delete Account</div>
                  <div className="prof-danger-desc">Permanently remove your account and all data. This cannot be undone.</div>
                </div>
                <button
                  className="prof-danger-toggle"
                  onClick={() => { setShowDeleteZone((v) => !v); setDeleteError(""); setDeleteConfirm(""); setDeletePassword(""); }}
                >
                  {showDeleteZone ? "Cancel" : "Delete account"}
                </button>
              </div>

              {showDeleteZone && (
                <div className="prof-danger-form">
                  <div className="prof-danger-warn">
                    <strong>This will permanently delete:</strong> your profile, preferences, reading history, saved articles, and collections. This action <strong>cannot be undone</strong>.
                  </div>
                  <input
                    className="prof-danger-input"
                    type="password"
                    placeholder="Your current password (if you have one)"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <input
                    className="prof-danger-input"
                    type="text"
                    placeholder='Type "DELETE" to confirm'
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    autoComplete="off"
                  />
                  {deleteError && <div className="prof-danger-error">{deleteError}</div>}
                  <button
                    className="prof-danger-submit"
                    disabled={deleting || deleteConfirm !== "DELETE"}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? "Deleting..." : "Permanently delete account"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
