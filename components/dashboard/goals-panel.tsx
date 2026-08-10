"use client";

import { Flag, Home, GraduationCap, Umbrella, TrendingUp, Lightbulb } from "lucide-react";

import { Panel, WhyNote } from "@/components/dashboard/panel";
import type { UnifiedPortfolio } from "@/types/portfolio";
import { formatInr, formatInrCompact } from "@/lib/utils";

interface Goal {
  id: string;
  label: string;
  icon: typeof Flag;
  color: string;
  softBg: string;
  target: number;
  current: number;
  yearsLeft: number;
  returnRate: number;
  ruleLabel: string;
  description: string;
  rationale: string;
  fundRecommendation: string;
  actionStep: string;
}

function futureSipNeeded(gap: number, years: number, rateMonthly: number): number {
  if (years <= 0 || gap <= 0) return 0;
  const n = years * 12;
  const fvFactor = ((Math.pow(1 + rateMonthly, n) - 1) / rateMonthly) * (1 + rateMonthly);
  return gap / fvFactor;
}

function fvCalc(pv: number, years: number, rate: number): number {
  return pv * Math.pow(1 + rate, years);
}

function buildGoals(portfolio: UnifiedPortfolio): Goal[] {
  const {
    age,
    horizonYears,
    monthlyExpenses = 50000,
    monthlyIncome = 80000,
    dependents,
  } = portfolio.riskProfileInput;

  const totalValue = portfolio.holdings.reduce((s, h) => s + h.currentValue, 0);

  const liquidValue = portfolio.holdings
    .filter(h => h.kind !== "epf" && h.kind !== "fixed_deposit" && !(h.kind === "gold" && h.form === "sgb"))
    .reduce((s, h) => s + h.currentValue, 0);

  const cashEquivalent = portfolio.holdings
    .filter(h => h.kind === "cash" || h.kind === "fixed_deposit")
    .reduce((s, h) => s + h.currentValue, 0);

  const epfValue = portfolio.holdings.filter(h => h.kind === "epf").reduce((s, h) => s + h.currentValue, 0);

  const goals: Goal[] = [];

  // ── Emergency Fund ────────────────────────────────────────────
  const emergencyTarget = monthlyExpenses * 6;
  const emergencyFv = fvCalc(cashEquivalent, 1, 0.065);
  const emergencyGap = Math.max(0, emergencyTarget - emergencyFv);
  const shortfall = Math.round(emergencyTarget - cashEquivalent);

  goals.push({
    id: "emergency",
    label: "Emergency Fund",
    icon: Umbrella,
    color: "#27b386",
    softBg: "rgba(39,179,134,0.09)",
    target: emergencyTarget,
    current: Math.min(cashEquivalent, emergencyTarget),
    yearsLeft: 1,
    returnRate: 0.065,
    ruleLabel: "6-month rule",
    description: `Your emergency fund target is ${formatInr(emergencyTarget)} — 6 months of your ₹${(monthlyExpenses / 1000).toFixed(0)}K monthly expenses. Current instantly-accessible cash stands at ${formatInr(cashEquivalent)}, covering ${Math.round((cashEquivalent / emergencyTarget) * 100)}% of the target. The remaining ${formatInrCompact(Math.max(0, shortfall))} gap should be parked in a liquid mutual fund or high-yield savings account — not equity, not a locked FD.`,
    rationale: `Without this buffer, any sudden expense — job loss, medical bill, emergency travel — forces you to sell your equity investments at whatever price the market offers, which is almost always the worst possible time to sell. This fund is your shield for your long-term portfolio.`,
    fundRecommendation: "Overnight or liquid MF (T+1 redemption, ~6.5–7% pa, no exit load) · Sweep-in FD linked to salary account (auto-saves surplus) · Avoid equity or long-tenure FDs for this goal.",
    actionStep: emergencyGap > 0
      ? `Transfer ${formatInrCompact(Math.round(emergencyGap))} to a liquid MF (Parag Parikh Liquid / ICICI Prudential Liquid) to fully fund this buffer before investing anything else.`
      : "Emergency fund is fully covered. Revisit the target if your monthly expenses increase.",
  });

  // ── Retirement Corpus ─────────────────────────────────────────
  const retirementAge = 60;
  const yearsToRetirement = Math.max(1, retirementAge - age);
  const inflatedExpenses = monthlyExpenses * Math.pow(1.06, yearsToRetirement);
  const retirementTarget = inflatedExpenses * 12 * 25;
  const retirementFv = fvCalc(totalValue, yearsToRetirement, 0.12);
  const retirementGap = Math.max(0, retirementTarget - retirementFv);
  const retirementSip = futureSipNeeded(retirementGap, yearsToRetirement, Math.pow(1.12, 1 / 12) - 1);
  const equityPct = Math.max(30, Math.min(85, 100 - age));

  goals.push({
    id: "retirement",
    label: "Retirement Corpus",
    icon: TrendingUp,
    color: "#8f78ff",
    softBg: "rgba(143,120,255,0.09)",
    target: retirementTarget,
    current: totalValue,
    yearsLeft: yearsToRetirement,
    returnRate: 0.12,
    ruleLabel: "25× / 4% SWR",
    description: `By age 60, you need ${formatInrCompact(Math.round(retirementTarget))} — 25 times your inflation-adjusted annual spending (accounting for 6% pa expense inflation). Your current portfolio of ${formatInrCompact(Math.round(totalValue))} growing at 12% pa projects to ${formatInrCompact(Math.round(retirementFv))} at retirement, covering ${Math.round((retirementFv / retirementTarget) * 100)}% of the target.${epfValue > 0 ? ` Your EPF corpus (${formatInrCompact(epfValue)}) compounding at ~8% pa adds to this base.` : ""} ${retirementGap > 0 ? `A monthly SIP of ${formatInrCompact(Math.round(retirementSip))} started today closes the remaining gap.` : "You are on track at current projections."}`,
    rationale: `The 25× multiplier (4% Safe Withdrawal Rate) is the global standard — it assumes your corpus earns ~7% real returns and you withdraw 4% annually, with inflation baked in. At ${age}, you have ${yearsToRetirement} compounding years left — the most valuable years for equity growth.`,
    fundRecommendation: `${equityPct}% equity (flexi-cap index + mid-cap) · ${100 - equityPct}% debt (PPF / NPS Tier-I). Shift to conservative hybrid after age 50. NPS Tier-I adds ₹50K extra deduction under 80CCD(1B).`,
    actionStep: `Start or top up a flexi-cap SIP and open NPS Tier-I for the ₹50,000 80CCD(1B) deduction — this saves ₹15,600 in income tax annually on top of the 80C limit.`,
  });

  // ── Home Down Payment ─────────────────────────────────────────
  if (age < 48 && horizonYears > 5) {
    const estimatedHomeValue = monthlyIncome * 60;
    const downPayment = estimatedHomeValue * 0.20;
    const homeYears = Math.min(7, horizonYears - 2);
    const homeCurrentBase = Math.min(liquidValue * 0.30, downPayment);
    const homeFv = fvCalc(homeCurrentBase, homeYears, 0.10);
    const homeGap = Math.max(0, downPayment - homeFv);
    const homeSip = futureSipNeeded(homeGap, homeYears, Math.pow(1.10, 1 / 12) - 1);
    const maxEmi = Math.round(monthlyIncome * 0.40);

    goals.push({
      id: "home",
      label: "Home Down Payment",
      icon: Home,
      color: "#df6ccf",
      softBg: "rgba(223,108,207,0.09)",
      target: downPayment,
      current: homeCurrentBase,
      yearsLeft: homeYears,
      returnRate: 0.10,
      ruleLabel: "20% down · 40% EMI rule",
      description: `Target down payment of ${formatInrCompact(Math.round(downPayment))} (20% on an estimated ${formatInrCompact(estimatedHomeValue)} home, based on 5× your annual salary). ${formatInrCompact(Math.round(homeCurrentBase))} in liquid assets is notionally allocated today; at 10% pa this grows to ${formatInrCompact(Math.round(homeFv))} in ${homeYears} years, covering ${Math.round((homeFv / downPayment) * 100)}% of the target.${homeGap > 0 ? ` A ${formatInrCompact(Math.round(homeSip))}/mo SIP bridges the gap.` : " You are on track."} Your safe EMI ceiling (40% income) is ${formatInr(maxEmi)}/mo.`,
      rationale: `A 20% down payment avoids LMI-equivalent costs, lowers total loan interest paid by lakhs, and signals creditworthiness. Factor in stamp duty (5–8%), registration, and interiors — the all-in cost runs 10–12% above the property price.`,
      fundRecommendation: "Balanced Advantage Fund / BAF (auto-rebalances equity when markets get expensive — protects your corpus from a crash near purchase date) · Short-duration debt fund · Bank RD maturing 3 months before purchase.",
      actionStep: `Start a BAF SIP of ${formatInrCompact(Math.round(homeSip))}/mo and set a separate RD maturing at your target purchase date to lock in a guaranteed sum.`,
    });
  }

  // ── Child's Education ─────────────────────────────────────────
  if (dependents > 0) {
    const educationYears = Math.max(5, 18 - Math.max(0, age - 30));
    const inflatedPerChild = 3500000 * Math.pow(1.07, educationYears);
    const inflatedEduTarget = inflatedPerChild * dependents;
    const eduCurrentBase = Math.min(liquidValue * 0.15, inflatedEduTarget);
    const eduFv = fvCalc(eduCurrentBase, educationYears, 0.11);
    const eduGap = Math.max(0, inflatedEduTarget - eduFv);
    const eduSip = futureSipNeeded(eduGap, educationYears, Math.pow(1.11, 1 / 12) - 1);

    goals.push({
      id: "education",
      label: dependents > 1 ? `Children's Education (×${dependents})` : "Child's Education",
      icon: GraduationCap,
      color: "#e3bb65",
      softBg: "rgba(227,187,101,0.12)",
      target: inflatedEduTarget,
      current: Math.min(eduCurrentBase, inflatedEduTarget),
      yearsLeft: educationYears,
      returnRate: 0.11,
      ruleLabel: "7% education inflation",
      description: `A 4-year professional degree costs ₹35L per child today; at 7% education inflation, that becomes ${formatInrCompact(Math.round(inflatedPerChild))} per child when your ${dependents > 1 ? "children enrol" : "child enrols"} in ${educationYears} years (total target: ${formatInrCompact(Math.round(inflatedEduTarget))}). ${formatInrCompact(Math.round(eduCurrentBase))} is notionally allocated today; growing at 11% pa it projects to ${formatInrCompact(Math.round(eduFv))} — covering ${Math.round((eduFv / inflatedEduTarget) * 100)}% of the inflated target.${eduGap > 0 ? ` A ${formatInrCompact(Math.round(eduSip / dependents))}/child/mo SIP closes the gap.` : " You are on track."}`,
      rationale: `Education inflation in India consistently runs 7–10% pa. Waiting even 3 years before starting roughly doubles the required monthly SIP, as you lose critical early compounding. An ELSS SIP doubles as a tax-saving instrument (80C) in the early years while building the equity corpus.`,
      fundRecommendation: "ELSS fund (80C deduction + equity returns, 3-yr lock-in aligns with discipline) · Multi-cap index fund (core long-horizon compounder) · Sukanya Samriddhi Yojana for daughters aged < 10 (8.2% guaranteed, tax-free maturity) · Shift to conservative hybrid in final 3 years.",
      actionStep: `Open an ELSS SIP per child to double-dip: 80C deduction every year while building the education corpus, and consider SSY if you have a daughter under 10 — ₹1.5L pa qualifies for 80C and matures tax-free.`,
    });
  }

  return goals;
}

// ── Progress ring ──────────────────────────────────────────────────
function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, pct) / 100) * circ;
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(23,20,28,0.07)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none" style={{ color }}>{Math.round(pct)}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-[#17141c]/38">funded</span>
      </div>
    </div>
  );
}

// ── Goal card ──────────────────────────────────────────────────────
function GoalCard({ goal }: { goal: Goal }) {
  const rateMonthly = Math.pow(1 + goal.returnRate, 1 / 12) - 1;
  const fvCurrent = fvCalc(goal.current, goal.yearsLeft, goal.returnRate);
  const gap = Math.max(0, goal.target - fvCurrent);
  const sipNeeded = futureSipNeeded(gap, goal.yearsLeft, rateMonthly);
  const pct = Math.min(100, (fvCurrent / goal.target) * 100);
  const onTrack = pct >= 80;
  const Icon = goal.icon;

  return (
    <div className="rounded-[24px] border border-[#17141c]/8 bg-white/62 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
            style={{ background: goal.softBg, color: goal.color }}
          >
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#17141c]">{goal.label}</p>
            <p className="mt-0.5 text-xs text-[#17141c]/50">
              {goal.yearsLeft} year{goal.yearsLeft !== 1 ? "s" : ""} away · {(goal.returnRate * 100).toFixed(0)}% pa · {goal.ruleLabel}
            </p>
          </div>
        </div>
        <ProgressRing pct={pct} color={goal.color} />
      </div>

      {/* Rich description */}
      <p className="mt-3 text-xs leading-relaxed text-[#17141c]/65">
        {goal.description}
      </p>

      {/* Rationale in muted italics */}
      <p className="mt-2 text-[11px] italic leading-relaxed text-[#17141c]/42">
        {goal.rationale}
      </p>

      {/* Key numbers — 3 col */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Target",          value: formatInrCompact(Math.round(goal.target))  },
          { label: "Projected value", value: formatInrCompact(Math.round(fvCurrent))   },
          { label: "Gap",             value: gap > 0 ? formatInrCompact(Math.round(gap)) : "None" },
        ].map(item => (
          <div key={item.label} className="rounded-[14px] bg-[#17141c]/4 px-3 py-2.5">
            <p className="text-[10px] text-[#17141c]/45">{item.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-[#17141c]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* SIP or on-track banner */}
      {onTrack ? (
        <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-[rgba(39,179,134,0.09)] px-3.5 py-2.5">
          <span className="text-sm text-[#11765a]">✓</span>
          <p className="text-xs font-medium text-[#11765a]">
            On track — projected to reach {Math.round(pct)}% of target at current growth rate.
          </p>
        </div>
      ) : (
        <div
          className="mt-3 flex items-center justify-between rounded-[14px] px-3.5 py-2.5"
          style={{ background: goal.softBg }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: goal.color }}>
              SIP needed to close the gap
            </p>
            <p className="mt-0.5 text-xs text-[#17141c]/50">
              at {(goal.returnRate * 100).toFixed(0)}% pa over {goal.yearsLeft} yr{goal.yearsLeft !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-xl font-bold" style={{ color: goal.color }}>
            {formatInrCompact(Math.round(sipNeeded))}
            <span className="text-xs font-normal text-[#17141c]/45">/mo</span>
          </p>
        </div>
      )}

      {/* Fund recommendation */}
      <div
        className="mt-3 rounded-[14px] border border-[#17141c]/7 bg-[#17141c]/[0.025] px-3.5 py-2.5"
      >
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/38">
          Where to invest
        </p>
        <p className="text-xs leading-relaxed text-[#17141c]/62">{goal.fundRecommendation}</p>
      </div>

      {/* Action step */}
      <p className="mt-2.5 text-xs leading-relaxed text-[#17141c]/55">
        <span className="font-semibold" style={{ color: goal.color }}>→ </span>
        {goal.actionStep}
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export function GoalsPanel({ portfolio }: { portfolio: UnifiedPortfolio }) {
  const goals = buildGoals(portfolio);
  const fundedGoals = goals.filter(g => {
    const fvC = fvCalc(g.current, g.yearsLeft, g.returnRate);
    return fvC / g.target >= 0.80;
  }).length;

  return (
    <div className="space-y-5">
      <Panel
        title="Financial goals tracker"
        subtitle="Where this portfolio stands against key life goals — target corpus, projection, SIP to close the gap, fund picks, and a concrete first step."
        accent
      >
        {/* Summary */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Goals tracked",  value: String(goals.length),                color: "#17141c"                                              },
            { label: "On track",       value: String(fundedGoals),                 color: "#11765a"                                              },
            { label: "Need attention", value: String(goals.length - fundedGoals),  color: goals.length - fundedGoals > 0 ? "#9a6f14" : "#11765a" },
          ].map(stat => (
            <div key={stat.label} className="rounded-[18px] border border-[#17141c]/7 bg-white/62 px-4 py-3 text-center">
              <p className="text-2xl font-semibold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-[#17141c]/50">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-start gap-2.5 rounded-[18px] border border-[#e3bb65]/22 bg-[#e3bb65]/8 px-4 py-3">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#9a6f14]" />
          <p className="text-xs leading-relaxed text-[#17141c]/70">
            Each card shows the projected value of what&apos;s currently allocated, the funding gap, the monthly SIP needed
            to close it, where to invest, and a concrete first step — all using your actual portfolio numbers.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        <WhyNote>
          Projections assume stated annual returns with monthly compounding and 6% annual expense inflation.
          The 25× retirement multiplier assumes a 4% safe withdrawal rate. Fund suggestions are illustrative —
          not personalised investment advice. Consult a SEBI-registered investment adviser before acting.
        </WhyNote>
      </Panel>
    </div>
  );
}
