import { Link } from "react-router";
import { cn } from "@/lib/cn";
import { type RailState, rail } from "./Rail";

type LaneProps = {
  to: string;
  state?: RailState;
  lead: React.ReactNode;
  title: string;
  description: string;
  aside?: React.ReactNode;
  className?: string;
};

export function Lane({
  to,
  state = "open",
  lead,
  title,
  description,
  aside,
  className,
}: LaneProps) {
  return (
    <Link
      to={to}
      className={cn(
        rail(state),
        "group flex items-center gap-gap sm:gap-interval py-interval",
        "border-t border-[var(--seam-color)] first:border-t-0",
        "motion-safe:transition-colors motion-safe:duration-150",
        "hover:bg-[var(--ground-raised)]",
        className,
      )}
    >
      <span className="shrink-0">{lead}</span>

      <span className="min-w-0 flex-1">
        <span className="block text-xl sm:text-2xl font-semibold tracking-tight group-hover:underline">
          {title}
        </span>
        <span className="mt-1 block max-w-[52ch] text-sm text-[var(--ink-dim)]">{description}</span>
      </span>

      {aside ? <span className="hidden shrink-0 text-right sm:block">{aside}</span> : null}
    </Link>
  );
}
