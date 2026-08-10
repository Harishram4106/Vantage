import type { AssetClass, RiskCategory } from "@/types/portfolio";
import type { Instrument } from "@/data/mock/instruments";

export const ANALYSIS_SCHEMA_VERSION = "1.0.0";

export type Severity = "critical" | "warning" | "info" | "positive";

export interface Explained<T> {
  value: T;
  why: string;
}

export interface AllocationSlice {
  assetClass: AssetClass;
  label: string;
  value: number;
  percent: number;
  color: string;
  contributors: string[];
}

export interface AllocationDrift {
  assetClass: AssetClass;
  actualPercent: number;
  targetPercent: number;
  driftPercent: number;
  direction: "over" | "under" | "on_target";
}

export interface AllocationResult {
  totalValue: number;
  slices: AllocationSlice[];
  drift: AllocationDrift[];
  largestDrift: AllocationDrift | null;
  why: string;
}

export interface RiskProfileResult {
  statedCategory: RiskCategory;
  derivedCategory: RiskCategory;
  capacityScore: number;
  isMismatched: boolean;
  targetAllocation: Record<AssetClass, number>;
  why: string;
}

export interface ConcentrationResult {
  topIssuers: Array<{ name: string; percentOfEquity: number; percentOfPortfolio: number }>;
  amcConcentration: Array<{ amc: string; percentOfMutualFunds: number; schemeCount: number }>;
  marketCapSplit: Partial<Record<"large" | "mid" | "small", number>>;
  herfindahlIndex: number;
  why: string;
}

export interface HealthScoreComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  why: string;
}

export interface HealthScoreResult {
  score: number;
  band: "poor" | "fair" | "good" | "strong";
  components: HealthScoreComponent[];
  why: string;
}

export interface ExposureSource {
  label: string;
  kind: "direct" | "fund";
  value: number;
  weightInFund?: number;
}

export interface IssuerExposure {
  name: string;
  sector: string;
  value: number;
  percentOfEquity: number;
  percentOfPortfolio: number;
  sources: ExposureSource[];
}

export interface FundOverlapPair {
  schemeA: string;
  schemeB: string;
  sameAmc: boolean;
  overlapPercent: number;
  sharedIssuers: string[];
}

export type ConcentrationLevel = "low" | "moderate" | "high" | "very_high";

export interface SectorExposure {
  sector: string;
  value: number;
  percentOfEquity: number;
  issuerCount: number;
  /** Every company in this industry, largest first — the treemap needs all of them. */
  members: IssuerExposure[];
  level: ConcentrationLevel;
}

export interface OverlapResult {
  analysedFunds: Array<{ schemeName: string; amc: string; disclosedWeight: number }>;
  unmatchedFunds: string[];
  issuerExposures: IssuerExposure[];
  duplicatedIssuers: IssuerExposure[];
  pairwiseOverlap: FundOverlapPair[];
  overlapPercentOfEquity: number;
  worstPair: FundOverlapPair | null;
  coveragePercent: number;
  sectorExposures: SectorExposure[];
  sectorHerfindahl: number;
  why: string;
  sectorWhy: string;
}

export interface BenchmarkRow {
  assetClass: AssetClass;
  label: string;
  color: string;
  actualPercent: number;
  referencePercent: number;
  driftPercent: number;
}

export interface BandComparison {
  band: RiskCategory;
  totalAbsoluteDrift: number;
  rows: BenchmarkRow[];
}

export interface BenchmarkResult {
  derivedBand: RiskCategory;
  /** The band this portfolio's actual mix most closely resembles, by lowest total drift. */
  closestBand: RiskCategory;
  shapeMismatch: boolean;
  comparisons: BandComparison[];
  why: string;
}

export interface MatchedInstrument {
  instrument: Instrument;
  fitScore: number;
  fitReasons: string[];
}

export interface GapMatch {
  assetClass: AssetClass;
  label: string;
  shortfallPercent: number;
  shortfallValue: number;
  rationale: string;
  matches: MatchedInstrument[];
}

export interface ActionPlan {
  gaps: GapMatch[];
  totalShortfallValue: number;
  why: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence: Array<{ label: string; value: string }>;
  suggestedAction?: string;
}

export interface PortfolioAnalysis {
  schemaVersion: typeof ANALYSIS_SCHEMA_VERSION;
  portfolioId: string;
  analysedAt: string;
  investorName?: string;
  allocation: AllocationResult;
  riskProfile: RiskProfileResult;
  concentration: ConcentrationResult;
  healthScore: HealthScoreResult;
  findings: Finding[];
  overlap: OverlapResult | null;
  actionPlan: ActionPlan | null;
  benchmark: BenchmarkResult;
}
