import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { analysePortfolio } from "@/lib/analytics";
import { MOCK_PORTFOLIOS, MOCK_PORTFOLIO_KEYS } from "@/data/mock/portfolios";
import {
  NARRATIVE_MODEL,
  NARRATIVE_SYSTEM_PROMPT,
  buildNarrativeUserMessage,
} from "@/lib/ai/narrative-prompt";
import type { PortfolioAnalysis } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

function streamNarrative(analysis: PortfolioAnalysis) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await ai.models.generateContentStream({
          model: NARRATIVE_MODEL,
          config: {
            systemInstruction: NARRATIVE_SYSTEM_PROMPT,
            maxOutputTokens: 6000,
          },
          contents: [{ role: "user", parts: [{ text: buildNarrativeUserMessage(analysis) }] }],
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[Narrative interrupted: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });
}

function textStreamResponse(analysis: PortfolioAnalysis) {
  return new Response(streamNarrative(analysis), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

function missingKeyResponse() {
  return NextResponse.json(
    {
      error: "GEMINI_API_KEY is not set",
      hint: "Add GEMINI_API_KEY to .env.local and restart the dev server.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!process.env.GEMINI_API_KEY) return missingKeyResponse();

  const key = new URL(request.url).searchParams.get("portfolio") ?? "aarav";
  const portfolio = MOCK_PORTFOLIOS[key];

  if (!portfolio) {
    return NextResponse.json(
      { error: `Unknown portfolio "${key}"`, available: MOCK_PORTFOLIO_KEYS },
      { status: 404 },
    );
  }

  return textStreamResponse(analysePortfolio(portfolio));
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return missingKeyResponse();

  let body: { portfolio?: string; analysis?: PortfolioAnalysis };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (body.analysis?.allocation && body.analysis?.findings) {
    return textStreamResponse(body.analysis);
  }

  const portfolio = body.portfolio ? MOCK_PORTFOLIOS[body.portfolio] : undefined;

  if (!portfolio) {
    return NextResponse.json(
      { error: "Provide either a full `analysis` object or a known `portfolio` key", available: MOCK_PORTFOLIO_KEYS },
      { status: 422 },
    );
  }

  return textStreamResponse(analysePortfolio(portfolio));
}
