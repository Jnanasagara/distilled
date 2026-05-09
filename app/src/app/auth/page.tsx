"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarPicker from "@/components/AvatarPicker";
import { AVATAR_SEEDS } from "@/lib/avatars";

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
  const [avatarStep, setAvatarStep] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(AVATAR_SEEDS[0]);
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
        // Show avatar picker before creating account
        setLoading(false);
        setAvatarStep(true);
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
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }

        /* ── LAYOUT ── */
        .auth-layout {
          display: flex; min-height: 100vh;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          width: 44%; flex-shrink: 0;
          background: #0c0c0c;
          border-right: 1px solid #1e1e1e;
          display: flex; flex-direction: column;
          padding: 40px 48px;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .auth-left-logo {
          display: flex; align-items: center; gap: 9px;
          position: relative; z-index: 1;
        }
        .auth-left-logo-icon {
          width: 30px; height: 30px; border-radius: 7px;
          overflow: hidden; flex-shrink: 0;
        }
        .auth-left-logo-icon img { width: 100%; height: 100%; display: block; }
        .auth-left-logo-name { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }

        .auth-left-body {
          flex: 1; display: flex; flex-direction: column; justify-content: center;
          position: relative; z-index: 1; padding: 40px 0;
        }
        .auth-left-headline {
          font-size: clamp(24px, 2.5vw, 34px); font-weight: 800;
          color: #fff; letter-spacing: -1px; line-height: 1.1; margin-bottom: 16px;
        }
        .auth-left-sub {
          font-size: 14px; color: rgba(255,255,255,0.42); line-height: 1.65;
          max-width: 320px; margin-bottom: 36px;
        }
        .auth-left-features { display: flex; flex-direction: column; gap: 14px; }
        .auth-left-feat {
          display: flex; align-items: flex-start; gap: 11px;
        }
        .auth-left-feat-dot {
          width: 20px; height: 20px; border-radius: 6px;
          background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .auth-left-feat-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }
        .auth-left-feat-text strong { color: rgba(255,255,255,0.75); font-weight: 600; }

        .auth-left-footer {
          font-size: 12px; color: rgba(255,255,255,0.2);
          position: relative; z-index: 1;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          flex: 1; background: var(--bg-page);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 32px; position: relative;
          transition: background 0.3s ease;
        }

        /* Theme toggle */
        .auth-theme-toggle { position: absolute; top: 20px; right: 20px; z-index: 100; }
        .theme-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1px solid var(--border-default); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted); transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover { border-color: var(--primary); color: var(--primary); }

        .auth-right-inner {
          width: 100%; max-width: 380px;
        }

        /* Mobile logo (hidden on desktop) */
        .auth-mobile-logo {
          display: none; align-items: center; gap: 9px;
          margin-bottom: 32px;
        }
        .auth-mobile-logo-icon {
          width: 28px; height: 28px; border-radius: 7px;
          overflow: hidden; flex-shrink: 0;
        }
        .auth-mobile-logo-icon img { width: 100%; height: 100%; display: block; }
        .auth-mobile-logo-name { font-size: 16px; font-weight: 700; color: var(--text-heading); letter-spacing: -0.3px; }

        /* Form heading */
        .auth-heading {
          font-size: 22px; font-weight: 800; color: var(--text-heading);
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .auth-subheading {
          font-size: 14px; color: var(--text-subtle); margin-bottom: 28px; line-height: 1.5;
        }

        /* Card - now just a subtle container */
        .auth-card {
          background: var(--bg-card);
          border-radius: 14px;
          border: 1px solid var(--border-default);
          padding: 28px;
          box-shadow: var(--shadow-sm);
        }

        /* Toggle */
        .auth-toggle {
          display: flex; gap: 3px;
          background: var(--bg-elevated); border-radius: 10px;
          padding: 3px; margin-bottom: 24px;
          border: 1px solid var(--border-default);
        }
        .auth-toggle-btn {
          flex: 1; padding: 9px;
          border: none; border-radius: 8px;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
          background: transparent; color: var(--text-subtle);
        }
        .auth-toggle-btn.active {
          background: var(--text-heading); color: var(--bg-page);
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        /* Form */
        .auth-fields { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .auth-field {
          width: 100%; padding: 12px 14px;
          border: 1px solid var(--border-default); border-radius: 10px;
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
        .auth-password-wrap .auth-field { padding-right: 44px; }
        .auth-eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); display: flex; align-items: center;
          padding: 0; transition: color 0.2s ease;
        }
        .auth-eye-btn:hover { color: var(--text-heading); }

        .pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
        .pw-rule { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-subtle); transition: color 0.2s ease; }
        .pw-rule.met { color: var(--text-success, #16a34a); }
        .pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; transition: background 0.2s ease; }
        .pw-rule.met .pw-rule-dot { background: var(--text-success, #16a34a); }

        .auth-error {
          background: var(--bg-error); color: var(--text-error);
          font-size: 13px; font-weight: 500;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 14px; border: 1px solid var(--border-error);
        }

        .auth-submit {
          width: 100%; padding: 13px;
          border: none; border-radius: 10px;
          background: var(--text-heading); color: var(--bg-page);
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: opacity 0.15s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-submit:hover { opacity: 0.88; }
        .auth-submit:active { transform: scale(0.99); }
        .auth-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .auth-spinner {
          width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.25);
          border-top-color: currentColor; border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-success {
          background: var(--bg-success); color: var(--text-success);
          font-size: 13px; font-weight: 500;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 14px;
        }

        .check-email-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: var(--primary-light); border: 1px solid rgba(249,115,22,0.2);
          margin: 0 auto 18px;
          display: flex; align-items: center; justify-content: center; font-size: 28px;
        }
        .check-email-title { font-size: 19px; font-weight: 800; color: var(--text-heading); margin: 0 0 8px; text-align: center; }
        .check-email-text { font-size: 13.5px; color: var(--text-subtle); line-height: 1.6; text-align: center; margin: 0 0 22px; }
        .check-email-btn {
          width: 100%; padding: 12px; border: 1px solid var(--border-default);
          border-radius: 10px; background: transparent;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .check-email-btn:hover { border-color: var(--border-hover); color: var(--primary); }

        .auth-forgot-link {
          background: none; border: none; color: var(--text-subtle);
          font-family: inherit; font-size: 12px; font-weight: 500;
          cursor: pointer; padding: 0; margin-top: 6px;
          display: block; text-align: right; transition: color 0.2s;
        }
        .auth-forgot-link:hover { color: var(--primary); }

        .auth-footer { text-align: center; font-size: 13px; color: var(--text-subtle); margin-top: 18px; }
        .auth-footer-link {
          background: none; border: none; color: var(--primary);
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; margin-left: 4px; padding: 0;
        }
        .auth-footer-link:hover { text-decoration: underline; }

        /* Google button */
        .auth-google-btn {
          width: 100%; padding: 12px 14px;
          border: 1px solid var(--border-default); border-radius: 10px;
          background: var(--bg-elevated); color: var(--text-heading);
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 18px;
        }
        .auth-google-btn:hover { border-color: var(--border-hover); background: var(--bg-card); }
        .auth-google-btn:active { transform: scale(0.99); }
        .auth-google-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 18px; color: var(--text-subtle); font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border-default);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 32px 24px; justify-content: flex-start; padding-top: 72px; }
          .auth-mobile-logo { display: flex; }
        }
        @media (max-width: 480px) {
          .auth-card { padding: 22px; }
          .auth-right { padding: 64px 20px 32px; }
        }
      `}</style>

      <div className="auth-layout">

        {/* ── LEFT BRAND PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
            <span className="auth-left-logo-name">Distilled</span>
          </div>

          <div className="auth-left-body">
            <h2 className="auth-left-headline">
              Your feed,<br />actually worth<br />reading.
            </h2>
            <p className="auth-left-sub">
              Curated from Reddit, Hacker News, Dev.to, and RSS. Ranked by your interests, summarized by AI.
            </p>
            <div className="auth-left-features">
              {[
                { icon: "✦", text: <><strong>AI summary + impact</strong> on every article</> },
                { icon: "✦", text: <><strong>Ranked by what you engage with</strong>, not by virality</> },
                { icon: "✦", text: <><strong>Daily, weekly, or monthly digest</strong> by email</> },
              ].map((f, i) => (
                <div key={i} className="auth-left-feat">
                  <div className="auth-left-feat-dot">
                    <span style={{ fontSize: 9, color: "#f97316", fontWeight: 700 }}>{f.icon}</span>
                  </div>
                  <span className="auth-left-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-left-footer">Free to use · No credit card required</div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="auth-right">
          <div className="auth-theme-toggle">
            <ThemeToggle />
          </div>

          <div className="auth-right-inner">
            {/* Mobile-only logo */}
            <div className="auth-mobile-logo">
              <div className="auth-mobile-logo-icon"><img src="/android-chrome-192x192.png" alt="Distilled" /></div>
              <span className="auth-mobile-logo-name">Distilled</span>
            </div>

            {!checkEmail && mode !== "forgot" && (
              <div style={{ marginBottom: 20 }}>
                <h1 className="auth-heading">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="auth-subheading">
                  {mode === "login" ? "Sign in to your Distilled account." : "Start reading smarter in under a minute."}
                </p>
              </div>
            )}

          <div className="auth-card">
            {avatarStep ? (
              <AvatarPicker
                mode="inline"
                currentSeed={pendingAvatar}
                saveLabel="Continue"
                cancelLabel="Back"
                onCancel={() => setAvatarStep(false)}
                onSave={async (seed) => {
                  setPendingAvatar(seed);
                  setLoading(true);
                  setError("");
                  try {
                    const res = await fetch("/api/auth/signup", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, email, password, avatarSeed: seed }),
                    });
                    const data = await res.json();
                    if (!res.ok) { setError(data.error); setAvatarStep(false); }
                    else { setAvatarStep(false); setCheckEmail(true); }
                  } catch {
                    setError("Network error. Please try again.");
                    setAvatarStep(false);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            ) : checkEmail ? (
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

            <button
              type="button"
              className="auth-google-btn"
              onClick={() => signIn("google", { callbackUrl: "/feed" })}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">or continue with email</div>

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
                      <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>
                        Tip: adding numbers and special characters makes your password stronger.
                      </div>
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
                    style={{ width: 15, height: 15, accentColor: "#f97316", cursor: "pointer" }}
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
          </div>{/* auth-right-inner */}
        </div>{/* auth-right */}
      </div>{/* auth-layout */}
    </>
  );
}
