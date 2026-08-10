import { NextResponse } from "next/server";

import { analysePortfolio } from "@/lib/analytics";
import { MOCK_PORTFOLIOS, MOCK_PORTFOLIO_KEYS } from "@/data/mock/portfolios";
import type { UnifiedPortfolio } from "@/types/portfolio";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("portfolio") ?? "aarav";
  const portfolio = MOCK_PORTFOLIOS[key];

  if (!portfolio) {
    return NextResponse.json(
      { error: `Unknown portfolio "${key}"`, available: MOCK_PORTFOLIO_KEYS },
      { status: 404 },
    );
  }

  return NextResponse.json(analysePortfolio(portfolio));
}

export async function POST(request: Request) {
  let payload: UnifiedPortfolio;

  try {
    payload = (await request.json()) as UnifiedPortfolio;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!payload?.holdings || !Array.isArray(payload.holdings)) {
    return NextResponse.json({ error: "Payload must include a holdings array" }, { status: 422 });
  }

  if (!payload.riskProfileInput) {
    return NextResponse.json({ error: "Payload must include riskProfileInput" }, { status: 422 });
  }

  return NextResponse.json(analysePortfolio(payload));
}
