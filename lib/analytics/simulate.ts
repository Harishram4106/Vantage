import type { AssetClass, Holding, UnifiedPortfolio } from "@/types/portfolio";

export type SimulationAdditions = Partial<Record<AssetClass, number>>;

const AS_OF = "2026-07-25";

/**
 * Builds the synthetic holding that represents "put this much new money into this
 * asset class". Deliberately produces a real `Holding` rather than patching the
 * allocation totals directly, so the simulated portfolio runs through exactly the
 * same engine as the real one — no parallel maths to drift out of sync.
 */
function syntheticHolding(assetClass: AssetClass, amount: number): Holding | null {
  const base = { id: `sim-${assetClass}`, source: "manual" as const, asOf: AS_OF, currentValue: amount };

  switch (assetClass) {
    case "debt":
      return {
        ...base,
        kind: "bond",
        isin: "SIMULATED",
        issuer: "Simulated AAA bond",
        creditRating: "AAA",
        couponRate: 7.7,
        maturityDate: "2031-01-01",
      };
    case "reit":
      return { ...base, kind: "reit", isin: "SIMULATED", name: "Simulated REIT", units: 0 };
    case "invit":
      return { ...base, kind: "invit", isin: "SIMULATED", name: "Simulated InvIT", units: 0 };
    case "gold":
      return { ...base, kind: "gold", form: "etf" };
    case "cash":
      return { ...base, kind: "cash", bank: "Simulated savings" };
    case "equity":
      return {
        ...base,
        kind: "mutual_fund",
        isin: "SIMULATED",
        schemeCode: "120716",
        schemeName: "UTI Nifty 50 Index Fund - Direct Growth",
        amc: "UTI Mutual Fund",
        category: "index_equity",
        folioNumber: "SIMULATED",
        units: 0,
        nav: 0,
      };
    default:
      return null;
  }
}

export function applyAdditions(
  portfolio: UnifiedPortfolio,
  additions: SimulationAdditions,
): UnifiedPortfolio {
  const extra = (Object.entries(additions) as Array<[AssetClass, number]>)
    .filter(([, amount]) => amount > 0)
    .map(([assetClass, amount]) => syntheticHolding(assetClass, amount))
    .filter((holding): holding is Holding => holding !== null);

  if (extra.length === 0) return portfolio;

  return { ...portfolio, holdings: [...portfolio.holdings, ...extra] };
}
