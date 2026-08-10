"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { NarrativeText } from "@/components/dashboard/narrative-text";
import { cn } from "@/lib/utils";

type Status = "idle" | "streaming" | "done" | "error";

export function AiNarrative({ portfolioKey }: { portfolioKey: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const reduceMotion = useReducedMotion();
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    setStatus("streaming");

    try {
      const response = await fetch(`/api/narrate?portfolio=${portfolioKey}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.warn("Narrative unavailable:", payload?.hint ?? payload?.error ?? response.status);
        setStatus("error");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.warn("Narrative unavailable: no response stream");
        setStatus("error");
        return;
      }

      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((current) => current + decoder.decode(value, { stream: true }));
      }

      setStatus("done");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      console.warn("Narrative unavailable:", caught);
      setStatus("error");
    }
  }, [portfolioKey]);

  useEffect(() => {
    generate();
    return () => abortRef.current?.abort();
  }, [generate]);

  // A failed narrative hides the panel instead of showing an error. The only real cause is a
  // missing ANTHROPIC_API_KEY, the rest of the dashboard is unaffected, and the reason is
  // logged to the console. To surface failures in the UI, render a message here instead.
  if (status === "error") return null;

  return (
    <section className="glass rounded-[28px] p-5 sm:p-8" aria-label="Plain language explanation">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8f78ff]">
          <Sparkles size={15} aria-hidden="true" />
          What this means for you
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={status === "streaming"}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#17141c]/10 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#17141c]/60 transition hover:bg-white hover:text-[#17141c] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
        >
          <RefreshCw size={12} className={cn(status === "streaming" && "animate-spin")} aria-hidden="true" />
          {status === "streaming" ? "Writing" : "Regenerate"}
        </button>
      </div>

      <div className="mt-6 min-h-[140px]">
        {text.length === 0 ? (
          <div className="max-w-[68ch] space-y-3" aria-label="Generating explanation">
            {[38, 95, 88, 72, 30, 91, 84].map((width, index) => (
              <motion.div
                key={`${width}-${index}`}
                className={cn("rounded-full bg-[#17141c]/7", width < 45 ? "h-2.5" : "h-3.5")}
                style={{ width: `${width}%` }}
                animate={reduceMotion ? undefined : { opacity: [0.4, 0.85, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.12 }}
              />
            ))}
          </div>
        ) : (
          <NarrativeText raw={text} streaming={status === "streaming"} />
        )}
      </div>

      <p className="mt-6 border-t border-[#17141c]/8 pt-3.5 text-xs leading-relaxed text-[#17141c]/45">
        Generated from the computed figures on this page — it cannot introduce numbers of its own. An
        explanation of your holdings, not investment advice.
      </p>
    </section>
  );
}
