import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { fetchContentForTopic, FetchedItem, TimeFilter } from "@/lib/fetchers";
import { summarizeContent, RateLimitError } from "@/lib/summarize";

// Hard daily cap — Groq free tier allows 14,400 RPD. Cap at 10,000 to leave buffer.
const DAILY_AI_CAP = 10000;

// Atomically increment the daily Redis counter before each AI call.
// Returns true if the call is allowed, false if daily cap is reached.
async function canCallAI(): Promise<boolean> {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
    const key = `ai:daily:${today}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 25 * 60 * 60);
    }
    if (count > DAILY_AI_CAP) {
      console.log(`AI daily cap reached (${count}/${DAILY_AI_CAP}), skipping summarization.`);
      return false;
    }
    return true;
  } catch {
    console.warn("Redis unavailable for AI cap check, skipping summarization.");
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
      // 3s delay keeps us at ~20 RPM, safely under Groq's 30 RPM free limit.
      if (!result.summary && await canCallAI()) {
        await new Promise((r) => setTimeout(r, 3000));
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
            try {
              const today = new Date().toISOString().slice(0, 10);
              await redis.decr(`ai:daily:${today}`);
            } catch {
              // Redis unavailable — accept the wasted slot rather than crash
            }
            console.warn("Groq rate-limited after retries; slot returned to daily cap.");
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
