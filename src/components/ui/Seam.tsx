import { cn } from "@/lib/cn";

export function Seam({ className }: { className?: string }) {
  return <hr className={cn("border-0 h-px bg-[var(--seam-color)]", className)} />;
}
