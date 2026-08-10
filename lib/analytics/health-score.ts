import type { UnifiedPortfolio } from "@/types/portfolio";
import type {
  AllocationResult,
  ConcentrationResult,
  HealthScoreComponent,
  HealthScoreResult,
  OverlapResult,
  RiskProfileResult,
} from "@/types/analysis";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function band(score: number): HealthScoreResult["band"] {
  if (score < 40) return "poor";
  if (score < 60) return "fair";
  if (score < 80) return "good";
  return "strong";
}

function percentOf(allocation: AllocationResult, assetClasses: string[]) {
  return allocation.slices
    .filter((slice) => assetClasses.includes(slice.assetClass))
    .reduce((sum, slice) => sum + slice.percent, 0);
}

export function computeHealthScore(
  portfolio: UnifiedPortfolio,
  allocation: AllocationResult,
  riskProfile: RiskProfileResult,
  concentration: ConcentrationResult,
  overlap: OverlapResult | null,
): HealthScoreResult {
  const totalAbsoluteDrift = allocation.drift.reduce((sum, item) => sum + Math.abs(item.driftPercent), 0);
  const allocationFit = clamp(100 - totalAbsoluteDrift * 1.2);

  const topAmcShare = concentration.amcConcentration[0]?.percentOfMutualFunds ?? 0;
  const issuerPenalty = clamp(concentration.herfindahlIndex * 220, 0, 60);
  const amcPenalty = clamp(Math.max(0, topAmcShare - 40) * 0.8, 0, 30);
  // Look-through overlap is the sharpest diversification signal available: money in
  // companies reached through more than one route is not doing the work of two holdings.
  const overlapPenalty = clamp(Math.max(0, (overlap?.overlapPercentOfEquity ?? 0) - 15) * 0.7, 0, 35);
  const diversification = clamp(100 - issuerPenalty - amcPenalty - overlapPenalty);

  const lockedValue = portfolio.holdings
    .filter(
      (holding) =>
        holding.kind === "epf" ||
        (holding.kind === "fixed_deposit" && !holding.prematureWithdrawalAllowed) ||
        (holding.kind === "gold" && holding.form === "sgb"),
    )
    .reduce((sum, holding) => sum + holding.currentValue, 0);
  const grossValue = portfolio.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const lockedShare = grossValue > 0 ? (lockedValue / grossValue) * 100 : 0;
  const liquidity = clamp(100 - Math.max(0, lockedShare - 25) * 1.5);

  const defensiveShare = percentOf(allocation, ["debt", "gold", "cash"]);
  const targetDefensive =
    riskProfile.targetAllocation.debt + riskProfile.targetAllocation.gold + riskProfile.targetAllocation.cash;
  const downsideBuffer = clamp(100 - Math.max(0, targetDefensive - defensiveShare) * 2.2);

  const components: HealthScoreComponent[] = [
    {
      key: "allocation_fit",
      label: "Allocation fit",
      score: Math.round(allocationFit),
      weight: 0.35,
      why: `Total absolute drift from the ${riskProfile.derivedCategory} target allocation is ${totalAbsoluteDrift.toFixed(1)} percentage points across all asset classes, penalised at 1.2x.`,
    },
    {
      key: "diversification",
      label: "Diversification",
      score: Math.round(diversification),
      weight: 0.3,
      why: `Herfindahl index of ${concentration.herfindahlIndex} on directly held issuers contributes a ${issuerPenalty.toFixed(0)}-point penalty${topAmcShare > 40 ? `, and ${topAmcShare}% of fund holdings sitting with a single AMC adds ${amcPenalty.toFixed(0)} more` : ""}${overlapPenalty > 0 ? `. Look-through found ${overlap?.overlapPercentOfEquity}% of your equity in companies reached through more than one holding, costing a further ${overlapPenalty.toFixed(0)} points` : ""}.`,
    },
    {
      key: "liquidity",
      label: "Liquidity",
      score: Math.round(liquidity),
      weight: 0.15,
      why: `${lockedShare.toFixed(1)}% of the portfolio sits in instruments that cannot be exited on demand (EPF/PPF, non-breakable FDs, sovereign gold bonds). Anything beyond 25% is penalised.`,
    },
    {
      key: "downside_buffer",
      label: "Downside buffer",
      score: Math.round(downsideBuffer),
      weight: 0.2,
      why: `Defensive assets (debt, gold, cash) total ${defensiveShare.toFixed(1)}% against a ${targetDefensive}% target for this risk band.`,
    },
  ];

  const score = Math.round(components.reduce((sum, item) => sum + item.score * item.weight, 0));

  return {
    score,
    band: band(score),
    components,
    why: `Composite of four weighted components: allocation fit (35%), diversification (30%), downside buffer (20%) and liquidity (15%). Each component is a transparent, rule-based calculation rather than a model output, so every point of the ${score}/100 can be traced back to a specific holding.`,
  };
}
