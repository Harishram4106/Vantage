import type { AssetClass, RiskCategory, RiskProfileInput } from "@/types/portfolio";
import type { RiskProfileResult } from "@/types/analysis";

const TARGET_ALLOCATION: Record<RiskCategory, Record<AssetClass, number>> = {
  conservative: { equity: 30, debt: 50, gold: 10, reit: 5, invit: 0, cash: 5 },
  moderate: { equity: 55, debt: 28, gold: 8, reit: 6, invit: 0, cash: 3 },
  aggressive: { equity: 75, debt: 12, gold: 6, reit: 4, invit: 0, cash: 3 },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function categorise(capacityScore: number): RiskCategory {
  if (capacityScore < 40) return "conservative";
  if (capacityScore < 70) return "moderate";
  return "aggressive";
}

export function assessRiskProfile(input: RiskProfileInput): RiskProfileResult {
  const ageScore = clamp(((60 - input.age) / 35) * 100);
  const horizonScore = clamp((input.horizonYears / 15) * 100);
  const dependentsScore = clamp(100 - input.dependents * 15);
  const drawdownScore = clamp((input.drawdownTolerancePercent / 40) * 100);

  const capacityScore = Math.round(
    horizonScore * 0.3 + ageScore * 0.25 + drawdownScore * 0.25 + dependentsScore * 0.2,
  );

  const derivedCategory = categorise(capacityScore);
  const isMismatched = derivedCategory !== input.statedRiskAppetite;

  return {
    statedCategory: input.statedRiskAppetite,
    derivedCategory,
    capacityScore,
    isMismatched,
    targetAllocation: TARGET_ALLOCATION[derivedCategory],
    why: `Capacity score ${capacityScore}/100 derived from a ${input.horizonYears}-year horizon (weight 30%), age ${input.age} (25%), a stated tolerance for a ${input.drawdownTolerancePercent}% drawdown (25%), and ${input.dependents} dependent(s) (20%). That places this investor in the "${derivedCategory}" band${isMismatched ? `, which differs from the self-declared "${input.statedRiskAppetite}" appetite` : ", matching the self-declared appetite"}.`,
  };
}

export { TARGET_ALLOCATION };
