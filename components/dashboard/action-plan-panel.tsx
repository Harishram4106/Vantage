"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import { INSTRUMENT_KIND_LABEL, MATCHING_DISCLAIMER } from "@/data/mock/instruments";
import type { ActionPlan, MatchedInstrument } from "@/types/analysis";
import { cn, formatInr } from "@/lib/utils";

const LIQUIDITY_LABEL = {
  high: "Easy to sell",
  moderate: "Moderately traded",
  low: "Thinly traded",
} as const;

function InstrumentCard({ match, index }: { match: MatchedInstrument; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const reduceMotion = useReducedMotion();
  const { instrument } = match;

  return (
    <motion.div
      className="overflow-hidden rounded-[22px] border border-[#17141c]/8 bg-white/72"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#8f78ff]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#6953dc]">
              {INSTRUMENT_KIND_LABEL[instrument.kind]}
            </span>
            <span className="rounded-full bg-[#17141c]/6 px-2.5 py-0.5 text-[11px] text-[#17141c]/58">
              {instrument.creditRating}
            </span>
            <span className="text-[11px] text-[#17141c]/42">{instrument.exchange}</span>
          </div>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#17141c]">{instrument.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#17141c]/58">{instrument.whatItIs}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold leading-none text-[#17141c]">
            {instrument.indicativeYieldPercent}%
          </p>
          <p className="mt-1 text-[11px] text-[#17141c]/45">indicative yield</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#17141c]/7 px-4 py-3 sm:grid-cols-4">
        <div>
          <p className="text-[11px] text-[#17141c]/45">Minimum</p>
          <p className="mt-0.5 text-sm font-medium text-[#17141c]">{formatInr(instrument.minInvestment)}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#17141c]/45">Tenure</p>
          <p className="mt-0.5 text-sm font-medium text-[#17141c]">
            {instrument.tenureYears === null ? "No maturity" : `${instrument.tenureYears} years`}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[#17141c]/45">Liquidity</p>
          <p className="mt-0.5 text-sm font-medium text-[#17141c]">{LIQUIDITY_LABEL[instrument.liquidity]}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#17141c]/45">Income</p>
          <p className="mt-0.5 text-sm font-medium text-[#17141c]">{instrument.incomeFrequency}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-t border-[#17141c]/7 px-4 py-2.5 text-left text-xs font-medium text-[#17141c]/58 transition hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
      >
        <span>Why this matches your gap · fit {match.fitScore}/100</span>
        <ChevronDown size={14} className={cn("transition duration-300", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open ? (
        <div className="border-t border-[#17141c]/7 bg-[#17141c]/[0.02] px-4 py-3">
          <ul className="space-y-1.5">
            {match.fitReasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-xs leading-relaxed text-[#17141c]/65">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8f78ff]" aria-hidden="true" />
                {reason}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#e3bb65]/12 px-3 py-2 text-xs leading-relaxed text-[#17141c]/68">
            <span className="font-semibold">Main risk —</span>
            {instrument.mainRisk}
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

export function ActionPlanPanel({ actionPlan }: { actionPlan: ActionPlan | null }) {
  if (!actionPlan) {
    return (
      <Panel
        title="Closing the gap"
        subtitle="Regulated instruments matched to what your portfolio is missing."
        action={<Target size={18} className="text-[#27b386]" aria-hidden="true" />}
      >
        <p className="rounded-2xl bg-[#27b386]/8 px-4 py-3.5 text-sm text-[#11765a]">
          No asset class is more than 3 percentage points below the reference mix for your risk capacity, so there is
          nothing to fill right now.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Closing the gap"
      subtitle="SEBI-regulated, exchange-listed instruments whose asset class matches what your portfolio is missing."
      action={<Target size={18} className="text-[#27b386]" aria-hidden="true" />}
      accent
    >
      <div className="space-y-8">
        {actionPlan.gaps.map((gap) => (
          <div key={gap.assetClass}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#17141c]/8 pb-3">
              <div>
                <p className="text-base font-semibold text-[#17141c]">
                  {gap.label} — short by {gap.shortfallPercent} points
                </p>
                {gap.rationale ? (
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#17141c]/58">{gap.rationale}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-[#17141c]">{formatInr(gap.shortfallValue)}</p>
                <p className="text-[11px] text-[#17141c]/45">to reach the reference mix</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {gap.matches.map((match, index) => (
                <InstrumentCard key={match.instrument.id} match={match} index={index} />
              ))}
            </div>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#17141c] px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(22,19,28,0.2)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              Continue on NSE / BSE
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
            <p className="mt-2 text-[11px] text-[#17141c]/40">
              Prototype — this would hand off to the exchange or registrar. Vantage never holds your money.
            </p>
          </div>
        ))}
      </div>

      <p className="mt-7 rounded-2xl border border-[#e3bb65]/24 bg-[#e3bb65]/10 px-4 py-3.5 text-xs leading-relaxed text-[#17141c]/70">
        {MATCHING_DISCLAIMER}
      </p>

      <WhyNote>{actionPlan.why}</WhyNote>
    </Panel>
  );
}
