import type { AssetClass, UnifiedPortfolio } from "@/types/portfolio";
import type {
  ActionPlan,
  AllocationResult,
  GapMatch,
  HealthScoreResult,
  MatchedInstrument,
  RiskProfileResult,
} from "@/types/analysis";
import { INSTRUMENTS, type Instrument } from "@/data/mock/instruments";
import { ASSET_CLASS_LABEL } from "@/lib/analytics/fund-taxonomy";

// A gap smaller than this is noise, not something worth acting on.
const MIN_GAP_PERCENT = 3;
const MAX_MATCHES_PER_GAP = 3;

const GAP_RATIONALE: Partial<Record<AssetClass, string>> = {
  debt: "Fixed income is what you spend from when equity markets fall, so you are not forced to sell shares at a loss.",
  reit: "Property rent behaves differently from both shares and interest, so it tends not to fall at the same time as the rest.",
  invit: "Infrastructure income comes from regulated charges and tolls rather than company profits, which makes it steadier.",
};

/**
 * Scores how well one instrument fits one gap. Deliberately a transparent additive
 * model rather than anything learned — every point has to be explainable to the
 * investor and to a regulator.
 */
function scoreInstrument(
  instrument: Instrument,
  horizonYears: number,
  liquidityIsTight: boolean,
  shortfallValue: number,
): MatchedInstrument {
  const reasons: string[] = [];
  let score = 40;
  reasons.push(`Fills the ${ASSET_CLASS_LABEL[instrument.fillsGap[0]].toLowerCase()} gap in your portfolio`);

  if (instrument.tenureYears === null) {
    if (horizonYears >= 5) {
      score += 20;
      reasons.push(`No fixed maturity, which suits your ${horizonYears}-year horizon`);
    } else {
      score += 8;
      reasons.push("No fixed maturity, so you would rely on selling in the market to exit");
    }
  } else if (instrument.tenureYears <= horizonYears) {
    score += 20;
    reasons.push(`Matures in ${instrument.tenureYears} years, inside your ${horizonYears}-year horizon`);
  } else {
    score += 6;
    reasons.push(`Matures in ${instrument.tenureYears} years, beyond your ${horizonYears}-year horizon`);
  }

  if (instrument.creditRating === "Sovereign") {
    score += 20;
    reasons.push("Backed by the Government of India — the highest safety available");
  } else if (instrument.creditRating.startsWith("AAA")) {
    score += 17;
    reasons.push("Rated AAA, the highest credit grade issued in India");
  } else if (instrument.creditRating.startsWith("AA")) {
    score += 10;
    reasons.push(`Rated ${instrument.creditRating} — pays more because it carries more credit risk`);
  } else {
    score += 8;
    reasons.push("Not credit rated — returns depend on the underlying property or assets");
  }

  if (instrument.liquidity === "high") {
    score += 10;
    reasons.push("Trades actively, so it is straightforward to exit");
  } else if (instrument.liquidity === "moderate") {
    score += liquidityIsTight ? 4 : 7;
  } else {
    score += 2;
    reasons.push("Trades thinly — selling in a hurry may be difficult");
  }

  if (instrument.minInvestment <= shortfallValue) {
    score += 10;
  } else {
    reasons.push("Minimum investment is larger than the gap identified");
  }

  return { instrument, fitScore: Math.min(100, score), fitReasons: reasons };
}

export function buildActionPlan(
  portfolio: UnifiedPortfolio,
  allocation: AllocationResult,
  riskProfile: RiskProfileResult,
  healthScore: HealthScoreResult,
): ActionPlan | null {
  const horizonYears = portfolio.riskProfileInput.horizonYears;
  const liquidityComponent = healthScore.components.find((component) => component.key === "liquidity");
  const liquidityIsTight = (liquidityComponent?.score ?? 100) < 60;

  const gaps: GapMatch[] = [];

  for (const drift of allocation.drift) {
    // Deliberately derived from the raw numbers rather than `drift.direction`, which
    // uses a wider 5-point band — a 4-point hole in an asset class you hold none of
    // still deserves to be matched.
    const shortfallPercent = Number((drift.targetPercent - drift.actualPercent).toFixed(1));
    if (shortfallPercent < MIN_GAP_PERCENT) continue;

    const shortfallValue = Math.round((allocation.totalValue * shortfallPercent) / 100);

    const candidates = INSTRUMENTS.filter(
      (instrument) =>
        instrument.fillsGap.includes(drift.assetClass) &&
        instrument.suitableFor.includes(riskProfile.derivedCategory),
    );

    if (candidates.length === 0) continue;

    const matches = candidates
      .map((instrument) => scoreInstrument(instrument, horizonYears, liquidityIsTight, shortfallValue))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, MAX_MATCHES_PER_GAP);

    gaps.push({
      assetClass: drift.assetClass,
      label: ASSET_CLASS_LABEL[drift.assetClass],
      shortfallPercent,
      shortfallValue,
      rationale: GAP_RATIONALE[drift.assetClass] ?? "",
      matches,
    });
  }

  if (gaps.length === 0) return null;

  gaps.sort((a, b) => b.shortfallValue - a.shortfallValue);

  const totalShortfallValue = gaps.reduce((sum, gap) => sum + gap.shortfallValue, 0);

  return {
    gaps,
    totalShortfallValue,
    why: `Gaps are the asset classes sitting more than ${MIN_GAP_PERCENT} percentage points below the reference mix for a ${riskProfile.derivedCategory} risk capacity. Within each gap, instruments are scored on four transparent factors — whether the maturity fits your ${horizonYears}-year horizon, credit quality, how easily the holding can be sold, and whether the minimum investment is within the gap. Nothing is scored on past or expected return, and the ordering is fit to your gap, not a view on which will perform best.`,
  };
}
