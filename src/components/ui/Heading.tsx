import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const levelStyles = {
  1: "text-2xl font-semibold tracking-tight sm:text-3xl",
  2: "text-xl font-semibold tracking-tight",
  3: "text-base font-semibold",
} as const;

type HeadingLevel = keyof typeof levelStyles;

type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  level?: HeadingLevel;
};

export function Heading({ level = 1, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return <Tag className={cn(levelStyles[level], className)} {...props} />;
}
