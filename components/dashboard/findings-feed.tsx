"use client";

import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { Finding, Severity } from "@/types/analysis";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<
  Severity,
  { label: string; short: string; tone: string; soft: string; border: string; icon: typeof Info }
> = {
  critical: {
    label: "Needs attention",
    short: "Needs attention",
    tone: "#c0343c",
    soft: "rgba(224,87,92,0.10)",
    border: "rgba(224,87,92,0.26)",
    icon: AlertOctagon,
  },
  warning: {
    label: "Worth reviewing",
    short: "Worth reviewing",
    tone: "#9a6f14",
    soft: "rgba(227,187,101,0.14)",
    border: "rgba(227,187,101,0.32)",
    icon: AlertTriangle,
  },
  info: {
    label: "Good to know",
    short: "Good to know",
    tone: "#3f7f90",
    soft: "rgba(91,183,201,0.12)",
    border: "rgba(91,183,201,0.28)",
    icon: Info,
  },
  positive: {
    label: "Looking healthy",
    short: "Healthy",
    tone: "#11765a",
    soft: "rgba(39,179,134,0.11)",
    border: "rgba(39,179,134,0.26)",
    icon: CheckCircle2,
  },
};

const ORDER: Severity[] = ["critical", "warning", "info", "positive"];

function FindingRow({ finding, index, defaultOpen }: { finding: Finding; index: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const style = SEVERITY_STYLE[finding.severity];
  const Icon = style.icon;

  return (
    <motion.div
      className="relative overflow-hidden rounded-[22px] border bg-white/62"
      style={{ borderColor: style.border }}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: style.tone }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3.5 p-4 pl-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
      >
        <span
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: style.soft, color: style.tone }}
        >
          <Icon size={16} aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ backgroundColor: style.soft, color: style.tone }}
            >
              {style.short}
            </span>
            <span className="font-mono text-[10px] text-[#17141c]/28">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
          <span className="mt-1.5 block text-[15px] font-semibold leading-snug text-[#17141c]">
            {finding.title}
          </span>
        </span>

        <ChevronDown
          size={17}
          aria-hidden="true"
          className={cn("mt-1.5 shrink-0 text-[#17141c]/32 transition duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t px-5 pb-4 pt-4" style={{ borderColor: style.border }}>
              <p className="max-w-[62ch] text-sm leading-[1.7] text-[#17141c]/70">{finding.detail}</p>

              {finding.evidence.length > 0 ? (
                <dl className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-3">
                  {finding.evidence.map((item) => (
                    <div
                      key={`${finding.id}-${item.label}`}
                      className="rounded-2xl border border-[#17141c]/7 bg-white/70 px-3.5 py-2.5"
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17141c]/40">
                        {item.label}
                      </dt>
                      <dd className="mt-1 truncate text-sm font-semibold text-[#17141c]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {finding.suggestedAction ? (
                <div
                  className="mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: style.soft }}
                >
                  <ArrowRight size={15} className="mt-0.5 shrink-0" style={{ color: style.tone }} aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: style.tone }}>
                      What you could do
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#17141c]/80">{finding.suggestedAction}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function FindingsFeed({ findings }: { findings: Finding[] }) {
  const [filter, setFilter] = useState<Severity | "all">("all");

  const counts = useMemo(() => {
    const map = new Map<Severity, number>();
    for (const finding of findings) map.set(finding.severity, (map.get(finding.severity) ?? 0) + 1);
    return map;
  }, [findings]);

  const present = ORDER.filter((severity) => (counts.get(severity) ?? 0) > 0);
  const visible = filter === "all" ? findings : findings.filter((finding) => finding.severity === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
            filter === "all"
              ? "bg-[#17141c] text-white"
              : "border border-[#17141c]/10 bg-white/70 text-[#17141c]/58 hover:text-[#17141c]",
          )}
        >
          All {findings.length}
        </button>

        {present.map((severity) => {
          const style = SEVERITY_STYLE[severity];
          const active = filter === severity;
          return (
            <button
              key={severity}
              type="button"
              onClick={() => setFilter(active ? "all" : severity)}
              aria-pressed={active}
              className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
              style={{
                borderColor: active ? style.tone : style.border,
                backgroundColor: active ? style.tone : style.soft,
                color: active ? "#ffffff" : style.tone,
              }}
            >
              {counts.get(severity)} {style.short.toLowerCase()}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visible.map((finding, index) => (
          <FindingRow
            key={finding.id}
            finding={finding}
            index={index}
            defaultOpen={index === 0 && filter === "all"}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-[#17141c]/4 px-4 py-3.5 text-sm text-[#17141c]/55">
          Nothing in this category.
        </p>
      ) : null}
    </div>
  );
}
