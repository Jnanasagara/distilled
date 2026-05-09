export const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  devto: "#3B49DF",
  rss: "#FFA500",
  aljazeera: "#007A5E",
  atlas: "#6366F1",
};

export const FALLBACK_GRADIENTS: Record<string, string> = {
  reddit:      "linear-gradient(135deg, #FF4500 0%, #FF6534 100%)",
  hackernews:  "linear-gradient(135deg, #FF6600 0%, #FF8C33 100%)",
  devto:       "linear-gradient(135deg, #374151 0%, #4B5563 100%)",
  rss:         "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  aljazeera:   "linear-gradient(135deg, #007A5E 0%, #00A87D 100%)",
  atlas:       "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
};

export const SOURCE_FALLBACK_IMAGES: Record<string, string> = {
  hackernews: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  devto:      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  reddit:     "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80",
  rss:        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  aljazeera:  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  atlas:      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
};

export const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  devto: "Dev.to",
  rss: "RSS",
  aljazeera: "Al Jazeera",
  atlas: "Atlas",
};

export const SOURCE_EMOJI: Record<string, string> = {
  hackernews: "🔶",
  reddit: "🔴",
  devto: "💻",
  rss: "📰",
  aljazeera: "🌍",
  atlas: "🔗",
};

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
