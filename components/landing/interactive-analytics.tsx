"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { assetAllocation, performanceData } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const modes = ["Allocation", "Overlap", "Risk"] as const;

const treemap = [
  { label: "Large Cap", value: 34, color: "#8f78ff" },
  { label: "Financials", value: 18, color: "#df6ccf" },
  { label: "Debt", value: 16, color: "#5bb7c9" },
  { label: "IT", value: 12, color: "#a59bff" },
  { label: "Gold", value: 8, color: "#e3bb65" },
  { label: "REIT", value: 7, color: "#27b386" },
  { label: "Cash", value: 5, color: "#c9c3d3" },
];

export function InteractiveAnalytics() {
  const [mode, setMode] = useState<(typeof modes)[number]>("Allocation");
  const reduceMotion = useReducedMotion();

  return (
    <section id="technology" className="px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f78ff]">Technology</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[#17141c] sm:text-5xl">
              Analytics that feel immediate, explainable, and beautifully restrained.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#17141c]/62">
              Every interaction is designed to make complexity quieter: hover to inspect, switch context instantly, and keep the
              whole portfolio in view.
            </p>
            <div className="mt-8 inline-flex rounded-full border border-[#17141c]/8 bg-white/70 p-1 shadow-sm backdrop-blur-xl">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
                    mode === item ? "bg-[#17141c] text-white shadow-lg" : "text-[#17141c]/62 hover:text-[#17141c]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <motion.div
              className="premium-border rounded-[36px] bg-white/72 p-4 shadow-[0_28px_90px_rgba(31,27,45,0.1)] backdrop-blur-2xl"
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="grid gap-4 rounded-[30px] border border-[#17141c]/8 bg-[#f8f7fb]/72 p-4 lg:grid-cols-2">
                <section className="rounded-[24px] bg-white/72 p-4" aria-label="Interactive doughnut chart">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#17141c]">{mode} Explorer</h3>
                      <p className="text-sm text-[#17141c]/55">Hover segments for instant context</p>
                    </div>
                    <span className="rounded-full bg-[#8f78ff]/12 px-3 py-1 text-sm font-semibold text-[#6953dc]">
                      <AnimatedCounter value={92} />
                    </span>
                  </div>
                  <div className="mt-5 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetAllocation} dataKey="value" innerRadius="58%" outerRadius="88%" paddingAngle={5} stroke="none">
                          {assetAllocation.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white/72 p-4" aria-label="Risk gauge and diversification meter">
                  <h3 className="text-base font-semibold text-[#17141c]">Risk Gauge</h3>
                  <p className="text-sm text-[#17141c]/55">Moderate concentration with healthy liquidity</p>
                  <div className="mt-8 grid place-items-center">
                    <div
                      className="relative grid h-56 w-56 place-items-center rounded-full"
                      style={{
                        background: "conic-gradient(from 220deg, #27b386 0deg, #e3bb65 118deg, #df6ccf 202deg, rgba(23,20,28,0.08) 202deg 360deg)",
                      }}
                    >
                      <div className="grid h-40 w-40 place-items-center rounded-full bg-white shadow-inner">
                        <div className="text-center">
                          <p className="text-sm text-[#17141c]/50">Score</p>
                          <p className="text-5xl font-semibold text-[#17141c]">
                            <AnimatedCounter value={74} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white/72 p-4 lg:col-span-2" aria-label="Animated line graph">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#17141c]">Scenario Timeline</h3>
                      <p className="text-sm text-[#17141c]/55">Projected path after reducing duplicated exposure</p>
                    </div>
                    <Button variant="secondary" size="default">Simulate rebalance</Button>
                  </div>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scenarioGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#27b386" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#27b386" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 12 }} />
                        <Tooltip />
                        <Area dataKey="value" type="monotone" stroke="#27b386" strokeWidth={3} fill="url(#scenarioGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            </motion.div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <section className="rounded-[34px] border border-[#17141c]/8 bg-white/66 p-5 shadow-[0_24px_80px_rgba(31,27,45,0.08)] backdrop-blur-2xl" aria-label="Animated treemap">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[#17141c]">Exposure Treemap</h3>
                <p className="text-sm text-[#17141c]/58">A compact map of where portfolio weight truly sits.</p>
              </div>
              <p className="text-sm font-medium text-[#17141c]/52">Hover each block to inspect concentration.</p>
            </div>
            <div className="grid min-h-[320px] grid-cols-12 grid-rows-6 gap-3">
              {treemap.map((item, index) => (
                <motion.div
                  key={item.label}
                  className={cn(
                    "group relative overflow-hidden rounded-[24px] p-4 text-white shadow-[0_18px_45px_rgba(31,27,45,0.1)]",
                    index === 0 && "col-span-7 row-span-4",
                    index === 1 && "col-span-5 row-span-3",
                    index === 2 && "col-span-3 row-span-2",
                    index === 3 && "col-span-2 row-span-2",
                    index === 4 && "col-span-3 row-span-2",
                    index === 5 && "col-span-4 row-span-3",
                    index === 6 && "col-span-4 row-span-1",
                  )}
                  style={{ backgroundColor: item.color }}
                  whileHover={reduceMotion ? undefined : { scale: 1.015 }}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{item.value}%</p>
                  <div className="absolute inset-x-0 bottom-0 h-12 translate-y-5 bg-white/22 blur-2xl transition duration-300 group-hover:translate-y-2" />
                </motion.div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
