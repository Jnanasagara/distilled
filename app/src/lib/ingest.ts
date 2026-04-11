import { prisma } from "@/lib/prisma";
import { fetchContentForTopic, FetchedItem, TimeFilter } from "@/lib/fetchers";
import { summarizeContent } from "@/lib/summarize";

// Global cap per full ingest cycle — not per topic.
// Free tier: 1500 RPD. With ingest running ~3x/day this gives 500/run headroom,
// but we cap at 20 to be conservative and leave room for retries.
const SUMMARIZE_CAP_PER_RUN = 20;

export async function ingestContentForTopic(
  topicId: string,
  topicSlug: string,
  timeFilter: TimeFilter = "day",
  summarizeCounter: { count: number }
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

      // Summarize only if: no summary yet AND global cap not reached.
      // 5-second delay = 12 RPM, safely under the free-tier 15 RPM limit.
      if (!result.summary && summarizeCounter.count < SUMMARIZE_CAP_PER_RUN) {
        summarizeCounter.count++;
        await new Promise((r) => setTimeout(r, 5000));
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

  // Shared counter passed by reference — caps total Gemini calls across all topics
  const summarizeCounter = { count: 0 };

  for (const topic of topics) {
    const count = await ingestContentForTopic(topic.id, topic.slug, timeFilter, summarizeCounter);
    console.log(`✅ ${topic.name}: ${count} items saved`);
  }

  console.log(`Ingestion complete! Summarized ${summarizeCounter.count} articles.`);
}
