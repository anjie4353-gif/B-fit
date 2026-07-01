import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[16px] text-[15px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] min-h-[48px] px-6 tracking-wide font-display",
  {
    variants: {
      variant: {
        default: "glass-btn-primary text-white",
        secondary:
          "glass-btn-secondary text-accent-700 hover:bg-accent-50",
        ghost:
          "text-accent-600 bg-transparent border border-transparent shadow-none hover:bg-white/60 hover:backdrop-blur-md",
        outline:
          "glass-subtle text-accent-700 hover:bg-accent-50",
        destructive:
          "bg-red-600 text-white border border-red-500/30 shadow-elev-2 hover:bg-red-700",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-[14px] px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };