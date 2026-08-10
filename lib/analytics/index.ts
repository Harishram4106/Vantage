import type { UnifiedPortfolio } from "@/types/portfolio";
import { ANALYSIS_SCHEMA_VERSION, type PortfolioAnalysis } from "@/types/analysis";
import { computeAllocation, computeDrift } from "@/lib/analytics/allocation";
import { assessRiskProfile } from "@/lib/analytics/risk-profile";
import { computeConcentration } from "@/lib/analytics/concentration";
import { computeHealthScore } from "@/lib/analytics/health-score";
import { computeOverlap } from "@/lib/analytics/overlap";
import { buildActionPlan } from "@/lib/analytics/instrument-match";
import { computeBenchmark } from "@/lib/analytics/benchmark";
import { buildFindings } from "@/lib/analytics/findings";

export function analysePortfolio(portfolio: UnifiedPortfolio): PortfolioAnalysis {
  const riskProfile = assessRiskProfile(portfolio.riskProfileInput);
  const allocation = computeAllocation(portfolio);
  const { drift, largestDrift } = computeDrift(allocation, riskProfile.targetAllocation);
  allocation.drift = drift;
  allocation.largestDrift = largestDrift;

  const concentration = computeConcentration(portfolio);
  const overlap = computeOverlap(portfolio);
  const healthScore = computeHealthScore(portfolio, allocation, riskProfile, concentration, overlap);
  const actionPlan = buildActionPlan(portfolio, allocation, riskProfile, healthScore);
  const benchmark = computeBenchmark(allocation, riskProfile.derivedCategory);
  const findings = buildFindings(
    portfolio,
    allocation,
    riskProfile,
    concentration,
    healthScore,
    overlap,
    benchmark,
  );

  return {
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    portfolioId: portfolio.portfolioId,
    analysedAt: new Date().toISOString(),
    investorName: portfolio.investorName,
    allocation,
    riskProfile,
    concentration,
    healthScore,
    findings,
    overlap,
    actionPlan,
    benchmark,
  };
}

export {
  computeAllocation,
  computeDrift,
  assessRiskProfile,
  computeConcentration,
  computeOverlap,
  computeHealthScore,
  buildActionPlan,
  computeBenchmark,
  buildFindings,
};
