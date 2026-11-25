import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { rail } from "@/components/ui/Rail";
import { formatElapsed } from "@/hooks/useStopwatch";
import { cn } from "@/lib/cn";
import { manifestLabel } from "@/lib/manifest-label";
import { useStore } from "@/store/store";
import type { Attempt } from "@/store/types";

type Pending =
  | { kind: "exam"; manifestId: string; examNumber: number; label: string }
  | { kind: "manifest"; manifestId: string; label: string }
  | { kind: "all" };

type Row = {
  manifestId: string;
  examNumber: number;
  attempts: Attempt[];
};

function parseRows(progress: Record<string, Attempt[]>): Row[] {
  return Object.entries(progress)
    .map(([key, attempts]) => {
      const split = key.lastIndexOf("|");
      return {
        manifestId: key.slice(0, split),
        examNumber: Number(key.slice(split + 1)),
        attempts,
      };
    })
    .sort((a, b) => b.examNumber - a.examNumber);
}

export function Stats() {
  const { t } = useTranslation();
  const progress = useStore((state) => state.progress);
  const failed = useStore((state) => state.failed);
  const wipeExam = useStore((state) => state.wipeExam);
  const wipeManifest = useStore((state) => state.wipeManifest);
  const wipeAll = useStore((state) => state.wipeAll);

  const [pending, setPending] = useState<Pending | null>(null);

  const rows = parseRows(progress);
  const backlog = Object.values(failed);
  const attempts = rows.flatMap((row) => row.attempts);
  const answered = attempts.reduce((total, attempt) => total + attempt.total, 0);
  const correct = attempts.reduce((total, attempt) => total + attempt.correct, 0);
  const seconds = attempts.reduce((total, attempt) => total + attempt.seconds, 0);
  const manifests = [...new Set(rows.map((row) => row.manifestId))];

  const confirm = () => {
    if (!pending) return;

    if (pending.kind === "exam") wipeExam(pending.manifestId, pending.examNumber);
    if (pending.kind === "manifest") wipeManifest(pending.manifestId);
    if (pending.kind === "all") wipeAll();

    setPending(null);
  };

  return (
    <section className="py-run">
      <Heading>{t("stats.title")}</Heading>

      <dl className="mt-interval grid grid-cols-2 gap-interval sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("stats.accuracy")}
          </dt>
          <dd>
            <Figure size="lead">
              {answered > 0 ? Math.round((correct / answered) * 100) : 0}%
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("stats.submitted")}
          </dt>
          <dd>
            <Figure size="lead">{attempts.length}</Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("stats.queued")}
          </dt>
          <dd>
            <Figure size="lead" className={backlog.length > 0 ? "text-temporary" : undefined}>
              {backlog.length}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
            {t("stats.totalTime")}
          </dt>
          <dd>
            <Figure size="lead">{formatElapsed(seconds)}</Figure>
          </dd>
        </div>
      </dl>

      {rows.length === 0 ? (
        <p className="mt-run max-w-[65ch] text-[var(--ink-dim)]">{t("stats.empty")}</p>
      ) : (
        <>
          <Heading level={2} className="mt-run">
            {t("stats.perExam")}
          </Heading>

          <ul className="mt-gap">
            {rows.map((row) => {
              const last = row.attempts.at(-1);

              return (
                <li
                  key={`${row.manifestId}|${row.examNumber}`}
                  className={cn(
                    rail("committed"),
                    "flex flex-wrap items-baseline gap-gap py-gap",
                    "border-t border-[var(--seam-color)]",
                  )}
                >
                  <Figure size="strong" className="w-[3.5rem] shrink-0 text-[var(--ink-dim)]">
                    {row.examNumber}
                  </Figure>
                  <span className="min-w-0 flex-1 text-sm text-[var(--ink-dim)]">
                    {manifestLabel(row.manifestId)}
                  </span>
                  <span className="text-sm">
                    <Figure>
                      {last?.correct}/{last?.total}
                    </Figure>{" "}
                    · <Figure>{row.attempts.length}</Figure>{" "}
                    {t("stats.tries", { count: row.attempts.length })}
                  </span>
                  <Button
                    variant="danger"
                    onClick={() =>
                      setPending({
                        kind: "exam",
                        manifestId: row.manifestId,
                        examNumber: row.examNumber,
                        label: t("stats.scope.exam", { number: row.examNumber }),
                      })
                    }
                  >
                    {t("stats.delete")}
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Heading level={2} className="mt-run">
        {t("stats.wipe.title")}
      </Heading>
      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">{t("stats.wipe.body")}</p>

      <div className="mt-interval flex flex-wrap gap-gap">
        {manifests.map((id) => (
          <Button
            key={id}
            variant="danger"
            onClick={() =>
              setPending({ kind: "manifest", manifestId: id, label: manifestLabel(id) })
            }
          >
            {t("stats.wipe.manifest", { label: manifestLabel(id) })}
          </Button>
        ))}
        <Button variant="danger" onClick={() => setPending({ kind: "all" })}>
          {t("stats.wipe.all")}
        </Button>
      </div>

      <ConfirmDialog
        open={pending !== null}
        destructive
        title={t("stats.confirm.title")}
        body={
          pending?.kind === "all"
            ? t("stats.confirm.all")
            : t("stats.confirm.scope", { label: pending?.kind ? pending.label : "" })
        }
        confirmLabel={t("stats.confirm.submit")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
