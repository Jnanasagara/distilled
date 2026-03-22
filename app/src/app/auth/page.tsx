"use client";

// Inside the component, add:
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); 

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
  e.preventDefault();

  if (mode === "signup") {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // Auto login after signup
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/onboarding"); // we'll build this in Sprint 2
    }
    return;
  }

  // Login flow
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result?.ok) {
    alert(result?.error ?? "Login failed");
    return;
  }

  router.push("/dashboard"); // we'll build this later
}

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
      css-bg="true"
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');

        body { margin: 0; }

        .auth-bg {
          background: #f0f2f8;
          min-height: 100vh;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #ededf8;
          border-radius: 999px;
          color: #5b5fc7;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .logo {
          font-family: 'Sora', sans-serif;
          font-size: 56px;
          font-weight: 800;
          color: #0f1132;
          margin: 0 0 12px 0;
          line-height: 1;
        }

        .tagline {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          max-width: 420px;
          margin: 0 auto;
          text-align: center;
        }

        .card {
          background: #ffffff;
          border-radius: 20px;
          padding: 36px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.07);
        }

        .toggle-bar {
          display: flex;
          gap: 6px;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .toggle-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #6b7280;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #4f52d3, #3b82f6);
          color: #fff;
          box-shadow: 0 2px 10px rgba(79, 82, 211, 0.35);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }

        .input-field {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1f2937;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          background: #fafafa;
        }

        .input-field::placeholder {
          color: #9ca3af;
        }

        .input-field:focus {
          border-color: #4f52d3;
          box-shadow: 0 0 0 3px rgba(79, 82, 211, 0.12);
          background: #fff;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f52d3 0%, #06b6d4 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover {
          opacity: 0.93;
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .footer-text {
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
          margin-top: 20px;
        }

        .footer-link {
          background: none;
          border: none;
          color: #4f52d3;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
          padding: 0;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #d1d5db;
          font-size: 12px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
      `}</style>

      <div className="auth-bg" style={{ position: 'fixed', inset: 0, zIndex: -1 }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div className="badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Mindful Content Consumption
        </div>
        <h1 className="logo">Distilled</h1>
        <p className="tagline">
          Cut through the noise. Get curated, relevant content tailored to your interests, no endless scrolling required.
        </p>
      </div>

      {/* Card */}
      <div className="card">

        {/* Toggle */}
        <div className="toggle-bar">
          <button
            type="button"
            className={`toggle-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`toggle-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            {mode === "signup" && (
              <input
                className="input-field"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              className="input-field"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="footer-text">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            className="footer-link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}