import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "solid" && "bg-slate-900 text-white hover:bg-slate-700",
        variant === "outline" && "border border-slate-300 bg-transparent hover:bg-slate-100",
        variant === "ghost" && "bg-transparent hover:bg-slate-100",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
