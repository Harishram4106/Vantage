import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium tracking-normal transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#16131c] text-white shadow-[0_18px_50px_rgba(22,19,28,0.22)] hover:-translate-y-0.5 hover:bg-[#211c2a]",
        secondary:
          "border border-white/50 bg-white/70 text-[#17141c] shadow-[0_14px_45px_rgba(31,27,45,0.08)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/90",
        ghost: "text-[#17141c]/78 hover:bg-white/60 hover:text-[#17141c]",
        light:
          "border border-white/20 bg-white/12 text-white backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/20",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
