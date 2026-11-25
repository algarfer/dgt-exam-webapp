import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
import { QuestionCard } from "@/components/QuestionCard";
import { TurnControls } from "@/components/TurnControls";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { ADVANCE_KEYS, ANSWER_KEYS, NEXT_KEYS, useKeybinds } from "@/hooks/useKeybinds";
import { useSingleTurn } from "@/hooks/useSingleTurn";
import { prepareSnapshot } from "@/lib/prepare";
import { randomSeed, shuffled } from "@/lib/shuffle";
import { useStore } from "@/store/store";

export function Review() {
  const { t } = useTranslation();
  const failed = useStore((state) => state.failed);
  const setReveal = useStore((state) => state.setReveal);

  const [snapshots] = useState(() => ({ ...failed }));
  const [seed] = useState(randomSeed);
  const [queue, setQueue] = useState(() => shuffled(Object.keys(failed), seed));
  const [cleared, setCleared] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);

  const currentId = queue[0];
  const question = useMemo(() => {
    const entry = currentId ? snapshots[currentId] : undefined;
    return entry ? prepareSnapshot(entry, seed + turnIndex) : null;
  }, [currentId, snapshots, seed, turnIndex]);

  const turn = useSingleTurn(question, turnIndex);

  const advance = () => {
    if (!currentId) return;

    setTurnIndex((current) => current + 1);

    if (turn.revealed && turn.wasCorrect) {
      setQueue((current) => current.slice(1));
      setCleared((current) => current + 1);
      return;
    }

    setQueue((current) => (current.length > 1 ? [...current.slice(1), currentId] : current));
  };

  useKeybinds([
    ...ANSWER_KEYS.map((key, position) => ({
      keys: [key],
      when: !turn.revealed && position < (question?.answers.length ?? 0),
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

  if (Object.keys(snapshots).length === 0) {
    return (
      <section className="py-run">
        <Heading>{t("review.empty.title")}</Heading>
        <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("review.empty.body")}</p>
        <Link to="/exams" className="mt-interval inline-block underline">
          {t("review.empty.link")}
        </Link>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="py-run">
        <Heading>{t("review.done.title")}</Heading>
        <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">
          <Trans i18nKey="review.done.body" count={cleared} components={{ fig: <Figure /> }} />
        </p>
        <Link to="/" className="mt-interval inline-block underline">
          {t("common.backHome")}
        </Link>
      </section>
    );
  }

  return (
    <section className="pt-run">
      <div className="flex flex-wrap items-baseline justify-between gap-gap">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-dim)]">
          {t("review.label")}
        </p>
        <p className="text-sm text-[var(--ink-dim)]">
          <Figure className="text-[var(--ink)]">{queue.length}</Figure> {t("review.queued")} ·{" "}
          <Figure className="text-[var(--ink)]">{cleared}</Figure> {t("review.cleared")}
        </p>
      </div>

      <div className="mt-run">
        <QuestionCard
          question={question}
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
        nextLabel={turn.revealed && !turn.wasCorrect ? t("review.nextReturns") : t("turn.next")}
        onToggleReveal={() => setReveal(turn.reveal === "select" ? "submit" : "select")}
      />
    </section>
  );
}
