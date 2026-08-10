export const assetAllocation = [
  { name: "Equity", value: 62, color: "#8f78ff" },
  { name: "Debt", value: 18, color: "#5bb7c9" },
  { name: "Gold", value: 8, color: "#e3bb65" },
  { name: "REIT", value: 7, color: "#df6ccf" },
  { name: "Cash", value: 5, color: "#27b386" },
];

export const performanceData = [
  { month: "Jan", value: 74, benchmark: 68 },
  { month: "Feb", value: 79, benchmark: 70 },
  { month: "Mar", value: 77, benchmark: 72 },
  { month: "Apr", value: 84, benchmark: 75 },
  { month: "May", value: 88, benchmark: 78 },
  { month: "Jun", value: 91, benchmark: 80 },
  { month: "Jul", value: 96, benchmark: 82 },
  { month: "Aug", value: 103, benchmark: 85 },
  { month: "Sep", value: 108, benchmark: 87 },
  { month: "Oct", value: 115, benchmark: 90 },
  { month: "Nov", value: 119, benchmark: 92 },
  { month: "Dec", value: 126, benchmark: 95 },
];

export const overlapData = [
  { fund: "Alpha Growth", overlap: 42 },
  { fund: "Prime Flexi", overlap: 35 },
  { fund: "Index Plus", overlap: 24 },
  { fund: "Value Select", overlap: 18 },
];

export const heatmapData = [
  ["Large Cap", "High", 82],
  ["Mid Cap", "Medium", 48],
  ["Small Cap", "Medium", 36],
  ["Debt", "Low", 24],
  ["Gold", "Low", 16],
  ["REIT", "Medium", 41],
  ["InvIT", "Low", 12],
  ["Cash", "Low", 8],
] as const;

export const timelineData = [
  { name: "Broker", progress: 92 },
  { name: "MF", progress: 88 },
  { name: "EPF", progress: 74 },
  { name: "Bonds", progress: 52 },
  { name: "Gold", progress: 67 },
];

export const featureCards = [
  ["Unified Portfolio", "Bring every investment into one calm, accurate portfolio view."],
  ["Mutual Fund Overlap Detection", "Reveal duplicate stock exposure hidden across funds before it compounds risk."],
  ["Portfolio Health Score", "Understand allocation quality, concentration, liquidity, and balance instantly."],
  ["Asset Allocation", "Visualise your complete financial allocation across brokers and instruments."],
  ["Risk Heatmap", "Identify concentration risk by asset, sector, manager, and account source."],
  ["Interactive Charts", "Explore professional-grade analytics with smooth, explainable interactions."],
  ["Explainable AI", "Turn dense portfolio data into plain-language insight and next best actions."],
  ["Privacy First", "Consent-based aggregation designed around user control and security."],
] as const;
