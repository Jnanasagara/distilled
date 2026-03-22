export default function FeedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 40, fontWeight: 800, color: "#0f1132" }}>
        Distilled
      </h1>
      <p style={{ color: "#6b7280", fontSize: 16, marginTop: 8 }}>
        🚧 Feed coming in Sprint 3
      </p>
      <a href="/preferences" style={{
        marginTop: 24,
        padding: "12px 24px",
        background: "linear-gradient(135deg, #4f52d3, #3b82f6)",
        color: "#fff",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14,
      }}>
        ← Edit Preferences
      </a>
    </div>
  );
}