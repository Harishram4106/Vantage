"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  action,
  className,
  delay = 0,
  accent = false,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  delay?: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={cn("glass rounded-[28px] p-5 sm:p-6", accent && "premium-border", className)}
      aria-label={title}
      initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(5px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#17141c]">{title}</h2>
          {subtitle ? <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#17141c]/55">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export function WhyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-2xl border border-[#8f78ff]/16 bg-[#8f78ff]/6 px-4 py-3 text-xs leading-relaxed text-[#17141c]/62">
      <span className="font-semibold text-[#6953dc]">How this is calculated — </span>
      {children}
    </p>
  );
}
