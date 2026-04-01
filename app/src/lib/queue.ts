import { Queue } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

export const contentQueue = new Queue("content-ingestion", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
  },
});

export async function scheduleIngestion() {
  // Daily ingest — every 6 hours
  await contentQueue.add(
    "ingest-daily",
    { timeFilter: "day" },
    {
      repeat: {
        every: 1000 * 60 * 60 * 6, // 6 hours
      },
    }
  );

  // Weekly ingest — every 24 hours
  await contentQueue.add(
    "ingest-weekly",
    { timeFilter: "week" },
    {
      repeat: {
        every: 1000 * 60 * 60 * 24, // 24 hours
      },
    }
  );

  // Monthly ingest — every 3 days
  await contentQueue.add(
    "ingest-monthly",
    { timeFilter: "month" },
    {
      repeat: {
        every: 1000 * 60 * 60 * 24 * 3, // 72 hours
      },
    }
  );

  console.log("✅ Ingestion jobs scheduled (daily/weekly/monthly)");
}