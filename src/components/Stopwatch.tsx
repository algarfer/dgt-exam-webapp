import { formatElapsed } from "@/hooks/useStopwatch";
import { Figure } from "./ui/Figure";

type StopwatchProps = {
  seconds: number;
  answered: number;
  total: number;
  allowed: number;
};

export function Stopwatch({ seconds, answered, total, allowed }: StopwatchProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-gap gap-y-dash">
      <Figure size="lead" aria-label={`Tiempo transcurrido ${formatElapsed(seconds)}`}>
        {formatElapsed(seconds)}
      </Figure>

      <p className="text-sm text-[var(--ink-dim)]">
        Respondidas{" "}
        <Figure className="text-[var(--ink)]">
          {answered}/{total}
        </Figure>{" "}
        · Fallos permitidos <Figure className="text-[var(--ink)]">{allowed}</Figure>
      </p>
    </div>
  );
}
