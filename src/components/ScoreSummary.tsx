import { Trans, useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const errors = total - correct;
  const allowed = allowedErrors(total);
  const percent = Math.round((correct / total) * 100);

  return (
    <section
      className={cn("border-t-2 pt-gap", passed ? "border-[var(--ink)]" : "border-temporary")}
    >
      <Heading level={2} className={passed ? undefined : "text-temporary"}>
        {passed ? t("score.passed") : t("score.failed")}
      </Heading>

      <dl className="mt-gap grid grid-cols-2 gap-gap sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("score.correct")}
          </dt>
          <dd>
            <Figure size="strong">
              {correct}/{total}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("score.percent")}
          </dt>
          <dd>
            <Figure size="strong">{percent}%</Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("score.errors")}
          </dt>
          <dd>
            <Figure size="strong" className={errors > allowed ? "text-temporary" : undefined}>
              {errors}/{allowed}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("score.time")}
          </dt>
          <dd>
            <Figure size="strong">{formatElapsed(seconds)}</Figure>
          </dd>
        </div>
      </dl>

      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">
        <Trans
          i18nKey="score.note"
          count={allowed}
          values={{ total }}
          components={{ fig: <Figure /> }}
        />
      </p>
    </section>
  );
}
