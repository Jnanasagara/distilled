"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  emailVerified: string | null;
  createdAt: string;
  onboarded: boolean;
  _count: { interactions: number };
};

type Report = {
  id: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user: { id: string; name: string | null; email: string };
};

type ChangePwForm = { currentPassword: string; newPassword: string; confirmPassword: string };

type AnalyticsData = {
  totals: { users: number; content: number; interactions: number; active7d: number };
  daily: { date: string; signups: number; interactions: number }[];
  sources: { source: string; count: number }[];
};

type ContentItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  isHidden: boolean;
  publishedAt: string | null;
  topic: { name: string; emoji: string | null } | null;
};

export default function AdminClient({ mustChangePassword }: { mustChangePassword: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [banningId, setBanningId] = useState<string | null>(null);
  const [banError, setBanError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [showChangePw, setShowChangePw] = useState(mustChangePassword);
  const [pwForm, setPwForm] = useState<ChangePwForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [reportFilter, setReportFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentTotal, setContentTotal] = useState(0);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentSearch, setContentSearch] = useState("");
  const [contentFilter, setContentFilter] = useState<"all" | "hidden" | "visible">("all");
  const [contentPage, setContentPage] = useState(1);
  const [hidingId, setHidingId] = useState<string | null>(null);
  const CONTENT_PAGE_SIZE = 30;

  const pwRules = [
    { label: "At least 8 characters", met: pwForm.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwForm.newPassword) },
    { label: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwForm.newPassword) },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    setReportsLoading(true);
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => { setReports(d.reports ?? []); setReportsLoading(false); })
      .catch(() => setReportsLoading(false));
  }, []);

  useEffect(() => {
    setAnalyticsLoading(true);
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setAnalyticsLoading(false); })
      .catch(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    setContentLoading(true);
    const params = new URLSearchParams({ page: String(contentPage), filter: contentFilter });
    if (contentSearch) params.set("q", contentSearch);
    fetch(`/api/admin/content?${params}`)
      .then((r) => r.json())
      .then((d) => { setContentItems(d.items ?? []); setContentTotal(d.total ?? 0); setContentLoading(false); })
      .catch(() => setContentLoading(false));
  }, [contentPage, contentFilter, contentSearch]);

  async function handleResolve(reportId: string) {
    setResolvingId(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: "RESOLVED", resolvedAt: new Date().toISOString() } : r));
      }
    } finally {
      setResolvingId(null);
    }
  }

  async function handleToggleHide(itemId: string) {
    setHidingId(itemId);
    try {
      const res = await fetch(`/api/admin/content/${itemId}/hide`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setContentItems((prev) => prev.map((c) => c.id === itemId ? { ...c, isHidden: data.isHidden } : c));
      }
    } finally {
      setHidingId(null);
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBanned && u.emailVerified).length,
    banned: users.filter((u) => u.isBanned).length,
    unverified: users.filter((u) => !u.emailVerified).length,
  };

  async function handleBan(userId: string) {
    setBanningId(userId);
    setBanError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setBanError(data.error);
      } else {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: data.isBanned } : u));
      }
    } catch {
      setBanError("Network error. Please try again.");
    } finally {
      setBanningId(null);
    }
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId);
    setBanError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setBanError(data.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      setBanError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
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
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error);
      } else {
        setPwSuccess("Password changed! Signing you out to refresh session...");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => signOut({ callbackUrl: "/auth" }), 1800);
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }

        .adm-navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--bg-navbar); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent; transition: all 0.3s ease;
        }
        .adm-navbar.scrolled { border-bottom-color: var(--border-default); box-shadow: var(--shadow-navbar); }
        .adm-navbar-inner {
          max-width: 1100px; margin: 0 auto; padding: 14px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .adm-brand { display: flex; align-items: center; gap: 10px; }
        .adm-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          overflow: hidden; flex-shrink: 0;
        }
        .adm-brand-icon img { width: 100%; height: 100%; display: block; }
        .adm-brand-name { font-size: 20px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .adm-badge {
          padding: 3px 10px; border-radius: 999px;
          background: #fef3c7; color: #d97706;
          font-size: 11px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;
        }
        .adm-nav-right { display: flex; align-items: center; gap: 8px; }
        .adm-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .adm-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); }

        .adm-container { max-width: 1100px; margin: 0 auto; padding: 28px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* Warning banner */
        .adm-warning {
          background: #fef9c3; border: 1.5px solid #fde68a; border-radius: 14px;
          padding: 14px 18px; display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: #92400e; font-weight: 500;
        }
        .adm-warning strong { font-weight: 700; }

        /* Stats */
        .adm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .adm-stat { background: var(--bg-card); border-radius: 16px; padding: 18px 20px; box-shadow: var(--shadow-sm); }
        .adm-stat-value { font-size: 28px; font-weight: 800; color: var(--primary); letter-spacing: -1px; }
        .adm-stat-label { font-size: 12px; color: var(--text-subtle); margin-top: 3px; font-weight: 500; }

        /* Card */
        .adm-card { background: var(--bg-card); border-radius: 20px; padding: 24px; box-shadow: var(--shadow-sm); }
        .adm-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .adm-card-title { font-size: 16px; font-weight: 700; color: var(--text-heading); }
        .adm-card-subtitle { font-size: 13px; color: var(--text-subtle); margin-top: 2px; }

        /* Search */
        .adm-search {
          padding: 9px 14px; border: 1.5px solid var(--border-default); border-radius: 10px;
          font-family: inherit; font-size: 13px; color: var(--text-heading);
          outline: none; background: var(--bg-input); width: 220px; transition: all 0.2s;
        }
        .adm-search::placeholder { color: var(--text-subtle); }
        .adm-search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }

        /* Table */
        .adm-table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead th {
          text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600;
          color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border-default);
        }
        tbody tr { border-bottom: 1px solid var(--border-divider); transition: background 0.15s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--bg-elevated); }
        td { padding: 12px; vertical-align: middle; }

        .adm-avatar {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: white;
        }
        .adm-user-cell { display: flex; align-items: center; gap: 10px; }
        .adm-user-name { font-weight: 600; color: var(--text-heading); font-size: 13px; }
        .adm-user-email { font-size: 12px; color: var(--text-subtle); }

        .adm-chip {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600;
        }
        .chip-admin { background: #ede9fe; color: #7c3aed; }
        .chip-active { background: #dcfce7; color: #16a34a; }
        .chip-banned { background: #fee2e2; color: #dc2626; }
        .chip-unverified { background: var(--bg-elevated); color: var(--text-subtle); }

        .adm-ban-btn {
          padding: 6px 14px; border-radius: 8px; border: 1.5px solid;
          font-family: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .adm-ban-btn.ban { border-color: #fca5a5; color: #dc2626; background: transparent; }
        .adm-ban-btn.ban:hover { background: #fee2e2; }
        .adm-ban-btn.unban { border-color: #86efac; color: #16a34a; background: transparent; }
        .adm-ban-btn.unban:hover { background: #dcfce7; }
        .adm-ban-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .adm-delete-btn {
          padding: 6px 14px; border-radius: 8px; border: 1.5px solid #fca5a5;
          font-family: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
          color: #dc2626; background: transparent;
        }
        .adm-delete-btn:hover { background: #fee2e2; }
        .adm-delete-btn.confirm { border-color: #dc2626; background: #dc2626; color: white; }
        .adm-delete-btn.confirm:hover { background: #b91c1c; }
        .adm-delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-action-cell { display: flex; align-items: center; gap: 6px; }
        .adm-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; }
        .adm-empty { text-align: center; padding: 40px; color: var(--text-subtle); font-size: 14px; }
        .adm-pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 16px; font-size: 13px; color: var(--text-subtle); }

        /* Reports */
        .adm-report-filters { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .adm-report-filter {
          padding: 6px 14px; border-radius: 999px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 12px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .adm-report-filter:hover { border-color: var(--primary); color: var(--primary); }
        .adm-report-filter.active { background: var(--primary); border-color: var(--primary); color: white; }
        .adm-report-list { display: flex; flex-direction: column; gap: 12px; }
        .adm-report-item {
          border: 1.5px solid var(--border-default); border-radius: 14px;
          padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
          transition: border-color 0.2s;
        }
        .adm-report-item.open { border-left: 4px solid #f59e0b; }
        .adm-report-item.resolved { border-left: 4px solid #86efac; opacity: 0.75; }
        .adm-report-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .adm-report-user { font-size: 13px; font-weight: 600; color: var(--text-heading); }
        .adm-report-email { font-size: 12px; color: var(--text-subtle); }
        .adm-report-date { font-size: 11px; color: var(--text-subtle); white-space: nowrap; }
        .adm-report-msg { font-size: 13px; color: var(--text-body); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        .adm-report-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .chip-open { background: #fef3c7; color: #d97706; }
        .chip-resolved { background: #dcfce7; color: #16a34a; }
        .adm-resolve-btn {
          padding: 6px 14px; border-radius: 8px;
          border: 1.5px solid #86efac; color: #16a34a; background: transparent;
          font-family: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .adm-resolve-btn:hover { background: #dcfce7; }
        .adm-resolve-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-page-btn { padding: 6px 12px; border-radius: 8px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .adm-page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .adm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Shimmer */
        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Change password collapsible */
        .adm-pw-header {
          display: flex; align-items: center; justify-content: space-between; cursor: pointer;
          user-select: none;
        }
        .adm-pw-toggle {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 9px;
          border: 1.5px solid var(--border-default); background: transparent;
          font-family: inherit; font-size: 12px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .adm-pw-toggle:hover { border-color: var(--primary); color: var(--primary); }

        .pw-form { max-width: 440px; display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
        .pw-field {
          width: 100%; padding: 13px 16px;
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
        .pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 6px; }
        .pw-rule { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-subtle); }
        .pw-rule.met { color: var(--text-success, #16a34a); }
        .pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; }
        .pw-rule.met .pw-rule-dot { background: var(--text-success, #16a34a); }
        .pw-submit {
          padding: 13px 24px; border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; width: fit-content;
        }
        .pw-submit:hover { background: var(--btn-dark-hover); }
        .pw-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .pw-success { background: #dcfce7; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; }
        .pw-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Analytics */
        .adm-analytics-totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
        .adm-atotal { background: var(--bg-elevated); border-radius: 12px; padding: 14px 16px; }
        .adm-atotal-val { font-size: 24px; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; }
        .adm-atotal-lbl { font-size: 11px; color: var(--text-subtle); margin-top: 2px; font-weight: 500; }
        .adm-chart-title { font-size: 13px; font-weight: 600; color: var(--text-heading); margin-bottom: 12px; }
        .adm-chart-wrap { height: 200px; margin-bottom: 24px; }
        .adm-sources-list { display: flex; flex-direction: column; gap: 8px; }
        .adm-source-row { display: flex; align-items: center; gap: 10px; }
        .adm-source-label { font-size: 12px; font-weight: 600; color: var(--text-muted); width: 90px; flex-shrink: 0; }
        .adm-source-bar-wrap { flex: 1; height: 8px; background: var(--bg-elevated); border-radius: 999px; overflow: hidden; }
        .adm-source-bar { height: 100%; background: var(--primary); border-radius: 999px; transition: width 0.6s ease; }
        .adm-source-count { font-size: 12px; font-weight: 700; color: var(--text-subtle); width: 40px; text-align: right; flex-shrink: 0; }

        /* Content moderation */
        .adm-cm-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .adm-cm-filter { padding: 6px 14px; border-radius: 999px; border: 1.5px solid var(--border-default); background: var(--bg-card); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .adm-cm-filter:hover { border-color: var(--primary); color: var(--primary); }
        .adm-cm-filter.active { background: var(--primary); border-color: var(--primary); color: white; }
        .adm-cm-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .adm-cm-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border-default); transition: all 0.2s; }
        .adm-cm-item.hidden { opacity: 0.6; background: var(--bg-elevated); }
        .adm-cm-info { flex: 1; min-width: 0; }
        .adm-cm-title { font-size: 13px; font-weight: 600; color: var(--text-heading); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-decoration: none; }
        .adm-cm-title:hover { color: var(--primary); }
        .adm-cm-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .adm-cm-source { font-size: 10px; font-weight: 700; color: white; padding: 2px 8px; border-radius: 999px; background: #888; }
        .adm-cm-topic { font-size: 11px; color: var(--primary); font-weight: 600; }
        .adm-cm-date { font-size: 11px; color: var(--text-subtle); }
        .adm-hide-btn { flex-shrink: 0; padding: 6px 12px; border-radius: 8px; border: 1.5px solid; font-family: inherit; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .adm-hide-btn.hide { border-color: #fca5a5; color: #dc2626; background: transparent; }
        .adm-hide-btn.hide:hover { background: #fee2e2; }
        .adm-hide-btn.unhide { border-color: #86efac; color: #16a34a; background: transparent; }
        .adm-hide-btn.unhide:hover { background: #dcfce7; }
        .adm-hide-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .chip-hidden { background: #fee2e2; color: #dc2626; }

        @media (max-width: 768px) {
          .adm-stats { grid-template-columns: repeat(2, 1fr); }
          .adm-analytics-totals { grid-template-columns: repeat(2, 1fr); }
          .adm-navbar-inner { padding: 12px 16px; }
          .adm-container { padding: 16px 16px 60px; }
          .adm-search { width: 100%; }
          .adm-card-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <nav className={`adm-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="adm-navbar-inner">
          <div className="adm-brand">
            <div className="adm-brand-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
            <span className="adm-brand-name">Distilled</span>
            <span className="adm-badge">Admin</span>
          </div>
          <div className="adm-nav-right">
            <ThemeToggle />
            <button className="adm-btn" onClick={() => signOut({ callbackUrl: "/auth" })}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="adm-container">

        {/* Default password warning */}
        {mustChangePassword && !pwSuccess && (
          <div className="adm-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span><strong>Security notice:</strong> You are using the default admin password. Please change it below.</span>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="adm-stats">
            {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer" style={{ height: 80 }} />)}
          </div>
        ) : (
          <div className="adm-stats">
            <div className="adm-stat">
              <div className="adm-stat-value">{stats.total}</div>
              <div className="adm-stat-label">Total users</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-value">{stats.active}</div>
              <div className="adm-stat-label">Active users</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-value">{stats.banned}</div>
              <div className="adm-stat-label">Banned</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-value">{stats.unverified}</div>
              <div className="adm-stat-label">Unverified</div>
            </div>
          </div>
        )}

        {/* Analytics */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">Analytics</div>
              <div className="adm-card-subtitle">30-day activity overview</div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="adm-empty">Loading analytics...</div>
          ) : analytics ? (
            <>
              <div className="adm-analytics-totals">
                <div className="adm-atotal">
                  <div className="adm-atotal-val">{analytics.totals.users}</div>
                  <div className="adm-atotal-lbl">Total users</div>
                </div>
                <div className="adm-atotal">
                  <div className="adm-atotal-val">{analytics.totals.active7d}</div>
                  <div className="adm-atotal-lbl">Active (7d)</div>
                </div>
                <div className="adm-atotal">
                  <div className="adm-atotal-val">{analytics.totals.content.toLocaleString()}</div>
                  <div className="adm-atotal-lbl">Articles</div>
                </div>
                <div className="adm-atotal">
                  <div className="adm-atotal-val">{analytics.totals.interactions.toLocaleString()}</div>
                  <div className="adm-atotal-lbl">Interactions</div>
                </div>
              </div>
              <div className="adm-chart-title">Daily Interactions (last 30 days)</div>
              <div className="adm-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "var(--text-subtle)" }}
                      tickLine={false}
                      axisLine={false}
                      interval={6}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-subtle)" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: 10, fontSize: 12 }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <Bar dataKey="interactions" fill="var(--primary)" radius={[3, 3, 0, 0]} name="Interactions" />
                    <Bar dataKey="signups" fill="var(--primary-light, #c7d2fe)" radius={[3, 3, 0, 0]} name="Signups" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {analytics.sources.length > 0 && (
                <>
                  <div className="adm-chart-title">Content by Source</div>
                  <div className="adm-sources-list">
                    {analytics.sources.map((s) => {
                      const max = analytics.sources[0].count;
                      return (
                        <div key={s.source} className="adm-source-row">
                          <span className="adm-source-label">{s.source}</span>
                          <div className="adm-source-bar-wrap">
                            <div className="adm-source-bar" style={{ width: `${(s.count / max) * 100}%` }} />
                          </div>
                          <span className="adm-source-count">{s.count.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="adm-empty">Failed to load analytics.</div>
          )}
        </div>

        {/* Content Moderation */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">Content Moderation</div>
              <div className="adm-card-subtitle">Hide or restore articles from user feeds</div>
            </div>
            <input
              className="adm-search"
              placeholder="Search articles..."
              value={contentSearch}
              onChange={(e) => { setContentSearch(e.target.value); setContentPage(1); }}
            />
          </div>
          <div className="adm-cm-filters">
            {(["all", "visible", "hidden"] as const).map((f) => (
              <button
                key={f}
                className={`adm-cm-filter ${contentFilter === f ? "active" : ""}`}
                onClick={() => { setContentFilter(f); setContentPage(1); }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {contentLoading ? (
            <div className="adm-empty">Loading content...</div>
          ) : contentItems.length === 0 ? (
            <div className="adm-empty">No articles found.</div>
          ) : (
            <div className="adm-cm-list">
              {contentItems.map((item) => (
                <div key={item.id} className={`adm-cm-item ${item.isHidden ? "hidden" : ""}`}>
                  <div className="adm-cm-info">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="adm-cm-title">
                      {item.title}
                    </a>
                    <div className="adm-cm-meta">
                      <span className="adm-cm-source">{item.source}</span>
                      {item.topic && <span className="adm-cm-topic">{item.topic.emoji} {item.topic.name}</span>}
                      {item.publishedAt && (
                        <span className="adm-cm-date">
                          {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {item.isHidden && <span className="adm-chip chip-hidden" style={{ fontSize: 10, padding: "2px 8px" }}>Hidden</span>}
                    </div>
                  </div>
                  <button
                    className={`adm-hide-btn ${item.isHidden ? "unhide" : "hide"}`}
                    disabled={hidingId === item.id}
                    onClick={() => handleToggleHide(item.id)}
                  >
                    {hidingId === item.id ? "..." : item.isHidden ? "Unhide" : "Hide"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {contentTotal > CONTENT_PAGE_SIZE && (
            <div className="adm-pagination">
              <span>{(contentPage - 1) * CONTENT_PAGE_SIZE + 1}–{Math.min(contentPage * CONTENT_PAGE_SIZE, contentTotal)} of {contentTotal}</span>
              <button className="adm-page-btn" disabled={contentPage === 1} onClick={() => setContentPage((p) => p - 1)}>← Prev</button>
              <button className="adm-page-btn" disabled={contentPage * CONTENT_PAGE_SIZE >= contentTotal} onClick={() => setContentPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        {/* Users table — always visible */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">User Management</div>
              <div className="adm-card-subtitle">View, search, and ban/unban users</div>
            </div>
            <input
              className="adm-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {banError && <div className="adm-error" style={{marginBottom: 12}}>{banError}</div>}

          {loading ? (
            <div className="adm-empty">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="adm-empty">{search ? "No users match your search." : "No users yet."}</div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-avatar">
                            {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="adm-user-name">{user.name ?? "—"}</div>
                            <div className="adm-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.role === "ADMIN" ? (
                          <span className="adm-chip chip-admin">Admin</span>
                        ) : (
                          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>User</span>
                        )}
                      </td>
                      <td>
                        {user.isBanned ? (
                          <span className="adm-chip chip-banned">Banned</span>
                        ) : !user.emailVerified ? (
                          <span className="adm-chip chip-unverified">Unverified</span>
                        ) : (
                          <span className="adm-chip chip-active">Active</span>
                        )}
                      </td>
                      <td style={{ color: "var(--text-subtle)", fontSize: 13 }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td>
                        {user.role !== "ADMIN" ? (
                          <div className="adm-action-cell">
                            <button
                              className={`adm-ban-btn ${user.isBanned ? "unban" : "ban"}`}
                              disabled={banningId === user.id}
                              onClick={() => handleBan(user.id)}
                            >
                              {banningId === user.id ? "..." : user.isBanned ? "Unban" : "Ban"}
                            </button>
                            {deleteConfirmId === user.id ? (
                              <>
                                <button
                                  className="adm-delete-btn confirm"
                                  disabled={deletingId === user.id}
                                  onClick={() => handleDelete(user.id)}
                                >
                                  {deletingId === user.id ? "..." : "Confirm"}
                                </button>
                                <button
                                  className="adm-delete-btn"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="adm-delete-btn"
                                onClick={() => setDeleteConfirmId(user.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > PAGE_SIZE && (
            <div className="adm-pagination">
              <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
              <button className="adm-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <button className="adm-page-btn" disabled={page * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        {/* User Reports */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">User Reports</div>
              <div className="adm-card-subtitle">
                Issues submitted by users · {reports.filter((r) => r.status === "OPEN").length} open
              </div>
            </div>
          </div>

          <div className="adm-report-filters">
            {(["OPEN", "ALL", "RESOLVED"] as const).map((f) => (
              <button
                key={f}
                className={`adm-report-filter ${reportFilter === f ? "active" : ""}`}
                onClick={() => setReportFilter(f)}
              >
                {f === "ALL" ? "All" : f === "OPEN" ? "Open" : "Resolved"}
              </button>
            ))}
          </div>

          {reportsLoading ? (
            <div className="adm-empty">Loading reports...</div>
          ) : (() => {
            const filtered = reports.filter((r) => reportFilter === "ALL" || r.status === reportFilter);
            if (filtered.length === 0) {
              return <div className="adm-empty">{reportFilter === "OPEN" ? "No open reports." : "No reports yet."}</div>;
            }
            return (
              <div className="adm-report-list">
                {filtered.map((report) => (
                  <div key={report.id} className={`adm-report-item ${report.status === "OPEN" ? "open" : "resolved"}`}>
                    <div className="adm-report-header">
                      <div>
                        <div className="adm-report-user">{report.user.name ?? "—"}</div>
                        <div className="adm-report-email">{report.user.email}</div>
                      </div>
                      <div className="adm-report-date">
                        {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                    <div className="adm-report-msg">{report.message}</div>
                    <div className="adm-report-footer">
                      <span className={`adm-chip ${report.status === "OPEN" ? "chip-open" : "chip-resolved"}`}>
                        {report.status === "OPEN" ? "Open" : "Resolved"}
                      </span>
                      {report.status === "OPEN" && (
                        <button
                          className="adm-resolve-btn"
                          disabled={resolvingId === report.id}
                          onClick={() => handleResolve(report.id)}
                        >
                          {resolvingId === report.id ? "..." : "Mark Resolved"}
                        </button>
                      )}
                      {report.status === "RESOLVED" && report.resolvedAt && (
                        <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                          Resolved {new Date(report.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Change password — collapsible at the bottom */}
        <div className="adm-card">
          <div className="adm-pw-header">
            <div>
              <div className="adm-card-title">Account Security</div>
              {!showChangePw && <div className="adm-card-subtitle">Change your admin password</div>}
            </div>
            <button
              className="adm-pw-toggle"
              onClick={() => { setShowChangePw((v) => !v); setPwError(""); setPwSuccess(""); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {showChangePw ? "Cancel" : "Change password"}
            </button>
          </div>

          {showChangePw && (
            <form className="pw-form" onSubmit={handleChangePassword}>
              <div className="pw-wrap">
                <input
                  className="pw-field"
                  type={showPw ? "text" : "password"}
                  placeholder="Current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)}>
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
                  className="pw-field"
                  type={showPw ? "text" : "password"}
                  placeholder="New password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
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

              <input
                className="pw-field"
                type={showPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />

              {pwError && <div className="adm-error">{pwError}</div>}
              {pwSuccess && <div className="pw-success">{pwSuccess}</div>}

              <button type="submit" className="pw-submit" disabled={pwLoading}>
                {pwLoading ? <span className="pw-spinner" /> : "Update password"}
              </button>
            </form>
          )}
        </div>

      </div>
    </>
  );
}
