import type { MarketCapBand, UnifiedPortfolio } from "@/types/portfolio";
import type { ConcentrationResult } from "@/types/analysis";
import { FUND_ASSET_MIX, FUND_MARKET_CAP_MIX } from "@/lib/analytics/fund-taxonomy";
import { FUND_FACTSHEETS } from "@/data/mock/fund-holdings";

export function computeConcentration(portfolio: UnifiedPortfolio): ConcentrationResult {
  const issuerValue = new Map<string, number>();
  const amcValue = new Map<string, { value: number; schemes: number }>();
  const marketCapValue = new Map<MarketCapBand, number>();

  let totalEquityValue = 0;
  let totalMutualFundValue = 0;

  for (const holding of portfolio.holdings) {
    if (holding.kind === "equity") {
      totalEquityValue += holding.currentValue;
      issuerValue.set(holding.name, (issuerValue.get(holding.name) ?? 0) + holding.currentValue);
      if (holding.marketCap) {
        marketCapValue.set(
          holding.marketCap,
          (marketCapValue.get(holding.marketCap) ?? 0) + holding.currentValue,
        );
      }
      continue;
    }

    if (holding.kind === "mutual_fund") {
      totalMutualFundValue += holding.currentValue;
      const existing = amcValue.get(holding.amc) ?? { value: 0, schemes: 0 };
      amcValue.set(holding.amc, { value: existing.value + holding.currentValue, schemes: existing.schemes + 1 });

      const equityWeight = FUND_ASSET_MIX[holding.category].equity ?? 0;
      if (equityWeight <= 0) continue;

      const fundEquityValue = holding.currentValue * equityWeight;
      totalEquityValue += fundEquityValue;

      const capMix = FUND_MARKET_CAP_MIX[holding.category];
      if (capMix) {
        for (const [band, weight] of Object.entries(capMix) as Array<[MarketCapBand, number]>) {
          marketCapValue.set(band, (marketCapValue.get(band) ?? 0) + fundEquityValue * weight);
        }
      }

      // Look through fund factsheets to attribute equity to individual issuers
      const factsheet = FUND_FACTSHEETS[holding.schemeCode];
      if (factsheet) {
        for (const entry of factsheet.holdings) {
          const amt = fundEquityValue * (entry.weight / 100);
          issuerValue.set(entry.name, (issuerValue.get(entry.name) ?? 0) + amt);
        }
      }
    }
  }

  const totalValue = portfolio.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);

  const topIssuers = Array.from(issuerValue.entries())
    .map(([name, value]) => ({
      name,
      percentOfEquity: totalEquityValue > 0 ? Number(((value / totalEquityValue) * 100).toFixed(1)) : 0,
      percentOfPortfolio: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.percentOfEquity - a.percentOfEquity)
    .slice(0, 10);

  const amcConcentration = Array.from(amcValue.entries())
    .map(([amc, { value, schemes }]) => ({
      amc,
      percentOfMutualFunds: totalMutualFundValue > 0 ? Number(((value / totalMutualFundValue) * 100).toFixed(1)) : 0,
      schemeCount: schemes,
    }))
    .sort((a, b) => b.percentOfMutualFunds - a.percentOfMutualFunds);

  const marketCapSplit: Partial<Record<MarketCapBand, number>> = {};
  const totalCapValue = Array.from(marketCapValue.values()).reduce((sum, value) => sum + value, 0);
  for (const [band, value] of marketCapValue.entries()) {
    marketCapSplit[band] = totalCapValue > 0 ? Number(((value / totalCapValue) * 100).toFixed(1)) : 0;
  }

  const herfindahlIndex = Number(
    topIssuers.reduce((sum, issuer) => sum + (issuer.percentOfEquity / 100) ** 2, 0).toFixed(4),
  );

  return {
    topIssuers,
    amcConcentration,
    marketCapSplit,
    herfindahlIndex,
    why: `Largest holdings combines directly held stocks and the disclosed top holdings of each equity fund, scaled by the fund's equity value. Undisclosed holdings in each fund's long tail cannot be attributed — actual concentration may be higher. Market-cap split blends direct stocks with each fund's category-typical cap profile. The Herfindahl index squares and sums each issuer's share of total equity exposure; values above 0.18 indicate meaningful single-name concentration risk.`,
  };
}
