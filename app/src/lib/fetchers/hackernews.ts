import axios from "axios";

export interface FetchedItem {
  title: string;
  url: string;
  sourceUrl?: string;   // ← add this
  author?: string;
  publishedAt?: Date;
  source: string;
  imageUrl?: string | null;
}

export async function fetchHackerNews(limit = 30): Promise<FetchedItem[]> {
  try {
    const { data: topIds } = await axios.get<number[]>(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    const ids = topIds.slice(0, limit);

    const items = await Promise.allSettled(
      ids.map((id) =>
        axios
          .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then((r) => r.data)
      )
    );

    return items
      .filter(
        (r): r is PromiseFulfilledResult<any> =>
          r.status === "fulfilled" && r.value?.url
      )
      .map((r) => ({
        title: r.value.title,
        url: r.value.url,
        sourceUrl: `https://news.ycombinator.com/item?id=${r.value.id}`,  // ← HN post URL
        author: r.value.by,
        publishedAt: r.value.time
          ? new Date(r.value.time * 1000)
          : undefined,
        source: "hackernews",
        imageUrl: null,
      }));
  } catch (error) {
    console.error("HackerNews fetch error:", error);
    return [];
  }
}