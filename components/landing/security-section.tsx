"use client";

import { Check, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/landing/reveal";

const securityItems = [
  "Consent-based aggregation",
  "Read-only portfolio intelligence",
  "Privacy-first data handling",
  "Explainable AI outputs",
];

export function SecuritySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="security" className="px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[38px] bg-[#17141c] px-6 py-14 text-white shadow-[0_34px_110px_rgba(23,20,28,0.22)] sm:px-10 lg:px-14">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "linear-gradient(135deg, rgba(143,120,255,0.22), transparent 32%), linear-gradient(225deg, rgba(39,179,134,0.16), transparent 32%)",
              }}
              aria-hidden="true"
            />
            <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/54">Security</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
                  Trust should feel invisible until you need to inspect it.
                </h2>
                <p className="mt-5 text-lg leading-8 text-white/66">
                  Vantage is designed for secure, consent-based portfolio aggregation with clear explanations, visible controls,
                  and a calm interface that does not pressure the investor.
                </p>
              </div>

              <motion.div
                className="grid gap-4 sm:grid-cols-2"
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                {[
                  { title: "RBI AA ready", icon: ShieldCheck, text: "Built around consent-led account aggregation patterns." },
                  { title: "SEBI compatible", icon: Fingerprint, text: "Designed for financial market transparency and investor clarity." },
                  { title: "Privacy first", icon: LockKeyhole, text: "Portfolio insights without noisy product nudges." },
                  { title: "Auditable AI", icon: Check, text: "Plain-language insights that show the reasoning behind the signal." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-[26px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 text-white">
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
                    </article>
                  );
                })}
              </motion.div>
            </div>

            <div className="relative mt-10 flex flex-wrap gap-2">
              {securityItems.map((item) => (
                <span key={item} className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-sm text-white/68">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
