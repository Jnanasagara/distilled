"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const verified = searchParams?.get("verified") === "1";
  const tokenError = searchParams?.get("error");

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const pwRules = mode === "signup" ? [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ] : [];

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); }
      else { setForgotSent(true); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        if (!EMAIL_REGEX.test(email)) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
        if (pwRules.some((r) => !r.met)) {
          setError("Please meet all password requirements.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        setCheckEmail(true);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, rememberMe: String(rememberMe), redirect: false });
      if (!result?.ok) { setError(result?.error ?? "Invalid email or password."); setLoading(false); return; }
      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else if (!session?.user?.onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/feed");
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
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; background: var(--bg-page); transition: background 0.3s ease; }

        .auth-page {
          min-height: 100vh;
          background: var(--bg-page);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
          position: relative; overflow: hidden;
          transition: background 0.3s ease;
        }

        .auth-page::before {
          content: '';
          position: absolute; top: -40%; right: -20%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, var(--overlay-radial-1) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-page::after {
          content: '';
          position: absolute; bottom: -30%; left: -15%;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, var(--overlay-radial-2) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Theme toggle */
        .auth-theme-toggle { position: fixed; top: 20px; right: 20px; z-index: 100; }
        .theme-toggle-btn {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1.5px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        .auth-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 420px;
        }

        /* Branding */
        .auth-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        .auth-brand-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, var(--gradient-brand-start), var(--gradient-brand-end));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 20px;
        }
        .auth-brand-name {
          font-size: 28px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px;
        }

        .auth-tagline { text-align: center; margin-bottom: 36px; }
        .auth-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; background: var(--bg-accent);
          border-radius: 999px; color: var(--primary);
          font-size: 12px; font-weight: 600;
          margin-bottom: 12px; letter-spacing: 0.02em;
        }
        .auth-headline {
          font-size: 15px; color: var(--text-subtle);
          line-height: 1.6; max-width: 360px; margin: 0;
        }

        /* Card */
        .auth-card {
          background: var(--bg-card); border-radius: 20px;
          padding: 32px; width: 100%;
          box-shadow: var(--shadow-sm);
          transition: background 0.3s ease;
        }

        /* Toggle */
        .auth-toggle {
          display: flex; gap: 4px;
          background: var(--bg-toggle); border-radius: 12px;
          padding: 4px; margin-bottom: 24px;
        }
        .auth-toggle-btn {
          flex: 1; padding: 10px;
          border: none; border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
          background: transparent; color: var(--text-subtle);
        }
        .auth-toggle-btn.active {
          background: var(--btn-dark); color: var(--text-inverse);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Form */
        .auth-fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .auth-field {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid var(--border-default); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s ease;
          background: var(--bg-input);
        }
        .auth-field::placeholder { color: var(--text-subtle); }
        .auth-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
          background: var(--bg-input-focus);
        }

        .auth-password-wrap { position: relative; }
        .auth-password-wrap .auth-field { padding-right: 46px; }
        .auth-eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); display: flex; align-items: center;
          padding: 0; transition: color 0.2s ease;
        }
        .auth-eye-btn:hover { color: var(--text-heading); }

        .pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
        .pw-rule {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-subtle); transition: color 0.2s ease;
        }
        .pw-rule.met { color: var(--text-success, #16a34a); }
        .pw-rule-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--border-default); flex-shrink: 0; transition: background 0.2s ease;
        }
        .pw-rule.met .pw-rule-dot { background: var(--text-success, #16a34a); }

        .auth-error {
          background: var(--bg-error); color: var(--text-error);
          font-size: 13px; font-weight: 500;
          padding: 10px 14px; border-radius: 10px;
          margin-bottom: 16px; text-align: center;
        }

        .auth-submit {
          width: 100%; padding: 14px;
          border: none; border-radius: 12px;
          background: var(--btn-dark); color: var(--text-inverse);
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-submit:hover { background: var(--btn-dark-hover); transform: translateY(-1px); box-shadow: 0 4px 16px var(--primary-shadow); }
        .auth-submit:active { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .auth-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-success {
          background: var(--bg-success, #f0fdf4); color: var(--text-success, #16a34a);
          font-size: 13px; font-weight: 500;
          padding: 10px 14px; border-radius: 10px;
          margin-bottom: 16px; text-align: center;
        }

        .check-email-icon {
          width: 64px; height: 64px; border-radius: 16px;
          background: var(--bg-accent); margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
        }
        .check-email-title { font-size: 20px; font-weight: 800; color: var(--text-heading); margin: 0 0 8px; text-align: center; }
        .check-email-text { font-size: 14px; color: var(--text-subtle); line-height: 1.6; text-align: center; margin: 0 0 24px; }
        .check-email-btn {
          width: 100%; padding: 13px; border: 1.5px solid var(--border-default);
          border-radius: 12px; background: var(--bg-card);
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .check-email-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-accent); }

        .auth-forgot-link {
          background: none; border: none; color: var(--text-subtle);
          font-family: inherit; font-size: 12px; font-weight: 500;
          cursor: pointer; padding: 0; margin-top: 8px;
          display: block; text-align: right; transition: color 0.2s;
        }
        .auth-forgot-link:hover { color: var(--primary); }

        .auth-footer { text-align: center; font-size: 13px; color: var(--text-subtle); margin-top: 20px; }
        .auth-footer-link {
          background: none; border: none;
          color: var(--primary); font-family: inherit;
          font-size: 13px; font-weight: 600;
          cursor: pointer; margin-left: 4px; padding: 0;
        }
        .auth-footer-link:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .auth-card { padding: 24px; }
          .auth-brand-name { font-size: 24px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-theme-toggle">
          <ThemeToggle />
        </div>

        <div className="auth-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">D</div>
            <span className="auth-brand-name">Distilled</span>
          </div>

          <div className="auth-tagline">
            <div className="auth-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Mindful Content Consumption
            </div>
            <p className="auth-headline">
              Cut through the noise. Get curated, relevant content tailored to your interests.
            </p>
          </div>

          <div className="auth-card">
            {checkEmail ? (
              <>
                <div className="check-email-icon">📬</div>
                <h2 className="check-email-title">Check your email</h2>
                <p className="check-email-text">
                  We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
                  <br /><br />
                  The link expires in 24 hours.
                </p>
                <button className="check-email-btn" onClick={() => { setCheckEmail(false); setMode("login"); }}>
                  Back to Login
                </button>
              </>
            ) : mode === "forgot" ? (
              <>
                {forgotSent ? (
                  <>
                    <div className="check-email-icon">✉️</div>
                    <h2 className="check-email-title">Check your inbox</h2>
                    <p className="check-email-text">
                      If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox (and spam folder).
                      <br /><br />
                      The link expires in 1 hour.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="check-email-title" style={{ marginBottom: 8 }}>Forgot password?</h2>
                    <p className="check-email-text" style={{ marginBottom: 20 }}>
                      Enter your email and we&#39;ll send you a reset link.
                    </p>
                    <form onSubmit={handleForgotPassword}>
                      <div className="auth-fields">
                        <input
                          className="auth-field"
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      {error && <div className="auth-error">{error}</div>}
                      <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? <div className="auth-spinner" /> : <>Send reset link <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
                      </button>
                    </form>
                  </>
                )}
                <button className="check-email-btn" style={{ marginTop: 16 }} onClick={() => { setMode("login"); setForgotSent(false); setError(""); }}>
                  Back to Login
                </button>
              </>
            ) : (
            <>
            {verified && (
              <div className="auth-success">Email verified! You can now log in.</div>
            )}
            {tokenError === "expired-token" && (
              <div className="auth-error">Verification link has expired. Please sign up again.</div>
            )}
            {(tokenError === "invalid-token" || tokenError === "missing-token") && (
              <div className="auth-error">Invalid verification link. Please sign up again.</div>
            )}
            <div className="auth-toggle">
              <button
                type="button"
                className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-toggle-btn ${mode === "signup" ? "active" : ""}`}
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-fields">
                {mode === "signup" && (
                  <input
                    className="auth-field"
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                )}
                <input
                  className="auth-field"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <div>
                  <div className="auth-password-wrap">
                    <input
                      className="auth-field"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
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
                  {mode === "signup" && password.length > 0 && (
                    <div className="pw-rules">
                      {pwRules.map((rule) => (
                        <div key={rule.label} className={`pw-rule ${rule.met ? "met" : ""}`}>
                          <span className="pw-rule-dot" />
                          {rule.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {mode === "login" && (
                    <button type="button" className="auth-forgot-link" onClick={() => { setMode("forgot"); setError(""); }}>
                      Forgot password?
                    </button>
                  )}
                </div>
              </div>

              {mode === "login" && (
                <label style={{
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", fontSize: 13, color: "var(--text-muted)",
                  userSelect: "none",
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer" }}
                  />
                  Remember me
                </label>
              )}

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    {mode === "login" ? "Login" : "Create Account"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="auth-footer-link"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              >
                {mode === "login" ? "Sign up" : "Login"}
              </button>
            </p>
            </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
