export default function UnsubscribedPage() {
  return (
    <div style={{
      fontFamily: "Inter, -apple-system, sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", margin: "0 auto 24px" }}>
          <img src="/android-chrome-192x192.png" alt="Distilled" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          Unsubscribed
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
          You've been unsubscribed from Distilled digest emails. You won't receive any more digest emails.
        </p>
        <a
          href="/preferences"
          style={{
            display: "inline-block", padding: "12px 24px",
            background: "#0f172a", color: "#ffffff",
            textDecoration: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 700,
          }}
        >
          Manage preferences →
        </a>
      </div>
    </div>
  );
}
