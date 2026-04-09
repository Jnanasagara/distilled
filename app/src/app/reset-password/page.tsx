"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pwRules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (pwRules.some((r) => !r.met)) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth"), 2500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg-page); -webkit-font-smoothing: antialiased; }

        .rp-page {
          min-height: 100vh; background: var(--bg-page);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 24px; position: relative; overflow: hidden;
        }
        .rp-page::before {
          content: ''; position: absolute; top: -40%; right: -20%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, var(--overlay-radial-1) 0%, transparent 70%);
          pointer-events: none;
        }
        .rp-theme-toggle { position: fixed; top: 20px; right: 20px; z-index: 100; }
        .theme-toggle-btn {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); }

        .rp-content { position: relative; z-index: 1; width: 100%; max-width: 420px; }
        .rp-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; justify-content: center; }
        .rp-brand-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 20px;
        }
        .rp-brand-name { font-size: 28px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }

        .rp-card {
          background: var(--bg-card); border-radius: 20px;
          padding: 32px; width: 100%; box-shadow: var(--shadow-sm);
        }
        .rp-title { font-size: 20px; font-weight: 800; color: var(--text-heading); margin-bottom: 6px; }
        .rp-subtitle { font-size: 14px; color: var(--text-subtle); margin-bottom: 24px; line-height: 1.5; }

        .rp-fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .rp-field {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s ease; background: var(--bg-input);
        }
        .rp-field::placeholder { color: var(--text-subtle); }
        .rp-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: var(--bg-input-focus); }

        .rp-password-wrap { position: relative; }
        .rp-password-wrap .rp-field { padding-right: 46px; }
        .rp-eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); display: flex; align-items: center; padding: 0;
        }
        .rp-eye-btn:hover { color: var(--text-heading); }

        .pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
        .pw-rule { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-subtle); }
        .pw-rule.met { color: var(--text-success, #16a34a); }
        .pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; }
        .pw-rule.met .pw-rule-dot { background: var(--text-success, #16a34a); }

        .rp-error {
          background: var(--bg-error); color: var(--text-error);
          font-size: 13px; font-weight: 500; padding: 10px 14px;
          border-radius: 10px; margin-bottom: 16px; text-align: center;
        }
        .rp-success {
          background: var(--bg-success, #f0fdf4); color: var(--text-success, #16a34a);
          font-size: 14px; font-weight: 600; padding: 16px;
          border-radius: 12px; text-align: center; line-height: 1.5;
        }
        .rp-submit {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rp-submit:hover { background: var(--btn-dark-hover); transform: translateY(-1px); }
        .rp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .rp-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rp-back { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-subtle); }
        .rp-back-link {
          background: none; border: none; color: var(--primary);
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; padding: 0; margin-left: 4px;
        }
        .rp-back-link:hover { text-decoration: underline; }
      `}</style>

      <div className="rp-page">
        <div className="rp-theme-toggle"><ThemeToggle /></div>
        <div className="rp-content">
          <div className="rp-brand">
            <div className="rp-brand-icon">D</div>
            <span className="rp-brand-name">Distilled</span>
          </div>

          <div className="rp-card">
            {!token ? (
              <div className="rp-error">Invalid reset link. Please request a new one.</div>
            ) : success ? (
              <div className="rp-success">
                Password updated! Redirecting to login...
              </div>
            ) : (
              <>
                <div className="rp-title">Set new password</div>
                <div className="rp-subtitle">Choose a strong password for your account.</div>

                <form onSubmit={handleSubmit}>
                  <div className="rp-fields">
                    <div>
                      <div className="rp-password-wrap">
                        <input
                          className="rp-field"
                          type={showPassword ? "text" : "password"}
                          placeholder="New password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button type="button" className="rp-eye-btn" onClick={() => setShowPassword((v) => !v)}>
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="pw-rules">
                          {pwRules.map((rule) => (
                            <div key={rule.label} className={`pw-rule ${rule.met ? "met" : ""}`}>
                              <span className="pw-rule-dot" />
                              {rule.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      className="rp-field"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  {error && <div className="rp-error">{error}</div>}

                  <button type="submit" className="rp-submit" disabled={loading}>
                    {loading ? <div className="rp-spinner" /> : <>Update password <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
                  </button>
                </form>
              </>
            )}

            <p className="rp-back">
              Remembered it?
              <button className="rp-back-link" onClick={() => router.push("/auth")}>Back to login</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
