"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Brain, Layers3, Radar, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import { Reveal } from "@/components/landing/reveal";
import { GlassPanel } from "@/components/ui/glass-panel";
import { assetAllocation, heatmapData, overlapData, performanceData, timelineData } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  border: "1px solid rgba(28,24,33,0.08)",
  borderRadius: 16,
  boxShadow: "0 18px 48px rgba(31,27,45,0.12)",
  color: "#17141c",
};

function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Activity;
  accent: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#17141c]/8 bg-white/68 p-4 shadow-[0_18px_45px_rgba(31,27,45,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(31,27,45,0.1)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#17141c]/58">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: `${accent}1f`, color: accent }}>
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-normal text-[#17141c]">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
    </div>
  );
}

function Panel({ children, className, title }: { children: React.ReactNode; className?: string; title: string }) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-[#17141c]/8 bg-white/70 p-4 shadow-[0_18px_50px_rgba(31,27,45,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1",
        className,
      )}
      aria-label={title}
    >
      {children}
    </section>
  );
}

export function DashboardPreview() {
  return (
    <section id="platform" className="relative px-5 py-28 sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f78ff]">Portfolio intelligence</p>
          <h2 className="mt-4 text-balance text-5xl font-semibold leading-[0.94] tracking-normal text-[#17141c] sm:text-6xl lg:text-7xl">
            One Portfolio.
            <span className="block">Every Investment.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#17141c]/62">
            A calm command center that turns scattered holdings into one clear, intelligent view.
          </p>
        </Reveal>

        <Reveal delay={0.18} className="mt-16 lg:mt-20">
          <GlassPanel id="dashboard" className="premium-border overflow-hidden rounded-[36px] p-3 sm:p-5">
            <div className="rounded-[30px] border border-[#17141c]/8 bg-[#f8f7fb]/72 p-4 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-[#17141c]/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#17141c] text-white">
                      <WalletCards size={16} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-[#17141c]">Vantage Portfolio Intelligence</p>
                  </div>
                  <p className="mt-2 text-sm text-[#17141c]/55">Consolidated across brokers, funds, EPF, bonds, gold, REITs, and InvITs.</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#27b386]/20 bg-[#27b386]/10 px-3 py-1.5 text-sm font-medium text-[#11765a]">
                  <span className="h-2 w-2 rounded-full bg-[#27b386]" />
                  Live sync complete
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                <MetricCard label="Portfolio Value" value={12.8} suffix="M" icon={WalletCards} accent="#8f78ff" />
                <MetricCard label="Health Score" value={92} suffix="/100" icon={ShieldCheck} accent="#27b386" />
                <MetricCard label="Overlap Detected" value={24} suffix="%" icon={Layers3} accent="#df6ccf" />
                <MetricCard label="Diversification" value={81} suffix="%" icon={Radar} accent="#5bb7c9" />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <Panel title="Performance area chart" className="xl:col-span-7">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#17141c]">Performance</h3>
                      <p className="text-sm text-[#17141c]/55">Portfolio vs benchmark over 12 months</p>
                    </div>
                    <span className="rounded-full bg-[#27b386]/10 px-3 py-1 text-sm font-semibold text-[#11765a]">+26.4%</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#8f78ff" stopOpacity={0.36} />
                            <stop offset="100%" stopColor="#8f78ff" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="benchmark" stroke="#c9c3d3" strokeWidth={2} fill="transparent" />
                        <Area type="monotone" dataKey="value" stroke="#8f78ff" strokeWidth={3} fill="url(#portfolioGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Asset allocation doughnut" className="xl:col-span-5">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-[#17141c]">Asset Allocation</h3>
                    <p className="text-sm text-[#17141c]/55">True consolidated exposure</p>
                  </div>
                  <div className="grid items-center gap-4 sm:grid-cols-[1fr_160px] xl:grid-cols-1">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={assetAllocation} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={4} stroke="none">
                            {assetAllocation.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {assetAllocation.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-4 rounded-full bg-[#17141c]/5 px-3 py-2">
                          <span className="flex items-center gap-2 text-sm text-[#17141c]/68">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold text-[#17141c]">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Mutual fund overlap">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#17141c]">MF Overlap</h3>
                    <Brain size={18} className="text-[#df6ccf]" aria-hidden="true" />
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overlapData} layout="vertical" margin={{ left: 0, right: 18, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide domain={[0, 50]} />
                        <YAxis type="category" dataKey="fund" width={82} axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="overlap" radius={[0, 10, 10, 0]} fill="#df6ccf" barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Risk heatmap">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#17141c]">Risk Heatmap</h3>
                    <Sparkles size={18} className="text-[#8f78ff]" aria-hidden="true" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {heatmapData.map(([asset, risk, score]) => (
                      <div
                        key={asset}
                        className="rounded-2xl p-3 transition duration-300 hover:-translate-y-0.5"
                        style={{
                          background: `rgba(${score > 70 ? "223,108,207" : score > 35 ? "143,120,255" : "39,179,134"}, ${0.11 + score / 520})`,
                        }}
                      >
                        <p className="text-sm font-semibold text-[#17141c]">{asset}</p>
                        <p className="mt-1 text-xs text-[#17141c]/56">{risk} risk</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Portfolio timeline chart">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-[#17141c]">Sync Timeline</h3>
                    <p className="text-sm text-[#17141c]/55">Coverage by account source</p>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData} margin={{ left: -24, right: 8, top: 10, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#766f80", fontSize: 11 }} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="progress" stroke="#27b386" strokeWidth={3} dot={{ r: 4, fill: "#27b386" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
