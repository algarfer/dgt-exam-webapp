import { useTranslation } from "react-i18next";
import { Figure } from "@/components/ui/Figure";
import type { PreparedQuestion } from "@/lib/prepare";
import { AnswerList } from "./AnswerList";

type QuestionCardProps = {
  question: PreparedQuestion;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  position?: string;
};

export function QuestionCard({
  question,
  selected,
  revealed,
  onSelect,
  position,
}: QuestionCardProps) {
  const { t } = useTranslation();

  return (
    <article>
      <p className="flex flex-wrap items-baseline gap-x-gap text-xs uppercase tracking-[0.12em] text-[var(--ink-dim)]">
        <span>
          {t("question.exam")} <Figure>{question.examNumber}</Figure> · {question.examTitle}
        </span>
        {position ? <span>{position}</span> : null}
      </p>

      <h1 className="mt-gap max-w-[48ch] text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        {question.title}
      </h1>

      {question.imageUrl ? (
        <img
          src={question.imageUrl}
          alt={question.imageAlt ?? ""}
          width={250}
          height={226}
          loading="lazy"
          className="mt-gap block w-full max-w-[250px] border border-[var(--seam-color)]"
        />
      ) : null}

      <AnswerList question={question} selected={selected} revealed={revealed} onSelect={onSelect} />

      {revealed && question.feedback ? (
        <p className="mt-interval max-w-[65ch] border-t border-[var(--seam-color)] pt-gap text-sm text-[var(--ink-dim)]">
          {question.feedback}
        </p>
      ) : null}
    </article>
  );
}
