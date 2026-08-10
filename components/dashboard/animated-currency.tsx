"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts a rupee amount up from zero using Indian digit grouping. Kept separate from
 * the landing page's AnimatedCounter, which formats with toFixed and cannot produce
 * lakh/crore grouping.
 */
export function AnimatedCurrency({
  value,
  className,
  duration = 1.6,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || reduceMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  return (
    <motion.span ref={ref} className={className} suppressHydrationWarning>
      ₹{Math.round(display).toLocaleString("en-IN")}
    </motion.span>
  );
}
