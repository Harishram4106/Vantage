"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart2, FileText, Flag, Layers3, LayoutGrid,
  PieChart, Radar, Receipt, Target,
} from "lucide-react";

import { FindingsFeed } from "@/components/dashboard/findings-feed";
import { HealthBreakdown } from "@/components/dashboard/health-breakdown";
import { AllocationPanel } from "@/components/dashboard/allocation-panel";
import { BenchmarkPanel } from "@/components/dashboard/benchmark-panel";
import { ConcentrationPanel } from "@/components/dashboard/concentration-panel";
import { OverlapPanel } from "@/components/dashboard/overlap-panel";
import { SectorHeatmap } from "@/components/dashboard/sector-heatmap";
import { ActionPlanPanel } from "@/components/dashboard/action-plan-panel";
import { WhatIfSimulator } from "@/components/dashboard/what-if-simulator";
import { AssetClassPrimer } from "@/components/dashboard/asset-class-primer";
import { RiskProfilePanel } from "@/components/dashboard/risk-profile-panel";
import { HoldingsTable } from "@/components/dashboard/holdings-table";
import { TaxPanel } from "@/components/dashboard/tax-panel";
import { GoalsPanel } from "@/components/dashboard/goals-panel";
import { ReportPanel } from "@/components/dashboard/report-panel";
import { Panel } from "@/components/dashboard/panel";
import type { PortfolioAnalysis } from "@/types/analysis";
import type { UnifiedPortfolio } from "@/types/portfolio";
import { cn } from "@/lib/utils";

// ── Primary sections ───────────────────────────────────────────────
const SECTIONS = [
  {
    id: "analyse" as const,
    label: "Analyse",
    icon: BarChart2,
    hint: "Holdings · risk · sectors",
  },
  {
    id: "plan" as const,
    label: "Plan",
    icon: Target,
    hint: "Actions · tax · goals",
  },
  {
    id: "report" as const,
    label: "Report",
    icon: FileText,
    hint: "PDF export",
  },
];

type SectionId = (typeof SECTIONS)[number]["id"];

// ── Sub-tabs per section ───────────────────────────────────────────
const SUB_TABS = {
  analyse: [
    { id: "findings",   label: "Findings",   icon: Radar      },
    { id: "allocation", label: "Allocation", icon: PieChart   },
    { id: "exposure",   label: "Exposure",   icon: Layers3    },
    { id: "sectors",    label: "Sectors",    icon: LayoutGrid },
  ],
  plan: [
    { id: "action", label: "Action Plan", icon: Target  },
    { id: "tax",    label: "Tax",         icon: Receipt },
    { id: "goals",  label: "Goals",       icon: Flag    },
  ],
} as const;

type AnalyseTab = (typeof SUB_TABS.analyse)[number]["id"];
type PlanTab    = (typeof SUB_TABS.plan)[number]["id"];
type TabId      = AnalyseTab | PlanTab;

const DEFAULT_TAB: Record<SectionId, TabId | null> = {
  analyse: "findings",
  plan: "action",
  report: null,
};

export function DashboardTabs({
  analysis,
  portfolio,
  activeKey,
}: {
  analysis: PortfolioAnalysis;
  portfolio: UnifiedPortfolio;
  activeKey: string;
}) {
  const [section, setSection] = useState<SectionId>("analyse");
  const [tab, setTab] = useState<TabId>("findings");
  const reduceMotion = useReducedMotion();

  const actionable = analysis.findings.filter((f) => f.severity !== "positive").length;

  function switchSection(s: SectionId) {
    setSection(s);
    const def = DEFAULT_TAB[s];
    if (def) setTab(def);
  }

  const subTabs = section !== "report" ? SUB_TABS[section] : [];

  return (
    <div className="space-y-3">
      {/* ── Primary section nav ── */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1.5 rounded-[22px] border border-[#17141c]/8 bg-white/70 p-1.5 shadow-[0_14px_45px_rgba(31,27,45,0.08)] backdrop-blur-xl">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const active = section === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => switchSection(sec.id)}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-[16px] px-7 py-3 text-center transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
                  active ? "text-white" : "text-[#17141c]/55 hover:text-[#17141c]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="section-pill"
                    className="absolute inset-0 rounded-[16px] bg-[#17141c] shadow-[0_8px_28px_rgba(22,19,28,0.28)]"
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <Icon size={16} className="relative shrink-0" aria-hidden="true" />
                <span className="relative text-sm font-semibold leading-none">{sec.label}</span>
                <span className={cn("relative text-[10px] leading-none", active ? "text-white/55" : "text-[#17141c]/36")}>
                  {sec.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sub-tab row (only when section has children) ── */}
      {subTabs.length > 0 && (
        <motion.div
          key={section}
          initial={reduceMotion ? false : { opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="inline-flex gap-0.5 rounded-full border border-[#17141c]/7 bg-[#17141c]/[0.04] p-1">
            {subTabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as TabId)}
                  aria-pressed={active}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/30",
                    active
                      ? "bg-white text-[#17141c] shadow-[0_2px_8px_rgba(22,19,28,0.10)]"
                      : "text-[#17141c]/48 hover:text-[#17141c]",
                  )}
                >
                  <Icon size={12} className="shrink-0" aria-hidden="true" />
                  {t.label}
                  {t.id === "findings" && actionable > 0 && (
                    <span
                      className={cn(
                        "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold",
                        active ? "bg-[#17141c]/10 text-[#17141c]" : "bg-[#17141c]/8 text-[#17141c]/55",
                      )}
                    >
                      {actionable}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Tab content ── */}
      <motion.div
        key={`${section}-${tab}`}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5 pt-1"
      >
        {/* ANALYSE */}
        {section === "analyse" && tab === "findings" && (
          <div className="grid gap-5 lg:grid-cols-12">
            <Panel
              title="What we found"
              subtitle="Ranked by how much it matters. Open any card to see the numbers behind it."
              className="lg:col-span-7"
              accent
            >
              <FindingsFeed findings={analysis.findings} />
            </Panel>
            <div className="space-y-5 lg:col-span-5">
              <HealthBreakdown healthScore={analysis.healthScore} />
              <RiskProfilePanel riskProfile={analysis.riskProfile} input={portfolio.riskProfileInput} />
            </div>
          </div>
        )}
        {section === "analyse" && tab === "allocation" && (
          <>
            <AllocationPanel allocation={analysis.allocation} />
            <BenchmarkPanel benchmark={analysis.benchmark} />
          </>
        )}
        {section === "analyse" && tab === "exposure" && (
          <>
            <OverlapPanel overlap={analysis.overlap} />
            <ConcentrationPanel concentration={analysis.concentration} />
            <HoldingsTable portfolio={portfolio} />
          </>
        )}
        {section === "analyse" && tab === "sectors" && (
          <SectorHeatmap overlap={analysis.overlap} />
        )}

        {/* PLAN */}
        {section === "plan" && tab === "action" && (
          <>
            <WhatIfSimulator portfolio={portfolio} baseline={analysis} />
            <ActionPlanPanel actionPlan={analysis.actionPlan} />
            <AssetClassPrimer actionPlan={analysis.actionPlan} />
          </>
        )}
        {section === "plan" && tab === "tax" && (
          <TaxPanel portfolio={portfolio} />
        )}
        {section === "plan" && tab === "goals" && (
          <GoalsPanel portfolio={portfolio} />
        )}

        {/* REPORT */}
        {section === "report" && (
          <ReportPanel analysis={analysis} portfolio={portfolio} portfolioKey={activeKey} />
        )}
      </motion.div>
    </div>
  );
}
