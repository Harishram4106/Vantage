import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/45 bg-white/62 px-3 py-1 text-xs font-medium text-[#17141c]/76 shadow-sm backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
