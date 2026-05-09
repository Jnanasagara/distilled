import { Queue } from "bullmq";

function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const parsed = new URL(redisUrl);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : 6379,
    password: parsed.password || undefined,
  };
}

const connection = getRedisConnection();

export const contentQueue = new Queue("content-ingestion", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
  },
});

// upsertJobScheduler is idempotent — safe to call on every server start.
// It updates the existing schedule if one with the same schedulerId already
// exists in Redis, rather than creating a duplicate job.
export async function scheduleIngestion() {
  // Refresh "top of day" content every 6 hours
  await contentQueue.upsertJobScheduler(
    "ingest-fresh",                       // stable scheduler ID
    { every: 1000 * 60 * 60 * 6 },       // every 6 hours
    { name: "ingest-fresh", data: { timeFilter: "day" } }
  );

  // Pull in week-old trending content once per day
  await contentQueue.upsertJobScheduler(
    "ingest-trending",
    { every: 1000 * 60 * 60 * 24 },      // every 24 hours
    { name: "ingest-trending", data: { timeFilter: "week" } }
  );

  // Backfill deep archive content every 3 days
  await contentQueue.upsertJobScheduler(
    "ingest-archive",
    { every: 1000 * 60 * 60 * 24 * 3 },  // every 3 days
    { name: "ingest-archive", data: { timeFilter: "month" } }
  );

  console.log("✅ Ingestion schedules registered (fresh/trending/archive)");
}

export async function scheduleDigests() {
  // Daily digest — runs every 24 hours
  await contentQueue.upsertJobScheduler(
    "digest-daily",
    { every: 1000 * 60 * 60 * 24 },
    { name: "digest-daily", data: { frequency: "DAILY" } }
  );

  // Weekly digest — runs every 7 days
  await contentQueue.upsertJobScheduler(
    "digest-weekly",
    { every: 1000 * 60 * 60 * 24 * 7 },
    { name: "digest-weekly", data: { frequency: "WEEKLY" } }
  );

  // Monthly digest — runs every 30 days
  await contentQueue.upsertJobScheduler(
    "digest-monthly",
    { every: 1000 * 60 * 60 * 24 * 30 },
    { name: "digest-monthly", data: { frequency: "MONTHLY" } }
  );

  console.log("✅ Digest schedules registered (daily/weekly/monthly)");
}