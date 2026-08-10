import type { UnifiedPortfolio } from "@/types/portfolio";
import type {
  AllocationResult,
  BenchmarkResult,
  ConcentrationResult,
  Finding,
  HealthScoreResult,
  OverlapResult,
  RiskProfileResult,
} from "@/types/analysis";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, positive: 3 } as const;

function inr(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function buildFindings(
  portfolio: UnifiedPortfolio,
  allocation: AllocationResult,
  riskProfile: RiskProfileResult,
  concentration: ConcentrationResult,
  healthScore: HealthScoreResult,
  overlap: OverlapResult | null,
  benchmark: BenchmarkResult,
): Finding[] {
  const findings: Finding[] = [];
  const percentFor = (assetClass: string) =>
    allocation.slices.find((slice) => slice.assetClass === assetClass)?.percent ?? 0;

  const equityPercent = percentFor("equity");
  const debtPercent = percentFor("debt");
  const targetEquity = riskProfile.targetAllocation.equity;
  const targetDebt = riskProfile.targetAllocation.debt;

  if (equityPercent - targetEquity >= 10) {
    findings.push({
      id: "equity_overweight",
      severity: equityPercent - targetEquity >= 25 ? "critical" : "warning",
      title: `${equityPercent}% of your money is riding on the stock market`,
      detail: `For a ${riskProfile.derivedCategory} risk capacity the reference allocation is ${targetEquity}% equity. You are ${(equityPercent - targetEquity).toFixed(1)} percentage points above that, which means a 30% market fall would cost roughly ${inr((allocation.totalValue * equityPercent * 0.3) / 100)} rather than ${inr((allocation.totalValue * targetEquity * 0.3) / 100)}.`,
      evidence: [
        { label: "Actual equity", value: `${equityPercent}%` },
        { label: "Reference equity", value: `${targetEquity}%` },
        { label: "Portfolio value", value: inr(allocation.totalValue) },
      ],
      suggestedAction: "Shift new investments toward debt and REIT exposure until the gap closes.",
    });
  }

  if (targetEquity - equityPercent >= 10) {
    const gap = targetEquity - equityPercent;
    const horizonYears = portfolio.riskProfileInput.horizonYears;
    findings.push({
      id: "equity_underweight",
      severity: gap >= 30 && horizonYears >= 10 ? "critical" : "warning",
      title: `Only ${equityPercent}% of your money is invested for growth`,
      detail: `With a ${horizonYears}-year horizon the reference equity allocation for a ${riskProfile.derivedCategory} capacity is ${targetEquity}%. Sitting ${gap.toFixed(1)} points below it protects you from short-term falls but exposes you to the slower risk that inflation erodes what this money can eventually buy.`,
      evidence: [
        { label: "Actual equity", value: `${equityPercent}%` },
        { label: "Reference equity", value: `${targetEquity}%` },
        { label: "Horizon", value: `${horizonYears} years` },
      ],
      suggestedAction: "Redirect maturing deposits into a low-cost index or flexi-cap fund via SIP.",
    });
  }

  if (targetDebt - debtPercent >= 10) {
    findings.push({
      id: "debt_underweight",
      severity: debtPercent < 5 ? "critical" : "warning",
      title: debtPercent < 5 ? "You hold almost no fixed income" : "Fixed income is well below target",
      detail: `Debt-type assets account for ${debtPercent}% of the portfolio against a ${targetDebt}% reference for this risk band. Fixed income is what funds spending during a market drawdown without selling equity at a loss.`,
      evidence: [
        { label: "Actual debt", value: `${debtPercent}%` },
        { label: "Reference debt", value: `${targetDebt}%` },
        { label: "Shortfall", value: inr((allocation.totalValue * (targetDebt - debtPercent)) / 100) },
      ],
      suggestedAction: "Consider listed corporate bonds or a short-duration debt fund to close the gap.",
    });
  }

  const topAmc = concentration.amcConcentration[0];
  if (topAmc && topAmc.percentOfMutualFunds >= 50 && topAmc.schemeCount >= 2) {
    findings.push({
      id: "amc_concentration",
      severity: topAmc.percentOfMutualFunds >= 70 ? "warning" : "info",
      title: `${topAmc.percentOfMutualFunds}% of your funds sit with one fund house`,
      detail: `${topAmc.schemeCount} of your schemes are managed by ${topAmc.amc}. Holding several funds feels diversified, but a shared investment process and research desk means they often move together.`,
      evidence: [
        { label: "Fund house", value: topAmc.amc },
        { label: "Schemes held", value: String(topAmc.schemeCount) },
        { label: "Share of MF corpus", value: `${topAmc.percentOfMutualFunds}%` },
      ],
      suggestedAction: "Spread future SIP contributions across a second fund house.",
    });
  }

  const dominantIssuer = concentration.topIssuers[0];
  // Suppressed when look-through already covers this name — the overlap finding
  // reports the same company with a strictly better number, and showing both
  // reads as two contradictory figures for one holding.
  const supersededByLookThrough = overlap?.duplicatedIssuers.some(
    (issuer) => issuer.name === dominantIssuer?.name,
  );

  if (dominantIssuer && dominantIssuer.percentOfEquity >= 15 && !supersededByLookThrough) {
    findings.push({
      id: "issuer_concentration",
      severity: dominantIssuer.percentOfEquity >= 25 ? "critical" : "warning",
      title: `${dominantIssuer.name} alone is ${dominantIssuer.percentOfEquity}% of your equity`,
      detail: `A single company carries ${dominantIssuer.percentOfPortfolio}% of your total portfolio. This figure counts directly held shares only — once fund look-through is applied the true figure is typically higher, because large-cap funds hold the same names.`,
      evidence: [
        { label: "Company", value: dominantIssuer.name },
        { label: "Share of equity", value: `${dominantIssuer.percentOfEquity}%` },
        { label: "Share of portfolio", value: `${dominantIssuer.percentOfPortfolio}%` },
      ],
      suggestedAction: "Trim the position or pause further additions to this name.",
    });
  }

  const topDuplicated = overlap?.duplicatedIssuers[0];
  if (topDuplicated && topDuplicated.sources.length > 1) {
    const routes = topDuplicated.sources.length;
    const directSource = topDuplicated.sources.find((source) => source.kind === "direct");
    const directPercent = concentration.topIssuers.find(
      (issuer) => issuer.name === topDuplicated.name,
    )?.percentOfEquity;

    findings.push({
      id: "hidden_duplication",
      severity: topDuplicated.percentOfEquity >= 25 ? "critical" : topDuplicated.percentOfEquity >= 15 ? "warning" : "info",
      title: `You own ${topDuplicated.name} ${routes} different ways`,
      detail: `Looking inside your funds, ${topDuplicated.name} accounts for ${topDuplicated.percentOfEquity}% of everything you hold in shares — ${inr(topDuplicated.value)}. ${
        directSource && directPercent !== undefined
          ? `Counting only the shares you bought yourself it looked like ${directPercent}%. The rest arrives through funds you may not have realised hold it.`
          : "None of that is a stock you picked yourself; it all arrives through the funds you hold."
      } Buying more funds does not spread your money if the funds own the same companies.`,
      evidence: [
        { label: "Company", value: topDuplicated.name },
        { label: "True share of equity", value: `${topDuplicated.percentOfEquity}%` },
        ...topDuplicated.sources.map((source) => ({
          label: source.kind === "direct" ? "Held directly" : source.label.replace(" - Direct Growth", ""),
          value: inr(source.value),
        })),
      ],
      suggestedAction: "Check this name before adding another large-cap fund.",
    });
  }

  const topSector = overlap?.sectorExposures[0];
  if (topSector && topSector.percentOfEquity >= 25) {
    findings.push({
      id: "sector_concentration",
      severity: topSector.percentOfEquity >= 35 ? "critical" : "warning",
      title: `${topSector.percentOfEquity}% of your equity is in one industry`,
      detail: `Across every fund and share you hold, ${topSector.issuerCount} companies in ${topSector.sector} together account for ${topSector.percentOfEquity}% of your equity — ${inr(topSector.value)}. You did not pick that as a bet, it is what your funds add up to. When one industry hits trouble, holding several companies inside it does not spread the risk much, because they tend to fall together.`,
      evidence: [
        { label: "Industry", value: topSector.sector },
        { label: "Share of equity", value: `${topSector.percentOfEquity}%` },
        { label: "Companies", value: String(topSector.issuerCount) },
        ...topSector.members.slice(0, 3).map((issuer) => ({
          label: issuer.name,
          value: `${issuer.percentOfEquity}%`,
        })),
      ],
      suggestedAction: "Check the industry mix before adding another fund with a similar mandate.",
    });
  }

  const worstPair = overlap?.worstPair;
  if (worstPair && worstPair.overlapPercent >= 12) {
    findings.push({
      id: "fund_pair_overlap",
      severity: worstPair.overlapPercent >= 25 ? "warning" : "info",
      title: `Two of your funds are ${worstPair.overlapPercent}% the same portfolio`,
      detail: `${worstPair.schemeA.replace(" - Direct Growth", "")} and ${worstPair.schemeB.replace(" - Direct Growth", "")} share ${worstPair.sharedIssuers.length} of their largest holdings${
        worstPair.sameAmc ? ", and both are run by the same fund house" : ""
      }. Holding both gives you far less extra spread than holding two funds suggests. This is measured on disclosed top holdings only, so the real figure is at least this high.`,
      evidence: [
        { label: "Overlap", value: `${worstPair.overlapPercent}%` },
        { label: "Shared names", value: worstPair.sharedIssuers.slice(0, 4).join(", ") },
        { label: "Same fund house", value: worstPair.sameAmc ? "Yes" : "No" },
      ],
      suggestedAction: "Keep the one with the lower cost and redirect new money elsewhere.",
    });
  }

  if (benchmark.shapeMismatch) {
    const own = benchmark.comparisons.find((item) => item.band === benchmark.derivedBand);
    const closest = benchmark.comparisons.find((item) => item.band === benchmark.closestBand);
    const buildingRisk = benchmark.closestBand === "aggressive" && benchmark.derivedBand !== "aggressive";

    findings.push({
      id: "benchmark_shape_mismatch",
      severity: buildingRisk ? "critical" : "warning",
      title: `Your portfolio is built like ${
        benchmark.closestBand === "aggressive" ? "an" : "a"
      } ${benchmark.closestBand} investor's`,
      detail: `Comparing your mix against the reference allocation for each risk band, it sits closest to the ${benchmark.closestBand} one — ${closest?.totalAbsoluteDrift} points away, against ${own?.totalAbsoluteDrift} points from the ${benchmark.derivedBand} reference your age, horizon and dependents point to. ${
        buildingRisk
          ? "In other words you are carrying more risk than your circumstances support, which matters most in a year when markets fall."
          : "In other words you are carrying less risk than your circumstances could support, which matters most over long stretches when inflation erodes what cash can buy."
      }`,
      evidence: [
        { label: "Built like", value: benchmark.closestBand },
        { label: "Circumstances suggest", value: benchmark.derivedBand },
        { label: `Distance to ${benchmark.derivedBand}`, value: `${own?.totalAbsoluteDrift} pts` },
      ],
      suggestedAction: buildingRisk
        ? "Direct new money to the safer end until the shape matches your circumstances."
        : "Consider whether some of the safer holdings could work harder over your horizon.",
    });
  }

  if (riskProfile.isMismatched) {
    findings.push({
      id: "risk_profile_mismatch",
      severity: "info",
      title: `You describe yourself as ${riskProfile.statedCategory}, but your circumstances read ${riskProfile.derivedCategory}`,
      detail: riskProfile.why,
      evidence: [
        { label: "Stated", value: riskProfile.statedCategory },
        { label: "Derived", value: riskProfile.derivedCategory },
        { label: "Capacity score", value: `${riskProfile.capacityScore}/100` },
      ],
    });
  }

  const reitPercent = percentFor("reit") + percentFor("invit");
  const targetReit = riskProfile.targetAllocation.reit + riskProfile.targetAllocation.invit;
  if (targetReit > 0 && reitPercent < 1) {
    findings.push({
      id: "no_reit_exposure",
      severity: "info",
      title: "No exposure to REITs or InvITs",
      detail: `These SEBI-regulated, exchange-listed instruments generate rental and infrastructure income that behaves differently from both equity and debt. A ${targetReit}% allocation is typical for this risk band.`,
      evidence: [
        { label: "Current", value: `${reitPercent}%` },
        { label: "Reference", value: `${targetReit}%` },
        { label: "Indicative amount", value: inr((allocation.totalValue * targetReit) / 100) },
      ],
      suggestedAction: "Review listed REITs and InvITs available on NSE/BSE.",
    });
  }

  const liquidityComponent = healthScore.components.find((component) => component.key === "liquidity");
  if (liquidityComponent && liquidityComponent.score < 60) {
    findings.push({
      id: "liquidity_locked",
      severity: "warning",
      title: "A large share of your money cannot be accessed quickly",
      detail: liquidityComponent.why,
      evidence: [{ label: "Liquidity score", value: `${liquidityComponent.score}/100` }],
      suggestedAction: "Keep at least six months of expenses in instruments you can exit on demand.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: "balanced",
      severity: "positive",
      title: "This portfolio is broadly aligned with your risk capacity",
      detail: `No material allocation gaps or concentration flags were triggered. Health score is ${healthScore.score}/100 (${healthScore.band}).`,
      evidence: allocation.slices.map((slice) => ({ label: slice.label, value: `${slice.percent}%` })),
    });
  }

  return findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
