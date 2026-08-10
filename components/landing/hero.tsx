"use client";

import { ArrowRight, Play } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

function MagneticLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 165, damping: 20, mass: 0.28 });
  const springY = useSpring(y, { stiffness: 165, damping: 20, mass: 0.28 });

  function handleMove(event: MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.28);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        reduceMotion
          ? undefined
          : {
              x: springX,
              y: springY,
            }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.018 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-[34px] py-[18px] text-[17px] font-semibold tracking-[-0.035em] transition duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/35",
        variant === "primary"
          ? "bg-white text-[#111827] shadow-[0_18px_48px_rgba(17,24,39,0.09)] hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(17,24,39,0.13)]"
          : "border border-white/70 bg-white/78 text-[#111827] shadow-[0_18px_48px_rgba(17,24,39,0.06)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white",
      )}
    >
      {children}
    </motion.a>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-[#f4f1f7] text-[#111827]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] items-center px-6 pb-12 pt-[88px] sm:px-10 lg:pl-[120px] lg:pr-16">
        <motion.div
          className="w-full max-w-[780px] text-left"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="max-w-[780px] text-[42px] font-bold leading-[0.88] tracking-[-0.05em] text-[#111827] sm:text-[56px] lg:text-[clamp(62px,6vw,98px)]">
            <span className="block whitespace-nowrap">See Everything.</span>
            <span className="block whitespace-nowrap">Invest Smarter.</span>
          </h1>

          <p className="mt-8 max-w-[520px] text-balance text-[20px] font-normal leading-[1.55] tracking-[-0.025em] text-[rgba(17,24,39,0.72)] sm:text-[24px]">
            Bring every investment together into one intelligent portfolio. Track asset allocation, detect hidden mutual fund overlap,
            and receive explainable AI insights—all in one place.
          </p>

          <div className="mt-9 flex flex-col items-start gap-[18px] sm:flex-row">
            <MagneticLink href="/connect">
              Connect Portfolio
              <ArrowRight size={18} aria-hidden="true" />
            </MagneticLink>
            <MagneticLink href="#dashboard" variant="secondary">
              <Play size={17} aria-hidden="true" />
              Watch Demo
            </MagneticLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
