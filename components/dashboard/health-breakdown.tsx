"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import type { HealthScoreResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

const BAND_TONE: Record<HealthScoreResult["band"], string> = {
  poor: "#e0575c",
  fair: "#e3bb65",
  good: "#5bb7c9",
  strong: "#27b386",
};

function scoreTone(score: number) {
  if (score < 40) return "#e0575c";
  if (score < 60) return "#e3bb65";
  if (score < 80) return "#5bb7c9";
  return "#27b386";
}

export function HealthBreakdown({ healthScore }: { healthScore: HealthScoreResult }) {
  const [openKey, setOpenKey] = useState<string | null>(healthScore.components[0]?.key ?? null);
  const tone = BAND_TONE[healthScore.band];
  const sweep = (healthScore.score / 100) * 360;

  return (
    <Panel
      title="Portfolio health"
      subtitle="Four transparent, rule-based components — no black box."
    >
      <div className="grid place-items-center">
        <div
          className="relative grid h-44 w-44 place-items-center rounded-full"
          style={{
            background: `conic-gradient(from 180deg, ${tone} ${sweep}deg, rgba(23,20,28,0.07) ${sweep}deg 360deg)`,
          }}
        >
          <div className="grid h-32 w-32 place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-4xl font-semibold text-[#17141c]">
                <AnimatedCounter value={healthScore.score} />
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: tone }}>
                {healthScore.band}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {healthScore.components.map((component) => {
          const open = openKey === component.key;
          const componentTone = scoreTone(component.score);

          return (
            <div key={component.key} className="rounded-2xl bg-[#17141c]/4">
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : component.key)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
              >
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-[#17141c]">{component.label}</span>
                    <span className="text-xs text-[#17141c]/45">{Math.round(component.weight * 100)}% weight</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2.5">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#17141c]/8">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${component.score}%`, backgroundColor: componentTone }}
                      />
                    </span>
                    <span className="w-9 shrink-0 text-right text-sm font-semibold text-[#17141c]">
                      {component.score}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={cn("shrink-0 text-[#17141c]/35 transition duration-300", open && "rotate-180")}
                />
              </button>

              {open ? (
                <p className="border-t border-white/60 px-3.5 py-3 text-xs leading-relaxed text-[#17141c]/62">
                  {component.why}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
