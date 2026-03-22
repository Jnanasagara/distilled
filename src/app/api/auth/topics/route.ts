import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ topics });
  } catch (error) {
    console.error("GET /api/topics error:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}