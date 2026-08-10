import type { AssetClass, FundCategory, MarketCapBand } from "@/types/portfolio";

export type AssetMix = Partial<Record<AssetClass, number>>;

export const FUND_ASSET_MIX: Record<FundCategory, AssetMix> = {
  equity_large_cap: { equity: 0.97, cash: 0.03 },
  equity_large_mid_cap: { equity: 0.96, cash: 0.04 },
  equity_mid_cap: { equity: 0.95, cash: 0.05 },
  equity_small_cap: { equity: 0.94, cash: 0.06 },
  equity_flexi_cap: { equity: 0.95, cash: 0.05 },
  equity_elss: { equity: 0.96, cash: 0.04 },
  equity_sectoral: { equity: 0.96, cash: 0.04 },
  index_equity: { equity: 0.99, cash: 0.01 },
  international_equity: { equity: 0.97, cash: 0.03 },
  hybrid_aggressive: { equity: 0.7, debt: 0.27, cash: 0.03 },
  hybrid_balanced: { equity: 0.5, debt: 0.47, cash: 0.03 },
  hybrid_conservative: { equity: 0.22, debt: 0.75, cash: 0.03 },
  debt_liquid: { debt: 0.95, cash: 0.05 },
  debt_short_duration: { debt: 0.97, cash: 0.03 },
  debt_corporate_bond: { debt: 0.98, cash: 0.02 },
  debt_gilt: { debt: 0.98, cash: 0.02 },
  gold_etf: { gold: 1 },
};

export const FUND_MARKET_CAP_MIX: Partial<Record<FundCategory, Partial<Record<MarketCapBand, number>>>> = {
  equity_large_cap: { large: 0.9, mid: 0.1 },
  equity_large_mid_cap: { large: 0.5, mid: 0.5 },
  equity_mid_cap: { mid: 0.8, small: 0.15, large: 0.05 },
  equity_small_cap: { small: 0.8, mid: 0.18, large: 0.02 },
  equity_flexi_cap: { large: 0.65, mid: 0.22, small: 0.13 },
  equity_elss: { large: 0.7, mid: 0.2, small: 0.1 },
  equity_sectoral: { large: 0.75, mid: 0.2, small: 0.05 },
  index_equity: { large: 1 },
  international_equity: { large: 1 },
  hybrid_aggressive: { large: 0.8, mid: 0.15, small: 0.05 },
  hybrid_balanced: { large: 0.85, mid: 0.12, small: 0.03 },
  hybrid_conservative: { large: 0.9, mid: 0.1 },
};

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  gold: "Gold",
  reit: "REIT",
  invit: "InvIT",
  cash: "Cash",
};

export const ASSET_CLASS_COLOR: Record<AssetClass, string> = {
  equity: "#8f78ff",
  debt: "#5bb7c9",
  gold: "#e3bb65",
  reit: "#df6ccf",
  invit: "#a59bff",
  cash: "#27b386",
};
