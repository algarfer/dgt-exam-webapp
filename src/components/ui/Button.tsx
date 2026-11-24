import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-[var(--ink)] text-[var(--ground)] border border-[var(--ink)] hover:bg-transparent hover:text-[var(--ink)]",
  secondary: "border border-[var(--seam-color)] text-[var(--ink)] hover:border-[var(--ink)]",
  danger:
    "border border-hazard text-hazard hover:bg-hazard hover:text-concrete focus-visible:border-hazard",
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof variantStyles;
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-dash px-gap py-dash",
        "text-sm font-medium tracking-wide",
        "motion-safe:transition-colors motion-safe:duration-150",
        "disabled:opacity-40 disabled:pointer-events-none",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
