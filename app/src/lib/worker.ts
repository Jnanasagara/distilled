import { Worker } from "bullmq";
import { ingestAllTopics } from "@/lib/ingest";

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

export function startWorker() {
  const worker = new Worker(
    "content-ingestion",
    async (job) => {
      console.log(`Processing job: ${job.name}`);
      
      const timeFilter = job.data?.timeFilter ?? "day";
      console.log(`Time filter: ${timeFilter}`);
      await ingestAllTopics(timeFilter);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });

  return worker;
}