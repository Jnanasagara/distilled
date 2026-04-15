import OpenAI from "openai";

export interface SummarizeResult {
  summary: string;
  impact: string;
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://distilled.blog",
    "X-Title": "Distilled",
  },
});

export async function summarizeContent(
  title: string,
  url: string
): Promise<SummarizeResult | null> {
  if (!process.env.OPENROUTER_API_KEY) return null;

  try {
    const completion = await client.chat.completions.create({
      model: "google/gemma-4-31b-it:free",
      messages: [
        {
          role: "user",
          content: `You are a content analyst for Distilled, a mindful news aggregator.

Given this article title and URL, provide two things as a JSON object:
1. "summary": A concise 2-3 sentence neutral summary of what the article is likely about.
2. "impact": A 1-2 sentence "how this affects you" blurb explaining the practical impact on everyday consumers, developers, or investors — whoever is most relevant to this topic. Be specific and direct.

Respond ONLY with a valid JSON object. No extra text, no markdown, no code fences.
Example: {"summary": "...", "impact": "..."}

Title: ${title}
URL: ${url}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";

    // Strip markdown code fences if model wraps output anyway
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    const parsed = JSON.parse(cleaned);
    if (typeof parsed.summary === "string" && typeof parsed.impact === "string") {
      return { summary: parsed.summary, impact: parsed.impact };
    }
    return null;
  } catch (error) {
    console.error("OpenRouter summarization error:", error);
    return null;
  }
}
