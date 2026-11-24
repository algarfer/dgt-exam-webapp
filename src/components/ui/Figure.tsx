import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const sizeStyles = {
  lead: "text-5xl sm:text-6xl font-bold tracking-tight",
  strong: "text-lg",
  body: "text-sm",
} as const;

type FigureProps = ComponentPropsWithoutRef<"span"> & {
  size?: keyof typeof sizeStyles;
};

export function Figure({ size = "body", className, ...props }: FigureProps) {
  return <span className={cn("font-mono", sizeStyles[size], className)} {...props} />;
}
