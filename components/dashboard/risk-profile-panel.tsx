import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { RiskProfileResult } from "@/types/analysis";
import type { RiskProfileInput } from "@/types/portfolio";

const CATEGORIES = ["conservative", "moderate", "aggressive"] as const;

export function RiskProfilePanel({
  riskProfile,
  input,
}: {
  riskProfile: RiskProfileResult;
  input: RiskProfileInput;
}) {
  return (
    <Panel
      title="Risk profile"
      subtitle="What you told us, against what your circumstances actually support."
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Capacity score</p>
            <p className="text-2xl font-semibold text-[#17141c]">{riskProfile.capacityScore}<span className="text-sm text-[#17141c]/40">/100</span></p>
          </div>
          <div className="mt-3 flex gap-1.5">
            {CATEGORIES.map((category) => {
              const isDerived = category === riskProfile.derivedCategory;
              const isStated = category === riskProfile.statedCategory;

              return (
                <div key={category} className="flex-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: isDerived ? "#8f78ff" : "rgba(23,20,28,0.09)" }}
                  />
                  <p className="mt-2 text-center text-xs capitalize text-[#17141c]/55">{category}</p>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    {isDerived ? (
                      <span className="rounded-full bg-[#8f78ff]/14 px-2 py-0.5 text-[10px] font-semibold text-[#6953dc]">
                        derived
                      </span>
                    ) : null}
                    {isStated ? (
                      <span className="rounded-full bg-[#17141c]/6 px-2 py-0.5 text-[10px] font-semibold text-[#17141c]/58">
                        you said
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Age", `${input.age}`],
            ["Horizon", `${input.horizonYears} years`],
            ["Dependents", `${input.dependents}`],
            ["Drawdown tolerance", `${input.drawdownTolerancePercent}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[#17141c]/4 px-3.5 py-2.5">
              <dt className="text-xs text-[#17141c]/50">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[#17141c]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <WhyNote>{riskProfile.why}</WhyNote>
    </Panel>
  );
}
