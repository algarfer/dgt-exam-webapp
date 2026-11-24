import { questionImageUrl } from "@/data/repository";
import type { Exam, Question } from "@/data/types";
import type { FailedQuestion } from "@/store/types";
import { questionKey } from "./keys";
import { shuffled } from "./shuffle";

export type PreparedAnswer = {
  text: string;
  correct: boolean;
};

export type PreparedQuestion = {
  id: string;
  manifestId: string;
  examNumber: number;
  examTitle: string;
  examUrl: string;
  number: number;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  feedback: string | null;
  answers: PreparedAnswer[];
  correctIndex: number;
};

type PrepareContext = {
  manifestId: string;
  examNumber: number;
  examTitle: string;
  examUrl: string;
};

export function prepareQuestion(
  question: Question,
  context: PrepareContext,
  seed: number,
): PreparedQuestion {
  const answers = shuffled(
    question.answers.map((answer) => ({ text: answer.text, correct: answer.correct === true })),
    seed,
  );

  return {
    id: questionKey(context.manifestId, context.examNumber, question.number),
    manifestId: context.manifestId,
    examNumber: context.examNumber,
    examTitle: context.examTitle,
    examUrl: context.examUrl,
    number: question.number,
    title: question.title,
    imageUrl: question.image ? questionImageUrl(context.examUrl, question.image) : null,
    imageAlt: question.image_alt ?? null,
    feedback: question.feedback ?? null,
    answers,
    correctIndex: answers.findIndex((answer) => answer.correct),
  };
}

export function prepareSnapshot(entry: FailedQuestion, seed: number): PreparedQuestion {
  const answers = shuffled(entry.answers, seed);

  return {
    id: entry.id,
    manifestId: entry.manifestId,
    examNumber: entry.examNumber,
    examTitle: entry.examTitle,
    examUrl: entry.examUrl,
    number: entry.number,
    title: entry.title,
    imageUrl: entry.imageUrl,
    imageAlt: entry.imageAlt,
    feedback: entry.feedback,
    answers,
    correctIndex: answers.findIndex((answer) => answer.correct),
  };
}

export function prepareExam(
  exam: Exam,
  context: Omit<PrepareContext, "examNumber" | "examTitle">,
  seed: number,
): PreparedQuestion[] {
  const full = { ...context, examNumber: exam.number, examTitle: exam.title };

  // Each question gets its own derived seed, so answer order does not shift
  // when the question order does.
  return shuffled(exam.questions, seed).map((question, index) =>
    prepareQuestion(question, full, seed + question.number * 7919 + index),
  );
}
