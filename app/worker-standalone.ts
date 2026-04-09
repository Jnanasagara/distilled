/**
 * Standalone BullMQ worker entry point.
 *
 * Run this as a separate process (Railway "worker" service) so the
 * background job processor is independent of the Next.js web server:
 *
 *   npm run worker
 *
 * Environment variables are the same as the web server (.env / Railway vars).
 * Redis and Postgres must be reachable from this process.
 */

import { startWorker } from "@/lib/worker";
import { scheduleIngestion } from "@/lib/queue";

async function main() {
  console.log("Starting standalone worker process...");

  // Register the recurring ingest schedules in Redis.
  // upsertJobScheduler is idempotent so this is safe to run on every boot.
  await scheduleIngestion();

  // Start the BullMQ worker that processes those scheduled jobs.
  const worker = startWorker();

  console.log("✅ Worker running. Waiting for jobs...");

  // Keep the process alive and handle clean shutdown.
  const shutdown = async () => {
    console.log("Shutting down worker...");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
