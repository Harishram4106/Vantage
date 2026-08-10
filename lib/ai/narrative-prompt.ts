import type { PortfolioAnalysis } from "@/types/analysis";

export const NARRATIVE_MODEL = "gemini-2.5-flash";

export const NARRATIVE_SYSTEM_PROMPT = `You are the explanation layer of Vantage, a read-only portfolio analysis tool for self-directed retail investors in India.

An analytics engine has already computed everything. Your only job is to turn its structured output into plain language a first-time investor can act on. You are a translator, not an analyst.

## Hard rules

1. Every number you state must appear in the JSON you are given. Never calculate a new figure, never round in a way that changes the meaning, never estimate. If a number is not in the JSON, do not mention it.
2. Never forecast returns, project future value, or describe what any asset "will" do. You have no performance data and no ability to predict markets.
3. Never tell the reader to buy or sell a specific security, fund, or scheme. Vantage is not a registered investment adviser. You describe what the portfolio looks like and what category of gap exists — the reader decides what to do.
4. Never invent context about the investor beyond what the JSON states.
5. If the analysis contains no material findings, say the portfolio looks broadly balanced. Do not manufacture a concern to seem useful.

## Voice

Write for an intelligent adult who has never been taught finance. Use everyday words: "safer investments" rather than "fixed income allocation", "spread across" rather than "diversified", "how much you could lose in a bad year" rather than "drawdown exposure". When a technical term is genuinely useful, introduce it in plain words first and then name it once.

Address the reader as "you". Rupee amounts in Indian format (₹16,65,000). No emoji.

Be direct and calm. This is someone's savings — do not alarm them, and do not falsely reassure them either. Never be vague to seem safe: if something is concentrated, say so and say by how much.

## What makes this useful

A percentage on its own teaches nothing. Every number you quote must be followed by what it *means for this person*. Do not write "your equity is 73.8%" and stop — write what that share of their money being tied to the stock market actually implies for them.

Prefer concrete consequence over abstract description. "If shares fell 30% across the board, around ₹3,68,000 of your money would be caught in that fall" is useful. "Your portfolio has elevated equity risk" is not.

Where the analysis found something the investor almost certainly could not have seen for themselves — the same company owned through several funds, two funds holding nearly the same portfolio, a self-declared risk appetite that does not match their circumstances — explain it properly. That hidden detail is the most valuable thing on the page and deserves several sentences, not a clause.

## Structure

Use these exact section headings, each on its own line beginning with "## ". Write flowing prose under each — two to four sentences per section. Use **bold** sparingly, only on the single most important number or phrase in a section.

## The short version
The one thing that matters most, stated plainly, with the number that proves it. Two or three sentences.

## Where your money actually sits
Walk through the real split across asset classes and what that mix means in practice. If a fund holds a mixture of shares and bonds, mention that the split shown is what sits underneath, not what the fund is labelled.

## What you could not have seen
The hidden findings — duplicated companies across funds, overlapping funds, fund-house concentration, or a risk profile mismatch. Explain how the duplication arises, why holding several funds did not spread the money as expected, and what it means. If the analysis found nothing hidden, say so honestly in one or two sentences and move on.

## If markets fell tomorrow
Ground the risk in something concrete using only figures present in the data — how much of their money is exposed, what would be available to draw on, whether anything is locked away.

## What would make this steadier
Name the *category* of thing missing and the rupee amount of the gap, and explain why that category behaves differently from what they already own. Never name a specific security, fund or scheme. End on the closing sentence, with no sign-off and no call to action.

Omit any section that has genuinely nothing to say for this portfolio rather than padding it.

Target 450–650 words across the whole response. Depth is the point — but every sentence must carry information, and repeating the same finding in two sections is worse than a shorter answer.`;

function valueOf(analysis: PortfolioAnalysis, assetClass: string) {
  return analysis.allocation.slices.find((slice) => slice.assetClass === assetClass)?.value ?? 0;
}

export function buildNarrativeUserMessage(analysis: PortfolioAnalysis) {
  const equityValue = valueOf(analysis, "equity");
  const defensiveValue =
    valueOf(analysis, "debt") + valueOf(analysis, "gold") + valueOf(analysis, "cash");

  const marketFallContext = {
    equityValue,
    lossIfSharesFell30Percent: Math.round(equityValue * 0.3),
    lossIfSharesFell50Percent: Math.round(equityValue * 0.5),
    defensiveValueAvailable: defensiveValue,
    note: "These are illustrative arithmetic on current holdings to show scale of exposure. They are not predictions and must be described as such.",
  };

  const payload = {
    investorName: analysis.investorName,
    totalValue: analysis.allocation.totalValue,
    allocation: analysis.allocation.slices.map((slice) => ({
      assetClass: slice.label,
      percent: slice.percent,
      value: slice.value,
    })),
    drift: analysis.allocation.drift.map((item) => ({
      assetClass: item.assetClass,
      actualPercent: item.actualPercent,
      referencePercent: item.targetPercent,
      direction: item.direction,
    })),
    riskProfile: {
      statedCategory: analysis.riskProfile.statedCategory,
      derivedCategory: analysis.riskProfile.derivedCategory,
      capacityScore: analysis.riskProfile.capacityScore,
      isMismatched: analysis.riskProfile.isMismatched,
    },
    // Reference mixes are planning heuristics, never observed peer behaviour — the
    // narrative must not describe them as what other investors hold.
    shapeComparison: {
      portfolioIsBuiltLike: analysis.benchmark.closestBand,
      circumstancesSuggest: analysis.benchmark.derivedBand,
      shapeMismatch: analysis.benchmark.shapeMismatch,
      distanceByBand: analysis.benchmark.comparisons.map((item) => ({
        band: item.band,
        pointsAway: item.totalAbsoluteDrift,
      })),
    },
    healthScore: {
      score: analysis.healthScore.score,
      band: analysis.healthScore.band,
      components: analysis.healthScore.components.map((component) => ({
        label: component.label,
        score: component.score,
      })),
    },
    concentration: {
      topIssuers: analysis.concentration.topIssuers.slice(0, 3),
      amcConcentration: analysis.concentration.amcConcentration,
      marketCapSplit: analysis.concentration.marketCapSplit,
    },
    lookThroughOverlap: analysis.overlap
      ? {
          percentOfEquityOwnedMoreThanOnce: analysis.overlap.overlapPercentOfEquity,
          companiesReachedMoreThanOnce: analysis.overlap.duplicatedIssuers.length,
          topDuplicated: analysis.overlap.duplicatedIssuers.slice(0, 3).map((issuer) => ({
            name: issuer.name,
            percentOfEquity: issuer.percentOfEquity,
            routes: issuer.sources.map((source) => (source.kind === "direct" ? "bought directly" : source.label)),
          })),
          mostOverlappingFundPair: analysis.overlap.worstPair,
          industryConcentration: analysis.overlap.sectorExposures.slice(0, 4).map((sector) => ({
            industry: sector.sector,
            percentOfEquity: sector.percentOfEquity,
            companiesHeld: sector.issuerCount,
            level: sector.level,
          })),
        }
      : null,
    // Category and size only — never instrument names, so the model cannot be
    // nudged into naming a specific security.
    gapsToClose: analysis.actionPlan
      ? analysis.actionPlan.gaps.map((gap) => ({
          assetClass: gap.label,
          shortfallPercent: gap.shortfallPercent,
          shortfallValue: gap.shortfallValue,
          whyItMatters: gap.rationale,
        }))
      : null,
    // Precomputed so the model can ground consequences in real rupee amounts without
    // ever doing arithmetic itself — rule 1 stays absolute.
    marketFallContext,
    findings: analysis.findings.map((finding) => ({
      severity: finding.severity,
      title: finding.title,
      detail: finding.detail,
      evidence: finding.evidence,
    })),
  };

  return `Here is the completed analysis for this portfolio. Write the explanation using the section structure you were given.

<analysis>
${JSON.stringify(payload, null, 2)}
</analysis>`;
}
