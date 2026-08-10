import type { PortfolioAnalysis } from "@/types/analysis";
import type { Holding, UnifiedPortfolio } from "@/types/portfolio";
import { ASSET_CLASS_COLOR, ASSET_CLASS_LABEL } from "@/lib/analytics/fund-taxonomy";
import { formatInr } from "@/lib/utils";

const SEVERITY_STYLE = {
  critical: { label: "Needs attention", color: "#c0343c", bg: "#fef2f2" },
  warning:  { label: "Worth reviewing",  color: "#9a6f14", bg: "#fefce8" },
  info:     { label: "Good to know",     color: "#3f7f90", bg: "#f0f9ff" },
  positive: { label: "Looking healthy",  color: "#11765a", bg: "#f0fdf4" },
} as const;

const HEALTH_BAND = {
  poor:   { color: "#c0343c", label: "Poor"   },
  fair:   { color: "#9a6f14", label: "Fair"   },
  good:   { color: "#3f7f90", label: "Good"   },
  strong: { color: "#11765a", label: "Strong" },
} as const;

// ── helpers ──────────────────────────────────────────────────────────────────

function holdingName(h: Holding): string {
  switch (h.kind) {
    case "equity":        return h.name;
    case "mutual_fund":   return h.schemeName;
    case "bond":          return `${h.issuer} Bond`;
    case "reit":
    case "invit":         return h.name;
    case "gold":          return `Gold (${h.form.toUpperCase()})`;
    case "epf":           return h.scheme.toUpperCase();
    case "fixed_deposit": return `${h.bank} FD`;
    case "cash":          return `${h.bank} Savings`;
  }
}

function holdingType(h: Holding): string {
  const m: Record<Holding["kind"], string> = {
    equity: "Stock", mutual_fund: "Mutual Fund", bond: "Bond",
    reit: "REIT", invit: "InvIT", gold: "Gold",
    epf: "Retirement", fixed_deposit: "Fixed Deposit", cash: "Cash",
  };
  return m[h.kind];
}

// ── shared inline-style constants ────────────────────────────────────────────

const AVOID: React.CSSProperties = { breakInside: "avoid", pageBreakInside: "avoid" };
const KEEP_WITH_NEXT: React.CSSProperties = { breakAfter: "avoid", pageBreakAfter: "avoid" };

const TH: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#6d6875",
  padding: "0 12px 8px 12px", textAlign: "left", borderBottom: "2px solid #e8e5ee",
};

const TD: React.CSSProperties = { fontSize: 12, padding: "7px 12px", verticalAlign: "top" };

function Bar({ pct, color, height = 5 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ height, background: "#e8e5ee", borderRadius: height, overflow: "hidden", marginTop: 5 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: height }} />
    </div>
  );
}

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <div style={{
      ...KEEP_WITH_NEXT,
      display: "flex", alignItems: "center", gap: 10,
      borderBottom: "1px solid #e8e5ee", paddingBottom: 10, marginBottom: 16,
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: "50%",
        background: "#8f78ff", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
      }}>{n}</span>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17141c", margin: 0 }}>{title}</h2>
    </div>
  );
}

function InfoCard({ label, value, cap }: { label: string; value: string; cap?: boolean }) {
  return (
    <div style={{ padding: "10px 14px", background: "#faf9fc", borderRadius: 8, border: "1px solid #e8e5ee" }}>
      <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 700, margin: "3px 0 0", textTransform: cap ? "capitalize" : undefined }}>{value}</p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function ReportDocument({ analysis, portfolio }: { analysis: PortfolioAnalysis; portfolio: UnifiedPortfolio }) {
  const asOf = new Date(portfolio.generatedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const totalValue = analysis.allocation.totalValue;
  const sortedHoldings = [...portfolio.holdings].sort((a, b) => b.currentValue - a.currentValue);
  const criticalCount = analysis.findings.filter(f => f.severity === "critical").length;
  const warningCount  = analysis.findings.filter(f => f.severity === "warning").length;
  const bandStyle     = HEALTH_BAND[analysis.healthScore.band];

  const sectionStyle: React.CSSProperties = { marginBottom: 28 };

  return (
    <div id="report-root" style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      color: "#17141c",
      background: "#fff",
      maxWidth: 760,
      margin: "0 auto",
      padding: "32px 44px 40px",
      fontSize: 12,
      lineHeight: 1.55,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    } as React.CSSProperties}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { size: A4; margin: 18mm 14mm 22mm 14mm; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { border-collapse: collapse; width: 100%; }
      `}</style>

      {/* ── COVER HEADER ─────────────────────────────────────────────── */}
      <header style={{ ...AVOID, borderBottom: "3px solid #8f78ff", paddingBottom: 24, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vantage-logo.png" alt="Vantage" style={{ height: 34, display: "block", marginBottom: 6 }} />
            <p style={{ fontSize: 9, color: "#6d6875", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
              Portfolio Intelligence Report
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: "#6d6875", lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, color: "#17141c", fontSize: 11 }}>Confidential</p>
            <p>Generated {generatedOn}</p>
            <p>Data as of {asOf}</p>
          </div>
        </div>

        <div style={{
          marginTop: 20,
          background: "linear-gradient(135deg, #f8f6ff 0%, #fdf5fc 100%)",
          borderRadius: 10, padding: "18px 22px",
          border: "1px solid rgba(143,120,255,0.15)",
        }}>
          <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Prepared for</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginTop: 2, color: "#17141c" }}>{analysis.investorName ?? "Investor"}</p>
          <div style={{ display: "flex", gap: 36, marginTop: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Portfolio Value</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#8f78ff", marginTop: 1 }}>{formatInr(totalValue)}</p>
            </div>
            <div>
              <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Health Score</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: bandStyle.color, marginTop: 1 }}>
                {analysis.healthScore.score}/100{" "}
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6d6875" }}>({bandStyle.label})</span>
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk Capacity</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#17141c", marginTop: 1, textTransform: "capitalize" }}>
                {analysis.riskProfile.derivedCategory}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Holdings</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#17141c", marginTop: 1 }}>{portfolio.holdings.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── 01 EXECUTIVE SUMMARY ─────────────────────────────────────── */}
      <section style={{ ...AVOID, ...sectionStyle }}>
        <SectionHeading n="01" title="Executive Summary" />
        <p style={{ fontSize: 12, lineHeight: 1.7, color: "#3d3649" }}>
          This report provides a comprehensive analysis of{" "}
          <strong>{analysis.investorName ?? "the investor"}</strong>&apos;s portfolio comprising{" "}
          <strong>{portfolio.holdings.length} holdings</strong> across{" "}
          <strong>{analysis.allocation.slices.length} asset classes</strong>, consolidated from{" "}
          {new Set(portfolio.holdings.map(h => h.source)).size} data sources. The portfolio has been
          evaluated against reference allocations for a{" "}
          <strong>{analysis.riskProfile.derivedCategory}</strong> risk profile, with look-through
          analysis applied to {analysis.overlap?.analysedFunds.length ?? 0} mutual fund holdings.
        </p>
        {(criticalCount > 0 || warningCount > 0) && (
          <div style={{
            marginTop: 10, padding: "9px 13px",
            background: criticalCount > 0 ? "#fef2f2" : "#fefce8",
            borderRadius: 7, borderLeft: `3px solid ${criticalCount > 0 ? "#c0343c" : "#9a6f14"}`,
            fontSize: 11, color: criticalCount > 0 ? "#991b1b" : "#854d0e",
          }}>
            {criticalCount > 0 && <><strong>{criticalCount} critical finding{criticalCount > 1 ? "s" : ""}</strong> and{" "}</>}
            <strong>{warningCount} warning{warningCount !== 1 ? "s" : ""}</strong> identified — see Section 06.
          </div>
        )}
      </section>

      {/* ── 02 ASSET ALLOCATION ──────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="02" title="Asset Allocation" />

        {/* stacked bar */}
        <div style={{ ...AVOID }}>
          <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
            {analysis.allocation.slices.map(s => (
              <div key={s.assetClass} style={{ width: `${s.percent}%`, background: s.color, minWidth: s.percent > 0 ? 2 : 0 }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginBottom: 16 }}>
            {analysis.allocation.slices.map(s => (
              <span key={s.assetClass} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6d6875" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                {s.label} <strong style={{ color: "#17141c" }}>{s.percent}%</strong>
              </span>
            ))}
          </div>
        </div>

        {/* drift table — let rows flow across pages if needed */}
        <table>
          <thead>
            <tr>
              <th style={TH}>Asset Class</th>
              <th style={{ ...TH, textAlign: "right" }}>Actual</th>
              <th style={{ ...TH, textAlign: "right" }}>Reference</th>
              <th style={{ ...TH, textAlign: "right" }}>Drift</th>
              <th style={{ ...TH, textAlign: "right" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {analysis.allocation.drift.map((d, i) => {
              const slice = analysis.allocation.slices.find(s => s.assetClass === d.assetClass);
              const dc = d.direction === "over" ? "#c0343c" : d.direction === "under" ? "#9a6f14" : "#11765a";
              return (
                <tr key={d.assetClass} style={{ background: i % 2 === 0 ? "#faf9fc" : "#fff", ...AVOID }}>
                  <td style={TD}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: slice?.color ?? "#ccc", display: "inline-block", flexShrink: 0 }} />
                      {ASSET_CLASS_LABEL[d.assetClass] ?? d.assetClass}
                    </span>
                  </td>
                  <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{d.actualPercent}%</td>
                  <td style={{ ...TD, textAlign: "right", color: "#6d6875" }}>{d.targetPercent}%</td>
                  <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: dc }}>
                    {d.direction === "on_target" ? "On target" : `${d.driftPercent > 0 ? "+" : ""}${d.driftPercent} pts`}
                  </td>
                  <td style={{ ...TD, textAlign: "right", color: "#6d6875" }}>{formatInr(slice?.value ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.allocation.why}</p>
      </section>

      {/* ── 03 HEALTH SCORE ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="03" title="Portfolio Health Score" />
        <div style={{ ...AVOID, display: "flex", gap: 20, alignItems: "flex-start", padding: "18px 20px", background: "linear-gradient(135deg,#f8f6ff,#f0fdf4)", borderRadius: 10, border: "1px solid rgba(143,120,255,0.12)" }}>
          {/* score ring */}
          <div style={{ textAlign: "center", flexShrink: 0, minWidth: 72 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              border: `4px solid ${bandStyle.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fff",
            }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: bandStyle.color }}>{analysis.healthScore.score}</span>
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, color: bandStyle.color, marginTop: 5 }}>{bandStyle.label}</p>
          </div>
          {/* bars */}
          <div style={{ flex: 1 }}>
            {analysis.healthScore.components.map(c => (
              <div key={c.key} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#6d6875" }}>
                    {c.label}{" "}
                    <span style={{ fontSize: 10, color: "#b8b3c0" }}>({(c.weight * 100).toFixed(0)}% wt)</span>
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{c.score}/100</span>
                </div>
                <div style={{ height: 5, background: "#e8e5ee", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${c.score}%`, height: "100%", borderRadius: 3,
                    background: c.score >= 70 ? "#27b386" : c.score >= 40 ? "#e3bb65" : "#c0343c",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.healthScore.why}</p>
      </section>

      {/* ── 04 RISK PROFILE ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="04" title="Risk Profile Assessment" />
        <div style={{ ...AVOID }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <InfoCard label="Stated Risk Appetite" value={analysis.riskProfile.statedCategory} cap />
            <InfoCard label="Derived Risk Capacity" value={analysis.riskProfile.derivedCategory} cap />
            <InfoCard label="Capacity Score" value={`${analysis.riskProfile.capacityScore}/100`} />
          </div>

          {analysis.riskProfile.isMismatched && (
            <div style={{
              marginBottom: 12, padding: "8px 12px", borderRadius: 7,
              background: "#fefce8", borderLeft: "3px solid #9a6f14",
              fontSize: 11, color: "#854d0e",
            }}>
              <strong>Mismatch:</strong> Stated <em>{analysis.riskProfile.statedCategory}</em> vs derived{" "}
              <em>{analysis.riskProfile.derivedCategory}</em> based on age, horizon, and dependents.
            </div>
          )}

          <p style={{ fontSize: 9, fontWeight: 700, color: "#6d6875", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Target allocation for {analysis.riskProfile.derivedCategory} profile
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(analysis.riskProfile.targetAllocation)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <div key={k} style={{
                  padding: "7px 12px", borderRadius: 7,
                  background: "#faf9fc", border: "1px solid #e8e5ee",
                  textAlign: "center", minWidth: 60,
                }}>
                  <p style={{ fontSize: 9, color: "#6d6875", textTransform: "uppercase" }}>
                    {ASSET_CLASS_LABEL[k as keyof typeof ASSET_CLASS_LABEL] ?? k}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: ASSET_CLASS_COLOR[k as keyof typeof ASSET_CLASS_COLOR] ?? "#17141c" }}>
                    {v}%
                  </p>
                </div>
              ))}
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.riskProfile.why}</p>
      </section>

      {/* ── 05 CONCENTRATION ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="05" title="Concentration Analysis" />
        <div style={{ ...AVOID, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {/* Top issuers */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 8 }}>Top equity holdings</p>
            {analysis.concentration.topIssuers.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9f9aa8" }}>No directly held stocks.</p>
            ) : analysis.concentration.topIssuers.slice(0, 5).map(iss => (
              <div key={iss.name} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#3d3649", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{iss.name}</span>
                  <strong>{iss.percentOfEquity}%</strong>
                </div>
                <Bar pct={iss.percentOfEquity} color="#8f78ff" />
              </div>
            ))}
          </div>

          {/* Fund houses */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 8 }}>Fund house concentration</p>
            {analysis.concentration.amcConcentration.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9f9aa8" }}>No mutual funds.</p>
            ) : analysis.concentration.amcConcentration.map(a => (
              <div key={a.amc} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#3d3649", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {a.amc.replace(" Mutual Fund", "")}
                  </span>
                  <strong>{a.percentOfMutualFunds}%</strong>
                </div>
                <Bar pct={a.percentOfMutualFunds} color={a.percentOfMutualFunds >= 50 ? "#df6ccf" : "#5bb7c9"} />
                <p style={{ fontSize: 9, color: "#9f9aa8", marginTop: 2 }}>{a.schemeCount} scheme{a.schemeCount !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>

          {/* Market cap + Herfindahl */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 8 }}>Market cap split</p>
            {(["large", "mid", "small"] as const)
              .filter(b => (analysis.concentration.marketCapSplit[b] ?? 0) > 0)
              .map(b => (
                <div key={b} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "#3d3649", textTransform: "capitalize" }}>{b} cap</span>
                    <strong>{analysis.concentration.marketCapSplit[b]}%</strong>
                  </div>
                  <Bar pct={analysis.concentration.marketCapSplit[b] ?? 0}
                    color={b === "large" ? "#8f78ff" : b === "mid" ? "#df6ccf" : "#e3bb65"} />
                </div>
              ))}
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#faf9fc", borderRadius: 7, border: "1px solid #e8e5ee" }}>
              <p style={{ fontSize: 9, color: "#6d6875" }}>Herfindahl Index</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{analysis.concentration.herfindahlIndex.toFixed(3)}</p>
              <p style={{ fontSize: 9, color: "#9f9aa8" }}>
                {analysis.concentration.herfindahlIndex >= 0.18 ? "Above 0.18 caution threshold" : "Below 0.18 caution threshold"}
              </p>
            </div>
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.concentration.why}</p>
      </section>

      {/* ── 06 FINDINGS ──────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="06" title="Key Findings & Recommendations" />
        {analysis.findings.map(f => {
          const s = SEVERITY_STYLE[f.severity];
          return (
            <div key={f.id} style={{
              ...AVOID,
              marginBottom: 10, borderRadius: 9,
              border: "1px solid #e8e5ee", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderLeft: `3px solid ${s.color}` }}>
                <span style={{
                  display: "inline-block", padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap",
                  fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
                  background: s.bg, color: s.color, marginTop: 2, flexShrink: 0,
                }}>
                  {s.label}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#17141c", lineHeight: 1.35, marginBottom: 5 }}>{f.title}</p>
                  <p style={{ fontSize: 11, color: "#3d3649", lineHeight: 1.6, marginBottom: f.evidence.length ? 8 : 0 }}>{f.detail}</p>

                  {f.evidence.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: f.suggestedAction ? 8 : 0 }}>
                      {f.evidence.map(ev => (
                        <span key={`${f.id}-${ev.label}`} style={{
                          display: "inline-block", padding: "3px 8px",
                          background: "#faf9fc", borderRadius: 5,
                          border: "1px solid #e8e5ee", fontSize: 10,
                        }}>
                          <span style={{ color: "#6d6875" }}>{ev.label}:</span>{" "}
                          <strong style={{ color: "#17141c" }}>{ev.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {f.suggestedAction && (
                    <div style={{ padding: "6px 10px", background: s.bg, borderRadius: 5, fontSize: 10 }}>
                      <span style={{ fontWeight: 700, color: s.color }}>Action: </span>
                      <span style={{ color: "#3d3649" }}>{f.suggestedAction}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── 07 BENCHMARK ─────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n="07" title="Benchmark Comparison" />

        <div style={{ ...AVOID }}>
          {/* verdict row */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24,
            padding: "12px 16px", borderRadius: 9, marginBottom: 14,
            background: analysis.benchmark.shapeMismatch
              ? (analysis.benchmark.closestBand === "aggressive" ? "#fef2f2" : "#fefce8")
              : "#f0fdf4",
            border: "1px solid #e8e5ee",
          }}>
            <div>
              <p style={{ fontSize: 8, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Portfolio built like</p>
              <p style={{ fontSize: 16, fontWeight: 700, textTransform: "capitalize", marginTop: 1 }}>{analysis.benchmark.closestBand}</p>
            </div>
            <span style={{ fontSize: 16, color: "#9f9aa8" }}>→</span>
            <div>
              <p style={{ fontSize: 8, color: "#6d6875", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Circumstances suggest</p>
              <p style={{ fontSize: 16, fontWeight: 700, textTransform: "capitalize", marginTop: 1 }}>{analysis.benchmark.derivedBand}</p>
            </div>
            <p style={{ fontSize: 10, color: "#6d6875", maxWidth: "28ch", lineHeight: 1.5 }}>
              {analysis.benchmark.shapeMismatch
                ? analysis.benchmark.closestBand === "aggressive"
                  ? "Carrying more risk than circumstances support."
                  : "Carrying less risk than horizon could support."
                : "Portfolio shape matches your circumstances."}
            </p>
          </div>
        </div>

        {/* detailed table */}
        {(() => {
          const own = analysis.benchmark.comparisons.find(c => c.band === analysis.benchmark.derivedBand);
          if (!own) return null;
          return (
            <>
              <p style={{ ...KEEP_WITH_NEXT, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 6 }}>
                Against your {analysis.benchmark.derivedBand} reference
              </p>
              <table>
                <thead>
                  <tr>
                    <th style={TH}>Asset class</th>
                    <th style={{ ...TH, textAlign: "right" }}>You hold</th>
                    <th style={{ ...TH, textAlign: "right" }}>Reference</th>
                    <th style={{ ...TH, textAlign: "right" }}>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {own.rows.map((r, i) => (
                    <tr key={r.assetClass} style={{ background: i % 2 === 0 ? "#faf9fc" : "#fff", ...AVOID }}>
                      <td style={TD}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, display: "inline-block", flexShrink: 0 }} />
                          {r.label}
                        </span>
                      </td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{r.actualPercent}%</td>
                      <td style={{ ...TD, textAlign: "right", color: "#6d6875" }}>{r.referencePercent}%</td>
                      <td style={{
                        ...TD, textAlign: "right", fontWeight: 600,
                        color: Math.abs(r.driftPercent) < 3 ? "#6d6875" : r.driftPercent > 0 ? "#c0343c" : "#9a6f14",
                      }}>
                        {r.driftPercent > 0 ? "+" : ""}{r.driftPercent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}
        <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.benchmark.why}</p>
      </section>

      {/* ── 08 FUND OVERLAP ──────────────────────────────────────────── */}
      {analysis.overlap && (
        <section style={sectionStyle}>
          <SectionHeading n="08" title="Fund Overlap Analysis" />

          <div style={{ ...AVOID }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              <InfoCard label="Equity owned more than once" value={`${analysis.overlap.overlapPercentOfEquity}%`} />
              <InfoCard label="Duplicated companies" value={String(analysis.overlap.duplicatedIssuers.length)} />
              <InfoCard label="Funds analysed" value={String(analysis.overlap.analysedFunds.length)} />
            </div>
          </div>

          {analysis.overlap.duplicatedIssuers.length > 0 && (
            <>
              <p style={{ ...KEEP_WITH_NEXT, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 6 }}>
                Companies held through multiple routes
              </p>
              <table style={{ marginBottom: 14 }}>
                <thead>
                  <tr>
                    <th style={TH}>Company</th>
                    <th style={{ ...TH, textAlign: "right" }}>% of Equity</th>
                    <th style={{ ...TH, textAlign: "right" }}>Value</th>
                    <th style={{ ...TH, textAlign: "right" }}>Routes</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.overlap.duplicatedIssuers.slice(0, 8).map((iss, i) => (
                    <tr key={iss.name} style={{ background: i % 2 === 0 ? "#faf9fc" : "#fff", ...AVOID }}>
                      <td style={{ ...TD, fontWeight: 500 }}>{iss.name}</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{iss.percentOfEquity}%</td>
                      <td style={{ ...TD, textAlign: "right", color: "#6d6875" }}>{formatInr(iss.value)}</td>
                      <td style={{ ...TD, textAlign: "right" }}>{iss.sources.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {analysis.overlap.pairwiseOverlap.length > 0 && (
            <>
              <p style={{ ...KEEP_WITH_NEXT, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6875", marginBottom: 6 }}>
                Fund-to-fund overlap
              </p>
              {analysis.overlap.pairwiseOverlap.map(pair => (
                <div key={`${pair.schemeA}-${pair.schemeB}`} style={{ ...AVOID, padding: "7px 12px", marginBottom: 5, background: "#faf9fc", borderRadius: 7, border: "1px solid #e8e5ee", fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#3d3649" }}>
                      {pair.schemeA.replace(" - Direct Growth", "")} vs {pair.schemeB.replace(" - Direct Growth", "")}
                    </span>
                    <strong style={{ color: pair.overlapPercent >= 25 ? "#c0343c" : "#17141c", flexShrink: 0, marginLeft: 10 }}>
                      {pair.overlapPercent}% overlap
                    </strong>
                  </div>
                  <p style={{ fontSize: 9, color: "#9f9aa8", marginTop: 2 }}>
                    {pair.sharedIssuers.length} shared names{pair.sameAmc ? " · same fund house" : ""}
                  </p>
                </div>
              ))}
            </>
          )}
          <p style={{ marginTop: 8, fontSize: 10, color: "#9f9aa8", lineHeight: 1.55 }}>{analysis.overlap.why}</p>
        </section>
      )}

      {/* ── 09 HOLDINGS SCHEDULE ─────────────────────────────────────── */}
      <section style={sectionStyle}>
        <SectionHeading n={analysis.overlap ? "09" : "08"} title="Complete Holdings Schedule" />
        <table>
          <thead>
            <tr>
              <th style={{ ...TH, width: 24 }}>#</th>
              <th style={TH}>Holding</th>
              <th style={TH}>Type</th>
              <th style={{ ...TH, textAlign: "right" }}>Value</th>
              <th style={{ ...TH, textAlign: "right" }}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((h, i) => (
              <tr key={h.id} style={{ background: i % 2 === 0 ? "#faf9fc" : "#fff", ...AVOID }}>
                <td style={{ ...TD, color: "#9f9aa8", fontSize: 10 }}>{i + 1}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{holdingName(h)}</td>
                <td style={{ ...TD, color: "#6d6875" }}>{holdingType(h)}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{formatInr(h.currentValue)}</td>
                <td style={{ ...TD, textAlign: "right", color: "#6d6875" }}>
                  {totalValue > 0 ? ((h.currentValue / totalValue) * 100).toFixed(1) : "0"}%
                </td>
              </tr>
            ))}
            <tr style={{ ...AVOID, background: "#f8f6ff", borderTop: "2px solid #8f78ff" }}>
              <td colSpan={3} style={{ ...TD, fontWeight: 700, fontSize: 13 }}>Total</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 700, fontSize: 13, color: "#8f78ff" }}>{formatInr(totalValue)}</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>100%</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ── FOOTER / DISCLAIMER ──────────────────────────────────────── */}
      <footer style={{ ...AVOID, borderTop: "2px solid #e8e5ee", paddingTop: 18, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vantage-logo.png" alt="Vantage" style={{ height: 22, opacity: 0.45 }} />
          <p style={{ fontSize: 9, color: "#9f9aa8", textAlign: "right", lineHeight: 1.6 }}>
            Report ID: {analysis.portfolioId.toUpperCase()}<br />
            {new Date().toISOString()}
          </p>
        </div>
        <div style={{ padding: "12px 16px", background: "#faf9fc", borderRadius: 8, border: "1px solid #e8e5ee" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#6d6875", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
            Important Disclaimer
          </p>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: "#6d6875" }}>
            This report is generated using synthetic data for demonstration purposes only. Every holding, value
            and folio number shown is invented. Reference allocations are illustrative rules of thumb, not
            personalised investment advice. Vantage is a read-only analysis layer — it never holds, moves or
            manages your money. The analysis is rule-based and transparent; no machine-learning model is involved
            in scoring or recommendations. Consult a SEBI-registered investment advisor before making any
            financial decisions.
          </p>
        </div>
        <p style={{ fontSize: 9, color: "#b8b3c0", textAlign: "center", marginTop: 12 }}>
          Powered by Vantage · Portfolio Intelligence Platform
        </p>
      </footer>
    </div>
  );
}
