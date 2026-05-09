"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LogoIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 900);
    const t2 = setTimeout(() => setPhase("out"), 2400);
    const t3 = setTimeout(() => onDone(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#04070e",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.7s ease" : "none",
      pointerEvents: phase === "out" ? "none" : "all",
      fontFamily: "var(--font-geist-sans), Inter, -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes introLogoIn {
          0% { transform: scale(0.5) translateY(16px); opacity: 0; filter: blur(6px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes introGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(249,115,22,0.30), 0 0 80px rgba(249,115,22,0.12); }
          50% { box-shadow: 0 0 70px rgba(249,115,22,0.55), 0 0 130px rgba(249,115,22,0.25); }
        }
        @keyframes introNameIn {
          0% { opacity: 0; transform: translateY(10px); letter-spacing: 0.1em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: -0.03em; }
        }
        @keyframes introTagIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes introBarFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes introOrbFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(4%,6%) scale(1.08); }
        }
        @keyframes introOrbFloat2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-5%,3%) scale(1.05); }
        }
        .intro-orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); pointer-events: none;
        }
      `}</style>

      <div className="intro-orb" style={{
        width: "60vw", height: "60vw", top: "-25%", left: "-20%",
        background: "radial-gradient(ellipse, rgba(249,115,22,0.14), transparent 65%)",
        animation: "introOrbFloat 8s ease-in-out infinite",
      }} />
      <div className="intro-orb" style={{
        width: "50vw", height: "50vw", bottom: "-20%", right: "-15%",
        background: "radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 65%)",
        animation: "introOrbFloat2 10s ease-in-out infinite",
      }} />

      <div style={{
        borderRadius: "28px",
        marginBottom: "28px",
        animation: "introLogoIn 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards, introGlow 3s ease-in-out 0.9s infinite",
        lineHeight: 0,
      }}>
        <Image
          src="/logo.jpeg"
          alt="Distilled"
          width={120}
          height={120}
          style={{ borderRadius: "28px", display: "block" }}
          priority
        />
      </div>

      <div style={{
        fontSize: "34px", fontWeight: 900, letterSpacing: "-0.03em",
        background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #fbbf24 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        animation: "introNameIn 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.55s both",
        marginBottom: "8px",
      }}>
        Distilled
      </div>

      <div style={{
        fontSize: "12px", color: "rgba(255,255,255,0.30)", letterSpacing: "0.20em",
        textTransform: "uppercase", fontWeight: 600,
        animation: "introTagIn 0.6s ease 1.1s both",
      }}>
        AI Curated Insights
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2.5px",
        background: "rgba(255,255,255,0.05)",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #f97316, #fbbf24, #f97316)",
          backgroundSize: "200% 100%",
          animation: "introBarFill 2.4s cubic-bezier(0.4,0,0.2,1) 0.2s both",
        }} />
      </div>
    </div>
  );
}
