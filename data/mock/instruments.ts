import type { AssetClass, RiskCategory } from "@/types/portfolio";

// Curated set of SEBI-regulated, exchange-listed instruments used to match against
// diagnosed allocation gaps.
//
// Issuer names, instrument names and exchanges are real. Yields, prices and minimum
// investments are INDICATIVE and synthetic — real figures move daily and must come
// from a live market feed before this is shown to an actual investor. Nothing here
// is ranked by expected return, and nothing here is a recommendation to buy.

export type InstrumentKind = "gsec" | "bond" | "reit" | "invit";

export type Liquidity = "high" | "moderate" | "low";

export interface Instrument {
  id: string;
  kind: InstrumentKind;
  name: string;
  issuer: string;
  exchange: string;
  regulatedAs: string;
  creditRating: string;
  indicativeYieldPercent: number;
  tenureYears: number | null;
  minInvestment: number;
  liquidity: Liquidity;
  incomeFrequency: string;
  fillsGap: AssetClass[];
  suitableFor: RiskCategory[];
  whatItIs: string;
  mainRisk: string;
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: "gsec-goi-2033",
    kind: "gsec",
    name: "GOI 7.18% 2033",
    issuer: "Government of India",
    exchange: "NSE goBID / RBI Retail Direct",
    regulatedAs: "Government security",
    creditRating: "Sovereign",
    indicativeYieldPercent: 7.18,
    tenureYears: 7,
    minInvestment: 10000,
    liquidity: "high",
    incomeFrequency: "Half-yearly interest",
    fillsGap: ["debt"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "A loan to the Government of India that pays fixed interest twice a year and returns your money at maturity.",
    mainRisk: "If you sell before maturity, the price moves with interest rates. Held to maturity, repayment is sovereign-backed.",
  },
  {
    id: "bond-pfc",
    kind: "bond",
    name: "Power Finance Corporation 7.85% 2031",
    issuer: "Power Finance Corporation",
    exchange: "NSE/BSE",
    regulatedAs: "Listed non-convertible debenture",
    creditRating: "AAA",
    indicativeYieldPercent: 7.85,
    tenureYears: 5,
    minInvestment: 10000,
    liquidity: "moderate",
    incomeFrequency: "Annual interest",
    fillsGap: ["debt"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "A loan to a state-owned power financing company, rated AAA — the highest safety grade in India.",
    mainRisk: "Very low default risk at AAA, but it can be harder to sell quickly than a government bond.",
  },
  {
    id: "bond-rec",
    kind: "bond",
    name: "REC Limited 7.72% 2030",
    issuer: "REC Limited",
    exchange: "NSE/BSE",
    regulatedAs: "Listed non-convertible debenture",
    creditRating: "AAA",
    indicativeYieldPercent: 7.72,
    tenureYears: 4,
    minInvestment: 10000,
    liquidity: "moderate",
    incomeFrequency: "Annual interest",
    fillsGap: ["debt"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "A loan to a state-owned rural electrification financier, rated AAA.",
    mainRisk: "Very low default risk at AAA. Shorter tenure means less price movement if rates change.",
  },
  {
    id: "bond-irfc",
    kind: "bond",
    name: "IRFC 7.60% 2036",
    issuer: "Indian Railway Finance Corporation",
    exchange: "NSE/BSE",
    regulatedAs: "Listed non-convertible debenture",
    creditRating: "AAA",
    indicativeYieldPercent: 7.6,
    tenureYears: 10,
    minInvestment: 10000,
    liquidity: "moderate",
    incomeFrequency: "Annual interest",
    fillsGap: ["debt"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "A loan to the financing arm of Indian Railways, rated AAA. Longer tenure locks the rate for a decade.",
    mainRisk: "Very low default risk, but a long tenure means the price swings more if interest rates move.",
  },
  {
    id: "bond-muthoot",
    kind: "bond",
    name: "Muthoot Finance 9.10% NCD",
    issuer: "Muthoot Finance",
    exchange: "NSE/BSE",
    regulatedAs: "Listed non-convertible debenture",
    creditRating: "AA+",
    indicativeYieldPercent: 9.1,
    tenureYears: 3,
    minInvestment: 10000,
    liquidity: "low",
    incomeFrequency: "Annual interest",
    fillsGap: ["debt"],
    suitableFor: ["moderate", "aggressive"],
    whatItIs: "A loan to a gold-loan finance company. AA+ is one notch below the top grade, which is why it pays more.",
    mainRisk: "Higher yield reflects higher credit risk than AAA, and these trade thinly on the exchange.",
  },
  {
    id: "reit-embassy",
    kind: "reit",
    name: "Embassy Office Parks REIT",
    issuer: "Embassy Office Parks",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered REIT",
    creditRating: "Not rated (equity-like)",
    indicativeYieldPercent: 6.5,
    tenureYears: null,
    minInvestment: 400,
    liquidity: "high",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["reit"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "Part-ownership of a portfolio of leased office parks. Rent collected from tenants is passed to you quarterly.",
    mainRisk: "Distributions depend on tenants paying rent and space staying leased. The unit price moves like a share.",
  },
  {
    id: "reit-mindspace",
    kind: "reit",
    name: "Mindspace Business Parks REIT",
    issuer: "Mindspace Business Parks",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered REIT",
    creditRating: "Not rated (equity-like)",
    indicativeYieldPercent: 6.8,
    tenureYears: null,
    minInvestment: 350,
    liquidity: "high",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["reit"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "Part-ownership of commercial business parks across several Indian cities, paying out rental income.",
    mainRisk: "Same as any REIT — occupancy and rent renewals drive income, and the price moves with the market.",
  },
  {
    id: "reit-nexus",
    kind: "reit",
    name: "Nexus Select Trust",
    issuer: "Nexus Select Trust",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered REIT",
    creditRating: "Not rated (equity-like)",
    indicativeYieldPercent: 7.0,
    tenureYears: null,
    minInvestment: 300,
    liquidity: "moderate",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["reit"],
    suitableFor: ["moderate", "aggressive"],
    whatItIs: "Part-ownership of shopping malls rather than offices, so the rent comes from retailers.",
    mainRisk: "Retail footfall and tenant health drive income; more cyclical than office REITs.",
  },
  {
    id: "invit-indigrid",
    kind: "invit",
    name: "India Grid Trust (IndiGrid)",
    issuer: "India Grid Trust",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered InvIT",
    creditRating: "AAA (at trust level)",
    indicativeYieldPercent: 9.5,
    tenureYears: null,
    minInvestment: 150,
    liquidity: "moderate",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["invit"],
    suitableFor: ["moderate", "aggressive"],
    whatItIs: "Part-ownership of power transmission lines. They earn regulated availability-based charges, not market prices.",
    mainRisk: "Income is steady and contracted, but the unit price still moves and assets need reinvestment over time.",
  },
  {
    id: "invit-pginvit",
    kind: "invit",
    name: "PowerGrid Infrastructure Investment Trust",
    issuer: "Power Grid Corporation of India",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered InvIT",
    creditRating: "AAA (at trust level)",
    indicativeYieldPercent: 9.0,
    tenureYears: null,
    minInvestment: 100,
    liquidity: "moderate",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["invit"],
    suitableFor: ["conservative", "moderate", "aggressive"],
    whatItIs: "Part-ownership of transmission assets sponsored by the state-owned Power Grid Corporation.",
    mainRisk: "Assets have a finite concession life, so distributions include return of capital, not just income.",
  },
  {
    id: "invit-nhit",
    kind: "invit",
    name: "National Highways Infra Trust",
    issuer: "National Highways Authority of India",
    exchange: "NSE/BSE",
    regulatedAs: "SEBI-registered InvIT",
    creditRating: "AAA (at trust level)",
    indicativeYieldPercent: 9.8,
    tenureYears: null,
    minInvestment: 100,
    liquidity: "low",
    incomeFrequency: "Quarterly distributions",
    fillsGap: ["invit"],
    suitableFor: ["moderate", "aggressive"],
    whatItIs: "Part-ownership of toll roads sponsored by NHAI, earning toll revenue passed through to unit holders.",
    mainRisk: "Toll traffic can vary, concessions expire, and these units trade less actively than REITs.",
  },
];

export const INSTRUMENT_KIND_LABEL: Record<InstrumentKind, string> = {
  gsec: "Government security",
  bond: "Corporate bond",
  reit: "REIT",
  invit: "InvIT",
};

export const MATCHING_DISCLAIMER =
  "These are instruments whose asset class matches the gap found in your portfolio. They are not ranked by expected return, they are not personalised advice, and Vantage earns nothing from showing them. Yields shown are indicative and move daily. Read the offer document and decide for yourself, or speak to a SEBI-registered investment adviser.";
