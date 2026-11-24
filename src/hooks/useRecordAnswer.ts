import { useCallback } from "react";
import type { PreparedQuestion } from "@/lib/prepare";
import { useStore } from "@/store/store";

export function useRecordAnswer(): (question: PreparedQuestion, correct: boolean) => void {
  const addFailed = useStore((state) => state.addFailed);
  const removeFailed = useStore((state) => state.removeFailed);

  return useCallback(
    (question, correct) => {
      if (correct) {
        removeFailed(question.id);
        return;
      }

      addFailed({
        id: question.id,
        manifestId: question.manifestId,
        examNumber: question.examNumber,
        examTitle: question.examTitle,
        examUrl: question.examUrl,
        number: question.number,
        title: question.title,
        imageUrl: question.imageUrl,
        imageAlt: question.imageAlt,
        feedback: question.feedback,
        answers: question.answers.map((answer) => ({
          text: answer.text,
          correct: answer.correct,
        })),
        addedAt: new Date().toISOString(),
      });
    },
    [addFailed, removeFailed],
  );
}
