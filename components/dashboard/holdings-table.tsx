"use client";

import { useMemo, useState } from "react";

import { Panel } from "@/components/dashboard/panel";
import { assetMixFor } from "@/lib/analytics/allocation";
import { ASSET_CLASS_COLOR, ASSET_CLASS_LABEL } from "@/lib/analytics/fund-taxonomy";
import type { AssetClass, Holding, UnifiedPortfolio } from "@/types/portfolio";
import { cn, formatInr } from "@/lib/utils";

const SOURCE_LABEL: Record<Holding["source"], string> = {
  cas_cdsl: "CAS · CDSL",
  cas_nsdl: "CAS · NSDL",
  account_aggregator: "Account Aggregator",
  epfo: "EPFO",
  manual: "Manually added",
};

const KIND_LABEL: Record<Holding["kind"], string> = {
  equity: "Stock",
  mutual_fund: "Mutual fund",
  bond: "Bond",
  reit: "REIT",
  invit: "InvIT",
  gold: "Gold",
  epf: "Retirement",
  fixed_deposit: "Fixed deposit",
  cash: "Cash",
};

function describe(holding: Holding) {
  switch (holding.kind) {
    case "equity":
      return { name: holding.name, meta: `${holding.quantity} shares · ${holding.sector ?? "—"}` };
    case "mutual_fund":
      return { name: holding.schemeName, meta: `${holding.units.toFixed(2)} units · NAV ₹${holding.nav}` };
    case "bond":
      return { name: holding.issuer, meta: `${holding.creditRating} · ${holding.couponRate}% coupon` };
    case "reit":
    case "invit":
      return { name: holding.name, meta: `${holding.units} units · ${holding.sector ?? "—"}` };
    case "gold":
      return { name: `Gold (${holding.form.toUpperCase()})`, meta: holding.grams ? `${holding.grams} g` : "—" };
    case "epf":
      return { name: holding.scheme.toUpperCase(), meta: holding.employerName ?? "—" };
    case "fixed_deposit":
      return {
        name: `${holding.bank} fixed deposit`,
        meta: `${holding.interestRate}% · matures ${holding.maturityDate}`,
      };
    case "cash":
      return { name: `${holding.bank} savings`, meta: "Instantly accessible" };
  }
}

function dominantClass(holding: Holding): AssetClass {
  const { mix } = assetMixFor(holding);
  return (Object.entries(mix) as Array<[AssetClass, number]>).sort((a, b) => b[1] - a[1])[0][0];
}

export function HoldingsTable({ portfolio }: { portfolio: UnifiedPortfolio }) {
  const [filter, setFilter] = useState<AssetClass | "all">("all");

  const total = useMemo(
    () => portfolio.holdings.reduce((sum, holding) => sum + holding.currentValue, 0),
    [portfolio.holdings],
  );

  const rows = useMemo(
    () =>
      portfolio.holdings
        .map((holding) => ({ holding, assetClass: dominantClass(holding) }))
        .filter((row) => filter === "all" || row.assetClass === filter)
        .sort((a, b) => b.holding.currentValue - a.holding.currentValue),
    [portfolio.holdings, filter],
  );

  const available = useMemo(() => {
    const set = new Set(portfolio.holdings.map(dominantClass));
    return Array.from(set);
  }, [portfolio.holdings]);

  return (
    <Panel
      title="Everything you hold"
      subtitle={`${portfolio.holdings.length} holdings pulled from ${new Set(portfolio.holdings.map((h) => h.source)).size} sources.`}
      action={
        <div className="flex flex-wrap justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
              filter === "all" ? "bg-[#17141c] text-white" : "bg-[#17141c]/6 text-[#17141c]/62 hover:bg-[#17141c]/10",
            )}
          >
            All
          </button>
          {available.map((assetClass) => (
            <button
              key={assetClass}
              type="button"
              onClick={() => setFilter(assetClass)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
                filter === assetClass
                  ? "bg-[#17141c] text-white"
                  : "bg-[#17141c]/6 text-[#17141c]/62 hover:bg-[#17141c]/10",
              )}
            >
              {ASSET_CLASS_LABEL[assetClass]}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#17141c]/8 text-xs font-semibold uppercase tracking-[0.1em] text-[#17141c]/42">
              <th className="pb-3 pr-4 font-semibold">Holding</th>
              <th className="pb-3 pr-4 font-semibold">Type</th>
              <th className="pb-3 pr-4 font-semibold">Source</th>
              <th className="pb-3 pr-4 text-right font-semibold">Value</th>
              <th className="pb-3 text-right font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ holding, assetClass }) => {
              const info = describe(holding);
              const share = total > 0 ? (holding.currentValue / total) * 100 : 0;

              return (
                <tr key={holding.id} className="border-b border-[#17141c]/6 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ASSET_CLASS_COLOR[assetClass] }}
                      />
                      <div>
                        <p className="text-sm font-medium leading-snug text-[#17141c]">{info.name}</p>
                        <p className="mt-0.5 text-xs text-[#17141c]/48">{info.meta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-[#17141c]/62">{KIND_LABEL[holding.kind]}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-[#17141c]/5 px-2.5 py-1 text-xs text-[#17141c]/58">
                      {SOURCE_LABEL[holding.source]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm font-semibold text-[#17141c]">
                    {formatInr(holding.currentValue)}
                  </td>
                  <td className="py-3 text-right text-sm text-[#17141c]/62">{share.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
