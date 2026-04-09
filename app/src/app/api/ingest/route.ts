import { NextResponse } from "next/server";
import { ingestAllTopics } from "@/lib/ingest";
import { scheduleIngestion } from "@/lib/queue";
import { TimeFilter } from "@/lib/fetchers";
import { rateLimit, getIp, rateLimitedResponse } from "@/lib/rate-limit";

function frequencyToTimeFilter(frequency: string): TimeFilter {
  switch (frequency) {
    case "WEEKLY": return "week";
    case "MONTHLY": return "month";
    default: return "day";
  }
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.INGEST_SECRET;
  if (!secret) return false; // require secret to be configured
  const auth = req.headers.get("x-ingest-secret");
  return auth === secret;
}

// Manual trigger: POST /api/ingest
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { limited } = await rateLimit(`ingest:${getIp(req)}`, 10, 60);
  if (limited) return rateLimitedResponse(60);
  try {
    const body = await req.json().catch(() => ({}));
    const timeFilter = frequencyToTimeFilter(body.frequency ?? "DAILY");
    await ingestAllTopics(timeFilter);
    return NextResponse.json({ success: true, message: "Ingestion complete" });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}

// Scheduled trigger: POST /api/ingest/schedule
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await scheduleIngestion();
    return NextResponse.json({ success: true, message: "Ingestion scheduled" });
  } catch (error) {
    console.error("Schedule error:", error);
    return NextResponse.json({ error: "Scheduling failed" }, { status: 500 });
  }
}