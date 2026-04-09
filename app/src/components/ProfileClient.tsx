"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";

const TOPIC_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

type ProfileData = {
  user: { name: string | null; email: string; createdAt: string };
  stats: { likes: number; saves: number; clicks: number };
  topicWeights: { name: string; emoji: string; weight: number; status: string }[];
  weeklyActivity: Record<string, string | number>[];
  weeklyTopicNames: string[];
};

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
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
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

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-page); font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }

        .prof-navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--bg-navbar);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent; transition: all 0.3s ease;
        }
        .prof-navbar.scrolled { border-bottom-color: var(--border-default); box-shadow: var(--shadow-navbar); }
        .prof-navbar-inner {
          max-width: 900px; margin: 0 auto; padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .prof-brand { display: flex; align-items: center; gap: 10px; }
        .prof-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px;
        }
        .prof-brand-name { font-size: 22px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
        .prof-nav-right { display: flex; align-items: center; gap: 8px; }
        .prof-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .prof-back-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }
        @media (max-width: 640px) {
          .prof-back-btn span { display: none; }
          .prof-back-btn { padding: 8px 10px; }
          .prof-brand-name { font-size: 18px; }
        }
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
          background: var(--bg-card); border-radius: 20px;
          padding: 28px; box-shadow: var(--shadow-sm);
          display: flex; align-items: center; gap: 24px;
        }
        .prof-avatar {
          width: 72px; height: 72px; border-radius: 20px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px;
        }
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
          background: var(--bg-card); border-radius: 16px;
          padding: 20px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .prof-stat-value { font-size: 32px; font-weight: 800; color: var(--primary); letter-spacing: -1px; }
        .prof-stat-label { font-size: 13px; color: var(--text-subtle); margin-top: 4px; font-weight: 500; }

        /* Chart cards */
        .prof-card {
          background: var(--bg-card); border-radius: 20px;
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

        /* Empty state */
        .prof-empty { text-align: center; padding: 40px 20px; color: var(--text-subtle); font-size: 14px; }

        /* Skeleton */
        .shimmer {
          background: linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-skeleton-shine) 50%, var(--bg-skeleton) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 640px) {
          .prof-hero { flex-direction: column; text-align: center; }
          .prof-stats { grid-template-columns: 1fr; }
          .prof-navbar-inner { padding: 12px 16px; }
          .prof-container { padding: 20px 16px 60px; }
        }
      `}</style>

      <nav className={`prof-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="prof-navbar-inner">
          <div className="prof-brand">
            <div className="prof-brand-icon">D</div>
            <span className="prof-brand-name">Distilled</span>
          </div>
          <div className="prof-nav-right">
            <ThemeToggle />
            <button className="prof-back-btn" onClick={() => router.push("/feed")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Feed
            </button>
            <button className="prof-back-btn" onClick={() => signOut({ callbackUrl: `${window.location.origin}/auth` })} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="prof-container">
        {loading ? (
          <>
            <div className="shimmer" style={{ height: 120 }} />
            <div className="prof-stats">
              {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 90 }} />)}
            </div>
            <div className="shimmer" style={{ height: 280 }} />
            <div className="shimmer" style={{ height: 280 }} />
          </>
        ) : !data ? (
          <div className="prof-empty">Failed to load profile.</div>
        ) : (
          <>
            {/* Hero */}
            <div className="prof-hero">
              <div className="prof-avatar">
                {(data.user.name ?? data.user.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="prof-info">
                <div className="prof-name">{data.user.name ?? "No name set"}</div>
                <div className="prof-email">{data.user.email}</div>
                <span className="prof-since">
                  ⏱ Member for {memberSince(data.user.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="prof-stats">
              <div className="prof-stat">
                <div className="prof-stat-value">{data.stats.likes}</div>
                <div className="prof-stat-label">❤️ Liked</div>
              </div>
              <div className="prof-stat">
                <div className="prof-stat-value">{data.stats.saves}</div>
                <div className="prof-stat-label">🔖 Saved</div>
              </div>
              <div className="prof-stat">
                <div className="prof-stat-value">{data.stats.clicks}</div>
                <div className="prof-stat-label">👆 Read</div>
              </div>
            </div>

            {/* Change Password */}
            <div className="prof-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showChangePw ? 0 : 0 }}>
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

            {/* Topic interest bar chart */}
            <div className="prof-card">
              <div className="prof-card-title">Your Interests</div>
              <div className="prof-card-desc">Topic weights — higher means you engage more with this topic.</div>
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
                        formatter={(val, _, props: any) => [`${val} weight`, `${props.payload.emoji} ${props.payload.name}`]}
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
                          {t.emoji} {t.name}
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
          </>
        )}
      </div>
    </>
  );
}
