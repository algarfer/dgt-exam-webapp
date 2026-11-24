import { useState } from "react";
import type { PreparedQuestion } from "@/lib/prepare";
import { useStore } from "@/store/store";
import { useRecordAnswer } from "./useRecordAnswer";

export function useSingleTurn(question: PreparedQuestion | null, turn = 0) {
  const reveal = useStore((state) => state.settings.reveal);
  const recordAnswer = useRecordAnswer();

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const key = `${question?.id ?? "none"}|${turn}`;
  const [shown, setShown] = useState(key);

  if (shown !== key) {
    setShown(key);
    setSelected(null);
    setRevealed(false);
    setWasCorrect(null);
  }

  const commit = (index: number) => {
    if (!question) return;

    const correct = index === question.correctIndex;
    setRevealed(true);
    setWasCorrect(correct);
    recordAnswer(question, correct);
  };

  const select = (index: number) => {
    if (revealed || !question) return;

    setSelected(index);
    if (reveal === "select") commit(index);
  };

  const submit = () => {
    if (revealed || selected === null) return;
    commit(selected);
  };

  return { reveal, selected, revealed, wasCorrect, select, submit };
}
