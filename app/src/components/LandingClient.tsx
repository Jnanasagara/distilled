"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoIntro from "./LogoIntro";
import ThemeToggle from "./ThemeToggle";
import LandingInstallButton from "./LandingInstallButton";

export default function LandingClient() {
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      {!introDone && <LogoIntro onDone={handleIntroDone} />}

      <main style={{
        fontFamily: "var(--font-geist-sans), 'Inter', -apple-system, sans-serif",
        minHeight: "100vh",
        color: "var(--lp-text)",
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        position: "relative",
        opacity: introDone ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── THEME TOKENS ── */
          :root {
            --lp-text: #0d0702;
            --lp-text-muted: rgba(13,7,2,0.52);
            --lp-text-subtle: rgba(13,7,2,0.30);
            --lp-card-bg: rgba(255,255,255,0.82);
            --lp-card-border: rgba(160,135,100,0.20);
            --lp-nav-bg: rgba(236,232,224,0.90);
            --lp-nav-border: rgba(160,135,100,0.15);
            --lp-section-alt-bg: rgba(228,222,212,0.55);
            --lp-section-alt-border: rgba(160,135,100,0.12);
            --lp-mock-bg: rgba(255,255,255,0.85);
            --lp-mock-border: rgba(160,135,100,0.22);
            --lp-mock-img: linear-gradient(135deg, #ddd6cc 0%, #c8c0b4 100%);
            --lp-grid-line: rgba(0,0,0,0.045);
            --lp-orb-1: rgba(249,115,22,0.22);
            --lp-orb-2: rgba(245,158,11,0.15);
            --lp-orb-3: rgba(251,146,60,0.10);
            --lp-tag-bg: rgba(255,255,255,0.68);
            --lp-tag-border: rgba(160,135,100,0.20);
            --lp-impact-bg: rgba(249,115,22,0.08);
            --lp-feed-row-bg: rgba(255,255,255,0.60);
            --lp-feed-row-border: rgba(160,135,100,0.16);
            --lp-badge-bg: rgba(249,115,22,0.10);
            --lp-badge-border: rgba(249,115,22,0.28);
            --lp-signin-color: rgba(13,7,2,0.42);
            --lp-ghost-color: rgba(13,7,2,0.42);
            --lp-ghost-border: rgba(0,0,0,0.12);
            --lp-ghost-bg: rgba(0,0,0,0.04);
            --lp-topic-bg: rgba(255,255,255,0.60);
            --lp-topic-border: rgba(160,135,100,0.22);
            --lp-topic-color: rgba(13,7,2,0.55);
            --lp-topic-active-bg: rgba(249,115,22,0.10);
            --lp-topic-active-border: rgba(249,115,22,0.38);
            --lp-check-border: rgba(160,135,100,0.38);
            --lp-impact-demo-bg: rgba(255,255,255,0.68);
            --lp-impact-demo-border: rgba(160,135,100,0.20);
            --lp-impact-title: #1c1208;
            --lp-impact-text: rgba(13,7,2,0.42);
            --lp-hiw-bg: rgba(222,216,206,0.55);
            --lp-step-border: rgba(160,135,100,0.15);
            --lp-step-title-color: #1c1208;
            --lp-step-desc-color: rgba(13,7,2,0.44);
            --lp-grid-card-bg: rgba(255,255,255,0.76);
            --lp-grid-card-border: rgba(160,135,100,0.16);
            --lp-grid-card-title: #1c1208;
            --lp-grid-card-desc: rgba(13,7,2,0.42);
            --lp-digest-header-bg: rgba(255,255,255,0.68);
            --lp-digest-body-bg: rgba(255,255,255,0.52);
            --lp-digest-from: rgba(13,7,2,0.38);
            --lp-digest-from-strong: rgba(13,7,2,0.68);
            --lp-digest-item: rgba(13,7,2,0.44);
            --lp-cta-h2: #0d0702;
            --lp-cta-sub: rgba(13,7,2,0.42);
            --lp-cta-note: rgba(13,7,2,0.24);
            --lp-sources-label: rgba(13,7,2,0.30);
            --lp-proof-color: rgba(13,7,2,0.32);
            --lp-proof-border: rgba(0,0,0,0.10);
            --lp-cards-fade: linear-gradient(to top, #ece8e0, transparent);
            --lp-mock-source-bg: rgba(0,0,0,0.50);
            --lp-mock-summary: rgba(13,7,2,0.44);
            --lp-mock-impact-text: rgba(13,7,2,0.50);
            --lp-mock-btn-color: rgba(13,7,2,0.26);
            --lp-mock-btn-bg: rgba(0,0,0,0.05);
            --lp-footer-bg: rgba(210,204,194,0.70);
            --lp-footer-border: rgba(160,135,100,0.18);
            --lp-footer-text: rgba(13,7,2,0.40);
            --lp-footer-link: rgba(13,7,2,0.55);
            --lp-footer-muted: rgba(13,7,2,0.28);
            --lp-overline-color: #c25408;
            --lp-h2-color: #0d0702;
            --lp-h2-sub-color: rgba(13,7,2,0.44);
          }
          [data-theme="dark"] {
            --lp-text: #eef2ff;
            --lp-text-muted: rgba(238,242,255,0.50);
            --lp-text-subtle: rgba(238,242,255,0.26);
            --lp-card-bg: rgba(8,14,30,0.85);
            --lp-card-border: rgba(70,100,200,0.18);
            --lp-nav-bg: rgba(2,5,16,0.90);
            --lp-nav-border: rgba(255,255,255,0.07);
            --lp-section-alt-bg: rgba(4,8,22,0.65);
            --lp-section-alt-border: rgba(255,255,255,0.06);
            --lp-mock-bg: rgba(10,18,38,0.85);
            --lp-mock-border: rgba(70,100,200,0.18);
            --lp-mock-img: linear-gradient(135deg, #141e38 0%, #0a1020 100%);
            --lp-grid-line: rgba(255,255,255,0.028);
            --lp-orb-1: rgba(249,115,22,0.20);
            --lp-orb-2: rgba(99,102,241,0.17);
            --lp-orb-3: rgba(139,92,246,0.11);
            --lp-tag-bg: rgba(255,255,255,0.06);
            --lp-tag-border: rgba(255,255,255,0.09);
            --lp-impact-bg: rgba(249,115,22,0.10);
            --lp-feed-row-bg: rgba(12,20,44,0.72);
            --lp-feed-row-border: rgba(70,100,200,0.14);
            --lp-badge-bg: rgba(249,115,22,0.11);
            --lp-badge-border: rgba(249,115,22,0.28);
            --lp-signin-color: rgba(238,242,255,0.46);
            --lp-ghost-color: rgba(238,242,255,0.46);
            --lp-ghost-border: rgba(255,255,255,0.11);
            --lp-ghost-bg: rgba(255,255,255,0.05);
            --lp-topic-bg: rgba(12,20,44,0.72);
            --lp-topic-border: rgba(70,100,200,0.18);
            --lp-topic-color: rgba(238,242,255,0.60);
            --lp-topic-active-bg: rgba(249,115,22,0.11);
            --lp-topic-active-border: rgba(249,115,22,0.42);
            --lp-check-border: rgba(70,100,200,0.28);
            --lp-impact-demo-bg: rgba(12,20,44,0.72);
            --lp-impact-demo-border: rgba(70,100,200,0.16);
            --lp-impact-title: #e8eeff;
            --lp-impact-text: rgba(238,242,255,0.38);
            --lp-hiw-bg: rgba(2,5,16,0.65);
            --lp-step-border: rgba(255,255,255,0.07);
            --lp-step-title-color: #eef2ff;
            --lp-step-desc-color: rgba(238,242,255,0.38);
            --lp-grid-card-bg: rgba(8,14,30,0.80);
            --lp-grid-card-border: rgba(70,100,200,0.14);
            --lp-grid-card-title: #eef2ff;
            --lp-grid-card-desc: rgba(238,242,255,0.38);
            --lp-digest-header-bg: rgba(14,24,50,0.72);
            --lp-digest-body-bg: rgba(8,16,36,0.72);
            --lp-digest-from: rgba(238,242,255,0.32);
            --lp-digest-from-strong: rgba(238,242,255,0.62);
            --lp-digest-item: rgba(238,242,255,0.40);
            --lp-cta-h2: #eef2ff;
            --lp-cta-sub: rgba(238,242,255,0.40);
            --lp-cta-note: rgba(238,242,255,0.22);
            --lp-sources-label: rgba(238,242,255,0.24);
            --lp-proof-color: rgba(238,242,255,0.28);
            --lp-proof-border: rgba(255,255,255,0.11);
            --lp-cards-fade: linear-gradient(to top, #020510, transparent);
            --lp-mock-source-bg: rgba(0,0,0,0.55);
            --lp-mock-summary: rgba(238,242,255,0.40);
            --lp-mock-impact-text: rgba(238,242,255,0.50);
            --lp-mock-btn-color: rgba(238,242,255,0.24);
            --lp-mock-btn-bg: rgba(255,255,255,0.05);
            --lp-footer-bg: rgba(2,5,16,0.72);
            --lp-footer-border: rgba(70,100,200,0.14);
            --lp-footer-text: rgba(238,242,255,0.32);
            --lp-footer-link: rgba(238,242,255,0.52);
            --lp-footer-muted: rgba(238,242,255,0.22);
            --lp-overline-color: #f97316;
            --lp-h2-color: #eef2ff;
            --lp-h2-sub-color: rgba(238,242,255,0.42);
          }

          /* ── ANIMATED BACKGROUND ── */
          .lp-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
          .lp-bg-orb { position: absolute; border-radius: 50%; filter: blur(88px); animation: lpOrbFloat 22s ease-in-out infinite; }
          .lp-bg-orb-1 { width: 65vw; height: 65vw; top: -28%; left: -22%; background: radial-gradient(ellipse, var(--lp-orb-1), transparent 62%); animation-duration: 26s; }
          .lp-bg-orb-2 { width: 55vw; height: 55vw; bottom: -22%; right: -18%; background: radial-gradient(ellipse, var(--lp-orb-2), transparent 62%); animation-duration: 32s; animation-delay: -10s; }
          .lp-bg-orb-3 { width: 42vw; height: 42vw; top: 42%; left: 50%; background: radial-gradient(ellipse, var(--lp-orb-3), transparent 62%); animation-duration: 38s; animation-delay: -18s; }
          @keyframes lpOrbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(3%,5%) scale(1.06)} 66%{transform:translate(-4%,2%) scale(0.95)} }

          .lp-grid-pattern {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image: linear-gradient(var(--lp-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--lp-grid-line) 1px, transparent 1px);
            background-size: 64px 64px;
            mask-image: radial-gradient(ellipse 85% 75% at 50% 0%, rgba(0,0,0,0.55) 0%, transparent 100%);
            -webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 0%, rgba(0,0,0,0.55) 0%, transparent 100%);
          }

          /* ── NAV ── */
          .lp-nav {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 40px; height: 64px;
            border-bottom: 1px solid var(--lp-nav-border);
            position: sticky; top: 0; z-index: 50;
            background: var(--lp-nav-bg);
            backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
          }
          .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
          .lp-logo-img-wrap {
            width: 32px; height: 32px; border-radius: 8px;
            overflow: hidden; flex-shrink: 0;
            background: #fff;
            box-shadow: 0 2px 10px rgba(249,115,22,0.28);
            display: flex; align-items: center; justify-content: center;
          }
          .lp-logo-name {
            font-size: 17px; font-weight: 800; letter-spacing: -0.4px;
            background: linear-gradient(135deg, #fb923c 0%, #f97316 50%, #fbbf24 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          }
          .lp-nav-right { display: flex; align-items: center; gap: 10px; }
          .lp-nav-links { display: flex; align-items: center; gap: 2px; }
          .lp-nav-link { font-size: 13.5px; font-weight: 500; color: var(--lp-signin-color); text-decoration: none; padding: 6px 13px; border-radius: 8px; transition: color 0.15s, background 0.15s; white-space: nowrap; }
          .lp-nav-link:hover { color: var(--lp-text); background: rgba(128,100,60,0.08); }
          [data-theme="dark"] .lp-nav-link:hover { background: rgba(255,255,255,0.07); }
          .lp-nav-divider { width: 1px; height: 18px; background: var(--lp-nav-border); }
          .lp-nav-signin { font-size: 13.5px; font-weight: 500; color: var(--lp-signin-color); text-decoration: none; padding: 7px 14px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
          .lp-nav-signin:hover { color: var(--lp-text); background: rgba(128,100,60,0.08); }
          [data-theme="dark"] .lp-nav-signin:hover { background: rgba(255,255,255,0.07); }
          .lp-nav-cta { font-size: 13px; font-weight: 700; color: #fff; text-decoration: none; padding: 8px 18px; background: linear-gradient(135deg, #f97316, #ea6f0f); border-radius: 9px; box-shadow: 0 2px 12px rgba(249,115,22,0.38); transition: all 0.2s ease; white-space: nowrap; }
          .lp-nav-cta:hover { box-shadow: 0 4px 22px rgba(249,115,22,0.55); transform: translateY(-1px); }

          /* ── HERO ── */
          .lp-hero { display: grid; grid-template-columns: 54fr 46fr; align-items: center; gap: 64px; max-width: 1280px; margin: 0 auto; padding: 100px 40px 88px; position: relative; z-index: 1; }
          .lp-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 999px; background: var(--lp-badge-bg); border: 1px solid var(--lp-badge-border); font-size: 11px; font-weight: 700; color: #fb923c; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 28px; }
          .lp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #f97316; box-shadow: 0 0 7px #f97316; animation: dotPulse 2s ease-in-out infinite; }
          @keyframes dotPulse { 0%,100%{box-shadow:0 0 6px #f97316} 50%{box-shadow:0 0 14px #f97316,0 0 24px rgba(249,115,22,0.40)} }
          .lp-h1 { font-size: clamp(42px, 5.8vw, 66px); font-weight: 900; line-height: 1.03; letter-spacing: -2.8px; color: var(--lp-text); margin-bottom: 22px; }
          .lp-h1-accent { background: linear-gradient(135deg, #fb923c 0%, #f97316 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .lp-h1-dim { color: var(--lp-text-subtle); }
          .lp-hero-sub { font-size: 16.5px; line-height: 1.70; color: var(--lp-text-muted); max-width: 430px; margin-bottom: 38px; }
          .lp-hero-sub strong { color: var(--lp-text); font-weight: 600; }
          .lp-hero-actions { display: flex; align-items: center; gap: 10px; margin-bottom: 46px; flex-wrap: wrap; }
          .lp-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 13px 26px; background: linear-gradient(135deg, #f97316, #ea6f0f); color: #fff; border-radius: 10px; font-size: 14.5px; font-weight: 800; letter-spacing: -0.2px; text-decoration: none; box-shadow: 0 4px 22px rgba(249,115,22,0.42); transition: all 0.22s ease; }
          .lp-btn-primary:hover { box-shadow: 0 6px 30px rgba(249,115,22,0.58), 0 0 44px rgba(249,115,22,0.22); transform: translateY(-2px); }
          .lp-btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 13px 18px; color: var(--lp-ghost-color); border-radius: 10px; font-size: 14px; font-weight: 500; text-decoration: none; border: 1px solid var(--lp-ghost-border); background: var(--lp-ghost-bg); backdrop-filter: blur(10px); transition: all 0.2s ease; }
          .lp-btn-ghost:hover { color: var(--lp-text); border-color: rgba(128,100,60,0.22); background: rgba(128,100,60,0.06); }
          [data-theme="dark"] .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.20); background: rgba(255,255,255,0.08); }
          .lp-hero-proof { display: flex; align-items: center; font-size: 11.5px; color: var(--lp-proof-color); flex-wrap: wrap; }
          .lp-proof-item { display: flex; align-items: center; gap: 6px; padding-right: 16px; margin-right: 16px; border-right: 1px solid var(--lp-proof-border); white-space: nowrap; }
          .lp-proof-item:last-child { border-right: none; }

          /* ── HERO CARDS ── */
          .lp-hero-right { position: relative; }
          .lp-cards-wrap { display: flex; flex-direction: column; gap: 12px; position: relative; }
          .lp-cards-wrap::after { content:''; position:absolute; bottom:0; left:0; right:0; height:110px; background:var(--lp-cards-fade); pointer-events:none; z-index:2; }
          .lp-mock-card { background:var(--lp-mock-bg); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--lp-mock-border); border-radius:16px; overflow:hidden; box-shadow:0 16px 56px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.55); }
          [data-theme="dark"] .lp-mock-card { box-shadow:0 16px 56px rgba(0,0,0,0.55),inset 0 1px 0 rgba(100,130,220,0.10); }
          .lp-mock-card-img { height:120px; background:var(--lp-mock-img); position:relative; overflow:hidden; }
          .lp-mock-source-pill { position:absolute; top:10px; left:10px; padding:3px 10px; border-radius:999px; font-size:10px; font-weight:800; color:#fff; backdrop-filter:blur(8px); background:var(--lp-mock-source-bg); border:1px solid rgba(255,255,255,0.18); }
          .lp-mock-time { position:absolute; top:10px; right:10px; font-size:10px; color:rgba(255,255,255,0.55); font-weight:500; }
          .lp-mock-body { padding:14px 16px 16px; }
          .lp-mock-topic { font-size:10px; font-weight:800; color:#fb923c; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.05em; }
          .lp-mock-title { font-size:13.5px; font-weight:700; color:var(--lp-impact-title); line-height:1.38; margin-bottom:8px; }
          .lp-mock-summary { font-size:12px; color:var(--lp-mock-summary); line-height:1.60; margin-bottom:10px; }
          .lp-mock-impact { background:var(--lp-impact-bg); border-left:2.5px solid #f97316; border-radius:0 7px 7px 0; padding:8px 11px; margin-bottom:12px; }
          .lp-mock-impact-label { font-size:9px; font-weight:800; color:#fb923c; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:3px; }
          .lp-mock-impact-text { font-size:11.5px; color:var(--lp-mock-impact-text); line-height:1.50; }
          .lp-mock-actions { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--lp-mock-border); }
          .lp-mock-btns { display:flex; gap:2px; }
          .lp-mock-btn { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--lp-mock-btn-color); font-size:13px; background:var(--lp-mock-btn-bg); }
          .lp-mock-read { font-size:11.5px; font-weight:700; color:#fff; background:linear-gradient(135deg,#f97316,#ea6f0f); border-radius:7px; padding:5px 13px; box-shadow:0 2px 10px rgba(249,115,22,0.38); cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.2s; }
          .lp-mock-read:hover { box-shadow:0 4px 18px rgba(249,115,22,0.58); transform:translateY(-1px); }

          /* ── SOURCES ── */
          .lp-sources { border-top:1px solid var(--lp-section-alt-border); border-bottom:1px solid var(--lp-section-alt-border); background:var(--lp-section-alt-bg); backdrop-filter:blur(10px); padding:14px 40px; position:relative; z-index:1; }
          .lp-sources-inner { max-width:1280px; margin:0 auto; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
          .lp-sources-label { font-size:11.5px; color:var(--lp-sources-label); font-weight:500; flex-shrink:0; }
          .lp-source-sep { color:var(--lp-sources-label); font-size:14px; opacity:0.5; }
          .lp-source-tag { font-size:11.5px; font-weight:700; padding:4px 12px; border-radius:999px; border:1px solid var(--lp-tag-border); background:var(--lp-tag-bg); backdrop-filter:blur(8px); white-space:nowrap; }

          /* ── SECTIONS ── */
          .lp-section { max-width:1280px; margin:0 auto; padding:104px 40px; position:relative; z-index:1; }
          .lp-section-sm { max-width:1280px; margin:0 auto; padding:0 40px 104px; position:relative; z-index:1; }
          .lp-overline { font-size:11px; font-weight:800; color:var(--lp-overline-color); text-transform:uppercase; letter-spacing:0.14em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
          .lp-overline::before { content:''; width:22px; height:1.5px; background:linear-gradient(90deg,#f97316,transparent); }
          .lp-h2 { font-size:clamp(28px,3.8vw,46px); font-weight:900; letter-spacing:-1.6px; color:var(--lp-h2-color); line-height:1.06; margin-bottom:14px; }
          .lp-h2-sub { font-size:15.5px; color:var(--lp-h2-sub-color); line-height:1.70; max-width:450px; }
          .lp-feat-split { display:grid; grid-template-columns:1fr 1fr; gap:84px; align-items:center; }
          .lp-feat-list { display:flex; flex-direction:column; gap:13px; }
          .lp-feat-list-item { display:flex; align-items:flex-start; gap:11px; }
          .lp-feat-list-text { font-size:13.5px; color:var(--lp-text-muted); line-height:1.65; }
          .lp-feat-visual { background:var(--lp-card-bg); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--lp-card-border); border-radius:18px; padding:28px; overflow:hidden; box-shadow:0 12px 52px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.55); }
          [data-theme="dark"] .lp-feat-visual { box-shadow:0 12px 52px rgba(0,0,0,0.50),inset 0 1px 0 rgba(100,130,220,0.10); }

          .lp-impact-demo { display:flex; flex-direction:column; gap:10px; }
          .lp-impact-demo-card { background:var(--lp-impact-demo-bg); backdrop-filter:blur(8px); border:1px solid var(--lp-impact-demo-border); border-radius:11px; padding:14px 16px; }
          .lp-impact-demo-title { font-size:13px; font-weight:700; color:var(--lp-impact-title); margin-bottom:8px; line-height:1.40; }
          .lp-impact-demo-text { font-size:12px; color:var(--lp-impact-text); line-height:1.60; margin-bottom:10px; }
          .lp-impact-demo-block { background:var(--lp-impact-bg); border-left:2.5px solid #f97316; border-radius:0 7px 7px 0; padding:8px 11px; }
          .lp-impact-demo-block-label { font-size:9px; font-weight:800; color:#f97316; text-transform:uppercase; letter-spacing:0.09em; margin-bottom:3px; }
          .lp-impact-demo-block-text { font-size:11.5px; color:var(--lp-mock-impact-text); line-height:1.50; }

          .lp-topics-demo { display:flex; flex-wrap:wrap; gap:8px; }
          .lp-topic-chip { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; border:1px solid var(--lp-topic-border); background:var(--lp-topic-bg); backdrop-filter:blur(6px); font-size:12.5px; font-weight:500; color:var(--lp-topic-color); }
          .lp-topic-chip.active { border-color:var(--lp-topic-active-border); background:var(--lp-topic-active-bg); color:#fb923c; }
          .lp-topic-check { width:15px; height:15px; border-radius:4px; border:1.5px solid var(--lp-check-border); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
          .lp-topic-check.checked { background:linear-gradient(135deg,#f97316,#ea6f0f); border-color:transparent; }
          .lp-feed-preview { margin-top:20px; display:flex; flex-direction:column; gap:8px; }
          .lp-feed-row { background:var(--lp-feed-row-bg); backdrop-filter:blur(6px); border:1px solid var(--lp-feed-row-border); border-radius:9px; padding:11px 14px; display:flex; align-items:center; gap:10px; }
          .lp-feed-row-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
          .lp-feed-row-text { font-size:12.5px; color:var(--lp-text-muted); font-weight:500; flex:1; }
          .lp-feed-row-source { font-size:10.5px; color:var(--lp-sources-label); }

          /* ── HOW IT WORKS ── */
          .lp-hiw-bg { background:var(--lp-hiw-bg); backdrop-filter:blur(10px); border-top:1px solid var(--lp-section-alt-border); border-bottom:1px solid var(--lp-section-alt-border); position:relative; z-index:1; }
          .lp-hiw { max-width:1280px; margin:0 auto; padding:92px 40px; }
          .lp-hiw-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:0; margin-top:56px; }
          .lp-step { padding-right:36px; border-right:1px solid var(--lp-step-border); margin-right:36px; }
          .lp-step:last-child { border-right:none; padding-right:0; margin-right:0; }
          .lp-step-num { font-size:11px; font-weight:800; color:#f97316; letter-spacing:0.06em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
          .lp-step-num::after { content:''; flex:1; max-width:24px; height:1.5px; background:rgba(249,115,22,0.32); }
          .lp-step-title { font-size:17px; font-weight:800; color:var(--lp-step-title-color); margin-bottom:10px; letter-spacing:-0.3px; }
          .lp-step-desc { font-size:13.5px; color:var(--lp-step-desc-color); line-height:1.70; }

          /* ── FEATURE GRID ── */
          .lp-grid { display:grid; grid-template-columns:5fr 4fr 4fr; gap:16px; }
          .lp-grid-card { background:var(--lp-grid-card-bg); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--lp-grid-card-border); border-radius:16px; padding:28px 24px; box-shadow:0 8px 36px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.50); transition:all 0.25s ease; }
          [data-theme="dark"] .lp-grid-card { box-shadow:0 8px 36px rgba(0,0,0,0.40),inset 0 1px 0 rgba(100,130,220,0.08); }
          .lp-grid-card:hover { border-color:rgba(249,115,22,0.28); box-shadow:0 12px 48px rgba(0,0,0,0.10),0 0 22px rgba(249,115,22,0.10); transform:translateY(-3px); }
          [data-theme="dark"] .lp-grid-card:hover { box-shadow:0 12px 48px rgba(0,0,0,0.55),0 0 28px rgba(249,115,22,0.12); }
          .lp-grid-card-icon { font-size:24px; margin-bottom:16px; display:block; }
          .lp-grid-card-title { font-size:14.5px; font-weight:800; color:var(--lp-grid-card-title); margin-bottom:8px; letter-spacing:-0.25px; }
          .lp-grid-card-desc { font-size:13px; color:var(--lp-grid-card-desc); line-height:1.65; }
          .lp-digest-demo { margin-top:20px; }
          .lp-digest-header { background:var(--lp-digest-header-bg); border:1px solid var(--lp-card-border); border-radius:9px 9px 0 0; padding:10px 14px; }
          .lp-digest-from { font-size:11px; color:var(--lp-digest-from); }
          .lp-digest-from strong { color:var(--lp-digest-from-strong); }
          .lp-digest-body { background:var(--lp-digest-body-bg); border:1px solid var(--lp-card-border); border-top:none; border-radius:0 0 9px 9px; padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
          .lp-digest-item { font-size:12px; color:var(--lp-digest-item); line-height:1.42; display:flex; gap:8px; }
          .lp-digest-item-num { color:#f97316; font-weight:700; flex-shrink:0; }

          /* ── STATS STRIP ── */
          .lp-stats { position:relative; z-index:1; }
          .lp-stats-inner { max-width:1280px; margin:0 auto; padding:60px 40px; display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
          .lp-stat { text-align:center; padding:0 24px; border-right:1px solid var(--lp-step-border); }
          .lp-stat:last-child { border-right:none; }
          .lp-stat-num { font-size:clamp(28px,3.5vw,40px); font-weight:900; letter-spacing:-1.5px; background:linear-gradient(135deg,#fb923c,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:6px; }
          .lp-stat-label { font-size:13px; color:var(--lp-text-muted); font-weight:500; }

          /* ── CTA ── */
          .lp-cta { padding:116px 40px; text-align:center; border-top:1px solid var(--lp-section-alt-border); position:relative; z-index:1; overflow:hidden; }
          .lp-cta::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:80vw; height:80vw; max-width:650px; max-height:650px; background:radial-gradient(ellipse,var(--lp-badge-bg),transparent 62%); pointer-events:none; }
          .lp-cta-inner { max-width:560px; margin:0 auto; position:relative; }
          .lp-cta-h2 { font-size:clamp(30px,4.5vw,50px); font-weight:900; letter-spacing:-2px; color:var(--lp-cta-h2); margin-bottom:18px; line-height:1.08; }
          .lp-cta-sub { font-size:15.5px; color:var(--lp-cta-sub); margin-bottom:38px; line-height:1.68; }
          .lp-cta-btn { display:inline-flex; align-items:center; gap:8px; padding:15px 34px; background:linear-gradient(135deg,#f97316,#ea6f0f); color:#fff; border-radius:12px; font-size:15px; font-weight:800; letter-spacing:-0.25px; text-decoration:none; box-shadow:0 6px 30px rgba(249,115,22,0.46); transition:all 0.22s ease; }
          .lp-cta-btn:hover { box-shadow:0 8px 40px rgba(249,115,22,0.62),0 0 52px rgba(249,115,22,0.22); transform:translateY(-2px); }
          .lp-cta-note { font-size:12px; color:var(--lp-cta-note); margin-top:16px; }

          /* ── FOOTER ── */
          .lp-footer-wrap { background:var(--lp-footer-bg); border-top:1px solid var(--lp-footer-border); position:relative; z-index:1; backdrop-filter:blur(12px); }
          .lp-footer-main { max-width:1280px; margin:0 auto; padding:64px 40px 48px; display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
          .lp-footer-brand { display:flex; flex-direction:column; gap:0; }
          .lp-footer-logo { display:flex; align-items:center; gap:10px; margin-bottom:14px; text-decoration:none; }
          .lp-footer-logo-img { width:36px; height:36px; border-radius:9px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow:0 2px 10px rgba(249,115,22,0.22); flex-shrink:0; }
          .lp-footer-logo-name { font-size:18px; font-weight:800; letter-spacing:-0.4px; background:linear-gradient(135deg,#fb923c,#f97316,#fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
          .lp-footer-tagline { font-size:13.5px; color:var(--lp-footer-text); line-height:1.65; max-width:280px; margin-bottom:24px; }
          .lp-footer-social { display:flex; align-items:center; gap:10px; }
          .lp-footer-social-btn { width:36px; height:36px; border-radius:9px; border:1px solid var(--lp-footer-border); background:var(--lp-mock-btn-bg); display:flex; align-items:center; justify-content:center; color:var(--lp-footer-text); text-decoration:none; transition:all 0.18s ease; }
          .lp-footer-social-btn:hover { border-color:#f97316; color:#f97316; background:rgba(249,115,22,0.08); }
          .lp-footer-col-title { font-size:12px; font-weight:800; color:var(--lp-footer-link); text-transform:uppercase; letter-spacing:0.10em; margin-bottom:18px; }
          .lp-footer-col-links { display:flex; flex-direction:column; gap:11px; }
          .lp-footer-col-link { font-size:13.5px; color:var(--lp-footer-text); text-decoration:none; transition:color 0.15s; }
          .lp-footer-col-link:hover { color:#f97316; }
          .lp-footer-bottom { max-width:1280px; margin:0 auto; padding:20px 40px 28px; border-top:1px solid var(--lp-footer-border); display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
          .lp-footer-copy { font-size:12.5px; color:var(--lp-footer-muted); }
          .lp-footer-bottom-links { display:flex; align-items:center; gap:20px; }
          .lp-footer-bottom-link { font-size:12.5px; color:var(--lp-footer-muted); text-decoration:none; transition:color 0.15s; }
          .lp-footer-bottom-link:hover { color:#f97316; }

          /* ── RESPONSIVE ── */
          @media (max-width: 960px) {
            .lp-nav { padding:0 24px; }
            .lp-nav-links { display:none; }
            .lp-hero { grid-template-columns:1fr; padding:72px 24px 56px; gap:48px; }
            .lp-hero-sub { max-width:100%; }
            .lp-feat-split { grid-template-columns:1fr; gap:40px; }
            .lp-grid { grid-template-columns:1fr; }
            .lp-hiw-steps { grid-template-columns:1fr; }
            .lp-step { border-right:none; border-bottom:1px solid var(--lp-step-border); padding:24px 0; margin:0; }
            .lp-step:last-child { border-bottom:none; }
            .lp-section { padding:68px 24px; } .lp-section-sm { padding:0 24px 68px; }
            .lp-hiw { padding:68px 24px; } .lp-cta { padding:72px 24px; }
            .lp-stats-inner { grid-template-columns:repeat(2,1fr); gap:32px 0; }
            .lp-stat:nth-child(2) { border-right:none; }
            .lp-footer-main { grid-template-columns:1fr 1fr; gap:36px; }
            .lp-footer-main>div:first-child { grid-column:1/-1; }
            .lp-sources { padding:14px 24px; }
          }
          @media (max-width: 640px) {
            .lp-nav { padding:0 16px; }
            .lp-nav-signin { display:none; }
            .lp-nav-divider { display:none; }
            .lp-nav-cta { padding:7px 12px; font-size:12px; }
            .lp-h1 { letter-spacing:-2px; }
            .lp-hero-actions { flex-direction:column; align-items:flex-start; }
            .lp-hero-proof { gap:8px; }
            .lp-proof-item { border-right:none; padding-right:0; margin-right:0; }
            .lp-stats-inner { grid-template-columns:1fr 1fr; }
            .lp-footer-main { grid-template-columns:1fr; padding:48px 20px 32px; }
            .lp-footer-main>div:first-child { grid-column:auto; }
            .lp-footer-bottom { flex-direction:column; align-items:flex-start; padding:16px 20px 24px; }
            .lp-footer-bottom-links { flex-wrap:wrap; gap:12px; }
          }
        `}</style>

        {/* ── BACKGROUND ── */}
        <div className="lp-bg" aria-hidden="true">
          <div className="lp-bg-orb lp-bg-orb-1" />
          <div className="lp-bg-orb lp-bg-orb-2" />
          <div className="lp-bg-orb lp-bg-orb-3" />
        </div>
        <div className="lp-grid-pattern" aria-hidden="true" />

        {/* ── NAVIGATION ── */}
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-img-wrap">
              <Image src="/logo.jpeg" alt="Distilled" width={32} height={32} style={{ objectFit: "contain", objectPosition: "center", width: "100%", height: "100%" }} priority />
            </div>
            <span className="lp-logo-name">Distilled</span>
          </Link>

          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How it works</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
          </div>

          <div className="lp-nav-right">
            <ThemeToggle />
            <div className="lp-nav-divider" />
            <Link href="/auth" className="lp-nav-signin">Sign in</Link>
            <Link href="/auth" className="lp-nav-cta">Get started free</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero" id="features">
          <div>
            <div className="lp-badge"><span className="lp-badge-dot" />Now with Al Jazeera &amp; Atlas News</div>
            <h1 className="lp-h1">
              The internet,<br />
              <span className="lp-h1-accent">distilled</span>{" "}
              <span className="lp-h1-dim">for you.</span>
            </h1>
            <p className="lp-hero-sub">
              Every hour, thousands of articles flood the web. Distilled reads them all so you don&apos;t have to -
              surfacing only what matters to <strong>you</strong>, with AI summaries and plain-English impact analysis.
            </p>
            <div className="lp-hero-actions">
              <Link href="/auth" className="lp-btn-primary">
                Start reading smarter
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </Link>
              <a href="#how-it-works" className="lp-btn-ghost">
                See how it works
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
              </a>
              <LandingInstallButton />
            </div>
            <div className="lp-hero-proof">
              <span className="lp-proof-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                AI summary on every article
              </span>
              <span className="lp-proof-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Daily · Weekly · Monthly digest
              </span>
              <span className="lp-proof-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Always know why it appeared
              </span>
            </div>
          </div>
          <div>
            <div className="lp-cards-wrap">
              <div className="lp-mock-card">
                <div className="lp-mock-card-img">
                  <div style={{ position: "absolute", inset: 0, background: "var(--lp-mock-img)" }} />
                  <span className="lp-mock-source-pill" style={{ background: "#FF6600" }}>Hacker News</span>
                  <span className="lp-mock-time">2h ago</span>
                </div>
                <div className="lp-mock-body">
                  <div className="lp-mock-topic">AI &amp; Machine Learning</div>
                  <div className="lp-mock-title">Claude 4 Opus surpasses human experts on MMLU-Pro benchmark by 6 points</div>
                  <div className="lp-mock-summary">Anthropic&apos;s latest flagship model sets a new bar across medicine, law, and advanced reasoning.</div>
                  <div className="lp-mock-impact">
                    <div className="lp-mock-impact-label">How this affects you</div>
                    <div className="lp-mock-impact-text">API tier 2+ developers get access within 30 days at significantly lower cost per token.</div>
                  </div>
                  <div className="lp-mock-actions">
                    <div className="lp-mock-btns">
                      <span className="lp-mock-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
                      <span className="lp-mock-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
                      <span className="lp-mock-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
                      <span className="lp-mock-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
                    </div>
                    <Link href="/auth" className="lp-mock-read">Read →</Link>
                  </div>
                </div>
              </div>
              <div className="lp-mock-card">
                <div className="lp-mock-card-img">
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1a2530,#0d1520)" }} />
                  <span className="lp-mock-source-pill" style={{ background: "#FF4500" }}>Reddit</span>
                  <span className="lp-mock-time">4h ago</span>
                </div>
                <div className="lp-mock-body">
                  <div className="lp-mock-topic">Geopolitics</div>
                  <div className="lp-mock-title">India and EU finalise landmark trade deal - largest bilateral agreement in history</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOURCES STRIP ── */}
        <div className="lp-sources">
          <div className="lp-sources-inner">
            <span className="lp-sources-label">Curated from</span>
            <span className="lp-source-sep">·</span>
            {[
              { label: "Hacker News", color: "#FF6600" },
              { label: "Reddit", color: "#FF4500" },
              { label: "Dev.to", color: "#7B8FFF" },
              { label: "Al Jazeera", color: "#0098D4" },
              { label: "Atlas News", color: "#5BA4CF" },
              { label: "RSS Feeds", color: "#FFA500" },
            ].map((s) => (
              <span key={s.label} className="lp-source-tag" style={{ color: s.color }}>{s.label}</span>
            ))}
            <span className="lp-sources-label" style={{ marginLeft: "auto" }}>More sources coming soon</span>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="lp-stats">
          <div className="lp-stats-inner">
            {[
              { num: "10k+", label: "Articles ranked daily" },
              { num: "20+", label: "Topic categories" },
              { num: "6", label: "Curated sources" },
              { num: "3", label: "Digest frequencies" },
            ].map((s) => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURE: AI Intelligence ── */}
        <section className="lp-section">
          <div className="lp-feat-split">
            <div>
              <p className="lp-overline">AI intelligence</p>
              <h2 className="lp-h2">Don&apos;t just read headlines.<br />Understand them.</h2>
              <p className="lp-h2-sub" style={{ marginBottom: 32 }}>
                Every article gets a 2-sentence neutral summary and a plain-English &quot;how this affects you&quot; block - whether you&apos;re a developer, investor, or just curious.
              </p>
              <div className="lp-feat-list">
                {[
                  "Neutral 2–3 sentence summary - no spin, no padding",
                  "\"How this affects you\" tailored to your specific interests",
                  "Tap ? on any card to see exactly why it appeared in your feed",
                ].map((t) => (
                  <div key={t} className="lp-feat-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" style={{ marginTop: 3, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="lp-feat-list-text">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-feat-visual">
              <div className="lp-impact-demo">
                <div className="lp-impact-demo-card">
                  <div className="lp-impact-demo-title">US Federal Reserve holds rates at 4.25% - signals two cuts before year-end</div>
                  <div className="lp-impact-demo-text">Minutes showed broad consensus to wait for more inflation data before easing, despite recent CPI cooling to 2.3%.</div>
                  <div className="lp-impact-demo-block">
                    <div className="lp-impact-demo-block-label">How this affects you</div>
                    <div className="lp-impact-demo-block-text">Mortgage and loan rates stay elevated through Q3. Equity markets likely rally on the two-cut signal.</div>
                  </div>
                </div>
                <div className="lp-impact-demo-card" style={{ opacity: 0.45 }}>
                  <div className="lp-impact-demo-title">EU passes mandatory right-to-repair legislation for consumer electronics</div>
                  <div className="lp-impact-demo-text" style={{ marginBottom: 0 }}>Manufacturers must provide spare parts and manuals for 10 years after...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE: Smart Ranking ── */}
        <section className="lp-section-sm">
          <div className="lp-feat-split" style={{ direction: "rtl" }}>
            <div style={{ direction: "ltr" }}>
              <p className="lp-overline">Smart ranking</p>
              <h2 className="lp-h2">A feed that adapts<br />as you evolve.</h2>
              <p className="lp-h2-sub" style={{ marginBottom: 32 }}>
                Pick your topics on day one. As you like, save, and read, Distilled quietly re-weights its algorithm to surface more of what actually captures you.
              </p>
              <div className="lp-feat-list">
                {[
                  "No black-box algorithm - view and adjust topic weights yourself",
                  "Fresh articles re-ranked every few hours from live sources",
                  "Trending stories surface automatically across all your interests",
                ].map((t) => (
                  <div key={t} className="lp-feat-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" style={{ marginTop: 3, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="lp-feat-list-text">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-feat-visual" style={{ direction: "ltr" }}>
              <div style={{ fontSize: 10, color: "var(--lp-sources-label)", marginBottom: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Your topics</div>
              <div className="lp-topics-demo">
                {[{l:"AI",a:true},{l:"Programming",a:true},{l:"Finance",a:true},{l:"Security",a:false},{l:"Startups",a:true},{l:"Cloud",a:false},{l:"Geopolitics",a:true},{l:"Gaming",a:false}].map((t) => (
                  <div key={t.l} className={`lp-topic-chip${t.a?" active":""}`}>
                    <div className={`lp-topic-check${t.a?" checked":""}`}>{t.a&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}</div>{t.l}
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "var(--lp-card-border)", margin: "16px 0" }} />
              <div style={{ fontSize: 10, color: "var(--lp-sources-label)", marginBottom: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Your ranked feed</div>
              <div className="lp-feed-preview">
                {[
                  {dot:"#f97316",text:"Claude 4 Opus sets new MMLU-Pro record - what it means for devs",src:"HN"},
                  {dot:"#0ea5e9",text:"TypeScript 6.0 ships with native ESM resolution and inferred generics",src:"Dev.to"},
                  {dot:"#10b981",text:"India-EU trade deal: sectors that gain most in 2026",src:"Atlas"},
                ].map((row) => (
                  <div key={row.text} className="lp-feed-row">
                    <div className="lp-feed-row-dot" style={{ background: row.dot, boxShadow: `0 0 6px ${row.dot}` }} />
                    <div className="lp-feed-row-text">{row.text}</div>
                    <div className="lp-feed-row-source">{row.src}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <div className="lp-hiw-bg" id="how-it-works">
          <div className="lp-hiw">
            <div style={{ maxWidth: 520 }}>
              <p className="lp-overline">How it works</p>
              <h2 className="lp-h2" style={{ marginBottom: 0 }}>Up and running<br />in three steps.</h2>
            </div>
            <div className="lp-hiw-steps">
              {[
                { num:"01", title:"Pick your interests", desc:"Choose from 20+ categories - AI, Finance, Security, Geopolitics, and more. Your personalised feed is built instantly around what you select." },
                { num:"02", title:"Get your ranked feed", desc:"Distilled ingests articles every few hours and ranks them by relevance. AI summaries and impact blocks generate automatically on every card." },
                { num:"03", title:"Read on your schedule", desc:"Dip in whenever you like, or receive a curated email digest - daily, weekly, or monthly - with only the highlights that actually matter to you." },
              ].map((s) => (
                <div key={s.num} className="lp-step">
                  <div className="lp-step-num">{s.num}</div>
                  <div className="lp-step-title">{s.title}</div>
                  <div className="lp-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECONDARY FEATURES ── */}
        <section className="lp-section" id="pricing">
          <div style={{ marginBottom: 44 }}>
            <p className="lp-overline">Everything included</p>
            <h2 className="lp-h2" style={{ marginBottom: 8 }}>Free, forever.</h2>
            <p className="lp-h2-sub">No tiers, no paywalls, no credit card required. Every feature ships to every user.</p>
          </div>
          <div className="lp-grid">
            <div className="lp-grid-card">
              <span className="lp-grid-card-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <div className="lp-grid-card-title">Email digests that don&apos;t suck</div>
              <div className="lp-grid-card-desc">Daily, weekly, or monthly - each digest ships only the articles you&apos;d actually open, with summaries already included.</div>
              <div className="lp-digest-demo">
                <div className="lp-digest-header">
                  <div className="lp-digest-from">From: <strong>Distilled Weekly</strong> · Your 5 top stories</div>
                </div>
                <div className="lp-digest-body">
                  {["Claude 4 Opus redefines expert-level AI benchmarks","India-EU trade deal: what changes for tech exports","Fed holds rates; two cuts signalled for H2 2026"].map((t,i) => (
                    <div key={t} className="lp-digest-item"><span className="lp-digest-item-num">{i+1}.</span><span>{t}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lp-grid-card">
              <span className="lp-grid-card-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
              <div className="lp-grid-card-title">Save for later</div>
              <div className="lp-grid-card-desc">Bookmark any article in one tap. Your saved list is always there - synced across devices and fully searchable.</div>
            </div>
            <div className="lp-grid-card">
              <span className="lp-grid-card-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></span>
              <div className="lp-grid-card-title">Light &amp; dark mode</div>
              <div className="lp-grid-card-desc">Toggle freely or follow your system preference. Both themes are crafted from scratch - not just an inverted palette.</div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <div className="lp-cta-inner">
            <h2 className="lp-cta-h2">Stop drowning in tabs.<br />Start reading with intent.</h2>
            <p className="lp-cta-sub">Free forever. No credit card. 60 seconds to your first personalised feed.</p>
            <Link href="/auth" className="lp-cta-btn">
              Create your free account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </Link>
            <p className="lp-cta-note">No spam. Unsubscribe from digests anytime.</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer-wrap">
          <div className="lp-footer-main">
            {/* Brand column */}
            <div className="lp-footer-brand">
              <Link href="/" className="lp-footer-logo">
                <div className="lp-footer-logo-img">
                  <Image src="/logo.jpeg" alt="Distilled" width={36} height={36} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                </div>
                <span className="lp-footer-logo-name">Distilled</span>
              </Link>
              <p className="lp-footer-tagline">
                AI-curated news platform that ranks, summarises, and explains articles tailored to your interests. Stay informed without the noise.
              </p>
              <div className="lp-footer-social">
                {/* Twitter/X */}
                <a href="#" className="lp-footer-social-btn" aria-label="Twitter / X">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* GitHub */}
                <a href="#" className="lp-footer-social-btn" aria-label="GitHub">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="lp-footer-social-btn" aria-label="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Product column */}
            <div>
              <div className="lp-footer-col-title">Product</div>
              <div className="lp-footer-col-links">
                {[
                  { label: "Feed", href: "/feed" },
                  { label: "Saved articles", href: "/saved" },
                  { label: "Read history", href: "/history" },
                  { label: "Preferences", href: "/profile" },
                  { label: "Install app", href: "#install" },
                ].map((l) => (
                  <Link key={l.label} href={l.href} className="lp-footer-col-link">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Company column */}
            <div>
              <div className="lp-footer-col-title">Company</div>
              <div className="lp-footer-col-links">
                {[
                  { label: "About us", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Status page", href: "#" },
                  { label: "Support", href: "mailto:support@distilled.blog" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="lp-footer-col-link">{l.label}</a>
                ))}
              </div>
            </div>

            {/* Legal column */}
            <div>
              <div className="lp-footer-col-title">Legal</div>
              <div className="lp-footer-col-links">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/privacy#cookies" },
                  { label: "GDPR", href: "/privacy#gdpr" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="lp-footer-col-link">{l.label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span className="lp-footer-copy">© 2026 Distilled. All rights reserved. Built with ♥ for curious minds.</span>
            <div className="lp-footer-bottom-links">
              <a href="mailto:support@distilled.blog" className="lp-footer-bottom-link">support@distilled.blog</a>
              <Link href="/privacy" className="lp-footer-bottom-link">Privacy</Link>
              <Link href="/terms" className="lp-footer-bottom-link">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
