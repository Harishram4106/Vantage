import * as React from "react";

import { cn } from "@/lib/utils";

export function GlassPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-[28px]", className)} {...props} />;
}
