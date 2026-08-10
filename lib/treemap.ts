export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk).
 *
 * Slice-and-dice produces slivers once one value dominates, which is exactly the case
 * here — a portfolio's largest industry is often several times the next. Squarifying
 * keeps cells near square so labels stay readable and area stays comparable by eye.
 *
 * Values must be positive. The returned rects exactly tile the input rect, and their
 * areas are proportional to the input values.
 */

function worstAspect(row: number[], side: number, scale: number) {
  const sum = row.reduce((total, value) => total + value, 0) * scale;
  if (sum <= 0 || side <= 0) return Infinity;

  const max = Math.max(...row) * scale;
  const min = Math.min(...row) * scale;
  const sideSquared = side * side;
  const sumSquared = sum * sum;

  return Math.max((sideSquared * max) / sumSquared, sumSquared / (sideSquared * min));
}

export function squarify(values: number[], bounds: Rect): Rect[] {
  const positive = values.filter((value) => value > 0);
  if (positive.length === 0 || bounds.w <= 0 || bounds.h <= 0) return [];

  const out: Rect[] = [];
  let remaining = [...values];
  let free: Rect = { ...bounds };

  while (remaining.length > 0) {
    const total = remaining.reduce((sum, value) => sum + value, 0);
    if (total <= 0) break;

    const scale = (free.w * free.h) / total;
    const side = Math.min(free.w, free.h);

    // Grow the current row while it improves the worst aspect ratio.
    let row: number[] = [remaining[0]];
    let best = worstAspect(row, side, scale);

    for (let i = 1; i < remaining.length; i += 1) {
      const candidate = [...row, remaining[i]];
      const candidateWorst = worstAspect(candidate, side, scale);
      if (candidateWorst > best) break;
      row = candidate;
      best = candidateWorst;
    }

    const rowArea = row.reduce((sum, value) => sum + value, 0) * scale;
    const thickness = rowArea / side;

    if (free.w >= free.h) {
      let y = free.y;
      for (const value of row) {
        const h = (value * scale) / thickness;
        out.push({ x: free.x, y, w: thickness, h });
        y += h;
      }
      free = { x: free.x + thickness, y: free.y, w: free.w - thickness, h: free.h };
    } else {
      let x = free.x;
      for (const value of row) {
        const w = (value * scale) / thickness;
        out.push({ x, y: free.y, w, h: thickness });
        x += w;
      }
      free = { x: free.x, y: free.y + thickness, w: free.w, h: free.h - thickness };
    }

    remaining = remaining.slice(row.length);
  }

  return out;
}

/** Shrinks a rect by a uniform gutter, never below zero size. */
export function inset(rect: Rect, gutter: number): Rect {
  return {
    x: rect.x + gutter,
    y: rect.y + gutter,
    w: Math.max(0, rect.w - gutter * 2),
    h: Math.max(0, rect.h - gutter * 2),
  };
}

/** Reserves a header strip at the top of a rect, returning the remaining body. */
export function reserveHeader(rect: Rect, headerHeight: number): Rect {
  const applied = Math.min(headerHeight, rect.h);
  return { x: rect.x, y: rect.y + applied, w: rect.w, h: Math.max(0, rect.h - applied) };
}
