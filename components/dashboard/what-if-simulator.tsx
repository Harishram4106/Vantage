"use client";

import { useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel } from "@/components/dashboard/panel";
import { analysePortfolio } from "@/lib/analytics";
import { applyAdditions, type SimulationAdditions } from "@/lib/analytics/simulate";
import { ASSET_CLASS_COLOR, ASSET_CLASS_LABEL } from "@/lib/analytics/fund-taxonomy";
import type { AssetClass } from "@/types/portfolio";
import type { PortfolioAnalysis } from "@/types/analysis";
import type { UnifiedPortfolio } from "@/types/portfolio";
import { cn, formatInr, formatInrCompact } from "@/lib/utils";

const BAND_TONE: Record<PortfolioAnalysis["healthScore"]["band"], string> = {
  poor: "#e0575c",
  fair: "#e3bb65",
  good: "#5bb7c9",
  strong: "#27b386",
};

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function WhatIfSimulator({
  portfolio,
  baseline,
}: {
  portfolio: UnifiedPortfolio;
  baseline: PortfolioAnalysis;
}) {
  const reduceMotion = useReducedMotion();

  const sliders = useMemo(() => {
    const gapClasses = baseline.actionPlan?.gaps.map((gap) => gap.assetClass) ?? [];
    // Always offer debt as a lever — it is the most common thing a retail portfolio
    // is missing, even when the shortfall sits just under the reporting threshold.
    const classes: AssetClass[] = Array.from(new Set<AssetClass>([...gapClasses, "debt"]));

    return classes.map((assetClass) => {
      const gap = baseline.actionPlan?.gaps.find((item) => item.assetClass === assetClass);
      const suggested = gap?.shortfallValue ?? Math.round(baseline.allocation.totalValue * 0.05);
      const max = Math.max(roundToStep(suggested * 2, 5000), 50000);
      return { assetClass, suggested: roundToStep(suggested, 5000), max };
    });
  }, [baseline]);

  const [additions, setAdditions] = useState<SimulationAdditions>({});

  const simulated = useMemo(
    () => analysePortfolio(applyAdditions(portfolio, additions)),
    [portfolio, additions],
  );

  const totalAdded = Object.values(additions).reduce((sum, amount) => sum + (amount ?? 0), 0);
  const isDirty = totalAdded > 0;

  const scoreDelta = simulated.healthScore.score - baseline.healthScore.score;
  const shown = isDirty ? simulated : baseline;

  return (
    <Panel
      title="What if you closed the gap?"
      subtitle="Move money into what your portfolio is missing and watch every score recalculate. Nothing here changes your real holdings."
      action={<SlidersHorizontal size={18} className="text-[#8f78ff]" aria-hidden="true" />}
      accent
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-6">
          {sliders.map(({ assetClass, suggested, max }) => {
            const amount = additions[assetClass] ?? 0;
            return (
              <div key={assetClass}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    htmlFor={`sim-${assetClass}`}
                    className="flex items-center gap-2 text-sm font-medium text-[#17141c]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ASSET_CLASS_COLOR[assetClass] }}
                    />
                    Add to {ASSET_CLASS_LABEL[assetClass]}
                  </label>
                  <span className="text-sm font-semibold text-[#17141c]">
                    {amount > 0 ? formatInr(amount) : "—"}
                  </span>
                </div>

                <input
                  id={`sim-${assetClass}`}
                  type="range"
                  min={0}
                  max={max}
                  step={5000}
                  value={amount}
                  onChange={(event) =>
                    setAdditions((current) => ({ ...current, [assetClass]: Number(event.target.value) }))
                  }
                  className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#17141c]/10 accent-[#8f78ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
                  style={{ accentColor: ASSET_CLASS_COLOR[assetClass] }}
                />

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#17141c]/42">₹0</span>
                  <button
                    type="button"
                    onClick={() => setAdditions((current) => ({ ...current, [assetClass]: suggested }))}
                    className="text-xs font-medium text-[#6953dc] transition hover:text-[#8f78ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
                  >
                    Snap to gap · {formatInrCompact(suggested)}
                  </button>
                  <span className="text-xs text-[#17141c]/42">{formatInrCompact(max)}</span>
                </div>
              </div>
            );
          })}

          {isDirty ? (
            <button
              type="button"
              onClick={() => setAdditions({})}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#17141c]/10 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#17141c]/60 transition hover:bg-white hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reset
            </button>
          ) : null}
        </div>

        <div className="w-full lg:w-[300px]">
          <div className="rounded-[24px] border border-[#17141c]/8 bg-white/72 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#17141c]/42">
              Health score
            </p>

            <div className="mt-3 flex items-end gap-3">
              <span className="text-[52px] font-semibold leading-none tracking-tight text-[#17141c]">
                {shown.healthScore.score}
              </span>
              {scoreDelta !== 0 ? (
                <motion.span
                  key={scoreDelta}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                    scoreDelta > 0 ? "bg-[#27b386]/12 text-[#11765a]" : "bg-[#e0575c]/12 text-[#c0343c]",
                  )}
                >
                  <TrendingUp
                    size={13}
                    className={scoreDelta < 0 ? "rotate-180" : undefined}
                    aria-hidden="true"
                  />
                  {scoreDelta > 0 ? "+" : ""}
                  {scoreDelta}
                </motion.span>
              ) : null}
            </div>

            <p
              className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: BAND_TONE[shown.healthScore.band] }}
            >
              {shown.healthScore.band}
              {isDirty && simulated.healthScore.band !== baseline.healthScore.band
                ? ` · was ${baseline.healthScore.band}`
                : ""}
            </p>

            <div className="mt-5 space-y-2.5 border-t border-[#17141c]/8 pt-4">
              {shown.healthScore.components.map((component) => {
                const before = baseline.healthScore.components.find((item) => item.key === component.key);
                const delta = component.score - (before?.score ?? 0);
                return (
                  <div key={component.key} className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#17141c]/55">{component.label}</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold text-[#17141c]">{component.score}</span>
                      {delta !== 0 ? (
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            delta > 0 ? "text-[#11765a]" : "text-[#c0343c]",
                          )}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-[#17141c]/8 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#17141c]/42">
                Allocation
              </p>
              {shown.allocation.slices.map((slice) => {
                const before = baseline.allocation.slices.find((item) => item.assetClass === slice.assetClass);
                const delta = Number((slice.percent - (before?.percent ?? 0)).toFixed(1));
                return (
                  <div key={slice.assetClass} className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs text-[#17141c]/55">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                      {slice.label}
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-sm text-[#17141c]">{slice.percent}%</span>
                      {delta !== 0 ? (
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            delta > 0 ? "text-[#11765a]" : "text-[#c0343c]",
                          )}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>

            {isDirty ? (
              <p className="mt-5 border-t border-[#17141c]/8 pt-3.5 text-xs leading-relaxed text-[#17141c]/50">
                Simulating {formatInr(totalAdded)} of new money. Your actual holdings are unchanged.
              </p>
            ) : (
              <p className="mt-5 border-t border-[#17141c]/8 pt-3.5 text-xs leading-relaxed text-[#17141c]/50">
                Drag a slider to see how the score responds.
              </p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
