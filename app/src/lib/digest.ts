import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendDigestEmail } from "@/lib/email";
import { scoreArticle } from "@/lib/algorithm";

const DIGEST_ARTICLE_COUNT = 6;

function lookbackMs(frequency: "DAILY" | "WEEKLY" | "MONTHLY"): number {
  switch (frequency) {
    case "WEEKLY":  return 7  * 24 * 60 * 60 * 1000;
    case "MONTHLY": return 30 * 24 * 60 * 60 * 1000;
    default:        return 24 * 60 * 60 * 1000;
  }
}

function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(userId).digest("hex");
}

export async function sendDigests(frequency: "DAILY" | "WEEKLY" | "MONTHLY") {
  console.log(`Starting ${frequency} digest send...`);

  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      onboarded: true,
      isBanned: false,
      preferences: { frequency, digestUnsubscribed: false },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log(`Found ${users.length} users for ${frequency} digest`);

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const userTopics = await prisma.userTopic.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        include: { topic: true },
      });

      if (userTopics.length === 0) continue;

      const topicIds = userTopics.map((ut) => ut.topicId);
      const topicWeightMap = new Map(userTopics.map((ut) => [ut.topicId, ut.weight]));

      const since = new Date(Date.now() - lookbackMs(frequency));
      const articles = await prisma.content.findMany({
        where: {
          topicId: { in: topicIds },
          publishedAt: { gte: since },
        },
        include: { topic: true },
        orderBy: { publishedAt: "desc" },
        take: 100,
      });

      if (articles.length === 0) continue;

      const scored = articles
        .map((a) => ({ ...a, _score: scoreArticle(a, topicWeightMap) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, DIGEST_ARTICLE_COUNT);

      const digestArticles = scored.map((a) => ({
        title: a.title,
        url: a.url,
        source: a.source,
        topicName: a.topic?.name ?? null,
        topicEmoji: a.topic?.emoji ?? null,
      }));

      const unsubscribeToken = generateUnsubscribeToken(user.id);
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/api/unsubscribe?uid=${user.id}&token=${unsubscribeToken}`;

      await sendDigestEmail(user.email, user.name, digestArticles, frequency, unsubscribeUrl);
      sent++;
    } catch (err) {
      console.error(`Failed to send digest to ${user.email}:`, err);
      failed++;
    }
  }

  console.log(`${frequency} digest complete — sent: ${sent}, failed: ${failed}`);
}
