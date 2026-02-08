"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

const hausButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        gold: "bg-[#D4AF37] text-black hover:bg-[#E5C76B] shadow-lg shadow-[#D4AF37]/25",
        "gold-outline":
          "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10",
        glass:
          "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
        "glass-gold":
          "bg-[#D4AF37]/10 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20",
        ghost: "hover:bg-white/10 text-white",
        link: "text-[#D4AF37] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-11 w-11",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface HausButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof hausButtonVariants> {
  asChild?: boolean;
}

const HausButton = React.forwardRef<HTMLButtonElement, HausButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(hausButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
HausButton.displayName = "HausButton";

export { HausButton, hausButtonVariants };
