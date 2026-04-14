import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { fetchContentForTopic, FetchedItem, TimeFilter } from "@/lib/fetchers";
import { summarizeContent } from "@/lib/summarize";

// Hard daily cap enforced via Redis — shared across ALL ingest job types
// (fresh runs 4×/day + trending 1×/day + archive every 3 days = ~21+ calls without this).
// Free tier: 20 RPD, 5 RPM. Cap at 16 to leave a safe buffer.
const DAILY_GEMINI_CAP = 16;

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
      // 13s delay keeps us safely under 5 RPM (4.6 RPM).
      if (!result.summary && await canCallGemini()) {
        await new Promise((r) => setTimeout(r, 13000));
        const ai = await summarizeContent(item.title, item.url);
        if (ai) {
          await prisma.content.update({
            where: { id: result.id },
            data: { summary: ai.summary, impact: ai.impact },
          });
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
