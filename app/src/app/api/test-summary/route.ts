import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello in one sentence.",
    });
    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}