import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { QuestionCard } from "@/components/QuestionCard";
import { TurnControls } from "@/components/TurnControls";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { examUrl, fetchExam, fetchManifest } from "@/data/repository";
import { ADVANCE_KEYS, ANSWER_KEYS, NEXT_KEYS, useKeybinds } from "@/hooks/useKeybinds";
import { useSingleTurn } from "@/hooks/useSingleTurn";
import { errorCopy } from "@/lib/error-copy";
import { manifestId } from "@/lib/manifest-id";
import { type PreparedQuestion, prepareExam } from "@/lib/prepare";
import { randomSeed, shuffled } from "@/lib/shuffle";
import { manifestUrls, useStore } from "@/store/store";

type ExamRef = {
  manifestUrl: string;
  path: string;
  number: number;
};

type EndlessData = {
  refs: ExamRef[];
};

export async function endlessLoader(): Promise<EndlessData> {
  const urls = manifestUrls(useStore.getState());
  const refs: ExamRef[] = [];

  for (const manifestUrl of urls) {
    try {
      const manifest = await fetchManifest(manifestUrl);
      for (const entry of manifest.exams) {
        refs.push({ manifestUrl, path: entry.path, number: entry.number });
      }
    } catch {}
  }

  return { refs };
}

export function Endless() {
  const { t } = useTranslation();
  const { refs } = useLoaderData() as EndlessData;
  const setReveal = useStore((state) => state.setReveal);

  const [seed] = useState(randomSeed);
  const order = useMemo(() => shuffled(refs, seed), [refs, seed]);

  const [examIndex, setExamIndex] = useState(0);
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [position, setPosition] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [error, setError] = useState<unknown>(null);

  const current = questions[position] ?? null;
  const turn = useSingleTurn(current, answered);

  useEffect(() => {
    const ref = order[examIndex];
    if (!ref) return;

    let active = true;
    setError(null);

    fetchExam(ref.manifestUrl, ref.path)
      .then((exam) => {
        if (!active) return;

        const id = manifestId(ref.manifestUrl);
        setQuestions(
          prepareExam(exam, { manifestId: id, examUrl: examUrl(id, ref.path) }, seed + ref.number),
        );
        setPosition(0);

        // Warm the next exam so the stream does not stall at the handover.
        const next = order[examIndex + 1];
        if (next) void fetchExam(next.manifestUrl, next.path).catch(() => {});
      })
      .catch((cause) => {
        if (active) setError(cause);
      });

    return () => {
      active = false;
    };
  }, [order, examIndex, seed]);

  const advance = () => {
    setAnswered((count) => count + 1);

    if (position + 1 < questions.length) {
      setPosition((current) => current + 1);
      return;
    }

    setExamIndex((current) => (current + 1) % Math.max(order.length, 1));
  };

  useKeybinds([
    ...ANSWER_KEYS.map((key, position) => ({
      keys: [key],
      when: !turn.revealed && position < (current?.answers.length ?? 0),
      run: () => turn.select(position),
    })),
    {
      keys: ADVANCE_KEYS,
      when: turn.reveal === "submit" && !turn.revealed,
      run: turn.submit,
    },
    { keys: ADVANCE_KEYS, run: advance },
    { keys: NEXT_KEYS, run: advance },
  ]);

  if (order.length === 0) {
    return (
      <section className="py-run">
        <Heading>{t("endless.empty.title")}</Heading>
        <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("endless.empty.body")}</p>
      </section>
    );
  }

  if (error) {
    const copy = errorCopy(error);
    return (
      <section className="py-run">
        <Heading className="text-temporary">{copy.title}</Heading>
        <p className="mt-gap max-w-[65ch]">{copy.detail}</p>
        <p className="mt-dash max-w-[65ch] text-[var(--ink-dim)]">{copy.recovery}</p>
      </section>
    );
  }

  return (
    <section className="pt-run">
      <div className="flex flex-wrap items-baseline justify-between gap-gap">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-dim)]">
          {t("endless.label")}
        </p>
        <p className="text-sm text-[var(--ink-dim)]">
          <Figure className="text-[var(--ink)]">{answered}</Figure> {t("endless.answered")} ·{" "}
          <Figure className="text-[var(--ink)]">{order.length}</Figure> {t("endless.mixed")}
        </p>
      </div>

      {current ? (
        <>
          <div className="mt-run">
            <QuestionCard
              question={current}
              selected={turn.selected}
              revealed={turn.revealed}
              onSelect={turn.select}
            />
          </div>

          <TurnControls
            reveal={turn.reveal}
            revealed={turn.revealed}
            canSubmit={turn.selected !== null}
            onSubmit={turn.submit}
            onNext={advance}
            onToggleReveal={() => setReveal(turn.reveal === "select" ? "submit" : "select")}
          />
        </>
      ) : (
        <p className="mt-run text-[var(--ink-dim)]">{t("endless.loading")}</p>
      )}
    </section>
  );
}
