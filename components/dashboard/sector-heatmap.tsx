"use client";

import { LayoutGrid } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import { SectorTreemap } from "@/components/dashboard/sector-treemap";
import type { ConcentrationLevel, OverlapResult } from "@/types/analysis";

const LEVEL: Record<ConcentrationLevel, { label: string; tone: string; soft: string; border: string }> = {
  low: { label: "Low", tone: "#11765a", soft: "rgba(39,179,134,0.10)", border: "rgba(39,179,134,0.26)" },
  moderate: { label: "Moderate", tone: "#3f7f90", soft: "rgba(91,183,201,0.13)", border: "rgba(91,183,201,0.30)" },
  high: { label: "High", tone: "#9a6f14", soft: "rgba(227,187,101,0.18)", border: "rgba(227,187,101,0.38)" },
  very_high: { label: "Very high", tone: "#c0343c", soft: "rgba(224,87,92,0.15)", border: "rgba(224,87,92,0.34)" },
};

const LEGEND: Array<{ level: ConcentrationLevel; range: string }> = [
  { level: "low", range: "under 10%" },
  { level: "moderate", range: "10–20%" },
  { level: "high", range: "20–35%" },
  { level: "very_high", range: "over 35%" },
];

export function SectorHeatmap({ overlap }: { overlap: OverlapResult | null }) {
  const reduceMotion = useReducedMotion();

  if (!overlap || overlap.sectorExposures.length === 0) {
    return (
      <Panel
        title="Which industries you are really backing"
        subtitle="Grouped from the companies found inside your funds."
        action={<LayoutGrid size={18} className="text-[#8f78ff]" aria-hidden="true" />}
      >
        <p className="text-sm text-[#17141c]/55">
          No fund holdings data is available for this portfolio, so there is nothing to group by industry.
        </p>
      </Panel>
    );
  }

  const sectors = overlap.sectorExposures;
  const dominant = sectors[0];
  const attributed = sectors.reduce((sum, sector) => sum + sector.percentOfEquity, 0);

  return (
    <Panel
      title="Which industries you are really backing"
      subtitle="Your funds hold companies, and those companies sit in industries. This groups every one of them, so a bet you never consciously placed becomes visible."
      action={<LayoutGrid size={18} className="text-[#8f78ff]" aria-hidden="true" />}
      accent
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: LEVEL[dominant.level].soft }}
        >
          <p className="text-xs text-[#17141c]/55">Largest industry</p>
          <p className="mt-1 truncate text-lg font-semibold text-[#17141c]">{dominant.sector}</p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: LEVEL[dominant.level].tone }}>
            {dominant.percentOfEquity}% of your equity
          </p>
        </div>
        <div className="rounded-2xl bg-[#17141c]/4 px-4 py-3.5">
          <p className="text-xs text-[#17141c]/55">Industries you touch</p>
          <p className="mt-1 text-3xl font-semibold text-[#17141c]">{sectors.length}</p>
        </div>
        <div className="rounded-2xl bg-[#17141c]/4 px-4 py-3.5">
          <p className="text-xs text-[#17141c]/55">Industry concentration index</p>
          <p className="mt-1 text-3xl font-semibold text-[#17141c]">{overlap.sectorHerfindahl.toFixed(3)}</p>
          <p className="mt-0.5 text-xs text-[#17141c]/45">
            {overlap.sectorHerfindahl >= 0.25 ? "Leans on a few industries" : "Reasonably spread"}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
          The whole picture, in one line
        </p>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-[#17141c]/6">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.sector}
              className="h-full first:rounded-l-full"
              style={{ backgroundColor: LEVEL[sector.level].tone, opacity: 1 - index * 0.06 }}
              title={`${sector.sector} — ${sector.percentOfEquity}%`}
              initial={reduceMotion ? false : { width: 0 }}
              whileInView={{ width: `${sector.percentOfEquity}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-[#17141c]/45">
          Bars total {attributed.toFixed(1)}% — the rest is each fund&apos;s undisclosed long tail, which cannot be
          grouped.
        </p>
      </div>

      <div className="mt-7">
        <SectorTreemap sectors={sectors} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-[#17141c]/4 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/42">Reading the map</p>
        {LEGEND.map(({ level, range }) => (
          <span key={level} className="inline-flex items-center gap-1.5 text-xs text-[#17141c]/58">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: LEVEL[level].tone }}
              aria-hidden="true"
            />
            {LEVEL[level].label} · {range} of equity
          </span>
        ))}
        <span className="text-xs text-[#17141c]/48">Deeper shade within a colour means a larger holding.</span>
      </div>

      <WhyNote>{overlap.sectorWhy}</WhyNote>
    </Panel>
  );
}
