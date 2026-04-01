import axios from "axios";
import { FetchedItem } from "./hackernews";

export async function fetchReddit(
  subreddit: string,
  limit = 20,
  timeFilter: "day" | "week" | "month" | "year" | "all" = "day"
): Promise<FetchedItem[]> {
  try {
    const { data } = await axios.get(
      `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=${timeFilter}`,
      { headers: { "User-Agent": "distilled-app/1.0" } }
    );

    return data.data.children
      .filter((post: any) => post.data.url) // ← remove the !is_self filter
      .map((post: any) => {
        const thumbnail = post.data.thumbnail;
        const postUrl = post.data.url as string;
      
        // Check if the post URL is a direct image
        const isDirectImage =
          postUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) ||
          postUrl.includes("i.redd.it") ||
          postUrl.includes("i.imgur.com");
      
        const isValidThumb =
          thumbnail &&
          thumbnail.startsWith("http") &&
          !["self", "default", "nsfw", "spoiler"].includes(thumbnail);
      
        // Prefer direct image URL, fall back to thumbnail
        const imageUrl = isDirectImage
          ? postUrl
          : isValidThumb
          ? thumbnail
          : null;
      
        return {
          title: post.data.title,
          url: isDirectImage
            ? `https://reddit.com${post.data.permalink}` // for image posts, "Read more" goes to Reddit
            : postUrl,
          sourceUrl: `https://reddit.com${post.data.permalink}`,
          author: post.data.author,
          publishedAt: new Date(post.data.created_utc * 1000),
          source: "reddit",
          imageUrl,
        };
      });
  } catch (error) {
    console.error(`Reddit fetch error (r/${subreddit}):`, error);
    return [];
  }
}