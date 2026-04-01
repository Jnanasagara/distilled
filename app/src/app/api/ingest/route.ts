import { NextResponse } from "next/server";
import { ingestAllTopics } from "@/lib/ingest";
import { scheduleIngestion } from "@/lib/queue";
import { TimeFilter } from "@/lib/fetchers";

function frequencyToTimeFilter(frequency: string): TimeFilter {
  switch (frequency) {
    case "WEEKLY": return "week";
    case "MONTHLY": return "month";
    default: return "day";
  }
}

// Manual trigger: POST /api/ingest
export async function POST(req: Request) {
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

// Scheduled trigger: GET /api/ingest
export async function GET() {
  try {
    await scheduleIngestion();
    return NextResponse.json({ success: true, message: "Ingestion scheduled" });
  } catch (error) {
    console.error("Schedule error:", error);
    return NextResponse.json({ error: "Scheduling failed" }, { status: 500 });
  }
}