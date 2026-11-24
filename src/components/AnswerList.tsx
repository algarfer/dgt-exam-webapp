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

const hint: Record<RailState, string> = {
  open: "",
  committed: "Tu respuesta",
  correct: "Respuesta correcta",
  barred: "Tu respuesta, incorrecta",
};

export function AnswerList({ question, selected, revealed, onSelect }: AnswerListProps) {
  return (
    <ul className="mt-interval">
      {question.answers.map((answer, index) => {
        const state = stateFor(index, selected, revealed, question.correctIndex);

        return (
          <li key={answer.text}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              disabled={revealed}
              aria-pressed={selected === index}
              className={cn(
                rail(state),
                "flex w-full items-baseline gap-gap py-gap text-start",
                "border-t border-[var(--seam-color)]",
                "motion-safe:transition-colors motion-safe:duration-150",
                !revealed && "hover:bg-[var(--ground-raised)]",
                revealed && "cursor-default",
                state === "barred" && "text-temporary",
              )}
            >
              <Figure className="shrink-0 text-[var(--ink-dim)]">{index + 1}</Figure>
              <span className="flex-1 text-base sm:text-lg">{answer.text}</span>
              {hint[state] ? (
                <span className="hidden shrink-0 text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] sm:block">
                  {hint[state]}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
