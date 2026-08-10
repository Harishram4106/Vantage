"use client";

import { Layers3 } from "lucide-react";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { ConcentrationResult } from "@/types/analysis";

const CAP_COLOR = { large: "#8f78ff", mid: "#df6ccf", small: "#e3bb65" } as const;
const CAP_LABEL = { large: "Large cap", mid: "Mid cap", small: "Small cap" } as const;

function Bar({ percent, color }: { percent: number; color: string }) {
  return (
    <span className="h-1.5 w-full overflow-hidden rounded-full bg-[#17141c]/8">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, backgroundColor: color }} />
    </span>
  );
}

export function ConcentrationPanel({ concentration }: { concentration: ConcentrationResult }) {
  const caps = (Object.keys(CAP_LABEL) as Array<keyof typeof CAP_LABEL>).filter(
    (band) => (concentration.marketCapSplit[band] ?? 0) > 0,
  );

  return (
    <Panel
      title="Concentration check"
      subtitle="Where the same names, fund houses and company sizes stack up behind the scenes."
      action={<Layers3 size={18} className="text-[#df6ccf]" aria-hidden="true" />}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Largest holdings</p>
          <div className="mt-3 space-y-3">
            {concentration.topIssuers.length === 0 ? (
              <p className="text-sm text-[#17141c]/50">No equity holdings with disclosed top companies.</p>
            ) : (
              concentration.topIssuers.slice(0, 5).map((issuer) => (
                <div key={issuer.name}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm text-[#17141c]/78">{issuer.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-[#17141c]">{issuer.percentOfEquity}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar percent={issuer.percentOfEquity} color="#8f78ff" />
                  </div>
                  <p className="mt-1 text-xs text-[#17141c]/45">{issuer.percentOfPortfolio}% of total portfolio</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Fund houses</p>
          <div className="mt-3 space-y-3">
            {concentration.amcConcentration.length === 0 ? (
              <p className="text-sm text-[#17141c]/50">No mutual funds held.</p>
            ) : (
              concentration.amcConcentration.map((amc) => (
                <div key={amc.amc}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm text-[#17141c]/78">{amc.amc.replace(" Mutual Fund", "")}</span>
                    <span className="shrink-0 text-sm font-semibold text-[#17141c]">{amc.percentOfMutualFunds}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar percent={amc.percentOfMutualFunds} color={amc.percentOfMutualFunds >= 50 ? "#df6ccf" : "#5bb7c9"} />
                  </div>
                  <p className="mt-1 text-xs text-[#17141c]/45">
                    {amc.schemeCount} scheme{amc.schemeCount === 1 ? "" : "s"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Company size mix</p>
          <div className="mt-3 space-y-3">
            {caps.length === 0 ? (
              <p className="text-sm text-[#17141c]/50">No equity exposure.</p>
            ) : (
              caps.map((band) => (
                <div key={band}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-[#17141c]/78">{CAP_LABEL[band]}</span>
                    <span className="text-sm font-semibold text-[#17141c]">{concentration.marketCapSplit[band]}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar percent={concentration.marketCapSplit[band] ?? 0} color={CAP_COLOR[band]} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-[#17141c]/4 px-3.5 py-3">
            <p className="text-xs text-[#17141c]/55">Single-name concentration index</p>
            <p className="mt-1 text-2xl font-semibold text-[#17141c]">{concentration.herfindahlIndex.toFixed(3)}</p>
            <p className="mt-0.5 text-xs text-[#17141c]/45">
              {concentration.herfindahlIndex >= 0.18 ? "Above the 0.18 caution threshold" : "Below the 0.18 caution threshold"}
            </p>
          </div>
        </div>
      </div>

      <WhyNote>{concentration.why}</WhyNote>
    </Panel>
  );
}
