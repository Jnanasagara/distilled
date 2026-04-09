export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { scheduleIngestion } = await import("./lib/queue");

    // Always register the schedules in Redis (idempotent).
    await scheduleIngestion();

    // Only start the in-process worker when there is NO dedicated worker
    // service running (i.e. DEDICATED_WORKER is not set to "true").
    // On Railway: set DEDICATED_WORKER=true on the web service when you have
    // a separate worker service running worker-standalone.ts.
    if (process.env.DEDICATED_WORKER !== "true") {
      const { startWorker } = await import("./lib/worker");
      startWorker();
      console.log("✅ In-process worker started and ingestion scheduled");
    } else {
      console.log("✅ Ingestion scheduled (dedicated worker handles processing)");
    }
  }
}