import { Download, ExternalLink, FileText, CheckCircle2, AlertTriangle, Info, AlertOctagon } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";
import type { PortfolioAnalysis } from "@/types/analysis";
import type { UnifiedPortfolio } from "@/types/portfolio";
import { formatInr, formatInrCompact } from "@/lib/utils";

const SEVERITY_COLOR = {
  critical: "#c0343c",
  warning: "#9a6f14",
  info: "#3f7f90",
  positive: "#11765a",
} as const;

const SEVERITY_BG = {
  critical: "rgba(224,87,92,0.09)",
  warning: "rgba(227,187,101,0.12)",
  info: "rgba(91,183,201,0.10)",
  positive: "rgba(39,179,134,0.10)",
} as const;

const SEVERITY_ICON = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
  positive: CheckCircle2,
} as const;

const HEALTH_BAND_COLOR = {
  poor: "#c0343c",
  fair: "#9a6f14",
  good: "#3f7f90",
  strong: "#11765a",
} as const;

export function ReportPanel({
  analysis,
  portfolio,
  portfolioKey,
}: {
  analysis: PortfolioAnalysis;
  portfolio: UnifiedPortfolio;
  portfolioKey: string;
}) {
  const asOf = new Date(portfolio.generatedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const bandColor = HEALTH_BAND_COLOR[analysis.healthScore.band];
  const critical = analysis.findings.filter(f => f.severity === "critical").length;
  const warnings = analysis.findings.filter(f => f.severity === "warning").length;

  const SECTIONS = [
    { n: "01", title: "Executive Summary", preview: `${portfolio.holdings.length} holdings · ${analysis.allocation.slices.length} asset classes · ${new Set(portfolio.holdings.map(h => h.source)).size} data sources` },
    { n: "02", title: "Asset Allocation", preview: analysis.allocation.slices.map(s => `${s.label} ${s.percent}%`).join(" · ") },
    { n: "03", title: "Portfolio Health Score", preview: `${analysis.healthScore.score}/100 — ${analysis.healthScore.band.charAt(0).toUpperCase() + analysis.healthScore.band.slice(1)}` },
    { n: "04", title: "Risk Profile Assessment", preview: `Derived ${analysis.riskProfile.derivedCategory} · Capacity ${analysis.riskProfile.capacityScore}/100` },
    { n: "05", title: "Concentration Analysis", preview: `Herfindahl ${analysis.concentration.herfindahlIndex.toFixed(3)} · ${analysis.concentration.amcConcentration.length} fund house${analysis.concentration.amcConcentration.length !== 1 ? "s" : ""}` },
    { n: "06", title: "Key Findings & Recommendations", preview: `${analysis.findings.length} findings · ${critical} critical · ${warnings} warnings` },
    { n: "07", title: "Benchmark Comparison", preview: `Built like ${analysis.benchmark.closestBand} · Circumstances suggest ${analysis.benchmark.derivedBand}` },
    ...(analysis.overlap ? [{ n: "08", title: "Fund Overlap Analysis", preview: `${analysis.overlap.overlapPercentOfEquity}% equity owned more than once · ${analysis.overlap.duplicatedIssuers.length} duplicated companies` }] : []),
    { n: analysis.overlap ? "09" : "08", title: "Complete Holdings Schedule", preview: `${portfolio.holdings.length} holdings · Total ${formatInrCompact(analysis.allocation.totalValue)}` },
  ];

  return (
    <div className="space-y-5">
      {/* ── Cover card ── */}
      <Panel title="Portfolio Intelligence Report" subtitle="A full PDF breakdown of this portfolio — ready to share with an advisor or keep for your records." accent>
        <div
          className="rounded-[22px] border p-6"
          style={{ background: "linear-gradient(135deg,#f8f6ff,#fdf5fc)", borderColor: "rgba(143,120,255,0.18)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Meta */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#17141c]/40">Prepared for</p>
              <p className="mt-1.5 text-3xl font-semibold text-[#17141c]">{analysis.investorName ?? "Investor"}</p>
              <p className="mt-1 text-sm text-[#17141c]/50">Data as of {asOf}</p>
            </div>

            {/* Key numbers */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#17141c]/40">Portfolio value</p>
                <p className="mt-1.5 text-2xl font-semibold" style={{ color: "#8f78ff" }}>
                  {formatInr(analysis.allocation.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#17141c]/40">Health score</p>
                <p className="mt-1.5 text-2xl font-semibold" style={{ color: bandColor }}>
                  {analysis.healthScore.score}/100
                  <span className="ml-1.5 text-sm font-medium text-[#17141c]/45 capitalize">({analysis.healthScore.band})</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#17141c]/40">Findings</p>
                <p className="mt-1.5 text-2xl font-semibold text-[#17141c]">
                  {analysis.findings.length}
                  {critical > 0 && (
                    <span className="ml-2 text-sm font-medium" style={{ color: "#c0343c" }}>
                      {critical} critical
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Download + preview buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`/api/report?portfolio=${portfolioKey}`}
              download
              className="inline-flex items-center gap-2 rounded-full bg-[#17141c] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,19,28,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <Download size={15} aria-hidden="true" />
              Download Report · PDF
            </a>
            <a
              href={`/report?portfolio=${portfolioKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#17141c]/12 bg-white/70 px-5 py-3 text-sm font-medium text-[#17141c]/70 backdrop-blur-xl transition hover:bg-white hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Preview in browser
            </a>
          </div>
        </div>
      </Panel>

      {/* ── Table of contents ── */}
      <Panel title="What's in the report" subtitle="Nine sections covering every dimension of this portfolio.">
        <div className="space-y-1.5">
          {SECTIONS.map((sec) => (
            <div
              key={sec.n}
              className="flex items-center gap-4 rounded-[18px] border border-[#17141c]/7 bg-white/60 px-4 py-3"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#8f78ff]/10 text-xs font-bold text-[#6953dc]">
                {sec.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#17141c]">{sec.title}</p>
                <p className="mt-0.5 truncate text-xs text-[#17141c]/48">{sec.preview}</p>
              </div>
              <FileText size={14} className="shrink-0 text-[#17141c]/22" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[18px] bg-[#17141c]/4 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#17141c]">Full PDF report · A4 format</p>
            <p className="mt-0.5 text-xs text-[#17141c]/50">
              Includes all 9 sections with charts, tables, Vantage branding and SEBI disclaimer.
            </p>
          </div>
          <a
            href={`/api/report?portfolio=${portfolioKey}`}
            download
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#8f78ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7a64ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
          >
            <Download size={13} aria-hidden="true" />
            Download
          </a>
        </div>
      </Panel>

      {/* ── Top findings preview ── */}
      <Panel title="Top findings preview" subtitle="The first three findings from Section 06, ranked by severity.">
        <div className="space-y-3">
          {analysis.findings.slice(0, 3).map((f) => {
            const Icon = SEVERITY_ICON[f.severity];
            return (
              <div
                key={f.id}
                className="flex items-start gap-3.5 rounded-[18px] border border-[#17141c]/7 px-4 py-3.5"
              >
                <span
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full"
                  style={{ background: SEVERITY_BG[f.severity], color: SEVERITY_COLOR[f.severity] }}
                >
                  <Icon size={14} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-[#17141c]">{f.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#17141c]/55">{f.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[#17141c]/40">
          + {Math.max(0, analysis.findings.length - 3)} more finding{analysis.findings.length - 3 !== 1 ? "s" : ""} in the full report.
        </p>
      </Panel>
    </div>
  );
}
