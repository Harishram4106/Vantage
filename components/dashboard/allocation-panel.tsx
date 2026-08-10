"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { GlassTooltip } from "@/components/dashboard/chart-tooltip";
import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { AllocationResult } from "@/types/analysis";

const DIRECTION_COPY = {
  over: { label: "over", tone: "#c0343c" },
  under: { label: "under", tone: "#9a6f14" },
  on_target: { label: "on target", tone: "#11765a" },
} as const;

export function AllocationPanel({ allocation }: { allocation: AllocationResult }) {
  const chartData = allocation.slices.map((slice) => ({
    name: slice.label,
    value: slice.percent,
    color: slice.color,
    amount: slice.value,
  }));

  return (
    <Panel
      title="Where your money actually sits"
      subtitle="Every holding broken down into its underlying asset classes, then compared with the reference mix for your risk profile."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-center">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius="62%" outerRadius="90%" paddingAngle={4} stroke="none">
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2.5">
          {allocation.drift.map((item) => {
            const slice = allocation.slices.find((entry) => entry.assetClass === item.assetClass);
            const direction = DIRECTION_COPY[item.direction];
            const scale = Math.max(item.actualPercent, item.targetPercent, 1);

            return (
              <div key={item.assetClass} className="rounded-2xl bg-[#17141c]/4 px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-[#17141c]">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice?.color ?? "#c9c3d3" }}
                    />
                    {slice?.label ?? item.assetClass}
                  </span>
                  <span className="text-sm text-[#17141c]/58">
                    <span className="font-semibold text-[#17141c]">{item.actualPercent}%</span>
                    <span className="mx-1.5 text-[#17141c]/32">vs</span>
                    {item.targetPercent}% target
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2.5">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#17141c]/8">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${(item.actualPercent / scale) * 100}%`,
                        backgroundColor: slice?.color ?? "#c9c3d3",
                      }}
                    />
                    <div
                      className="absolute inset-y-[-3px] w-0.5 rounded-full bg-[#17141c]/45"
                      style={{ left: `${(item.targetPercent / scale) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-medium" style={{ color: direction.tone }}>
                    {item.direction === "on_target"
                      ? "on target"
                      : `${Math.abs(item.driftPercent).toFixed(1)} pts ${direction.label}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <WhyNote>{allocation.why}</WhyNote>
    </Panel>
  );
}
