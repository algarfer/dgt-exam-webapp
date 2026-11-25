import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { rail } from "@/components/ui/Rail";
import { fetchManifest } from "@/data/repository";
import type { Manifest } from "@/data/types";
import { formatElapsed } from "@/hooks/useStopwatch";
import { cn } from "@/lib/cn";
import { examKey } from "@/lib/keys";
import { manifestId } from "@/lib/manifest-id";
import { activeManifestUrl, useStore } from "@/store/store";
import type { Attempt } from "@/store/types";

type ExamListData = {
  manifest: Manifest;
  manifestUrl: string;
};

export async function examListLoader(): Promise<ExamListData> {
  const manifestUrl = activeManifestUrl(useStore.getState());
  return { manifest: await fetchManifest(manifestUrl), manifestUrl };
}

function best(attempts: Attempt[]): Attempt | undefined {
  return attempts.reduce<Attempt | undefined>((top, attempt) => {
    if (!top) return attempt;
    return attempt.correct / attempt.total > top.correct / top.total ? attempt : top;
  }, undefined);
}

export function ExamList() {
  const { t } = useTranslation();
  const { manifest, manifestUrl } = useLoaderData() as ExamListData;
  const progress = useStore((state) => state.progress);
  const id = manifestId(manifestUrl);

  return (
    <section className="pt-run">
      <Heading>{t("examList.title")}</Heading>
      <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("examList.intro")}</p>

      <ul className="mt-run">
        {manifest.exams.map((entry) => {
          const attempts = progress[examKey(id, entry.number)] ?? [];
          const last = attempts.at(-1);
          const top = best(attempts);

          return (
            <li
              key={entry.number}
              className={cn(
                rail(attempts.length > 0 ? "committed" : "open"),
                "flex flex-wrap items-baseline gap-x-gap gap-y-dash py-gap",
                "border-t border-[var(--seam-color)]",
              )}
            >
              <Figure size="strong" className="w-[3.5rem] shrink-0 text-[var(--ink-dim)]">
                {entry.number}
              </Figure>

              <span className="min-w-0 flex-1 text-lg font-medium">{entry.title}</span>

              {last && top ? (
                <span className="order-last w-full text-xs text-[var(--ink-dim)] sm:order-none sm:w-auto sm:text-end">
                  {t("examList.last")}{" "}
                  <Figure className="text-[var(--ink)]">
                    {last.correct}/{last.total}
                  </Figure>{" "}
                  · {t("examList.best")}{" "}
                  <Figure className="text-[var(--ink)]">
                    {top.correct}/{top.total}
                  </Figure>{" "}
                  · <Figure className="text-[var(--ink)]">{attempts.length}</Figure>{" "}
                  {t("examList.tries", { count: attempts.length })} ·{" "}
                  <Figure>{formatElapsed(last.seconds)}</Figure>
                </span>
              ) : (
                <span className="order-last w-full text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] sm:order-none sm:w-auto">
                  {t("examList.notDone")}
                </span>
              )}

              <span className="flex shrink-0 gap-gap text-sm">
                <Link to={`/exams/${entry.number}?mode=study`} className="underline">
                  {t("examList.study")}
                </Link>
                <Link to={`/exams/${entry.number}?mode=exam`} className="underline">
                  {t("examList.exam")}
                </Link>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
