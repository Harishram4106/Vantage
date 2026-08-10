import type { MarketCapBand } from "@/types/portfolio";

// Stand-in for the AMFI/AMC monthly factsheet dataset.
//
// Fund names, company names and ISINs are real. The holding WEIGHTS are synthetic —
// plausible for each fund's mandate, but not transcribed from an actual factsheet.
// Replace this file with scraped factsheet data; the engine reads it through the
// same shape either way.
//
// Weights are percentages of the fund's total portfolio. Only disclosed top holdings
// are listed, so they intentionally sum to well under 100 — the remainder is the
// fund's long tail, which look-through cannot attribute. `lib/analytics/overlap.ts`
// reports that gap as `coveragePercent` rather than pretending it away.

export interface IssuerMeta {
  isin: string;
  sector: string;
  marketCap: MarketCapBand;
}

export const ISSUERS: Record<string, IssuerMeta> = {
  "HDFC Bank": { isin: "INE040A01034", sector: "Financial Services", marketCap: "large" },
  "ICICI Bank": { isin: "INE090A01021", sector: "Financial Services", marketCap: "large" },
  "Axis Bank": { isin: "INE238A01034", sector: "Financial Services", marketCap: "large" },
  "State Bank of India": { isin: "INE062A01020", sector: "Financial Services", marketCap: "large" },
  "Kotak Mahindra Bank": { isin: "INE237A01028", sector: "Financial Services", marketCap: "large" },
  "Bajaj Finance": { isin: "INE296A01024", sector: "Financial Services", marketCap: "large" },
  "Reliance Industries": { isin: "INE002A01018", sector: "Energy", marketCap: "large" },
  Infosys: { isin: "INE009A01021", sector: "Information Technology", marketCap: "large" },
  "Tata Consultancy Services": { isin: "INE467B01029", sector: "Information Technology", marketCap: "large" },
  "HCL Technologies": { isin: "INE860A01027", sector: "Information Technology", marketCap: "large" },
  "Bharti Airtel": { isin: "INE397D01024", sector: "Telecom", marketCap: "large" },
  "Larsen & Toubro": { isin: "INE018A01030", sector: "Construction", marketCap: "large" },
  ITC: { isin: "INE154A01025", sector: "Consumer Goods", marketCap: "large" },
  "Maruti Suzuki": { isin: "INE585B01010", sector: "Automobile", marketCap: "large" },
  "Hindustan Unilever": { isin: "INE030A01027", sector: "Consumer Goods", marketCap: "large" },

  "Max Healthcare": { isin: "INE027H01010", sector: "Healthcare", marketCap: "mid" },
  "Persistent Systems": { isin: "INE262H01021", sector: "Information Technology", marketCap: "mid" },
  "Federal Bank": { isin: "INE171A01029", sector: "Financial Services", marketCap: "mid" },
  Coforge: { isin: "INE591G01017", sector: "Information Technology", marketCap: "mid" },
  "Cummins India": { isin: "INE298A01020", sector: "Industrials", marketCap: "mid" },
  "Indian Hotels": { isin: "INE053A01029", sector: "Consumer Services", marketCap: "mid" },
  "Supreme Industries": { isin: "INE195A01028", sector: "Industrials", marketCap: "mid" },
  "AU Small Finance Bank": { isin: "INE949L01017", sector: "Financial Services", marketCap: "mid" },
  Voltas: { isin: "INE226A01021", sector: "Consumer Durables", marketCap: "mid" },
  Trent: { isin: "INE849A01020", sector: "Consumer Services", marketCap: "mid" },

  "KEI Industries": { isin: "INE878B01027", sector: "Industrials", marketCap: "small" },
  "Blue Star": { isin: "INE472A01039", sector: "Consumer Durables", marketCap: "small" },
  CDSL: { isin: "INE736A01011", sector: "Financial Services", marketCap: "small" },
  "Karur Vysya Bank": { isin: "INE036D01028", sector: "Financial Services", marketCap: "small" },
  "Cera Sanitaryware": { isin: "INE739E01017", sector: "Consumer Durables", marketCap: "small" },
  "JB Chemicals": { isin: "INE572A01036", sector: "Healthcare", marketCap: "small" },
  "Multi Commodity Exchange": { isin: "INE745G01035", sector: "Financial Services", marketCap: "small" },
  "Finolex Industries": { isin: "INE183A01024", sector: "Industrials", marketCap: "small" },
  "V-Guard Industries": { isin: "INE951I01027", sector: "Consumer Durables", marketCap: "small" },
  "Sheela Foam": { isin: "INE916U01025", sector: "Consumer Durables", marketCap: "small" },
};

export interface FactsheetHolding {
  name: string;
  weight: number;
}

export interface FundFactsheet {
  schemeCode: string;
  schemeName: string;
  amc: string;
  asOfMonth: string;
  holdings: FactsheetHolding[];
}

export const FUND_FACTSHEETS: Record<string, FundFactsheet> = {
  "119063": {
    schemeCode: "119063",
    schemeName: "HDFC Flexi Cap Fund - Direct Growth",
    amc: "HDFC Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "HDFC Bank", weight: 9.2 },
      { name: "ICICI Bank", weight: 8.1 },
      { name: "Axis Bank", weight: 5.4 },
      { name: "Reliance Industries", weight: 4.8 },
      { name: "Infosys", weight: 4.1 },
      { name: "Bharti Airtel", weight: 3.6 },
      { name: "Larsen & Toubro", weight: 3.2 },
      { name: "State Bank of India", weight: 3.0 },
      { name: "Kotak Mahindra Bank", weight: 2.6 },
      { name: "ITC", weight: 2.4 },
    ],
  },
  "118989": {
    schemeCode: "118989",
    schemeName: "HDFC Mid-Cap Opportunities Fund - Direct Growth",
    amc: "HDFC Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "Max Healthcare", weight: 4.2 },
      { name: "Persistent Systems", weight: 3.8 },
      { name: "Federal Bank", weight: 3.5 },
      { name: "Coforge", weight: 3.1 },
      { name: "Cummins India", weight: 2.9 },
      { name: "Indian Hotels", weight: 2.7 },
      { name: "Supreme Industries", weight: 2.5 },
      { name: "AU Small Finance Bank", weight: 2.3 },
      { name: "Voltas", weight: 2.1 },
      { name: "Trent", weight: 2.0 },
    ],
  },
  "120586": {
    schemeCode: "120586",
    schemeName: "ICICI Prudential Bluechip Fund - Direct Growth",
    amc: "ICICI Prudential Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "HDFC Bank", weight: 9.5 },
      { name: "ICICI Bank", weight: 8.7 },
      { name: "Reliance Industries", weight: 7.2 },
      { name: "Infosys", weight: 5.4 },
      { name: "Bharti Airtel", weight: 4.6 },
      { name: "Larsen & Toubro", weight: 4.1 },
      { name: "Tata Consultancy Services", weight: 3.4 },
      { name: "Axis Bank", weight: 3.1 },
      { name: "Maruti Suzuki", weight: 2.8 },
      { name: "State Bank of India", weight: 2.6 },
    ],
  },
  "125497": {
    schemeCode: "125497",
    schemeName: "SBI Small Cap Fund - Direct Growth",
    amc: "SBI Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "KEI Industries", weight: 3.6 },
      { name: "Blue Star", weight: 3.3 },
      { name: "CDSL", weight: 3.0 },
      { name: "Karur Vysya Bank", weight: 2.8 },
      { name: "Cera Sanitaryware", weight: 2.5 },
      { name: "JB Chemicals", weight: 2.4 },
      { name: "Multi Commodity Exchange", weight: 2.2 },
      { name: "Finolex Industries", weight: 2.0 },
      { name: "V-Guard Industries", weight: 1.9 },
      { name: "Sheela Foam", weight: 1.7 },
    ],
  },
  "118834": {
    schemeCode: "118834",
    schemeName: "Nippon India Growth Fund - Direct Growth",
    amc: "Nippon India Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "Persistent Systems", weight: 3.4 },
      { name: "Max Healthcare", weight: 3.1 },
      { name: "Federal Bank", weight: 2.9 },
      { name: "Coforge", weight: 2.7 },
      { name: "Trent", weight: 2.6 },
      { name: "Cummins India", weight: 2.4 },
      { name: "Supreme Industries", weight: 2.2 },
      { name: "Voltas", weight: 2.0 },
      { name: "Indian Hotels", weight: 1.9 },
      { name: "AU Small Finance Bank", weight: 1.8 },
    ],
  },
  "120465": {
    schemeCode: "120465",
    schemeName: "Franklin India Flexi Cap Fund - Direct Growth",
    amc: "Franklin Templeton Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "ICICI Bank", weight: 7.8 },
      { name: "HDFC Bank", weight: 7.1 },
      { name: "Infosys", weight: 5.2 },
      { name: "Reliance Industries", weight: 4.9 },
      { name: "Bharti Airtel", weight: 4.2 },
      { name: "Axis Bank", weight: 3.8 },
      { name: "Larsen & Toubro", weight: 3.4 },
      { name: "Tata Consultancy Services", weight: 3.0 },
      { name: "State Bank of India", weight: 2.8 },
      { name: "HCL Technologies", weight: 2.5 },
    ],
  },
  "120716": {
    schemeCode: "120716",
    schemeName: "UTI Nifty 50 Index Fund - Direct Growth",
    amc: "UTI Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "HDFC Bank", weight: 11.4 },
      { name: "ICICI Bank", weight: 8.2 },
      { name: "Reliance Industries", weight: 7.9 },
      { name: "Infosys", weight: 5.6 },
      { name: "Tata Consultancy Services", weight: 4.1 },
      { name: "Bharti Airtel", weight: 3.9 },
      { name: "ITC", weight: 3.5 },
      { name: "Larsen & Toubro", weight: 3.4 },
      { name: "Axis Bank", weight: 3.1 },
      { name: "Kotak Mahindra Bank", weight: 2.7 },
    ],
  },
  "119598": {
    schemeCode: "119598",
    schemeName: "Mirae Asset ELSS Tax Saver Fund - Direct Growth",
    amc: "Mirae Asset Mutual Fund",
    asOfMonth: "2026-06",
    holdings: [
      { name: "HDFC Bank", weight: 9.8 },
      { name: "ICICI Bank", weight: 8.5 },
      { name: "Infosys", weight: 5.8 },
      { name: "Reliance Industries", weight: 5.2 },
      { name: "Bharti Airtel", weight: 4.6 },
      { name: "Larsen & Toubro", weight: 3.9 },
      { name: "Tata Consultancy Services", weight: 3.4 },
      { name: "Axis Bank", weight: 3.2 },
      { name: "State Bank of India", weight: 2.8 },
      { name: "Maruti Suzuki", weight: 2.3 },
    ],
  },
};

export const FACTSHEET_COVERAGE_NOTE =
  "Look-through uses each fund's disclosed top holdings. The undisclosed long tail cannot be attributed, so true concentration is at least what is shown here — never less.";
