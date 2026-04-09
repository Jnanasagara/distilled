import Parser from "rss-parser";
import { FetchedItem } from "./hackernews";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "enclosure"],
  },
});

export async function fetchRSS(
  url: string,
  limit = 15
): Promise<FetchedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items
      .slice(0, limit)
      .map((item: any) => {
        const imageUrl =
          item["media:content"]?.$.url ||
          item["media:thumbnail"]?.$.url ||
          item.enclosure?.url ||
          null;

        return {
          title: item.title ?? "",
          url: item.link ?? "",
          sourceUrl: item.link ?? null,  // original article link is the source
          author: item.creator || item.author || null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          source: "rss",
          imageUrl,
        };
      })
      .filter((item) => item.url && item.title);
  } catch (error) {
    console.error(`RSS fetch error (${url}):`, error);
    return [];
  }
}