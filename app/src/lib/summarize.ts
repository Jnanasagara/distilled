import { GoogleGenAI } from "@google/genai";

export interface SummarizeResult {
  summary: string;
  impact: string;
}

// Thrown when all retry attempts are exhausted with 429 — signals no API
// call was successfully processed so the daily cap slot can be returned.
export class RateLimitError extends Error {
  constructor() {
    super("rate_limited");
    this.name = "RateLimitError";
  }
}

const RETRY_DELAYS_MS = [10_000, 20_000]; // 10s then 20s before giving up

export async function summarizeContent(
  title: string,
  url: string
): Promise<SummarizeResult | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are a content analyst for Distilled, a mindful news aggregator.

Given this article title and URL, provide two things as a JSON object:
1. "summary": A concise 2-3 sentence neutral summary of what the article is likely about.
2. "impact": A 1-2 sentence "how this affects you" blurb explaining the practical impact on everyday consumers, developers, or investors — whoever is most relevant to this topic. Be specific and direct.

Respond ONLY with a valid JSON object. No extra text, no markdown, no code fences.
Example: {"summary": "...", "impact": "..."}

Title: ${title}
URL: ${url}`;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text?.trim() ?? "";

      // Strip markdown code fences if model wraps output anyway
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (typeof parsed.summary === "string" && typeof parsed.impact === "string") {
        return { summary: parsed.summary, impact: parsed.impact };
      }
      return null;
    } catch (error: unknown) {
      // Google API 429: status 429 or RESOURCE_EXHAUSTED in the message
      const status = (error as { status?: number })?.status;
      const message = (error as { message?: string })?.message ?? "";
      const isRateLimit = status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.includes("429");

      if (isRateLimit && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`Gemini 429 on attempt ${attempt + 1}, retrying in ${delay / 1000}s…`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (isRateLimit) {
        // All retries exhausted — no successful call was made
        throw new RateLimitError();
      }

      console.error("Gemini summarization error:", error);
      return null;
    }
  }

  return null;
}
