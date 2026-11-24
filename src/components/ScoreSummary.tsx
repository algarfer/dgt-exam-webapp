import { formatElapsed } from "@/hooks/useStopwatch";
import { cn } from "@/lib/cn";
import { allowedErrors } from "@/lib/dgt-rules";
import { Figure } from "./ui/Figure";
import { Heading } from "./ui/Heading";

type ScoreSummaryProps = {
  correct: number;
  total: number;
  seconds: number;
  passed: boolean;
};

export function ScoreSummary({ correct, total, seconds, passed }: ScoreSummaryProps) {
  const errors = total - correct;
  const allowed = allowedErrors(total);
  const percent = Math.round((correct / total) * 100);

  return (
    <section
      className={cn("border-t-2 pt-gap", passed ? "border-[var(--ink)]" : "border-temporary")}
    >
      <Heading level={2} className={passed ? undefined : "text-temporary"}>
        {passed ? "Aprobado" : "Suspenso"}
      </Heading>

      <dl className="mt-gap grid grid-cols-2 gap-gap sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Aciertos</dt>
          <dd>
            <Figure size="strong">
              {correct}/{total}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Porcentaje</dt>
          <dd>
            <Figure size="strong">{percent}%</Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Fallos</dt>
          <dd>
            <Figure size="strong" className={errors > allowed ? "text-temporary" : undefined}>
              {errors}/{allowed}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Tiempo</dt>
          <dd>
            <Figure size="strong">{formatElapsed(seconds)}</Figure>
          </dd>
        </div>
      </dl>

      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">
        Un examen de <Figure>{total}</Figure> preguntas admite <Figure>{allowed}</Figure>{" "}
        {allowed === 1 ? "fallo" : "fallos"}.
      </p>
    </section>
  );
}
