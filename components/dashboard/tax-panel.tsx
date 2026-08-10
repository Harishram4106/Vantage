"use client";

import { useState } from "react";
import {
  Receipt, ShieldCheck, TrendingDown, Lightbulb, ChevronDown, ChevronUp,
  AlertTriangle, Info, Trophy,
} from "lucide-react";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { UnifiedPortfolio } from "@/types/portfolio";
import { formatInr, formatInrCompact } from "@/lib/utils";

// ── FY 2024-25 constants ──────────────────────────────────────────
const LTCG_RATE       = 0.125;
const STCG_RATE       = 0.20;
const LTCG_EXEMPTION  = 125000;
const SEC_80C_LIMIT   = 150000;
const CESS_RATE       = 0.04;

// ── Types ─────────────────────────────────────────────────────────
interface TaxBreakdownRow {
  label: string;
  type: string;
  gain: number;
  regime: "ltcg" | "stcg" | "slab" | "exempt";
  color: string;
  note?: string;
}

interface RegimeInputs {
  grossSalary: number;
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
  sec80C: number;
  sec80D: number;
  homeLoanInterest: number;
  nps80CCD1B: number;
}

// ── Capital gains computation (from portfolio) ────────────────────
function computePortfolioTax(portfolio: UnifiedPortfolio) {
  const rows: TaxBreakdownRow[] = [];
  let elss80C = 0;
  let epfContrib = 0;

  for (const h of portfolio.holdings) {
    const invested = h.investedValue ?? h.currentValue;
    const gain = h.currentValue - invested;

    switch (h.kind) {
      case "equity":
        rows.push({ label: h.name, type: "Direct equity (held > 1 yr)", gain, regime: "ltcg", color: "#8f78ff" });
        break;
      case "mutual_fund":
        if (h.category === "equity_elss") {
          elss80C += invested;
          rows.push({
            label: h.schemeName.replace(" - Direct Growth", ""),
            type: "ELSS — 80C + LTCG",
            gain, regime: "ltcg", color: "#8f78ff",
            note: `₹${Math.min(invested, SEC_80C_LIMIT).toLocaleString("en-IN")} eligible for 80C`,
          });
        } else if (h.category.startsWith("equity") || h.category === "index_equity" || h.category === "hybrid_aggressive") {
          rows.push({ label: h.schemeName.replace(" - Direct Growth", ""), type: "Equity fund (held > 1 yr) — LTCG 12.5%", gain, regime: "ltcg", color: "#8f78ff" });
        } else if (h.category === "gold_etf") {
          rows.push({ label: h.schemeName.replace(" - Direct Growth", ""), type: "Gold fund — slab rate", gain, regime: "slab", color: "#e3bb65" });
        } else {
          rows.push({ label: h.schemeName.replace(" - Direct Growth", ""), type: "Debt fund — slab rate", gain, regime: "slab", color: "#5bb7c9" });
        }
        break;
      case "gold":
        if (h.form === "sgb") {
          rows.push({ label: "Sovereign Gold Bond", type: "SGB — tax-free at maturity (RBI)", gain: 0, regime: "exempt", color: "#e3bb65", note: "Coupon interest taxable as income" });
        } else {
          rows.push({ label: `Gold (${h.form.toUpperCase()})`, type: "Physical / digital gold — slab rate", gain, regime: "slab", color: "#e3bb65" });
        }
        break;
      case "bond":
        rows.push({ label: h.issuer, type: `Bond (${h.creditRating}) — slab rate`, gain, regime: "slab", color: "#5bb7c9" });
        break;
      case "epf":
        epfContrib = Math.min(h.currentValue * 0.12, SEC_80C_LIMIT);
        rows.push({ label: "EPF", type: "Employee provident fund — exempt", gain: 0, regime: "exempt", color: "#27b386", note: "Tax-free up to ₹2.5L annual employer contribution" });
        break;
      case "fixed_deposit":
        rows.push({ label: `${h.bank} FD`, type: "Fixed deposit interest — slab rate", gain: h.currentValue * (h.interestRate / 100), regime: "slab", color: "#5bb7c9", note: `${h.interestRate}% p.a. — interest taxed as income` });
        break;
    }
  }

  const ltcgGains    = rows.filter(r => r.regime === "ltcg").reduce((s, r) => s + Math.max(0, r.gain), 0);
  const taxableLtcg  = Math.max(0, ltcgGains - LTCG_EXEMPTION);
  const ltcgTax      = taxableLtcg * LTCG_RATE;
  const stcgGains    = rows.filter(r => r.regime === "stcg").reduce((s, r) => s + Math.max(0, r.gain), 0);
  const stcgTax      = stcgGains * STCG_RATE;
  const slabGains    = rows.filter(r => r.regime === "slab").reduce((s, r) => s + Math.max(0, r.gain), 0);
  const slabTax      = slabGains * 0.30;
  const totalTax     = ltcgTax + stcgTax + slabTax;
  const sec80CUsed   = Math.min(elss80C + epfContrib, SEC_80C_LIMIT);
  const sec80CRemaining = Math.max(0, SEC_80C_LIMIT - sec80CUsed);

  const tips: string[] = [];
  if (sec80CRemaining > 0)
    tips.push(`₹${sec80CRemaining.toLocaleString("en-IN")} of Section 80C limit unused — an ELSS SIP could save up to ₹${Math.round(sec80CRemaining * 0.30).toLocaleString("en-IN")} in income tax.`);
  if (ltcgGains < LTCG_EXEMPTION + 50000)
    tips.push("LTCG is within the ₹1.25L exemption band — consider booking gains this FY before they roll over.");
  if (rows.some(r => r.regime === "slab" && r.gain > 50000))
    tips.push("Debt-fund and FD gains are taxed at slab rate. Switching to tax-efficient instruments (SGBs, NCDs) could reduce liability.");
  if (!rows.some(r => r.note?.includes("80C")) && sec80CUsed < SEC_80C_LIMIT)
    tips.push("No ELSS detected. Adding an ELSS fund can give up to ₹46,800 annual tax saving at the 30% slab.");

  return { rows, ltcgGains, taxableLtcg, ltcgTax, stcgGains, stcgTax, slabGains, slabTax, totalTax, sec80CUsed, sec80CRemaining, elss80CContrib: elss80C, epfContrib, tips };
}

// ── Old regime tax computation ─────────────────────────────────────
function computeOldRegime(inp: RegimeInputs) {
  const stdDeduction = 50000;
  const hraExempt = Math.max(
    0,
    Math.min(
      inp.hraReceived,
      inp.rentPaid - 0.10 * inp.basicSalary,
      (inp.isMetro ? 0.50 : 0.40) * inp.basicSalary,
    ),
  );
  const d80C   = Math.min(inp.sec80C,           SEC_80C_LIMIT);
  const dNPS   = Math.min(inp.nps80CCD1B,       50000);
  const d80D   = Math.min(inp.sec80D,           50000);
  const d24b   = Math.min(inp.homeLoanInterest, 200000);

  const taxable = Math.max(0,
    inp.grossSalary - stdDeduction - hraExempt - d80C - dNPS - d80D - d24b,
  );

  let tax = 0;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
  if (taxable >  500000) tax += (Math.min(taxable, 1000000) - 500000) * 0.20;
  if (taxable >  250000) tax += (Math.min(taxable,  500000) - 250000) * 0.05;
  if (taxable <= 500000) tax = 0; // 87A full rebate

  const cess  = tax * CESS_RATE;
  const total = tax + cess;
  return { taxable, tax, cess, total, hraExempt, d80C, dNPS, d80D, d24b };
}

// ── New regime tax computation ─────────────────────────────────────
function computeNewRegime(inp: RegimeInputs) {
  const stdDeduction = 75000; // increased in Budget 2024
  const taxable = Math.max(0, inp.grossSalary - stdDeduction);

  let tax = 0;
  if (taxable > 1500000) tax += (taxable - 1500000) * 0.30;
  if (taxable > 1200000) tax += (Math.min(taxable, 1500000) - 1200000) * 0.20;
  if (taxable > 1000000) tax += (Math.min(taxable, 1200000) - 1000000) * 0.15;
  if (taxable >  700000) tax += (Math.min(taxable, 1000000) - 700000)  * 0.10;
  if (taxable >  300000) tax += (Math.min(taxable,  700000) - 300000)  * 0.05;
  // 87A rebate up to ₹25,000 if taxable ≤ ₹7L
  if (taxable <= 700000) tax = Math.max(0, tax - 25000);

  const cess  = tax * CESS_RATE;
  const total = tax + cess;
  return { taxable, tax, cess, total };
}

// ── Regime insights engine ─────────────────────────────────────────
function buildInsights(inp: RegimeInputs, oldResult: ReturnType<typeof computeOldRegime>, newResult: ReturnType<typeof computeNewRegime>) {
  const insights: { level: "tip" | "warn" | "info"; text: string }[] = [];

  const saving = newResult.total - oldResult.total; // positive = old is better
  const abs    = Math.abs(saving);

  if (abs < 5000 && abs > 0)
    insights.push({ level: "warn", text: `Regime-switch alert: the difference between regimes is only ${formatInr(Math.round(abs))} — a minor income change or new deduction next year could flip the recommendation. Review annually.` });

  const unused80C = SEC_80C_LIMIT - inp.sec80C;
  if (inp.sec80C < SEC_80C_LIMIT)
    insights.push({ level: "tip", text: `₹${unused80C.toLocaleString("en-IN")} unused under Section 80C. In the old regime, investing this in ELSS would save ₹${Math.round(unused80C * 0.30).toLocaleString("en-IN")} in income tax and build an equity corpus simultaneously.` });

  if (inp.nps80CCD1B < 50000)
    insights.push({ level: "tip", text: `You haven't claimed Section 80CCD(1B). A ₹50,000 NPS Tier-I contribution (over and above 80C) saves an additional ₹15,600 in tax at the 30% slab — the single most underused deduction for salaried professionals.` });

  if (inp.homeLoanInterest === 0 && inp.grossSalary > 1000000)
    insights.push({ level: "info", text: "If you have or plan a home loan, Section 24(b) allows up to ₹2L deduction on interest — a major advantage of the old regime for high earners with loans." });

  if (inp.grossSalary > 1500000 && saving < 0)
    insights.push({ level: "info", text: "For gross income above ₹15L with limited deductions, the new regime's flat 30% slab with ₹75,000 standard deduction often wins. If your deductions exceed ₹3.75L, the old regime typically recovers its edge." });

  if (inp.rentPaid > 0 && inp.hraReceived === 0)
    insights.push({ level: "warn", text: "You entered rent paid but no HRA received. If you're not drawing HRA, you cannot claim the HRA exemption — but you can claim ₹60,000 u/s 80GG (non-HRA rent deduction) if self-employed or if your employer doesn't provide HRA." });

  return insights;
}

// ── Input field component ─────────────────────────────────────────
function InputField({
  label, value, onChange, prefix = "₹", hint,
}: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/45">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#17141c]/40">{prefix}</span>
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-[14px] border border-[#17141c]/10 bg-white/70 py-2.5 pl-7 pr-3 text-sm font-semibold text-[#17141c] outline-none transition focus:border-[#8f78ff]/50 focus:ring-2 focus:ring-[#8f78ff]/15"
          placeholder="0"
        />
      </div>
      {hint && <p className="mt-0.5 text-[10px] text-[#17141c]/38">{hint}</p>}
    </div>
  );
}

function RegimePill({ regime }: { regime: TaxBreakdownRow["regime"] }) {
  const map = {
    ltcg:   { label: "LTCG 12.5%", color: "#8f78ff", bg: "rgba(143,120,255,0.10)" },
    stcg:   { label: "STCG 20%",   color: "#c0343c", bg: "rgba(192,52,60,0.08)"   },
    slab:   { label: "Slab rate",  color: "#9a6f14", bg: "rgba(227,187,101,0.12)" },
    exempt: { label: "Exempt",     color: "#11765a", bg: "rgba(39,179,134,0.10)"  },
  } as const;
  const s = map[regime];
  return (
    <span style={{ background: s.bg, color: s.color }} className="rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
      {s.label}
    </span>
  );
}

// ── Main panel ────────────────────────────────────────────────────
export function TaxPanel({ portfolio }: { portfolio: UnifiedPortfolio }) {
  const portfolioTax = computePortfolioTax(portfolio);
  const [expanded, setExpanded] = useState(false);

  // Salary regime inputs — pre-fill from portfolio where possible
  const { monthlyIncome = 80000 } = portfolio.riskProfileInput;
  const [inp, setInp] = useState<RegimeInputs>({
    grossSalary:       monthlyIncome * 12,
    basicSalary:       Math.round(monthlyIncome * 0.40) * 12,
    hraReceived:       Math.round(monthlyIncome * 0.20) * 12,
    rentPaid:          Math.round(monthlyIncome * 0.25) * 12,
    isMetro:           true,
    sec80C:            portfolioTax.sec80CUsed,
    sec80D:            25000,
    homeLoanInterest:  0,
    nps80CCD1B:        0,
  });

  function set(field: keyof RegimeInputs) {
    return (v: number | boolean) => setInp(prev => ({ ...prev, [field]: v }));
  }

  const oldResult = computeOldRegime(inp);
  const newResult = computeNewRegime(inp);
  const insights  = buildInsights(inp, oldResult, newResult);

  const oldWins = oldResult.total < newResult.total;
  const saving  = Math.abs(oldResult.total - newResult.total);

  const visibleRows = expanded ? portfolioTax.rows : portfolioTax.rows.slice(0, 5);

  return (
    <div className="space-y-5">

      {/* ══════════════════════════════════════════════════════════
          SECTION A — Salary & regime comparison (TaxTrust-style)
          ══════════════════════════════════════════════════════════ */}
      <Panel
        title="Income tax regime planner"
        subtitle="Enter your salary details to instantly compare Old vs New regime — see which saves more and why."
        accent
      >
        {/* Input grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="Gross annual salary"  value={inp.grossSalary}      onChange={set("grossSalary")}      hint="CTC before any deductions" />
          <InputField label="Basic salary (annual)" value={inp.basicSalary}      onChange={set("basicSalary")}      hint="Usually 40–50% of CTC" />
          <InputField label="HRA received"          value={inp.hraReceived}      onChange={set("hraReceived")}      hint="Annual HRA component in salary" />
          <InputField label="Rent paid (annual)"    value={inp.rentPaid}         onChange={set("rentPaid")}         hint="Actual rent paid, 0 if none" />
          <InputField label="Section 80C"           value={inp.sec80C}           onChange={set("sec80C")}           hint="ELSS + PPF + EPF + LIC (max ₹1.5L)" />
          <InputField label="Section 80D"           value={inp.sec80D}           onChange={set("sec80D")}           hint="Health insurance premium (max ₹50K)" />
          <InputField label="Home loan interest"    value={inp.homeLoanInterest} onChange={set("homeLoanInterest")} hint="Section 24(b) — max ₹2L" />
          <InputField label="NPS 80CCD(1B)"         value={inp.nps80CCD1B}       onChange={set("nps80CCD1B")}       hint="Extra NPS over 80C (max ₹50K)" />
        </div>

        {/* Metro toggle */}
        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs text-[#17141c]/55">City type (affects HRA exemption):</p>
          {(["Metro (50% HRA)", "Non-metro (40% HRA)"] as const).map((label, i) => {
            const metro = i === 0;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setInp(p => ({ ...p, isMetro: metro }))}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  inp.isMetro === metro
                    ? "bg-[#17141c] text-white"
                    : "border border-[#17141c]/15 text-[#17141c]/55 hover:text-[#17141c]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Side-by-side regime cards ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Old regime */}
          <div className={`relative rounded-[20px] border-2 p-5 transition-all ${
            oldWins ? "border-[#27b386]/40 bg-[rgba(39,179,134,0.05)]" : "border-[#17141c]/8 bg-white/50"
          }`}>
            {oldWins && (
              <div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-[#27b386] px-3 py-1 text-[10px] font-bold text-white shadow-md">
                <Trophy size={10} />
                SAVES MORE
              </div>
            )}
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#17141c]/50">Old regime</p>
            <p className="mt-1 text-[10px] text-[#17141c]/38">Standard deduction ₹50,000 · multiple deductions apply</p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Gross salary",       value: formatInr(inp.grossSalary)                },
                { label: "− Standard deduction", value: `− ${formatInr(50000)}`                  },
                { label: "− HRA exemption",    value: `− ${formatInr(Math.round(oldResult.hraExempt))}` },
                { label: "− Section 80C",      value: `− ${formatInr(oldResult.d80C)}`            },
                { label: "− Section 80D",      value: `− ${formatInr(oldResult.d80D)}`            },
                { label: "− 80CCD(1B) NPS",    value: `− ${formatInr(oldResult.dNPS)}`            },
                { label: "− Home loan 24(b)",  value: `− ${formatInr(oldResult.d24b)}`            },
              ].map(row => (
                <div key={row.label} className="flex items-baseline justify-between text-xs">
                  <span className="text-[#17141c]/55">{row.label}</span>
                  <span className="font-medium text-[#17141c]">{row.value}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-[#17141c]/8 pt-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#17141c]/70">Taxable income</span>
                  <span>{formatInr(Math.round(oldResult.taxable))}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[16px] bg-[#17141c]/[0.04] p-4">
              <div className="flex justify-between text-xs text-[#17141c]/55">
                <span>Income tax</span>
                <span>{formatInr(Math.round(oldResult.tax))}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-[#17141c]/55">
                <span>+ 4% H&E Cess</span>
                <span>{formatInr(Math.round(oldResult.cess))}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#17141c]/8 pt-2">
                <span className="text-sm font-bold text-[#17141c]">Total tax payable</span>
                <span className="text-xl font-bold" style={{ color: oldWins ? "#11765a" : "#c0343c" }}>
                  {formatInr(Math.round(oldResult.total))}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-[#17141c]/38">
                Effective rate: {inp.grossSalary > 0 ? ((oldResult.total / inp.grossSalary) * 100).toFixed(1) : "0.0"}%
              </p>
            </div>
          </div>

          {/* New regime */}
          <div className={`relative rounded-[20px] border-2 p-5 transition-all ${
            !oldWins ? "border-[#8f78ff]/40 bg-[rgba(143,120,255,0.05)]" : "border-[#17141c]/8 bg-white/50"
          }`}>
            {!oldWins && (
              <div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-[#8f78ff] px-3 py-1 text-[10px] font-bold text-white shadow-md">
                <Trophy size={10} />
                SAVES MORE
              </div>
            )}
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#17141c]/50">New regime</p>
            <p className="mt-1 text-[10px] text-[#17141c]/38">Standard deduction ₹75,000 · no other deductions · default from FY 2024-25</p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Gross salary",           value: formatInr(inp.grossSalary) },
                { label: "− Standard deduction",   value: `− ${formatInr(75000)}`   },
                { label: "No HRA / 80C / 80D deductions", value: "—"                },
              ].map(row => (
                <div key={row.label} className="flex items-baseline justify-between text-xs">
                  <span className="text-[#17141c]/55">{row.label}</span>
                  <span className="font-medium text-[#17141c]">{row.value}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-[#17141c]/8 pt-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#17141c]/70">Taxable income</span>
                  <span>{formatInr(Math.round(newResult.taxable))}</span>
                </div>
              </div>
            </div>

            {/* New regime slabs reference */}
            <div className="mt-3 rounded-[14px] border border-[#17141c]/7 bg-white/50 px-3 py-2.5">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-[#17141c]/38">Slab rates (FY 2024-25)</p>
              {[
                { range: "₹0 – ₹3L", rate: "Nil" },
                { range: "₹3L – ₹7L", rate: "5%" },
                { range: "₹7L – ₹10L", rate: "10%" },
                { range: "₹10L – ₹12L", rate: "15%" },
                { range: "₹12L – ₹15L", rate: "20%" },
                { range: "Above ₹15L", rate: "30%" },
              ].map(s => (
                <div key={s.range} className="flex justify-between text-[10px] text-[#17141c]/55">
                  <span>{s.range}</span><span className="font-semibold">{s.rate}</span>
                </div>
              ))}
              <p className="mt-1.5 text-[9px] text-[#17141c]/35">87A rebate: nil tax if taxable income ≤ ₹7L</p>
            </div>

            <div className="mt-4 rounded-[16px] bg-[#17141c]/[0.04] p-4">
              <div className="flex justify-between text-xs text-[#17141c]/55">
                <span>Income tax</span>
                <span>{formatInr(Math.round(newResult.tax))}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-[#17141c]/55">
                <span>+ 4% H&E Cess</span>
                <span>{formatInr(Math.round(newResult.cess))}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#17141c]/8 pt-2">
                <span className="text-sm font-bold text-[#17141c]">Total tax payable</span>
                <span className="text-xl font-bold" style={{ color: !oldWins ? "#8f78ff" : "#c0343c" }}>
                  {formatInr(Math.round(newResult.total))}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-[#17141c]/38">
                Effective rate: {inp.grossSalary > 0 ? ((newResult.total / inp.grossSalary) * 100).toFixed(1) : "0.0"}%
              </p>
            </div>
          </div>
        </div>

        {/* Winner banner */}
        {saving > 0 && (
          <div
            className="mt-4 flex items-center justify-between rounded-[18px] px-5 py-4"
            style={{ background: oldWins ? "rgba(39,179,134,0.10)" : "rgba(143,120,255,0.10)" }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: oldWins ? "#11765a" : "#6953dc" }}>
                {oldWins ? "Old regime saves more" : "New regime saves more"}
              </p>
              <p className="mt-0.5 text-xs text-[#17141c]/55">
                based on the deductions you&apos;ve entered
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#17141c]/45">Annual saving</p>
              <p className="text-2xl font-bold" style={{ color: oldWins ? "#11765a" : "#6953dc" }}>
                {formatInr(Math.round(saving))}
              </p>
            </div>
          </div>
        )}
        {saving === 0 && (
          <div className="mt-4 rounded-[18px] bg-[#17141c]/5 px-5 py-3 text-center text-sm text-[#17141c]/55">
            Both regimes result in the same tax — either choice is fine.
          </div>
        )}

        {/* Insights engine */}
        {insights.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/40">Tax insights</p>
            {insights.map((ins, i) => {
              const Icon = ins.level === "warn" ? AlertTriangle : ins.level === "tip" ? Lightbulb : Info;
              const color = ins.level === "warn" ? "#9a6f14" : ins.level === "tip" ? "#11765a" : "#3f7f90";
              const bg    = ins.level === "warn" ? "rgba(227,187,101,0.10)" : ins.level === "tip" ? "rgba(39,179,134,0.08)" : "rgba(91,183,201,0.10)";
              const border= ins.level === "warn" ? "rgba(227,187,101,0.24)" : ins.level === "tip" ? "rgba(39,179,134,0.22)" : "rgba(91,183,201,0.22)";
              return (
                <div key={i} className="flex items-start gap-3 rounded-[16px] border px-4 py-3" style={{ background: bg, borderColor: border }}>
                  <Icon size={14} className="mt-0.5 shrink-0" style={{ color }} />
                  <p className="text-xs leading-relaxed text-[#17141c]/75">{ins.text}</p>
                </div>
              );
            })}
          </div>
        )}

        <WhyNote>
          All calculations use FY 2024-25 rates. Old regime slab rates: 5% (₹2.5–5L), 20% (₹5–10L), 30% (above ₹10L).
          New regime slabs: 5% (₹3–7L), 10% (₹7–10L), 15% (₹10–12L), 20% (₹12–15L), 30% (above ₹15L). Surcharge
          (for income above ₹50L) and marginal relief are not included. All calculations run in your browser — no data
          is sent to any server.
        </WhyNote>
      </Panel>

      {/* ══════════════════════════════════════════════════════════
          SECTION B — Capital gains from portfolio
          ══════════════════════════════════════════════════════════ */}
      <Panel
        title="Capital gains from this portfolio"
        subtitle="Estimated tax if every unrealised gain were booked today — FY 2024-25 rates."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Estimated total tax",  value: formatInr(Math.round(portfolioTax.totalTax)),  sub: "if all gains realised", color: portfolioTax.totalTax > 50000 ? "#c0343c" : "#11765a" },
            { label: "LTCG gains",           value: formatInr(Math.round(portfolioTax.ltcgGains)), sub: `₹1.25L exempt · taxable ${formatInr(Math.round(portfolioTax.taxableLtcg))}`, color: "#8f78ff" },
            { label: "Slab-rate gains",      value: formatInr(Math.round(portfolioTax.slabGains)), sub: "Debt, FD, gold fund etc.", color: "#9a6f14" },
            { label: "Section 80C used",     value: formatInr(portfolioTax.sec80CUsed),           sub: `₹${portfolioTax.sec80CRemaining.toLocaleString("en-IN")} remaining`, color: portfolioTax.sec80CRemaining > 0 ? "#9a6f14" : "#11765a" },
          ].map(card => (
            <div key={card.label} className="rounded-[20px] border border-[#17141c]/7 bg-white/62 px-4 py-3.5">
              <p className="text-xs text-[#17141c]/50">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: card.color }}>{card.value}</p>
              <p className="mt-0.5 text-[11px] text-[#17141c]/42">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Gain split bars */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/40">Gains by regime</p>
          {[
            { label: "LTCG (12.5%)", value: portfolioTax.ltcgGains, color: "#8f78ff", tax: portfolioTax.ltcgTax },
            { label: "Slab rate",    value: portfolioTax.slabGains, color: "#e3bb65", tax: portfolioTax.slabTax },
            { label: "STCG (20%)",   value: portfolioTax.stcgGains, color: "#c0343c", tax: portfolioTax.stcgTax },
          ].map(row => {
            const total = portfolioTax.ltcgGains + portfolioTax.slabGains + portfolioTax.stcgGains || 1;
            return (
              <div key={row.label} className="mb-2.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-[#17141c]/70">{row.label}</span>
                  <span>
                    <span className="font-semibold text-[#17141c]">{formatInr(Math.round(row.value))}</span>
                    <span className="ml-2 text-xs text-[#17141c]/42">tax ≈ {formatInr(Math.round(row.tax))}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#17141c]/7">
                  <div className="h-full rounded-full" style={{ width: `${(row.value / total) * 100}%`, background: row.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <WhyNote>
          Holding period above 1 year assumed for equity instruments. STCG assumed nil. Slab-rate tax shown at 30%.
          Consult a CA before filing returns.
        </WhyNote>
      </Panel>

      {/* Section 80C donut */}
      <Panel title="Section 80C utilisation" subtitle="Tax deductions from ELSS and provident fund contributions this FY.">
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(23,20,28,0.08)" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#27b386" strokeWidth="4"
                strokeDasharray={`${(portfolioTax.sec80CUsed / SEC_80C_LIMIT) * 87.96} 87.96`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#17141c]">
              {Math.round((portfolioTax.sec80CUsed / SEC_80C_LIMIT) * 100)}%
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { label: "ELSS investments",          value: portfolioTax.elss80CContrib > 0 ? formatInr(Math.round(portfolioTax.elss80CContrib)) : "₹0 (none in portfolio)" },
              { label: "EPF contributions (est.)",  value: portfolioTax.epfContrib > 0 ? formatInr(Math.round(portfolioTax.epfContrib)) : "No EPF detected" },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-[#17141c]/60">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-[#17141c]/8 pt-2 text-sm">
              <span className="font-semibold text-[#17141c]">Remaining limit</span>
              <span className="font-semibold" style={{ color: portfolioTax.sec80CRemaining > 0 ? "#9a6f14" : "#11765a" }}>
                {portfolioTax.sec80CRemaining > 0
                  ? `₹${portfolioTax.sec80CRemaining.toLocaleString("en-IN")} unused`
                  : "Fully utilised"}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Per-holding table */}
      <Panel
        title="Holding-by-holding tax view"
        subtitle="Every position mapped to its capital gains tax regime."
        action={<Receipt size={18} className="text-[#8f78ff]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#17141c]/8 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#17141c]/42">
                <th className="pb-2.5 pr-4 font-semibold">Holding</th>
                <th className="pb-2.5 pr-4 font-semibold">Tax regime</th>
                <th className="pb-2.5 pr-4 text-right font-semibold">Unrealised gain</th>
                <th className="pb-2.5 text-right font-semibold">Est. tax</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(row => {
                const taxOnRow =
                  row.regime === "ltcg" ? Math.max(0, row.gain - LTCG_EXEMPTION) * LTCG_RATE :
                  row.regime === "stcg" ? Math.max(0, row.gain) * STCG_RATE :
                  row.regime === "slab" ? Math.max(0, row.gain) * 0.30 : 0;
                return (
                  <tr key={row.label} className="border-b border-[#17141c]/6 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} />
                        <div>
                          <p className="text-sm font-medium leading-snug text-[#17141c]">{row.label}</p>
                          {row.note && <p className="text-[10px] text-[#17141c]/42">{row.note}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4"><RegimePill regime={row.regime} /></td>
                    <td className="py-2.5 pr-4 text-right text-sm">
                      <span className={row.gain >= 0 ? "font-semibold text-[#11765a]" : "font-semibold text-[#c0343c]"}>
                        {row.gain >= 0 ? "+" : ""}{formatInr(Math.round(row.gain))}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-sm text-[#17141c]/62">
                      {row.regime === "exempt" ? <span className="text-[#11765a]">Nil</span> : formatInr(Math.round(taxOnRow))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {portfolioTax.rows.length > 5 && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#8f78ff] focus-visible:outline-none"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? "Show less" : `Show ${portfolioTax.rows.length - 5} more holdings`}
          </button>
        )}
      </Panel>

      {/* Portfolio tax tips */}
      {portfolioTax.tips.length > 0 && (
        <Panel
          title="Portfolio tax-saving opportunities"
          subtitle="Rule-based suggestions based on current holdings and tax positions."
          action={<Lightbulb size={18} className="text-[#e3bb65]" />}
        >
          <div className="space-y-3">
            {portfolioTax.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[18px] border border-[#e3bb65]/22 bg-[#e3bb65]/8 px-4 py-3">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#9a6f14]" />
                <p className="text-sm leading-relaxed text-[#17141c]/78">{tip}</p>
              </div>
            ))}
          </div>
          <WhyNote>
            These suggestions are illustrative and rule-based, not personalised tax advice. Tax laws change frequently
            — verify with a qualified CA for your specific situation.
          </WhyNote>
        </Panel>
      )}
    </div>
  );
}
