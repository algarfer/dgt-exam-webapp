import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { PreparedQuestion } from "@/lib/prepare";
import { Figure } from "./ui/Figure";
import { type RailState, rail } from "./ui/Rail";

type AnswerListProps = {
  question: PreparedQuestion;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
};

function stateFor(index: number, selected: number | null, revealed: boolean, correct: number) {
  if (!revealed) return selected === index ? "committed" : "open";
  if (index === correct) return "correct";
  if (index === selected) return "barred";
  return "open";
}

const hintKeys = {
  open: null,
  committed: "answers.committed",
  correct: "answers.correct",
  barred: "answers.barred",
} as const satisfies Record<RailState, string | null>;

export function AnswerList({ question, selected, revealed, onSelect }: AnswerListProps) {
  const { t } = useTranslation();

  return (
    <ul className="mt-interval">
      {question.answers.map((answer, index) => {
        const state = stateFor(index, selected, revealed, question.correctIndex);
        const hint = hintKeys[state];

        return (
          <li key={answer.text}>
            <label
              className={cn(
                rail(state),
                "flex w-full items-baseline gap-gap py-gap text-start",
                "border-t border-[var(--seam-color)]",
                "focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-temporary",
                "motion-safe:transition-colors motion-safe:duration-150",
                revealed ? "cursor-default" : "cursor-pointer hover:bg-[var(--ground-raised)]",
                state === "barred" && "text-temporary",
              )}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                className="sr-only"
                checked={selected === index}
                disabled={revealed}
                onChange={() => onSelect(index)}
              />

              <Figure className="shrink-0 text-[var(--ink-dim)]">{index + 1}</Figure>
              <span className="flex-1 text-base sm:text-lg">{answer.text}</span>

              {hint ? (
                <span className="sr-only sm:not-sr-only sm:shrink-0 sm:text-xs sm:uppercase sm:tracking-[0.1em] sm:text-[var(--ink-dim)]">
                  {t(hint)}
                </span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
