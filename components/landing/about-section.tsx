"use client";

import { ArrowRight, CircleDotDashed } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

export function AboutSection() {
  return (
    <section id="about" className="px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="grid gap-10 border-y border-[#17141c]/10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#17141c] text-white shadow-lg">
                <CircleDotDashed size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-semibold text-[#17141c]">Vantage</p>
                <p className="text-sm text-[#17141c]/55">See Everything. Invest Smarter.</p>
              </div>
            </div>
            <div>
              <h2 className="text-balance text-4xl font-semibold tracking-normal text-[#17141c] sm:text-5xl">
                Built for investors who want clarity without becoming full-time portfolio analysts.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#17141c]/62">
                Vantage consolidates investments across brokers, mutual funds, EPF, bonds, gold, REITs, and InvITs into one
                intelligent view. The product focuses on comprehension: what you own, where risk hides, and what deserves attention.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href="#dashboard">
                    Connect Portfolio
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="#technology">Explore Technology</a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
