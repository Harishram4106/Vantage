export const PORTFOLIO_SCHEMA_VERSION = "1.0.0";

export type AssetClass = "equity" | "debt" | "gold" | "reit" | "invit" | "cash";

export type MarketCapBand = "large" | "mid" | "small";

export type HoldingSource =
  | "cas_cdsl"
  | "cas_nsdl"
  | "account_aggregator"
  | "epfo"
  | "manual";

export type FundCategory =
  | "equity_large_cap"
  | "equity_large_mid_cap"
  | "equity_mid_cap"
  | "equity_small_cap"
  | "equity_flexi_cap"
  | "equity_elss"
  | "equity_sectoral"
  | "index_equity"
  | "hybrid_aggressive"
  | "hybrid_balanced"
  | "hybrid_conservative"
  | "debt_liquid"
  | "debt_short_duration"
  | "debt_corporate_bond"
  | "debt_gilt"
  | "gold_etf"
  | "international_equity";

interface HoldingBase {
  id: string;
  source: HoldingSource;
  asOf: string;
  currentValue: number;
  investedValue?: number;
}

export interface EquityHolding extends HoldingBase {
  kind: "equity";
  isin: string;
  symbol: string;
  name: string;
  quantity: number;
  sector?: string;
  marketCap?: MarketCapBand;
}

export interface MutualFundHolding extends HoldingBase {
  kind: "mutual_fund";
  isin: string;
  schemeCode: string;
  schemeName: string;
  amc: string;
  category: FundCategory;
  folioNumber: string;
  units: number;
  nav: number;
}

export interface BondHolding extends HoldingBase {
  kind: "bond";
  isin: string;
  issuer: string;
  creditRating: string;
  couponRate: number;
  maturityDate: string;
}

export interface ReitHolding extends HoldingBase {
  kind: "reit" | "invit";
  isin: string;
  name: string;
  units: number;
  sector?: string;
}

export interface GoldHolding extends HoldingBase {
  kind: "gold";
  form: "sgb" | "etf" | "digital" | "physical";
  grams?: number;
  maturityDate?: string;
}

export interface EpfHolding extends HoldingBase {
  kind: "epf";
  scheme: "epf" | "ppf" | "nps";
  employerName?: string;
}

export interface FixedDepositHolding extends HoldingBase {
  kind: "fixed_deposit";
  bank: string;
  interestRate: number;
  maturityDate: string;
  prematureWithdrawalAllowed: boolean;
}

export interface CashHolding extends HoldingBase {
  kind: "cash";
  bank: string;
}

export type Holding =
  | EquityHolding
  | MutualFundHolding
  | BondHolding
  | ReitHolding
  | GoldHolding
  | EpfHolding
  | FixedDepositHolding
  | CashHolding;

export type RiskCategory = "conservative" | "moderate" | "aggressive";

export interface RiskProfileInput {
  age: number;
  horizonYears: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  dependents: number;
  statedRiskAppetite: RiskCategory;
  drawdownTolerancePercent: number;
}

export interface UnifiedPortfolio {
  schemaVersion: typeof PORTFOLIO_SCHEMA_VERSION;
  portfolioId: string;
  generatedAt: string;
  investorName?: string;
  holdings: Holding[];
  riskProfileInput: RiskProfileInput;
}

export function isMutualFund(holding: Holding): holding is MutualFundHolding {
  return holding.kind === "mutual_fund";
}

export function isEquity(holding: Holding): holding is EquityHolding {
  return holding.kind === "equity";
}
