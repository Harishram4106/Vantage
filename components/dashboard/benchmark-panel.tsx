"use client";

import { ArrowRight, Scale } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { BenchmarkResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

const BAND_COPY: Record<string, string> = {
  conservative: "Protects capital first, accepts slower growth",
  moderate: "Balances growth against a softer fall",
  aggressive: "Chases growth, accepts deeper falls",
};

export function BenchmarkPanel({ benchmark }: { benchmark: BenchmarkResult }) {
  const reduceMotion = useReducedMotion();

  const own = benchmark.comparisons.find((item) => item.band === benchmark.derivedBand);
  const riskier = benchmark.closestBand === "aggressive" && benchmark.derivedBand !== "aggressive";
  const verdictTone = benchmark.shapeMismatch ? (riskier ? "#c0343c" : "#9a6f14") : "#11765a";
  const verdictSoft = benchmark.shapeMismatch
    ? riskier
      ? "rgba(224,87,92,0.10)"
      : "rgba(227,187,101,0.14)"
    : "rgba(39,179,134,0.10)";

  return (
    <Panel
      title="How your mix compares"
      subtitle="Measured against the reference allocation for every risk band, not just your own — so you can see which one your portfolio actually resembles."
      action={<Scale size={18} className="text-[#8f78ff]" aria-hidden="true" />}
      accent
    >
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] px-5 py-4"
        style={{ backgroundColor: verdictSoft }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
            Your portfolio is built like
          </p>
          <p className="mt-1 text-xl font-semibold capitalize text-[#17141c]">{benchmark.closestBand}</p>
        </div>

        <ArrowRight size={18} className="mt-4 shrink-0 text-[#17141c]/28" aria-hidden="true" />

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
            Your circumstances suggest
          </p>
          <p className="mt-1 text-xl font-semibold capitalize" style={{ color: verdictTone }}>
            {benchmark.derivedBand}
          </p>
        </div>

        <p className="ml-auto max-w-[34ch] text-xs leading-relaxed text-[#17141c]/58">
          {benchmark.shapeMismatch
            ? riskier
              ? "You are carrying more risk than your age, horizon and dependents support."
              : "You are carrying less risk than your horizon could support."
            : "The shape of your portfolio matches your circumstances."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {benchmark.comparisons.map((comparison, index) => {
          const isClosest = comparison.band === benchmark.closestBand;
          const isOwn = comparison.band === benchmark.derivedBand;

          return (
            <motion.div
              key={comparison.band}
              className={cn(
                "rounded-[22px] border p-4",
                isClosest ? "border-[#8f78ff]/40 bg-[#8f78ff]/6" : "border-[#17141c]/8 bg-white/62",
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold capitalize text-[#17141c]">{comparison.band}</p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {isClosest ? (
                    <span className="rounded-full bg-[#8f78ff]/16 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6953dc]">
                      Closest
                    </span>
                  ) : null}
                  {isOwn ? (
                    <span className="rounded-full bg-[#17141c]/7 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/58">
                      Yours
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-[#17141c]/52">{BAND_COPY[comparison.band]}</p>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/40">
                  Reference mix
                </p>
                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-[#17141c]/6">
                  {comparison.rows
                    .filter((row) => row.referencePercent > 0)
                    .map((row) => (
                      <span
                        key={row.assetClass}
                        className="h-full"
                        style={{ width: `${row.referencePercent}%`, backgroundColor: row.color }}
                        title={`${row.label} ${row.referencePercent}%`}
                      />
                    ))}
                </div>
              </div>

              <div className="mt-4 border-t border-[#17141c]/8 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/40">
                  Distance from your mix
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#17141c]">
                  {comparison.totalAbsoluteDrift}
                  <span className="ml-1 text-xs font-normal text-[#17141c]/45">points</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {own ? (
        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
            Against your own {benchmark.derivedBand} reference
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#17141c]/8 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/42">
                  <th className="pb-2.5 pr-4 font-semibold">Asset class</th>
                  <th className="pb-2.5 pr-4 text-right font-semibold">You hold</th>
                  <th className="pb-2.5 pr-4 text-right font-semibold">Reference</th>
                  <th className="pb-2.5 text-right font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {own.rows.map((row) => {
                  const over = row.driftPercent > 0;
                  const material = Math.abs(row.driftPercent) >= 3;
                  return (
                    <tr key={row.assetClass} className="border-b border-[#17141c]/6 last:border-0">
                      <td className="py-2.5 pr-4">
                        <span className="flex items-center gap-2 text-sm text-[#17141c]/78">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                          {row.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-sm font-semibold text-[#17141c]">
                        {row.actualPercent}%
                      </td>
                      <td className="py-2.5 pr-4 text-right text-sm text-[#17141c]/55">{row.referencePercent}%</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            !material
                              ? "text-[#17141c]/38"
                              : over
                                ? "text-[#c0343c]"
                                : "text-[#9a6f14]",
                          )}
                        >
                          {over ? "+" : ""}
                          {row.driftPercent}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <WhyNote>{benchmark.why}</WhyNote>
    </Panel>
  );
}
