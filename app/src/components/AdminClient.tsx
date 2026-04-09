"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

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

type ChangePwForm = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function AdminClient({ mustChangePassword }: { mustChangePassword: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [banningId, setBanningId] = useState<string | null>(null);
  const [banError, setBanError] = useState("");

  const [showChangePw, setShowChangePw] = useState(mustChangePassword);
  const [pwForm, setPwForm] = useState<ChangePwForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const pwRules = [
    { label: "At least 8 characters", met: pwForm.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwForm.newPassword) },
    { label: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwForm.newPassword) },
  ];

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px;
        }
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

        .adm-error { background: var(--bg-error); color: var(--text-error); font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; }
        .adm-empty { text-align: center; padding: 40px; color: var(--text-subtle); font-size: 14px; }

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

        @media (max-width: 768px) {
          .adm-stats { grid-template-columns: repeat(2, 1fr); }
          .adm-navbar-inner { padding: 12px 16px; }
          .adm-container { padding: 16px 16px 60px; }
          .adm-search { width: 100%; }
          .adm-card-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <nav className={`adm-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="adm-navbar-inner">
          <div className="adm-brand">
            <div className="adm-brand-icon">D</div>
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

          {banError && <div className="adm-error">{banError}</div>}

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
                          <button
                            className={`adm-ban-btn ${user.isBanned ? "unban" : "ban"}`}
                            disabled={banningId === user.id}
                            onClick={() => handleBan(user.id)}
                          >
                            {banningId === user.id ? "..." : user.isBanned ? "Unban" : "Ban"}
                          </button>
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
