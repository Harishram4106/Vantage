import type { AssetClass, RiskCategory } from "@/types/portfolio";
import type { AllocationResult, BandComparison, BenchmarkResult, BenchmarkRow } from "@/types/analysis";
import { TARGET_ALLOCATION } from "@/lib/analytics/risk-profile";
import { ASSET_CLASS_COLOR, ASSET_CLASS_LABEL } from "@/lib/analytics/fund-taxonomy";

const BANDS: RiskCategory[] = ["conservative", "moderate", "aggressive"];
const ORDER: AssetClass[] = ["equity", "debt", "gold", "reit", "invit", "cash"];

/**
 * Compares the portfolio against the reference mix for every risk band, not just the
 * investor's own. The band with the lowest total absolute drift is the one the
 * portfolio actually *resembles* — which is frequently not the band their
 * circumstances put them in, and that divergence is the useful finding.
 *
 * These references are conventional planning heuristics. They are deliberately NOT
 * described as observed peer behaviour, because no peer data exists here.
 */
export function computeBenchmark(
  allocation: AllocationResult,
  derivedBand: RiskCategory,
): BenchmarkResult {
  const actualByClass = new Map(allocation.slices.map((slice) => [slice.assetClass, slice.percent]));

  const comparisons: BandComparison[] = BANDS.map((band) => {
    const reference = TARGET_ALLOCATION[band];

    const rows: BenchmarkRow[] = ORDER.filter(
      (assetClass) => (reference[assetClass] ?? 0) > 0 || (actualByClass.get(assetClass) ?? 0) > 0,
    ).map((assetClass) => {
      const actualPercent = actualByClass.get(assetClass) ?? 0;
      const referencePercent = reference[assetClass] ?? 0;
      return {
        assetClass,
        label: ASSET_CLASS_LABEL[assetClass],
        color: ASSET_CLASS_COLOR[assetClass],
        actualPercent,
        referencePercent,
        driftPercent: Number((actualPercent - referencePercent).toFixed(1)),
      };
    });

    return {
      band,
      totalAbsoluteDrift: Number(
        rows.reduce((sum, row) => sum + Math.abs(row.driftPercent), 0).toFixed(1),
      ),
      rows,
    };
  });

  const closest = comparisons.reduce((best, item) =>
    item.totalAbsoluteDrift < best.totalAbsoluteDrift ? item : best,
  );

  const shapeMismatch = closest.band !== derivedBand;
  const own = comparisons.find((item) => item.band === derivedBand);

  return {
    derivedBand,
    closestBand: closest.band,
    shapeMismatch,
    comparisons,
    why: `Your mix is measured against the reference allocation for all three risk bands by adding up how far it sits from each, across every asset class. The lowest total wins: your portfolio is ${closest.totalAbsoluteDrift} points away from the ${closest.band} reference, against ${own?.totalAbsoluteDrift ?? 0} points from the ${derivedBand} reference your circumstances point to. These references are conventional planning starting points, not a record of what other investors actually hold — Vantage has no peer data and does not imply any.`,
  };
}
