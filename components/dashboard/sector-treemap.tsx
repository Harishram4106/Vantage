"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { inset, reserveHeader, squarify, type Rect } from "@/lib/treemap";
import type { ConcentrationLevel, IssuerExposure, SectorExposure } from "@/types/analysis";
import { cn, formatInr } from "@/lib/utils";

/** Layout is computed in a 1.7:1 space, then emitted as percentages so it stays responsive. */
const SPACE: Rect = { x: 0, y: 0, w: 170, h: 100 };

/**
 * Label strip height, and the gutters between regions and cells.
 *
 * Gutters are the main reason a treemap's areas are only approximately proportional: a
 * fixed inset removes a much larger share of a small cell than a large one. They are
 * kept deliberately tight so the distortion stays confined to sub-1% holdings, which no
 * viewer compares by eye anyway — and every cell carries its exact percentage as a label
 * or tooltip, so the precise figure never depends on reading the area.
 */
const HEADER_FRACTION = 0.15;
const REGION_GUTTER = 0.35;
const CELL_GUTTER = 0.16;

const LEVEL_RGB: Record<ConcentrationLevel, string> = {
  low: "39,179,134",
  moderate: "91,183,201",
  high: "227,187,101",
  very_high: "224,87,92",
};

const LEVEL_TONE: Record<ConcentrationLevel, string> = {
  low: "#11765a",
  moderate: "#3f7f90",
  high: "#9a6f14",
  very_high: "#c0343c",
};

const LEVEL_LABEL: Record<ConcentrationLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
};

type PlacedCell = {
  issuer: IssuerExposure;
  sector: SectorExposure;
  rect: Rect;
};

type PlacedRegion = {
  sector: SectorExposure;
  rect: Rect;
  cells: PlacedCell[];
};

function pct(value: number, axis: "x" | "y") {
  const span = axis === "x" ? SPACE.w : SPACE.h;
  return `${(value / span) * 100}%`;
}

export function SectorTreemap({ sectors }: { sectors: SectorExposure[] }) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<PlacedCell | null>(null);

  const regions = useMemo<PlacedRegion[]>(() => {
    const rects = squarify(
      sectors.map((sector) => sector.value),
      SPACE,
    );

    return sectors.map((sector, index) => {
      const rect = inset(rects[index] ?? { x: 0, y: 0, w: 0, h: 0 }, REGION_GUTTER);
      const body = reserveHeader(rect, rect.h * HEADER_FRACTION);
      const cellRects = squarify(
        sector.members.map((member) => member.value),
        body,
      );

      return {
        sector,
        rect,
        cells: sector.members.map((issuer, cellIndex) => ({
          issuer,
          sector,
          rect: inset(cellRects[cellIndex] ?? { x: 0, y: 0, w: 0, h: 0 }, CELL_GUTTER),
        })),
      };
    });
  }, [sectors]);

  const maxMemberPercent = useMemo(
    () => Math.max(...sectors.flatMap((sector) => sector.members.map((m) => m.percentOfEquity)), 1),
    [sectors],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">
          Portfolio map — block size follows your holding, colour shows concentration
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(LEVEL_LABEL) as ConcentrationLevel[]).map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5 text-xs text-[#17141c]/52">
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ backgroundColor: `rgb(${LEVEL_RGB[level]})` }}
                aria-hidden="true"
              />
              {LEVEL_LABEL[level]}
            </span>
          ))}
        </div>
      </div>

      <div
        className="relative mt-4 w-full overflow-hidden rounded-[24px] border border-[#17141c]/8 bg-white/50"
        style={{ aspectRatio: "1.7 / 1", minHeight: 400 }}
        role="group"
        aria-label="Industry and company treemap"
      >
        {regions.map((region, regionIndex) => {
          const rgb = LEVEL_RGB[region.sector.level];
          const tone = LEVEL_TONE[region.sector.level];
          const wide = (region.rect.w / SPACE.w) * 100 > 14;

          return (
            <motion.div
              key={region.sector.sector}
              className="absolute overflow-hidden rounded-[10px]"
              style={{
                left: pct(region.rect.x, "x"),
                top: pct(region.rect.y, "y"),
                width: pct(region.rect.w, "x"),
                height: pct(region.rect.h, "y"),
                backgroundColor: `rgba(${rgb},0.07)`,
                border: `1px solid rgba(${rgb},0.30)`,
              }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: regionIndex * 0.05 }}
            >
              <div
                className="flex items-baseline justify-between gap-1.5 px-2"
                style={{ height: `${HEADER_FRACTION * 100}%` }}
              >
                <span
                  className="truncate text-[11px] font-semibold leading-none"
                  style={{ color: tone, lineHeight: "1.9" }}
                  title={region.sector.sector}
                >
                  {wide ? region.sector.sector : region.sector.sector.split(" ")[0]}
                </span>
                <span
                  className="shrink-0 text-[11px] font-semibold leading-none"
                  style={{ color: tone, lineHeight: "1.9" }}
                >
                  {region.sector.percentOfEquity}%
                </span>
              </div>

              {region.cells.map((cell) => {
                const cw = (cell.rect.w / SPACE.w) * 100;
                const ch = (cell.rect.h / SPACE.h) * 100;
                const alpha = 0.16 + (cell.issuer.percentOfEquity / maxMemberPercent) * 0.46;
                const showLabel = cw > 6.5 && ch > 8;
                const isSelected = selected?.issuer.name === cell.issuer.name;

                return (
                  <button
                    key={cell.issuer.name}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : cell)}
                    aria-label={`${cell.issuer.name}, ${cell.issuer.percentOfEquity}% of equity`}
                    title={`${cell.issuer.name} — ${cell.issuer.percentOfEquity}% of equity · ${formatInr(cell.issuer.value)}`}
                    className={cn(
                      "absolute overflow-hidden rounded-[6px] p-1.5 text-left transition duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17141c]/50",
                      isSelected && "ring-2 ring-[#17141c]",
                    )}
                    style={{
                      // Cells are children of the region div, so every value is a share
                      // of the region's own box — not of the outer layout space.
                      left: `${((cell.rect.x - region.rect.x) / region.rect.w) * 100}%`,
                      top: `${((cell.rect.y - region.rect.y) / region.rect.h) * 100}%`,
                      width: `${(cell.rect.w / region.rect.w) * 100}%`,
                      height: `${(cell.rect.h / region.rect.h) * 100}%`,
                      backgroundColor: `rgba(${rgb},${alpha})`,
                    }}
                  >
                    {showLabel ? (
                      <>
                        <span className="block truncate text-[10px] font-semibold leading-tight text-[#17141c]">
                          {cell.issuer.name}
                        </span>
                        <span className="block text-[10px] leading-tight text-[#17141c]/62">
                          {cell.issuer.percentOfEquity}%
                        </span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {selected ? (
        <motion.div
          className="mt-4 rounded-[22px] border border-[#17141c]/10 bg-white/74 p-5"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: LEVEL_TONE[selected.sector.level] }}
              >
                {selected.sector.sector}
              </p>
              <p className="mt-1 text-xl font-semibold text-[#17141c]">{selected.issuer.name}</p>
              <p className="mt-1 text-sm text-[#17141c]/58">
                <span className="font-semibold text-[#17141c]">{selected.issuer.percentOfEquity}%</span> of your equity
                · {formatInr(selected.issuer.value)} · {selected.issuer.percentOfPortfolio}% of everything you own
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close detail"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#17141c]/10 bg-white/70 text-[#17141c]/55 transition hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 border-t border-[#17141c]/8 pt-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/42">
              How your money reaches it — {selected.issuer.sources.length}{" "}
              {selected.issuer.sources.length === 1 ? "route" : "routes"}
            </p>
            <ul className="mt-2.5 space-y-2">
              {selected.issuer.sources.map((source) => (
                <li
                  key={`${selected.issuer.name}-${source.label}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-[#17141c]/4 px-3.5 py-2.5"
                >
                  <span className="text-sm text-[#17141c]/78">
                    {source.kind === "direct" ? "Bought directly" : source.label.replace(" - Direct Growth", "")}
                    {source.weightInFund !== undefined ? (
                      <span className="ml-1.5 text-xs text-[#17141c]/45">
                        {source.weightInFund}% of that fund
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm font-semibold text-[#17141c]">{formatInr(source.value)}</span>
                </li>
              ))}
            </ul>

            {selected.issuer.sources.length > 1 ? (
              <p className="mt-3 rounded-2xl bg-[#e3bb65]/14 px-4 py-2.5 text-xs leading-relaxed text-[#17141c]/70">
                You reach this company more than one way, so holding those funds together spreads your money less than
                the number of funds suggests.
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : (
        <p className="mt-3 text-xs text-[#17141c]/45">
          Each block is a company, grouped into the industry it belongs to. Click any block to see every route your
          money takes to reach it.
        </p>
      )}
    </div>
  );
}
