import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export async function summarizeContent(title: string, url: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a content summarizer for a news aggregator app called Distilled.
      
Given the following article title and URL, write a concise 2-3 sentence summary of what this article is likely about.
Be informative, neutral, and clear. Do not make up specific facts — base it on the title.

Title: ${title}
URL: ${url}

Write only the summary, nothing else.`,
    });
    return response.text ?? null;
  } catch (error) {
    console.error("Gemini summarization error:", error);
    return null;
  }
}