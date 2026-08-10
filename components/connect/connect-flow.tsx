"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Landmark,
  Loader2,
  Lock,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "method" | "consent" | "syncing" | "done";

const METHODS = [
  {
    id: "aa",
    icon: Landmark,
    title: "Account Aggregator",
    tag: "Recommended",
    detail:
      "Fetch holdings straight from your banks, brokers and fund houses through the RBI-licensed Account Aggregator network. Read-only, revocable any time.",
  },
  {
    id: "cas",
    icon: FileText,
    title: "Upload CAS statement",
    detail:
      "Drop in the consolidated account statement emailed to you by CDSL or NSDL. We parse holdings locally and never store the file.",
  },
  {
    id: "manual",
    icon: PencilLine,
    title: "Add manually",
    detail: "Enter your FDs, gold and provident fund balances yourself. Useful for anything the network cannot reach.",
  },
] as const;

const PROVIDERS = [
  { id: "cdsl", name: "CDSL Depository", kind: "Demat holdings", preselected: true },
  { id: "camsmf", name: "CAMS / KFintech", kind: "Mutual fund folios", preselected: true },
  { id: "epfo", name: "EPFO", kind: "Provident fund balance", preselected: true },
  { id: "axis", name: "Axis Bank", kind: "Deposits and savings", preselected: true },
  { id: "nps", name: "NPS Trust", kind: "Pension corpus", preselected: false },
] as const;

const CONSENT_TERMS = [
  ["Purpose", "Personal finance management — portfolio analysis only"],
  ["Data requested", "Holdings, balances and transaction summary"],
  ["Access type", "Read-only. Vantage can never move or withdraw funds."],
  ["Frequency", "Once daily refresh"],
  ["Valid until", "12 months, revocable at any time from your AA app"],
  ["Storage", "Encrypted, deleted within 24 hours of consent revocation"],
] as const;

const SYNC_SOURCES = [
  "Establishing consent artefact",
  "CDSL Depository — demat holdings",
  "CAMS / KFintech — mutual fund folios",
  "EPFO — provident fund balance",
  "Axis Bank — deposits and savings",
  "Normalising into unified portfolio",
  "Running allocation and concentration analysis",
] as const;

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["method", "consent", "syncing"];
  const activeIndex = order.indexOf(step === "done" ? "syncing" : step);

  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {order.map((item, index) => (
        <span
          key={item}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            index <= activeIndex ? "w-8 bg-[#8f78ff]" : "w-4 bg-[#17141c]/12",
          )}
        />
      ))}
    </div>
  );
}

export function ConnectFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("aa");
  const [selected, setSelected] = useState<string[]>(
    PROVIDERS.filter((provider) => provider.preselected).map((provider) => provider.id),
  );
  const [syncIndex, setSyncIndex] = useState(0);

  useEffect(() => {
    if (step !== "syncing") return;

    if (syncIndex >= SYNC_SOURCES.length) {
      const timer = setTimeout(() => setStep("done"), 500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setSyncIndex((value) => value + 1), reduceMotion ? 120 : 620);
    return () => clearTimeout(timer);
  }, [step, syncIndex, reduceMotion]);

  useEffect(() => {
    if (step !== "done") return;
    const timer = setTimeout(() => router.push("/dashboard"), 1100);
    return () => clearTimeout(timer);
  }, [step, router]);

  function toggleProvider(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };
  const view = step === "done" ? "syncing" : step;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <StepDots step={step} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27b386]/20 bg-[#27b386]/10 px-3 py-1.5 text-xs font-medium text-[#11765a]">
          <Lock size={13} aria-hidden="true" />
          Encrypted end to end
        </span>
      </div>

      <motion.div
        key={view}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {step === "method" ? (
          <section>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#17141c] sm:text-5xl">
              Bring your investments together.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#17141c]/60">
              Pick how you would like Vantage to see your holdings. You stay in control of what is shared, and you can
              withdraw access whenever you want.
            </p>

            <div className="mt-8 space-y-3">
              {METHODS.map((item) => {
                const Icon = item.icon;
                const active = method === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    aria-pressed={active}
                    className={cn(
                      "glass flex w-full items-start gap-4 rounded-[24px] p-5 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40",
                      active ? "premium-border -translate-y-0.5" : "hover:-translate-y-0.5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-full transition duration-300",
                        active ? "bg-[#17141c] text-white" : "bg-[#17141c]/6 text-[#17141c]/62",
                      )}
                    >
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-[#17141c]">{item.title}</span>
                        {"tag" in item ? (
                          <span className="rounded-full bg-[#8f78ff]/14 px-2.5 py-0.5 text-[11px] font-semibold text-[#6953dc]">
                            {item.tag}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-[#17141c]/58">{item.detail}</span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition duration-300",
                        active ? "border-[#8f78ff] bg-[#8f78ff] text-white" : "border-[#17141c]/18",
                      )}
                    >
                      {active ? <Check size={12} aria-hidden="true" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={() => setStep("consent")}>
                Continue
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
            </div>
          </section>
        ) : null}

        {step === "consent" ? (
          <section>
            <button
              type="button"
              onClick={() => setStep("method")}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#17141c]/58 transition hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back
            </button>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#17141c]">
              Review what you are sharing.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#17141c]/60">
              This is the consent artefact your Account Aggregator will record. Nothing is fetched until you approve it.
            </p>

            <div className="glass mt-8 rounded-[28px] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17141c]/45">Accounts to link</p>
              <div className="mt-3 space-y-2">
                {PROVIDERS.map((provider) => {
                  const active = selected.includes(provider.id);

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => toggleProvider(provider.id)}
                      aria-pressed={active}
                      className="flex w-full items-center gap-3 rounded-2xl bg-[#17141c]/4 px-3.5 py-3 text-left transition duration-300 hover:bg-[#17141c]/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 text-[#17141c]/60">
                        <Building2 size={16} aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-[#17141c]">{provider.name}</span>
                        <span className="block text-xs text-[#17141c]/50">{provider.kind}</span>
                      </span>
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition duration-300",
                          active ? "border-[#27b386] bg-[#27b386] text-white" : "border-[#17141c]/18",
                        )}
                      >
                        {active ? <Check size={12} aria-hidden="true" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <dl className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {CONSENT_TERMS.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#17141c]/7 bg-white/55 px-3.5 py-3">
                    <dt className="text-xs text-[#17141c]/48">{label}</dt>
                    <dd className="mt-1 text-sm leading-snug text-[#17141c]/82">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 flex items-start gap-2 rounded-2xl border border-[#27b386]/18 bg-[#27b386]/8 px-4 py-3 text-xs leading-relaxed text-[#11765a]">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Vantage is a read-only analysis layer. It is not a broker, custodian or fund manager, and it can never
                  place a trade or move money on your behalf.
                </span>
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#17141c]/48">
                {selected.length} account{selected.length === 1 ? "" : "s"} selected
              </p>
              <Button size="lg" disabled={selected.length === 0} onClick={() => setStep("syncing")}>
                Approve and fetch
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
            </div>
          </section>
        ) : null}

        {step === "syncing" || step === "done" ? (
          <section>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#17141c]">
              {step === "done" ? "Your portfolio is ready." : "Pulling everything together."}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#17141c]/60">
              {step === "done"
                ? "Taking you to your dashboard."
                : "This usually takes a few seconds. You can keep this tab open."}
            </p>

            <div className="glass mt-8 rounded-[28px] p-5 sm:p-6">
              <ul className="space-y-1">
                {SYNC_SOURCES.map((source, index) => {
                  const complete = index < syncIndex;
                  const active = index === syncIndex && step === "syncing";

                  return (
                    <li
                      key={source}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3.5 py-3 transition duration-500",
                        active && "bg-[#8f78ff]/8",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full transition duration-500",
                          complete ? "bg-[#27b386] text-white" : active ? "text-[#8f78ff]" : "bg-[#17141c]/7",
                        )}
                      >
                        {complete ? (
                          <Check size={13} aria-hidden="true" />
                        ) : active ? (
                          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "text-sm transition duration-500",
                          complete ? "text-[#17141c]/70" : active ? "font-medium text-[#17141c]" : "text-[#17141c]/35",
                        )}
                      >
                        {source}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {step === "done" ? (
              <motion.div
                className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-[#6953dc]"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles size={16} aria-hidden="true" />
                Analysis complete
              </motion.div>
            ) : null}
          </section>
        ) : null}
      </motion.div>
    </div>
  );
}
