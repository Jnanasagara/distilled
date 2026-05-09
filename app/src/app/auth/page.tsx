"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  const [suggestSignup, setSuggestSignup] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setForgotSent(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(""); setSuggestSignup(false);

    try {
      if (mode === "signup") {
        if (!EMAIL_REGEX.test(email)) { setError("Please enter a valid email address."); setLoading(false); return; }
        if (pwRules.some((r) => !r.met)) { setError("Please meet all password requirements."); setLoading(false); return; }
        if (!agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy to continue."); setLoading(false); return; }
        setLoading(false); setAvatarStep(true); return;
      }

      const result = await signIn("credentials", { email, password, rememberMe: String(rememberMe), redirect: false });
      if (!result?.ok) {
        const errMsg = result?.error ?? "Invalid email or password.";
        setError(errMsg);
        // suggest signup if account likely doesn't exist
        if (errMsg.toLowerCase().includes("no user") || errMsg.toLowerCase().includes("not found") || errMsg === "CredentialsSignin" || errMsg.includes("Invalid email or password")) {
          setSuggestSignup(true);
        }
        setLoading(false); return;
      }
      const session = await getSession();
      if (session?.user?.role === "ADMIN") router.push("/admin");
      else if (!session?.user?.onboarded) router.push("/onboarding");
      else router.push("/feed");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const FEATURES = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
      title: "AI summaries",
      desc: "Every article gets a 2-sentence summary and a plain-English impact analysis.",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>,
      title: "Ranked by you",
      desc: "Pick your topics. Your feed re-ranks every few hours based on what you engage with.",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      title: "Digest emails",
      desc: "Daily, weekly, or monthly — get only the highlights that actually matter to you.",
    },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── LAYOUT ── */
        .auth-root { display: flex; min-height: 100vh; }

        /* ── LEFT BRAND PANEL ── */
        .auth-left {
          width: 45%; flex-shrink: 0;
          display: flex; flex-direction: column;
          padding: 36px 52px 36px 48px;
          position: relative; overflow: hidden;
        }
        /* Light mode: vivid orange/amber brand gradient */
        .auth-left {
          background: linear-gradient(150deg, #f97316 0%, #ea6f0f 30%, #c25408 65%, #7c3212 100%);
        }
        /* Dark mode: deep navy */
        [data-theme="dark"] .auth-left {
          background: linear-gradient(150deg, #0a0f22 0%, #06091a 50%, #020510 100%);
        }
        /* Dot grid overlay */
        .auth-left::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0);
          background-size: 28px 28px;
          pointer-events: none;
        }
        /* Glow orb */
        .auth-left::after {
          content: '';
          position: absolute; bottom: -20%; right: -20%;
          width: 60%; height: 60%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.10), transparent 65%);
          pointer-events: none;
        }
        [data-theme="dark"] .auth-left::after {
          background: radial-gradient(ellipse, rgba(249,115,22,0.14), transparent 65%);
        }

        /* Logo in left panel */
        .auth-left-logo {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1; text-decoration: none;
        }
        .auth-left-logo-img {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.20);
        }
        .auth-left-logo-name {
          font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px;
        }
        [data-theme="dark"] .auth-left-logo-name {
          background: linear-gradient(135deg,#fb923c,#f97316,#fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* Left body */
        .auth-left-body {
          flex: 1; display: flex; flex-direction: column; justify-content: center;
          position: relative; z-index: 1; padding: 48px 0 32px;
        }
        .auth-left-eyebrow {
          font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.60); margin-bottom: 14px;
        }
        [data-theme="dark"] .auth-left-eyebrow { color: #f97316; }
        .auth-left-headline {
          font-size: clamp(26px, 2.8vw, 38px); font-weight: 900;
          color: #fff; letter-spacing: -1.2px; line-height: 1.08; margin-bottom: 18px;
        }
        [data-theme="dark"] .auth-left-headline { color: #eef2ff; }
        .auth-left-sub {
          font-size: 14px; color: rgba(255,255,255,0.58); line-height: 1.68;
          max-width: 300px; margin-bottom: 40px;
        }
        [data-theme="dark"] .auth-left-sub { color: rgba(192,204,232,0.65); }

        .auth-left-features { display: flex; flex-direction: column; gap: 18px; }
        .auth-left-feat {
          display: flex; align-items: flex-start; gap: 14px;
        }
        .auth-left-feat-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(255,255,255,0.14);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        [data-theme="dark"] .auth-left-feat-icon {
          background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.22);
        }
        .auth-left-feat-content {}
        .auth-left-feat-title {
          font-size: 13.5px; font-weight: 700; color: rgba(255,255,255,0.92); margin-bottom: 2px;
        }
        [data-theme="dark"] .auth-left-feat-title { color: #eef2ff; }
        .auth-left-feat-desc {
          font-size: 12.5px; color: rgba(255,255,255,0.50); line-height: 1.55;
        }
        [data-theme="dark"] .auth-left-feat-desc { color: rgba(192,204,232,0.55); }

        .auth-left-footer {
          font-size: 12px; color: rgba(255,255,255,0.35);
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 8px;
        }
        [data-theme="dark"] .auth-left-footer { color: rgba(192,204,232,0.28); }

        /* Testimonial / social proof */
        .auth-left-proof {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 12px; padding: 16px 18px; margin-bottom: 36px;
        }
        [data-theme="dark"] .auth-left-proof {
          background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.18);
        }
        .auth-left-proof-quote {
          font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.65; font-style: italic; margin-bottom: 10px;
        }
        [data-theme="dark"] .auth-left-proof-quote { color: rgba(192,204,232,0.78); }
        .auth-left-proof-author {
          font-size: 11.5px; color: rgba(255,255,255,0.45); font-weight: 600;
        }
        [data-theme="dark"] .auth-left-proof-author { color: rgba(192,204,232,0.45); }

        /* ── RIGHT FORM PANEL ── */
        .auth-right {
          flex: 1; background: var(--bg-page);
          display: flex; flex-direction: column;
          position: relative;
          transition: background 0.3s ease;
        }
        .auth-right-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border-divider);
        }
        .auth-right-topbar-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--text-muted);
          text-decoration: none; transition: color 0.15s;
        }
        .auth-right-topbar-back:hover { color: var(--primary); }
        .auth-right-center {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 32px;
        }
        .auth-right-inner {
          width: 100%; max-width: 400px;
        }

        /* Mobile logo */
        .auth-mobile-logo {
          display: none; align-items: center; gap: 10px; margin-bottom: 32px;
        }
        .auth-mobile-logo-img {
          width: 40px; height: 40px; border-radius: 9px; overflow: hidden; flex-shrink: 0; background: #fff;
        }
        .auth-mobile-logo-name {
          font-size: 17px; font-weight: 800; letter-spacing: -0.4px;
          background: linear-gradient(135deg,#fb923c,#f97316,#fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* Form header */
        .auth-form-header { margin-bottom: 28px; }
        .auth-heading { font-size: 24px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.6px; margin-bottom: 6px; }
        .auth-subheading { font-size: 14px; color: var(--text-muted); line-height: 1.55; }

        /* Mode toggle */
        .auth-toggle {
          display: flex; gap: 4px;
          background: var(--bg-elevated); border-radius: 11px;
          padding: 4px; margin-bottom: 24px;
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
          box-shadow: 0 1px 6px rgba(0,0,0,0.14);
        }

        /* Google button */
        .auth-google-btn {
          width: 100%; padding: 12px 16px;
          border: 1px solid var(--border-default); border-radius: 10px;
          background: var(--bg-card); color: var(--text-heading);
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }
        .auth-google-btn:hover { border-color: var(--primary); box-shadow: var(--shadow-md); transform: translateY(-1px); }
        .auth-google-btn:active { transform: scale(0.99); }
        .auth-google-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px; color: var(--text-subtle); font-size: 12.5px;
        }
        .auth-divider::before, .auth-divider::after { content:''; flex:1; height:1px; background:var(--border-default); }

        /* Fields */
        .auth-fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
        .auth-field-group { display: flex; flex-direction: column; gap: 6px; }
        .auth-field-label { font-size: 12.5px; font-weight: 600; color: var(--text-muted); }
        .auth-field {
          width: 100%; padding: 11px 14px;
          border: 1px solid var(--border-default); border-radius: 10px;
          font-family: inherit; font-size: 14px; color: var(--text-heading);
          outline: none; transition: all 0.2s ease;
          background: var(--bg-input);
        }
        .auth-field::placeholder { color: var(--text-subtle); }
        .auth-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: var(--bg-input-focus); }

        .auth-password-wrap { position: relative; }
        .auth-password-wrap .auth-field { padding-right: 46px; }
        .auth-eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-subtle); display: flex; align-items: center; padding: 0; transition: color 0.2s;
        }
        .auth-eye-btn:hover { color: var(--text-heading); }

        .pw-rules { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
        .pw-rule { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-subtle); transition: color 0.2s; }
        .pw-rule.met { color: var(--text-success, #16a34a); }
        .pw-rule-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-default); flex-shrink: 0; transition: background 0.2s; }
        .pw-rule.met .pw-rule-dot { background: var(--text-success, #16a34a); }

        /* Remember me + forgot row */
        .auth-remember-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .auth-remember-label {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; font-size: 13px; color: var(--text-muted); user-select: none;
        }
        .auth-remember-checkbox {
          width: 16px; height: 16px; accent-color: #f97316; cursor: pointer; flex-shrink: 0;
        }
        .auth-forgot-link {
          background: none; border: none; color: var(--text-muted);
          font-family: inherit; font-size: 13px; font-weight: 500;
          cursor: pointer; padding: 0; transition: color 0.2s;
        }
        .auth-forgot-link:hover { color: var(--primary); }
        .auth-terms-checkbox {
          width: 16px; height: 16px; accent-color: #f97316; cursor: pointer; flex-shrink: 0;
        }
        .auth-terms-label {
          display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; font-size: 13px; color: var(--text-muted); user-select: none;
          margin-bottom: 16px;
        }
        .auth-terms-label a {
          color: var(--primary); text-decoration: none; font-weight: 500;
        }
        .auth-terms-label a:hover { text-decoration: underline; }

        /* Messages */
        .auth-error {
          background: var(--bg-error); color: var(--text-error);
          font-size: 13px; font-weight: 500;
          padding: 11px 14px; border-radius: 9px;
          margin-bottom: 14px; border: 1px solid var(--border-error);
          line-height: 1.5;
        }
        .auth-success {
          background: var(--bg-success); color: var(--text-success);
          font-size: 13px; font-weight: 500;
          padding: 11px 14px; border-radius: 9px;
          margin-bottom: 14px; border: 1px solid var(--border-success);
        }
        .auth-suggest {
          margin-top: 8px; padding: 12px 14px;
          border-radius: 9px; border: 1px solid var(--border-default);
          background: var(--bg-elevated); text-align: center;
          font-size: 13px; color: var(--text-muted);
        }
        .auth-suggest-link {
          background: none; border: none; color: var(--primary);
          font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; padding: 0; margin-left: 5px;
        }
        .auth-suggest-link:hover { text-decoration: underline; }

        /* Submit button */
        .auth-submit {
          width: 100%; padding: 13px;
          border: none; border-radius: 10px;
          background: linear-gradient(135deg, #f97316, #ea6f0f);
          color: #fff;
          font-family: inherit; font-size: 14.5px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38);
          margin-bottom: 14px;
        }
        .auth-submit:hover { box-shadow: 0 6px 22px rgba(249,115,22,0.55); transform: translateY(-1px); }
        .auth-submit:active { transform: scale(0.99); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .auth-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Switch mode footer */
        .auth-switch { text-align: center; font-size: 13.5px; color: var(--text-muted); margin-top: 6px; }
        .auth-switch-link {
          background: none; border: none; color: var(--primary);
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          cursor: pointer; margin-left: 5px; padding: 0;
        }
        .auth-switch-link:hover { text-decoration: underline; }

        /* Check email / forgot sent */
        .auth-state-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: var(--primary-light); border: 1px solid rgba(249,115,22,0.22);
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center; font-size: 30px;
        }
        .auth-state-title { font-size: 20px; font-weight: 800; color: var(--text-heading); margin-bottom: 8px; text-align: center; letter-spacing: -0.4px; }
        .auth-state-text { font-size: 13.5px; color: var(--text-muted); line-height: 1.65; text-align: center; margin-bottom: 24px; }
        .auth-state-btn {
          width: 100%; padding: 12px; border: 1px solid var(--border-default);
          border-radius: 10px; background: transparent;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s ease;
        }
        .auth-state-btn:hover { border-color: var(--primary); color: var(--primary); }

        /* Right footer */
        .auth-right-footer {
          padding: 16px 32px; border-top: 1px solid var(--border-divider);
          text-align: center; font-size: 12px; color: var(--text-subtle);
        }
        .auth-right-footer a { color: var(--text-subtle); text-decoration: none; }
        .auth-right-footer a:hover { color: var(--primary); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; }
          .auth-mobile-logo { display: flex; }
          .auth-right-topbar { padding: 16px 24px; }
          .auth-right-center { padding: 24px; }
        }
        @media (max-width: 480px) {
          .auth-right-center { padding: 20px; }
          .auth-right-inner { max-width: 100%; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT BRAND PANEL ── */}
        <div className="auth-left">
          <Link href="/" className="auth-left-logo">
            <div className="auth-left-logo-img">
              <Image src="/logo.jpeg" alt="Distilled" width={34} height={34} style={{ objectFit: "contain", width: "100%", height: "100%" }} priority />
            </div>
            <span className="auth-left-logo-name">Distilled</span>
          </Link>

          <div className="auth-left-body">
            <div className="auth-left-eyebrow">AI-Curated News</div>
            <h2 className="auth-left-headline">
              Read less.<br />Know more.<br />Stay ahead.
            </h2>
            <p className="auth-left-sub">
              Distilled ranks, summarises, and explains the web&apos;s best articles — tailored entirely to your interests.
            </p>

            <div className="auth-left-features">
              {FEATURES.map((f) => (
                <div key={f.title} className="auth-left-feat">
                  <div className="auth-left-feat-icon">{f.icon}</div>
                  <div className="auth-left-feat-content">
                    <div className="auth-left-feat-title">{f.title}</div>
                    <div className="auth-left-feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-left-footer">
            <span>Free forever</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>No credit card</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>60-second setup</span>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="auth-right">
          {/* Top bar */}
          <div className="auth-right-topbar">
            <Link href="/" className="auth-right-topbar-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to home
            </Link>
            <ThemeToggle />
          </div>

          {/* Centered form */}
          <div className="auth-right-center">
            <div className="auth-right-inner">

              {/* Mobile logo */}
              <div className="auth-mobile-logo">
                <div className="auth-mobile-logo-img">
                  <Image src="/logo.jpeg" alt="Distilled" width={32} height={32} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                </div>
                <span className="auth-mobile-logo-name">Distilled</span>
              </div>

              {/* ── Avatar picker ── */}
              {avatarStep ? (
                <AvatarPicker
                  mode="inline"
                  currentSeed={pendingAvatar}
                  saveLabel="Continue"
                  cancelLabel="Back"
                  onCancel={() => setAvatarStep(false)}
                  onSave={async (seed) => {
                    setPendingAvatar(seed);
                    setLoading(true); setError("");
                    try {
                      const res = await fetch("/api/auth/signup", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, email, password, avatarSeed: seed }),
                      });
                      const data = await res.json();
                      if (!res.ok) { setError(data.error); setAvatarStep(false); }
                      else { setAvatarStep(false); setCheckEmail(true); }
                    } catch { setError("Network error. Please try again."); setAvatarStep(false); }
                    finally { setLoading(false); }
                  }}
                />

              /* ── Check email screen ── */
              ) : checkEmail ? (
                <>
                  <div className="auth-state-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                  <h2 className="auth-state-title">Check your email</h2>
                  <p className="auth-state-text">
                    We sent a verification link to <strong>{email}</strong>.<br />
                    Click it to activate your account. The link expires in 24 hours.
                  </p>
                  <button className="auth-state-btn" onClick={() => { setCheckEmail(false); setMode("login"); }}>
                    Back to Login
                  </button>
                </>

              /* ── Forgot password flow ── */
              ) : mode === "forgot" ? (
                <>
                  {forgotSent ? (
                    <>
                      <div className="auth-state-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><polyline points="16 12 18 14 22 10"/></svg></div>
                      <h2 className="auth-state-title">Reset link sent</h2>
                      <p className="auth-state-text">
                        If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox and spam folder.<br /><br />
                        The link expires in 1 hour.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="auth-form-header">
                        <h1 className="auth-heading">Forgot your password?</h1>
                        <p className="auth-subheading">Enter your email and we&apos;ll send a reset link.</p>
                      </div>
                      <form onSubmit={handleForgotPassword}>
                        <div className="auth-fields">
                          <div className="auth-field-group">
                            <label className="auth-field-label">Email address</label>
                            <input className="auth-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                          </div>
                        </div>
                        {error && <div className="auth-error">{error}</div>}
                        <button type="submit" className="auth-submit" disabled={loading}>
                          {loading ? <div className="auth-spinner" /> : <>Send reset link <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                        </button>
                      </form>
                    </>
                  )}
                  <button className="auth-state-btn" style={{ marginTop: forgotSent ? 0 : 12 }} onClick={() => { setMode("login"); setForgotSent(false); setError(""); }}>
                    ← Back to Login
                  </button>
                </>

              /* ── Main login / signup form ── */
              ) : (
                <>
                  <div className="auth-form-header">
                    <h1 className="auth-heading">
                      {mode === "login" ? "Welcome back" : "Create your account"}
                    </h1>
                    <p className="auth-subheading">
                      {mode === "login"
                        ? "Sign in to access your personalised feed."
                        : "Start reading smarter in under a minute."}
                    </p>
                  </div>

                  {/* Status banners */}
                  {verified && <div className="auth-success">✓ Email verified! You can now sign in.</div>}
                  {tokenError === "expired-token" && <div className="auth-error">Verification link expired. Please sign up again.</div>}
                  {(tokenError === "invalid-token" || tokenError === "missing-token") && <div className="auth-error">Invalid verification link. Please sign up again.</div>}

                  {/* Google SSO */}
                  <button type="button" className="auth-google-btn" onClick={() => signIn("google", { callbackUrl: "/feed" })} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="auth-divider">or continue with email</div>

                  {/* Login / Sign Up toggle */}
                  <div className="auth-toggle">
                    <button type="button" className={`auth-toggle-btn${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); setSuggestSignup(false); }}>Sign In</button>
                    <button type="button" className={`auth-toggle-btn${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(""); setSuggestSignup(false); }}>Sign Up</button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="auth-fields">
                      {mode === "signup" && (
                        <div className="auth-field-group">
                          <label className="auth-field-label">Full name</label>
                          <input className="auth-field" type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                        </div>
                      )}
                      <div className="auth-field-group">
                        <label className="auth-field-label">Email address</label>
                        <input className="auth-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                      </div>
                      <div className="auth-field-group">
                        <label className="auth-field-label">Password</label>
                        <div className="auth-password-wrap">
                          <input
                            className="auth-field"
                            type={showPassword ? "text" : "password"}
                            placeholder={mode === "signup" ? "Min 8 chars, 1 uppercase" : "Your password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          />
                          <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                          </button>
                        </div>
                        {mode === "signup" && password.length > 0 && (
                          <div className="pw-rules">
                            {pwRules.map((rule) => (
                              <div key={rule.label} className={`pw-rule${rule.met ? " met" : ""}`}>
                                <span className="pw-rule-dot" />{rule.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms and conditions for signup */}
                    {mode === "signup" && (
                      <label className="auth-terms-label">
                        <input type="checkbox" className="auth-terms-checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                        <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                      </label>
                    )}

                    {/* Remember me + Forgot password row */}
                    {mode === "login" && (
                      <div className="auth-remember-row">
                        <label className="auth-remember-label">
                          <input type="checkbox" className="auth-remember-checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                          Remember me
                        </label>
                        <button type="button" className="auth-forgot-link" onClick={() => { setMode("forgot"); setError(""); }}>
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Error */}
                    {error && <div className="auth-error">{error}</div>}

                    {/* No account suggestion */}
                    {suggestSignup && mode === "login" && (
                      <div className="auth-suggest">
                        No account with that email?
                        <button type="button" className="auth-suggest-link" onClick={() => { setMode("signup"); setError(""); setSuggestSignup(false); }}>
                          Create one →
                        </button>
                      </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: error || suggestSignup ? 14 : 0 }}>
                      {loading ? <div className="auth-spinner" /> : (
                        <>
                          {mode === "login" ? "Sign In" : "Create Account"}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="auth-switch">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button type="button" className="auth-switch-link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuggestSignup(false); }}>
                      {mode === "login" ? "Sign up free" : "Sign in"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Bottom footer */}
          <div className="auth-right-footer">
            By continuing, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            &nbsp;·&nbsp; © 2026 Distilled
          </div>
        </div>

      </div>
    </>
  );
}
