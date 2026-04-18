import OpenAI from "openai";

export interface SummarizeResult {
  summary: string;
  impact: string;
}

export class RateLimitError extends Error {
  constructor() {
    super("rate_limited");
    this.name = "RateLimitError";
  }
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? "",
  baseURL: "https://api.groq.com/openai/v1",
});

const RETRY_DELAYS_MS = [8_000, 15_000];

export async function summarizeContent(
  title: string,
  url: string
): Promise<SummarizeResult | null> {
  if (!process.env.GROQ_API_KEY) return null;

  const prompt = `You are a content analyst for Distilled, a mindful news aggregator.

Given this article title and URL, provide two things as a JSON object:
1. "summary": A concise 2-3 sentence neutral summary of what the article is likely about.
2. "impact": A 1-2 sentence "how this affects you" blurb explaining the practical impact on everyday consumers, developers, or investors, whoever is most relevant to this topic. Be specific and direct.

Respond ONLY with a valid JSON object. No extra text, no markdown, no code fences.
Example: {"summary": "...", "impact": "..."}

Title: ${title}
URL: ${url}`;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const text = response.choices[0]?.message?.content?.trim() ?? "";

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
      const status = (error as { status?: number })?.status;
      const message = (error as { message?: string })?.message ?? "";
      const isRateLimit = status === 429 || message.includes("rate_limit") || message.includes("429");

      if (isRateLimit && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`Groq 429 on attempt ${attempt + 1}, retrying in ${delay / 1000}s…`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (isRateLimit) throw new RateLimitError();

      console.error("Groq summarization error:", error);
      return null;
    }
  }

  return null;
}
