import { GoogleGenAI } from "@google/genai";

export interface SummarizeResult {
  summary: string;
  impact: string;
}

export async function summarizeContent(
  title: string,
  url: string
): Promise<SummarizeResult | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a content analyst for Distilled, a mindful news aggregator.

Given this article title and URL, provide two things:
1. A concise 2-3 sentence neutral summary of what the article is likely about.
2. A 1-2 sentence "how this affects you" blurb explaining the practical impact on everyday consumers, developers, or investors — whoever is most relevant to this topic. Be specific and direct.

Title: ${title}
URL: ${url}`,
      config: { responseMimeType: "application/json" },
    });

    const cleaned = response.text?.trim() ?? "";

    const parsed = JSON.parse(cleaned);
    if (typeof parsed.summary === "string" && typeof parsed.impact === "string") {
      return { summary: parsed.summary, impact: parsed.impact };
    }
    return null;
  } catch (error) {
    console.error("Gemini summarization error:", error);
    return null;
  }
}
