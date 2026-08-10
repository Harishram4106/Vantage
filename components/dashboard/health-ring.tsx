"use client";

import { motion, useReducedMotion } from "framer-motion";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import type { HealthScoreResult } from "@/types/analysis";

const BAND_TONE: Record<HealthScoreResult["band"], { stroke: string; label: string }> = {
  poor: { stroke: "#e0575c", label: "Needs work" },
  fair: { stroke: "#e3bb65", label: "Fair" },
  good: { stroke: "#5bb7c9", label: "Good" },
  strong: { stroke: "#27b386", label: "Strong" },
};

const SIZE = 176;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HealthRing({ healthScore }: { healthScore: HealthScoreResult }) {
  const reduceMotion = useReducedMotion();
  const tone = BAND_TONE[healthScore.band];
  const progress = Math.min(100, Math.max(0, healthScore.score)) / 100;

  return (
    <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        role="img"
        aria-label={`Portfolio health score ${healthScore.score} out of 100, rated ${healthScore.band}`}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(23,20,28,0.07)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={reduceMotion ? false : { strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>

      <div className="absolute grid place-items-center text-center">
        <p className="text-[52px] font-semibold leading-none tracking-tight text-[#17141c]">
          <AnimatedCounter value={healthScore.score} />
        </p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: tone.stroke }}>
          {tone.label}
        </p>
        <p className="mt-0.5 text-[11px] text-[#17141c]/42">Health score</p>
      </div>
    </div>
  );
}
