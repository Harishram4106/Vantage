"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AiNarrative } from "@/components/dashboard/ai-narrative";
import { AnimatedCurrency } from "@/components/dashboard/animated-currency";
import { HealthRing } from "@/components/dashboard/health-ring";
import { MOCK_PORTFOLIOS } from "@/data/mock/portfolios";
import type { PortfolioAnalysis } from "@/types/analysis";
import { cn } from "@/lib/utils";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#17141c]/40">{label}</p>
      <p
        className="mt-1.5 truncate text-lg font-semibold capitalize text-[#17141c]"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

export function DashboardHero({
  analysis,
  activeKey,
  asOf,
}: {
  analysis: PortfolioAnalysis;
  activeKey: string;
  asOf: string;
}) {
  const reduceMotion = useReducedMotion();
  const equity = analysis.allocation.slices.find((slice) => slice.assetClass === "equity");
  const critical = analysis.findings.filter((finding) => finding.severity === "critical").length;
  const actionable = analysis.findings.filter((finding) => finding.severity !== "positive").length;

  return (
    <section className="px-5 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="Back to home"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#17141c]/10 bg-white/70 text-[#17141c]/60 backdrop-blur-xl transition hover:bg-white hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
            <Image
              src="/vantage-logo.png"
              alt="Vantage"
              width={130}
              height={42}
              priority
              className="h-auto w-[110px]"
            />
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/report?portfolio=${activeKey}`}
              download
              className="inline-flex items-center gap-2 rounded-full border border-[#8f78ff]/22 bg-[#8f78ff]/10 px-3.5 py-1.5 text-xs font-medium text-[#6953dc] transition hover:bg-[#8f78ff]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <Download size={14} aria-hidden="true" />
              Download Report
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#27b386]/22 bg-[#27b386]/10 px-3.5 py-1.5 text-xs font-medium text-[#11765a]">
              <ShieldCheck size={14} aria-hidden="true" />
              Read-only access · consent active
            </span>
          </div>
        </div>

        <motion.div
          className="premium-border glass mt-7 rounded-[36px] p-6 sm:p-9"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-9 lg:grid-cols-[1.4fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f78ff]">
                Portfolio intelligence
              </p>

              <p className="mt-4 text-sm text-[#17141c]/52">
                {analysis.investorName ?? "Your portfolio"} · as of {asOf}
              </p>

              <p className="mt-1.5 text-[clamp(44px,6vw,72px)] font-semibold leading-[0.98] tracking-tight text-[#17141c]">
                <AnimatedCurrency value={analysis.allocation.totalValue} />
              </p>

              <p className="mt-3 text-lg leading-8 text-[#17141c]/58">
                Consolidated across {analysis.allocation.slices.length} asset classes, {analysis.overlap?.analysedFunds.length ?? 0} funds
                looked through to the companies underneath.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#17141c]/10 pt-6 sm:grid-cols-4">
                <Stat label="Equity" value={`${equity?.percent ?? 0}%`} />
                <Stat label="Reference" value={`${analysis.riskProfile.targetAllocation.equity}%`} />
                <Stat
                  label="Risk capacity"
                  value={analysis.riskProfile.derivedCategory}
                  tone={analysis.riskProfile.isMismatched ? "#9a6f14" : undefined}
                />
                <Stat
                  label="Issues"
                  value={actionable === 0 ? "None" : String(actionable)}
                  tone={critical > 0 ? "#c0343c" : undefined}
                />
              </div>
            </div>

            <motion.div
              className="flex flex-col items-center gap-6"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <HealthRing healthScore={analysis.healthScore} />

              <div className="w-full max-w-[236px] space-y-2.5">
                {analysis.healthScore.components.map((component, index) => (
                  <div key={component.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-[#17141c]/55">{component.label}</span>
                      <span className="text-xs font-semibold text-[#17141c]">{component.score}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#17141c]/8">
                      <motion.div
                        className="h-full rounded-full bg-[#8f78ff]"
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: `${component.score}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.55 + index * 0.08 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-5">
          <AiNarrative portfolioKey={activeKey} />
        </div>

        <nav className="mt-7 flex flex-wrap items-center gap-2" aria-label="Sample portfolios">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#17141c]/35">
            Demo portfolios
          </span>
          {Object.entries(MOCK_PORTFOLIOS).map(([key, portfolio]) => (
            <Link
              key={key}
              href={`/dashboard?portfolio=${key}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
                key === activeKey
                  ? "bg-[#17141c] text-white shadow-[0_12px_30px_rgba(22,19,28,0.18)]"
                  : "border border-[#17141c]/10 bg-white/70 text-[#17141c]/62 backdrop-blur-xl hover:bg-white hover:text-[#17141c]",
              )}
            >
              {portfolio.investorName?.split(" ")[0] ?? key}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
