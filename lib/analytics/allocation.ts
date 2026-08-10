import type { AssetClass, Holding, UnifiedPortfolio } from "@/types/portfolio";
import type { AllocationDrift, AllocationResult, AllocationSlice } from "@/types/analysis";
import { ASSET_CLASS_COLOR, ASSET_CLASS_LABEL, FUND_ASSET_MIX, type AssetMix } from "@/lib/analytics/fund-taxonomy";

const ASSET_CLASS_ORDER: AssetClass[] = ["equity", "debt", "gold", "reit", "invit", "cash"];

export function assetMixFor(holding: Holding): { mix: AssetMix; label: string } {
  switch (holding.kind) {
    case "equity":
      return { mix: { equity: 1 }, label: holding.name };
    case "mutual_fund":
      return { mix: FUND_ASSET_MIX[holding.category], label: holding.schemeName };
    case "bond":
      return { mix: { debt: 1 }, label: `${holding.issuer} bond` };
    case "reit":
      return { mix: { reit: 1 }, label: holding.name };
    case "invit":
      return { mix: { invit: 1 }, label: holding.name };
    case "gold":
      return { mix: { gold: 1 }, label: `Gold (${holding.form.toUpperCase()})` };
    case "epf":
      return { mix: { debt: 1 }, label: holding.scheme.toUpperCase() };
    case "fixed_deposit":
      return { mix: { debt: 1 }, label: `${holding.bank} FD` };
    case "cash":
      return { mix: { cash: 1 }, label: `${holding.bank} savings` };
  }
}

export function computeAllocation(portfolio: UnifiedPortfolio): AllocationResult {
  const totals = new Map<AssetClass, number>();
  const contributors = new Map<AssetClass, Set<string>>();

  for (const holding of portfolio.holdings) {
    const { mix, label } = assetMixFor(holding);
    for (const [assetClass, weight] of Object.entries(mix) as Array<[AssetClass, number]>) {
      const contribution = holding.currentValue * weight;
      if (contribution <= 0) continue;
      totals.set(assetClass, (totals.get(assetClass) ?? 0) + contribution);
      if (weight >= 0.1) {
        const bucket = contributors.get(assetClass) ?? new Set<string>();
        bucket.add(label);
        contributors.set(assetClass, bucket);
      }
    }
  }

  const totalValue = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

  const slices: AllocationSlice[] = ASSET_CLASS_ORDER.filter((assetClass) => (totals.get(assetClass) ?? 0) > 0).map(
    (assetClass) => {
      const value = totals.get(assetClass) ?? 0;
      return {
        assetClass,
        label: ASSET_CLASS_LABEL[assetClass],
        value: Math.round(value),
        percent: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0,
        color: ASSET_CLASS_COLOR[assetClass],
        contributors: Array.from(contributors.get(assetClass) ?? []),
      };
    },
  );

  const hybridCount = portfolio.holdings.filter(
    (holding) => holding.kind === "mutual_fund" && holding.category.startsWith("hybrid"),
  ).length;

  return {
    totalValue: Math.round(totalValue),
    slices,
    drift: [],
    largestDrift: null,
    why: `Every holding is decomposed into its underlying asset classes before totalling, so a hybrid fund counts partly as equity and partly as debt rather than landing in a single bucket${hybridCount > 0 ? ` (${hybridCount} hybrid fund(s) were split this way)` : ""}. EPF, PPF and fixed deposits are treated as debt; percentages are of a ₹${Math.round(totalValue).toLocaleString("en-IN")} total.`,
  };
}

export function computeDrift(
  allocation: AllocationResult,
  targetAllocation: Record<AssetClass, number>,
): { drift: AllocationDrift[]; largestDrift: AllocationDrift | null } {
  const actualByClass = new Map(allocation.slices.map((slice) => [slice.assetClass, slice.percent]));

  const drift: AllocationDrift[] = ASSET_CLASS_ORDER.filter(
    (assetClass) => (targetAllocation[assetClass] ?? 0) > 0 || (actualByClass.get(assetClass) ?? 0) > 0,
  ).map((assetClass) => {
    const actualPercent = actualByClass.get(assetClass) ?? 0;
    const targetPercent = targetAllocation[assetClass] ?? 0;
    const driftPercent = Number((actualPercent - targetPercent).toFixed(1));
    return {
      assetClass,
      actualPercent,
      targetPercent,
      driftPercent,
      direction: Math.abs(driftPercent) < 5 ? "on_target" : driftPercent > 0 ? "over" : "under",
    };
  });

  const largestDrift = drift.reduce<AllocationDrift | null>(
    (worst, item) => (worst === null || Math.abs(item.driftPercent) > Math.abs(worst.driftPercent) ? item : worst),
    null,
  );

  return { drift, largestDrift };
}
