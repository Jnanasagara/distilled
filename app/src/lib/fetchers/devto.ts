import axios from "axios";
import { FetchedItem } from "./hackernews";

export async function fetchDevTo(
  tag: string,
  limit = 20
): Promise<FetchedItem[]> {
  try {
    const { data } = await axios.get(
      `https://dev.to/api/articles?tag=${tag}&per_page=${limit}&top=7`
    );

    return data.map((article: any) => ({
      title: article.title,
      url: article.url,
      sourceUrl: article.url,   // Dev.to article page is the canonical source
      author: article.user?.name,
      publishedAt: article.published_at
        ? new Date(article.published_at)
        : undefined,
      source: "devto",
      imageUrl: article.cover_image ?? article.social_image ?? null,
    }));
  } catch (error) {
    console.error("Dev.to fetch error:", error);
    return [];
  }
}