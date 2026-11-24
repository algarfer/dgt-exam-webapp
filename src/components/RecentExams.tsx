import type { ManifestEntry } from "@/data/types";
import { formatElapsed } from "@/hooks/useStopwatch";
import { cn } from "@/lib/cn";
import { examKey } from "@/lib/keys";
import { useStore } from "@/store/store";
import type { Attempt } from "@/store/types";
import { Heading } from "./ui/Heading";
import { rail } from "./ui/Rail";
import { Seam } from "./ui/Seam";

type RecentExamsProps = {
  manifestId: string;
  exams: ManifestEntry[];
  limit?: number;
};

type Row = {
  number: number;
  title: string;
  last: Attempt;
  best: Attempt;
  tries: number;
};

function bestOf(attempts: Attempt[], fallback: Attempt): Attempt {
  return attempts.reduce(
    (top, attempt) => (attempt.correct / attempt.total > top.correct / top.total ? attempt : top),
    fallback,
  );
}

function rowsFor(
  exams: ManifestEntry[],
  progress: Record<string, Attempt[]>,
  manifestId: string,
  limit: number,
): Row[] {
  return exams
    .flatMap((entry) => {
      const attempts = progress[examKey(manifestId, entry.number)] ?? [];
      const last = attempts.at(-1);
      if (!last) return [];

      return [
        {
          number: entry.number,
          title: entry.title,
          last,
          best: bestOf(attempts, last),
          tries: attempts.length,
        },
      ];
    })
    .sort((a, b) => b.last.at.localeCompare(a.last.at))
    .slice(0, limit);
}

const cell = "border-t border-[var(--seam-color)] py-gap align-baseline";
const figures = cn(cell, "w-[7rem] text-end text-[var(--ink-dim)]");

export function RecentExams({ manifestId, exams, limit = 6 }: RecentExamsProps) {
  const progress = useStore((state) => state.progress);
  const rows = rowsFor(exams, progress, manifestId, limit);

  if (rows.length === 0) return null;

  return (
    <section className="mt-run">
      <Seam />

      <div className="flex flex-wrap items-baseline gap-gap pb-dash pt-interval">
        <Heading level={2} className="text-xs uppercase tracking-[0.18em] text-[var(--ink-dim)]">
          Últimos exámenes
        </Heading>
        <span className="ms-auto font-mono text-xs text-[var(--ink-dim)]">
          último · mejor · intentos
        </span>
      </div>

      <table className="w-full border-collapse font-mono text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Examen</th>
            <th scope="col">Título</th>
            <th scope="col">Preguntas</th>
            <th scope="col">Tiempo</th>
            <th scope="col">Último, mejor e intentos</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.number}>
              <td className={cn(rail("committed"), cell, "w-[5.5rem] text-[var(--ink-dim)]")}>
                {row.number}
              </td>
              <td className={cn(cell, "min-w-0 font-sans")}>{row.title}</td>
              <td className={figures}>{row.last.total} preg.</td>
              <td className={figures}>{formatElapsed(row.last.seconds)}</td>
              <td className={figures}>
                <span className="text-[var(--ink)]">
                  {row.last.correct}/{row.last.total}
                </span>{" "}
                · {row.best.correct}/{row.best.total} · {row.tries}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
