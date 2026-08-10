"use client";

import { formatInr } from "@/lib/utils";

type SlicePayload = {
  name: string;
  value: number;
  amount: number;
  color: string;
};

export function GlassTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: unknown }>;
}) {
  if (!active || !payload?.length) return null;

  const slice = payload[0]?.payload as SlicePayload | undefined;
  if (!slice) return null;

  return (
    <div className="rounded-2xl border border-white/60 bg-white/92 px-3.5 py-2.5 shadow-[0_18px_48px_rgba(31,27,45,0.16)] backdrop-blur-xl">
      <p className="flex items-center gap-2 text-sm font-semibold text-[#17141c]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
        {slice.name}
      </p>
      <p className="mt-1 text-lg font-semibold leading-none text-[#17141c]">{slice.value}%</p>
      <p className="mt-1 text-xs text-[#17141c]/52">{formatInr(slice.amount)}</p>
    </div>
  );
}
