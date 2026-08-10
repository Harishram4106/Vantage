"use client";

import { ArrowRight, DatabaseZap, LineChart, PlugZap, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    title: "Connect",
    description: "Link accounts through consent-first aggregation flows.",
    icon: PlugZap,
  },
  {
    title: "Aggregate",
    description: "Normalize holdings across every instrument and source.",
    icon: DatabaseZap,
  },
  {
    title: "Analyse",
    description: "Detect overlap, concentration, drift, and allocation gaps.",
    icon: LineChart,
  },
  {
    title: "Act",
    description: "Receive clear, explainable portfolio intelligence.",
    icon: Sparkles,
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#27b386]">How it works</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[#17141c] sm:text-5xl">
            From fragmented accounts to confident decisions in four calm steps.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.08}>
                <motion.article
                  className="relative min-h-72 overflow-hidden rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-[0_22px_70px_rgba(31,27,45,0.08)] backdrop-blur-xl"
                  whileHover={reduceMotion ? undefined : { y: -8 }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#8f78ff,#df6ccf,#27b386)] opacity-70" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#17141c]/42">0{index + 1}</span>
                    {index < steps.length - 1 && <ArrowRight size={18} className="hidden text-[#17141c]/24 lg:block" aria-hidden="true" />}
                  </div>
                  <div className="mt-14 grid h-16 w-16 place-items-center rounded-3xl border border-white/70 bg-white/72 text-[#17141c] shadow-[0_20px_50px_rgba(31,27,45,0.1)]">
                    <Icon size={25} aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold text-[#17141c]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#17141c]/60">{step.description}</p>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
