import type { UnifiedPortfolio } from "@/types/portfolio";
import type {
  ConcentrationLevel,
  ExposureSource,
  FundOverlapPair,
  IssuerExposure,
  OverlapResult,
  SectorExposure,
} from "@/types/analysis";
import { FUND_ASSET_MIX } from "@/lib/analytics/fund-taxonomy";
import { FUND_FACTSHEETS, ISSUERS } from "@/data/mock/fund-holdings";

interface MatchedFund {
  schemeName: string;
  amc: string;
  equityValue: number;
  disclosedWeight: number;
  weights: Map<string, number>;
}

function round(value: number, dp = 1) {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

/**
 * Overlap between two funds using the standard minimum-weight measure:
 * sum over shared issuers of min(weightInA, weightInB). It answers "what share of
 * these two portfolios is the same book of stocks", which is what makes holding
 * both redundant.
 */
function pairOverlap(a: MatchedFund, b: MatchedFund) {
  let overlapPercent = 0;
  const sharedIssuers: string[] = [];

  for (const [issuer, weightA] of a.weights) {
    const weightB = b.weights.get(issuer);
    if (weightB === undefined) continue;
    overlapPercent += Math.min(weightA, weightB);
    sharedIssuers.push(issuer);
  }

  sharedIssuers.sort((left, right) => {
    const scoreLeft = Math.min(a.weights.get(left) ?? 0, b.weights.get(left) ?? 0);
    const scoreRight = Math.min(a.weights.get(right) ?? 0, b.weights.get(right) ?? 0);
    return scoreRight - scoreLeft;
  });

  return { overlapPercent: round(overlapPercent), sharedIssuers };
}

/**
 * A single sector's share of equity. Thresholds are deliberately the same shape as the
 * health-score bands so a colour means the same thing everywhere in the product.
 */
function sectorLevel(percentOfEquity: number): ConcentrationLevel {
  if (percentOfEquity >= 35) return "very_high";
  if (percentOfEquity >= 20) return "high";
  if (percentOfEquity >= 10) return "moderate";
  return "low";
}

function aggregateSectors(issuers: IssuerExposure[], totalEquityValue: number): SectorExposure[] {
  const bySector = new Map<string, IssuerExposure[]>();

  for (const issuer of issuers) {
    const bucket = bySector.get(issuer.sector) ?? [];
    bucket.push(issuer);
    bySector.set(issuer.sector, bucket);
  }

  return Array.from(bySector.entries())
    .map(([sector, members]) => {
      const value = members.reduce((sum, member) => sum + member.value, 0);
      const percentOfEquity = totalEquityValue > 0 ? round((value / totalEquityValue) * 100) : 0;

      return {
        sector,
        value: Math.round(value),
        percentOfEquity,
        issuerCount: members.length,
        members: members.slice().sort((a, b) => b.value - a.value),
        level: sectorLevel(percentOfEquity),
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function computeOverlap(portfolio: UnifiedPortfolio): OverlapResult | null {
  const matched: MatchedFund[] = [];
  const unmatchedFunds: string[] = [];
  const exposures = new Map<string, { value: number; sources: ExposureSource[] }>();

  let totalEquityValue = 0;
  let attributedFundEquity = 0;
  let totalFundEquity = 0;

  const addExposure = (issuer: string, value: number, source: ExposureSource) => {
    const entry = exposures.get(issuer) ?? { value: 0, sources: [] };
    entry.value += value;
    entry.sources.push(source);
    exposures.set(issuer, entry);
  };

  for (const holding of portfolio.holdings) {
    if (holding.kind === "equity") {
      totalEquityValue += holding.currentValue;
      addExposure(holding.name, holding.currentValue, {
        label: "Held directly",
        kind: "direct",
        value: Math.round(holding.currentValue),
      });
      continue;
    }

    if (holding.kind !== "mutual_fund") continue;

    const equityWeight = FUND_ASSET_MIX[holding.category].equity ?? 0;
    if (equityWeight <= 0) continue;

    const equityValue = holding.currentValue * equityWeight;
    totalEquityValue += equityValue;
    totalFundEquity += equityValue;

    const factsheet = FUND_FACTSHEETS[holding.schemeCode];
    if (!factsheet) {
      unmatchedFunds.push(holding.schemeName);
      continue;
    }

    const weights = new Map<string, number>();
    let disclosedWeight = 0;

    for (const entry of factsheet.holdings) {
      const issuerValue = equityValue * (entry.weight / 100);
      weights.set(entry.name, entry.weight);
      disclosedWeight += entry.weight;
      attributedFundEquity += issuerValue;

      addExposure(entry.name, issuerValue, {
        label: factsheet.schemeName,
        kind: "fund",
        value: Math.round(issuerValue),
        weightInFund: entry.weight,
      });
    }

    matched.push({
      schemeName: factsheet.schemeName,
      amc: factsheet.amc,
      equityValue,
      disclosedWeight: round(disclosedWeight),
      weights,
    });
  }

  if (matched.length === 0) return null;

  const totalPortfolioValue = portfolio.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);

  const issuerExposures: IssuerExposure[] = Array.from(exposures.entries())
    .map(([name, entry]) => ({
      name,
      sector: ISSUERS[name]?.sector ?? "Unclassified",
      value: Math.round(entry.value),
      percentOfEquity: totalEquityValue > 0 ? round((entry.value / totalEquityValue) * 100) : 0,
      percentOfPortfolio: totalPortfolioValue > 0 ? round((entry.value / totalPortfolioValue) * 100) : 0,
      sources: entry.sources.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);

  const duplicatedIssuers = issuerExposures.filter((issuer) => issuer.sources.length > 1);

  const pairwiseOverlap: FundOverlapPair[] = [];
  for (let i = 0; i < matched.length; i += 1) {
    for (let j = i + 1; j < matched.length; j += 1) {
      const { overlapPercent, sharedIssuers } = pairOverlap(matched[i], matched[j]);
      if (sharedIssuers.length === 0) continue;
      pairwiseOverlap.push({
        schemeA: matched[i].schemeName,
        schemeB: matched[j].schemeName,
        sameAmc: matched[i].amc === matched[j].amc,
        overlapPercent,
        sharedIssuers,
      });
    }
  }
  pairwiseOverlap.sort((a, b) => b.overlapPercent - a.overlapPercent);

  const duplicatedValue = duplicatedIssuers.reduce((sum, issuer) => sum + issuer.value, 0);
  const overlapPercentOfEquity = totalEquityValue > 0 ? round((duplicatedValue / totalEquityValue) * 100) : 0;
  const coveragePercent = totalFundEquity > 0 ? round((attributedFundEquity / totalFundEquity) * 100) : 0;

  // Aggregated from the full issuer list, not the top-12 slice sent to the UI.
  const sectorExposures = aggregateSectors(issuerExposures, totalEquityValue);
  const sectorHerfindahl = Number(
    sectorExposures.reduce((sum, sector) => sum + (sector.percentOfEquity / 100) ** 2, 0).toFixed(4),
  );

  return {
    analysedFunds: matched.map((fund) => ({
      schemeName: fund.schemeName,
      amc: fund.amc,
      disclosedWeight: fund.disclosedWeight,
    })),
    unmatchedFunds,
    issuerExposures: issuerExposures.slice(0, 12),
    duplicatedIssuers,
    pairwiseOverlap,
    overlapPercentOfEquity,
    worstPair: pairwiseOverlap[0] ?? null,
    coveragePercent,
    sectorExposures,
    sectorHerfindahl,
    sectorWhy: `Every company found by look-through is grouped by the industry it operates in, then each industry's share of your total equity is added up. A sector crossing 20% is flagged high and 35% very high, because at that point a single industry's fortunes drive much of your portfolio regardless of how many funds you hold. The index below squares and sums each sector's share — above 0.25 means your equity leans heavily on a few industries.`,
    why: `Each fund's value is split into its underlying companies using that fund's disclosed top holdings, then added to any shares you hold directly. Fund-to-fund overlap uses the minimum-weight method — for every company two funds share, the smaller of the two weights is counted, which measures how much of the two portfolios is genuinely the same book of stocks. Only ${coveragePercent}% of your fund equity could be attributed to named companies; the rest is each fund's undisclosed long tail, so real concentration is at least these figures and never less.`,
  };
}
