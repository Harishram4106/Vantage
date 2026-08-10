"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Blocks,
  BrainCircuit,
  ChartNoAxesCombined,
  Eye,
  Fingerprint,
  Gauge,
  Layers3,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { featureCards } from "@/data/portfolio";

const icons = [Blocks, Layers3, Gauge, ChartNoAxesCombined, Eye, ChartNoAxesCombined, BrainCircuit, Fingerprint];

export function FeatureGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#df6ccf]">Features</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[#17141c] sm:text-5xl">
            Everything an investor should see before making the next move.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <Reveal key={title} delay={index * 0.04}>
                <motion.article
                  className="group min-h-64 rounded-[28px] border border-[#17141c]/8 bg-white/72 p-6 shadow-[0_18px_60px_rgba(31,27,45,0.07)] backdrop-blur-xl transition-colors duration-300 hover:bg-white"
                  whileHover={reduceMotion ? undefined : { y: -8, rotateX: 2, rotateY: -2 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#17141c] text-white shadow-[0_18px_40px_rgba(31,27,45,0.2)] transition duration-300 group-hover:scale-105">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-normal text-[#17141c]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#17141c]/60">{description}</p>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
