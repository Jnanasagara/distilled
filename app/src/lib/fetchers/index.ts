import { fetchHackerNews, FetchedItem } from "./hackernews";
import { fetchDevTo } from "./devto";
import { fetchReddit } from "./reddit";
import { fetchRSS } from "./rss";

export type TimeFilter = "day" | "week" | "month" | "year" | "all";

type TopicFetcher = (timeFilter?: TimeFilter) => Promise<FetchedItem[]>;

const TOPIC_SOURCE_MAP: { [key: string]: TopicFetcher } = {
  memes: async (t = "day") => {
    const [r1, r2, r3] = await Promise.all([
      fetchReddit("memes", 15, t),
      fetchReddit("dankmemes", 10, t),
      fetchReddit("funny", 10, t),
    ]);
    return [...r1, ...r2, ...r3];
  },
  technology: async (t = "day") => {
    const [hn, devto, reddit, rss, atlas] = await Promise.all([
      fetchHackerNews(15),
      fetchDevTo("technology", 10),
      fetchReddit("technology", 10, t),
      fetchRSS("https://feeds.wired.com/wired/index", 10),
      fetchRSS("https://links.atlasdev.club/feeds/shared", 10, "atlas"),
    ]);
    return [...hn, ...devto, ...reddit, ...rss, ...atlas];
  },
  "artificial-intelligence": async (t = "day") => {
    const [hn, devto, reddit, rss] = await Promise.all([
      fetchHackerNews(15),
      fetchDevTo("ai", 10),
      fetchReddit("MachineLearning", 10, t),
      fetchRSS("https://feeds.feedburner.com/blogspot/gJZg", 10),
    ]);
    return [...hn, ...devto, ...reddit, ...rss];
  },
  "web-development": async (t = "day") => {
    const [devto, reddit, rss] = await Promise.all([
      fetchDevTo("webdev", 15),
      fetchReddit("webdev", 10, t),
      fetchRSS("https://css-tricks.com/feed/", 10),
    ]);
    return [...devto, ...reddit, ...rss];
  },
  finance: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("investing", 10, t),
      fetchReddit("personalfinance", 10, t),
      fetchRSS("https://feeds.reuters.com/reuters/businessNews", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  science: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("science", 10, t),
      fetchReddit("EverythingScience", 10, t),
      fetchRSS("https://rss.scientificamerican.com/Scientific_American_Mind", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  design: async (t = "day") => {
    const [devto, reddit, rss] = await Promise.all([
      fetchDevTo("design", 10),
      fetchReddit("Design", 10, t),
      fetchRSS("https://feeds.feedburner.com/smashingmagazine", 10),
    ]);
    return [...devto, ...reddit, ...rss];
  },
  startups: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("startups", 10, t),
      fetchReddit("entrepreneur", 10, t),
      fetchRSS("https://techcrunch.com/startups/feed/", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  cybersecurity: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("netsec", 10, t),
      fetchReddit("cybersecurity", 10, t),
      fetchRSS("https://feeds.feedburner.com/TheHackersNews", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  health: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("health", 10, t),
      fetchReddit("nutrition", 10, t),
      fetchRSS("https://rss.medicalnewstoday.com/featurednews.xml", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  climate: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("climate", 10, t),
      fetchReddit("environment", 10, t),
      fetchRSS("https://www.theguardian.com/environment/climate-crisis/rss", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  crypto: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("cryptocurrency", 10, t),
      fetchReddit("Bitcoin", 10, t),
      fetchRSS("https://cointelegraph.com/rss", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  space: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("space", 10, t),
      fetchReddit("SpaceX", 10, t),
      fetchRSS("https://www.space.com/feeds/all", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  geopolitics: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("geopolitics", 10, t),
      fetchReddit("worldnews", 10, t),
      fetchRSS("https://www.aljazeera.com/xml/rss/all.xml", 15, "aljazeera"),
    ]);
    return [...r1, ...r2, ...rss];
  },
  gaming: async (t = "day") => {
    const [r1, r2, rss] = await Promise.all([
      fetchReddit("gaming", 10, t),
      fetchReddit("Games", 10, t),
      fetchRSS("https://www.polygon.com/rss/index.xml", 10),
    ]);
    return [...r1, ...r2, ...rss];
  },
  culture: async (t = "day") => {
    const [r1, r2, devto, rss] = await Promise.all([
      fetchReddit("Music", 10, t),
      fetchReddit("books", 10, t),
      fetchDevTo("culture", 10),
      fetchRSS("https://pitchfork.com/rss/news/feed.xml", 10),
    ]);
    return [...r1, ...r2, ...devto, ...rss];
  },
};

export async function fetchContentForTopic(
  topicSlug: string,
  timeFilter: TimeFilter = "day"
): Promise<FetchedItem[]> {
  const fetcher = TOPIC_SOURCE_MAP[topicSlug];
  if (!fetcher) return [];
  return fetcher(timeFilter);
}

export type { FetchedItem };