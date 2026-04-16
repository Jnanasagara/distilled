import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { fetchContentForTopic, FetchedItem, TimeFilter } from "@/lib/fetchers";
import { summarizeContent, RateLimitError } from "@/lib/summarize";

// Hard daily cap enforced via Redis — shared across ALL ingest job types.
// Google Gemini free tier: 1500 RPD. Cap at 1000 to leave a buffer.
const DAILY_GEMINI_CAP = 1000;

// Atomically increment the daily Redis counter before each Gemini call.
// Returns true if the call is allowed, false if daily cap is reached.
async function canCallGemini(): Promise<boolean> {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
    const key = `gemini:daily:${today}`;
    const count = await redis.incr(key);
    if (count === 1) {
      // First call today — expire key after 25 hours so it cleans itself up
      await redis.expire(key, 25 * 60 * 60);
    }
    if (count > DAILY_GEMINI_CAP) {
      console.log(`Gemini daily cap reached (${count}/${DAILY_GEMINI_CAP}), skipping summarization.`);
      return false;
    }
    return true;
  } catch {
    // Redis unavailable — skip summarization rather than risk blowing quota
    console.warn("Redis unavailable for Gemini cap check, skipping summarization.");
    return false;
  }
}

export async function ingestContentForTopic(
  topicId: string,
  topicSlug: string,
  timeFilter: TimeFilter = "day",
): Promise<number> {
  const items: FetchedItem[] = await fetchContentForTopic(topicSlug, timeFilter);

  let saved = 0;

  for (const item of items) {
    try {
      const result = await prisma.content.upsert({
        where: { url: item.url },
        update: {
          sourceUrl: item.sourceUrl ?? null,
        },
        create: {
          title: item.title,
          url: item.url,
          sourceUrl: item.sourceUrl ?? null,
          source: item.source,
          author: item.author,
          publishedAt: item.publishedAt,
          imageUrl: item.imageUrl ?? null,
          topicId,
        },
      });

      // Summarize only if: no summary yet AND global daily cap not reached.
      // 6s delay keeps us at ~10 RPM, safely under Gemini's 15 RPM free limit.
      if (!result.summary && await canCallGemini()) {
        await new Promise((r) => setTimeout(r, 6000));
        try {
          const ai = await summarizeContent(item.title, item.url);
          if (ai) {
            await prisma.content.update({
              where: { id: result.id },
              data: { summary: ai.summary, impact: ai.impact },
            });
          }
        } catch (err) {
          if (err instanceof RateLimitError) {
            // Provider rejected after all retries — no successful API call was
            // processed, so return the slot to avoid burning the daily cap.
            try {
              const today = new Date().toISOString().slice(0, 10);
              await redis.decr(`gemini:daily:${today}`);
            } catch {
              // Redis unavailable — accept the wasted slot rather than crash
            }
            console.warn("Gemini rate-limited after retries; slot returned to daily cap.");
          }
        }
      }

      saved++;
    } catch {
      // skip duplicates or bad URLs
    }
  }

  return saved;
}

export async function ingestAllTopics(
  timeFilter: TimeFilter = "day"
): Promise<void> {
  const topics = await prisma.topic.findMany();
  console.log(`Starting ingestion for ${topics.length} topics...`);

  for (const topic of topics) {
    const count = await ingestContentForTopic(topic.id, topic.slug, timeFilter);
    console.log(`✅ ${topic.name}: ${count} items saved`);
  }

  console.log("Ingestion complete.");
}
