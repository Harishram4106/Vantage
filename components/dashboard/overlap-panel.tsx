"use client";

import { Layers } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { OverlapResult } from "@/types/analysis";
import { formatInr } from "@/lib/utils";

const SOURCE_COLORS = ["#17141c", "#8f78ff", "#df6ccf", "#5bb7c9", "#e3bb65"];

function shortScheme(name: string) {
  return name.replace(" - Direct Growth", "").replace(" Fund", "");
}

export function OverlapPanel({ overlap }: { overlap: OverlapResult | null }) {
  const reduceMotion = useReducedMotion();

  if (!overlap) {
    return (
      <Panel
        title="Fund overlap"
        subtitle="What your funds actually own underneath."
        action={<Layers size={18} className="text-[#df6ccf]" aria-hidden="true" />}
      >
        <p className="text-sm text-[#17141c]/55">
          None of your holdings are mutual funds with published holdings data, so there is nothing to look through.
        </p>
      </Panel>
    );
  }

  const maxPercent = Math.max(...overlap.issuerExposures.map((issuer) => issuer.percentOfEquity), 1);
  const duplicated = overlap.duplicatedIssuers.slice(0, 6);

  return (
    <Panel
      title="Fund overlap"
      subtitle="Two funds can look different and own the same companies. This looks inside them."
      action={<Layers size={18} className="text-[#df6ccf]" aria-hidden="true" />}
      accent
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#df6ccf]/8 px-4 py-3.5">
          <p className="text-xs text-[#17141c]/55">Equity you own more than once</p>
          <p className="mt-1 text-3xl font-semibold text-[#17141c]">{overlap.overlapPercentOfEquity}%</p>
        </div>
        <div className="rounded-2xl bg-[#17141c]/4 px-4 py-3.5">
          <p className="text-xs text-[#17141c]/55">Companies reached twice or more</p>
          <p className="mt-1 text-3xl font-semibold text-[#17141c]">{overlap.duplicatedIssuers.length}</p>
        </div>
        <div className="rounded-2xl bg-[#17141c]/4 px-4 py-3.5">
          <p className="text-xs text-[#17141c]/55">Funds looked through</p>
          <p className="mt-1 text-3xl font-semibold text-[#17141c]">{overlap.analysedFunds.length}</p>
        </div>
      </div>

      {duplicated.length > 0 ? (
        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
            Where the duplication sits
          </p>
          <p className="mt-1.5 text-sm text-[#17141c]/55">
            Each bar is one company. The segments show every route your money reaches it by.
          </p>

          <div className="mt-4 space-y-4">
            {duplicated.map((issuer) => (
              <div key={issuer.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#17141c]">{issuer.name}</span>
                  <span className="text-sm text-[#17141c]/58">
                    <span className="font-semibold text-[#17141c]">{issuer.percentOfEquity}%</span> of equity ·{" "}
                    {formatInr(issuer.value)}
                  </span>
                </div>

                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-[#17141c]/6">
                  {issuer.sources.map((source, index) => (
                    <motion.div
                      key={`${issuer.name}-${source.label}`}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }}
                      initial={reduceMotion ? false : { width: 0 }}
                      whileInView={{
                        width: `${(source.value / issuer.value) * (issuer.percentOfEquity / maxPercent) * 100}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                    />
                  ))}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {issuer.sources.map((source, index) => (
                    <span
                      key={`${issuer.name}-legend-${source.label}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#17141c]/55"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }}
                      />
                      {source.kind === "direct" ? "Bought directly" : shortScheme(source.label)}
                      <span className="text-[#17141c]/40">{formatInr(source.value)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-[#27b386]/8 px-4 py-3.5 text-sm text-[#11765a]">
          No company in your portfolio is reached through more than one holding. Your funds are genuinely covering
          different ground.
        </p>
      )}

      {overlap.pairwiseOverlap.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Fund against fund</p>
          <div className="mt-3 space-y-2.5">
            {overlap.pairwiseOverlap.map((pair) => (
              <div
                key={`${pair.schemeA}-${pair.schemeB}`}
                className="rounded-2xl bg-[#17141c]/4 px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm text-[#17141c]/78">
                    {shortScheme(pair.schemeA)} <span className="text-[#17141c]/35">vs</span>{" "}
                    {shortScheme(pair.schemeB)}
                  </span>
                  <span className="text-sm font-semibold text-[#17141c]">{pair.overlapPercent}% the same</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#17141c]/8">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: pair.overlapPercent >= 25 ? "#df6ccf" : "#5bb7c9" }}
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={{ width: `${Math.min(100, pair.overlapPercent)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#17141c]/48">
                  Shares {pair.sharedIssuers.length} top holdings
                  {pair.sameAmc ? " · same fund house" : ""} · {pair.sharedIssuers.slice(0, 3).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <WhyNote>{overlap.why}</WhyNote>
    </Panel>
  );
}
