import { useTranslation } from "react-i18next";
import { formatElapsed } from "@/hooks/useStopwatch";
import { Figure } from "./ui/Figure";

type StopwatchProps = {
  seconds: number;
  answered: number;
  total: number;
  allowed: number;
};

export function Stopwatch({ seconds, answered, total, allowed }: StopwatchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-baseline gap-x-gap gap-y-dash">
      <Figure size="lead" aria-label={t("stopwatch.elapsed", { time: formatElapsed(seconds) })}>
        {formatElapsed(seconds)}
      </Figure>

      <p className="text-sm text-[var(--ink-dim)]">
        {t("stopwatch.answered")}{" "}
        <Figure className="text-[var(--ink)]">
          {answered}/{total}
        </Figure>{" "}
        · {t("stopwatch.allowed")} <Figure className="text-[var(--ink)]">{allowed}</Figure>
      </p>
    </div>
  );
}
