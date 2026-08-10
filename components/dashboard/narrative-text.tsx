"use client";

import type { ReactNode } from "react";

/**
 * Minimal renderer for the narrative's own subset of markdown: "## " headings and
 * **bold** spans. Deliberately not a full markdown library — the model is instructed
 * to emit only these two constructs, and parsing partial text mid-stream needs to
 * stay predictable.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Only complete **...** pairs are bolded, so a half-typed marker mid-stream
  // renders as plain text rather than flashing stray asterisks.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${index}`} className="font-semibold text-[#17141c]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
}

type Block = { type: "heading"; text: string } | { type: "paragraph"; text: string };

export function parseNarrative(raw: string): Block[] {
  const blocks: Block[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    buffer = [];
  };

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", text: trimmed.slice(3).trim() });
      continue;
    }

    if (trimmed === "") {
      flush();
      continue;
    }

    buffer.push(trimmed);
  }

  flush();
  return blocks;
}

export function NarrativeText({ raw, streaming }: { raw: string; streaming: boolean }) {
  const blocks = parseNarrative(raw);
  const lastIndex = blocks.length - 1;

  return (
    <div className="max-w-[68ch]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`h-${index}`}
              className="mt-7 text-sm font-semibold uppercase tracking-[0.14em] text-[#8f78ff] first:mt-0"
            >
              {block.text}
            </h3>
          );
        }

        return (
          <p key={`p-${index}`} className="mt-3 text-[15px] leading-[1.75] text-[#17141c]/72">
            {renderInline(block.text, `p-${index}`)}
            {streaming && index === lastIndex ? (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#8f78ff] align-middle" />
            ) : null}
          </p>
        );
      })}
    </div>
  );
}
