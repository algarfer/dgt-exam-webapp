import { useState } from "react";
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
      <Heading>Estadísticas</Heading>

      <dl className="mt-interval grid grid-cols-2 gap-interval sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Acierto</dt>
          <dd>
            <Figure size="lead">
              {answered > 0 ? Math.round((correct / answered) * 100) : 0}%
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Entregados</dt>
          <dd>
            <Figure size="lead">{attempts.length}</Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">En la cola</dt>
          <dd>
            <Figure size="lead" className={backlog.length > 0 ? "text-temporary" : undefined}>
              {backlog.length}
            </Figure>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">Tiempo total</dt>
          <dd>
            <Figure size="lead">{formatElapsed(seconds)}</Figure>
          </dd>
        </div>
      </dl>

      {rows.length === 0 ? (
        <p className="mt-run max-w-[65ch] text-[var(--ink-dim)]">
          Todavía no has entregado ningún examen, así que no hay nada que contar.
        </p>
      ) : (
        <>
          <Heading level={2} className="mt-run">
            Por examen
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
                    {row.attempts.length === 1 ? "intento" : "intentos"}
                  </span>
                  <Button
                    variant="danger"
                    onClick={() =>
                      setPending({
                        kind: "exam",
                        manifestId: row.manifestId,
                        examNumber: row.examNumber,
                        label: `el examen ${row.examNumber}`,
                      })
                    }
                  >
                    Borrar
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Heading level={2} className="mt-run">
        Borrar progreso
      </Heading>
      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">
        Borrar el progreso elimina los intentos y las preguntas falladas. No se puede deshacer, así
        que exporta tus datos antes desde Ajustes si quieres conservarlos.
      </p>

      <div className="mt-interval flex flex-wrap gap-gap">
        {manifests.map((id) => (
          <Button
            key={id}
            variant="danger"
            onClick={() =>
              setPending({ kind: "manifest", manifestId: id, label: manifestLabel(id) })
            }
          >
            Borrar {manifestLabel(id)}
          </Button>
        ))}
        <Button variant="danger" onClick={() => setPending({ kind: "all" })}>
          Borrar todo el progreso
        </Button>
      </div>

      <ConfirmDialog
        open={pending !== null}
        destructive
        title="Esto no se puede deshacer"
        body={
          pending?.kind === "all"
            ? "Se borrarán todos los intentos y toda la cola de preguntas falladas, de todos los manifiestos."
            : `Se borrarán los intentos y las preguntas falladas de ${pending?.kind ? pending.label : ""}.`
        }
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
