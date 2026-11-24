import { describe, expect, it } from "bun:test";
import type { Exam } from "@/data/types";
import { allowedErrors, hasPassed } from "@/lib/dgt-rules";
import { prepareExam } from "@/lib/prepare";
import { shuffled } from "@/lib/shuffle";
import examFixture from "./fixtures/exam-248.json";

const MANIFEST_ID = "https://example.com/dgt/manifest.json";
const EXAM_URL = "https://example.com/dgt/exam-248/index.json";

function exam(): Exam {
  return structuredClone(examFixture) as Exam;
}

describe("allowedErrors", () => {
  it("matches the real exam at 30 questions", () => {
    expect(allowedErrors(30)).toBe(3);
  });

  it("scales proportionally", () => {
    expect(allowedErrors(20)).toBe(2);
    expect(allowedErrors(15)).toBe(1);
    expect(allowedErrors(11)).toBe(1);
  });

  it("never drops to zero, which would be stricter than the real exam", () => {
    expect(allowedErrors(9)).toBe(1);
    expect(allowedErrors(7)).toBe(1);
    expect(allowedErrors(1)).toBe(1);
  });
});

describe("hasPassed", () => {
  it("passes on the budget and fails one over it", () => {
    expect(hasPassed(1, 11)).toBe(true);
    expect(hasPassed(2, 11)).toBe(false);
    expect(hasPassed(3, 30)).toBe(true);
    expect(hasPassed(4, 30)).toBe(false);
  });

  it("passes a perfect run", () => {
    expect(hasPassed(0, 7)).toBe(true);
  });
});

describe("shuffled", () => {
  it("is stable for the same seed, so paging back does not reorder", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(shuffled(items, 1234)).toEqual(shuffled(items, 1234));
  });

  it("differs between seeds", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(shuffled(items, 1)).not.toEqual(shuffled(items, 2));
  });

  it("keeps every item exactly once", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect([...shuffled(items, 99)].sort((a, b) => a - b)).toEqual(items);
  });

  it("does not mutate the input", () => {
    const items = [1, 2, 3];
    shuffled(items, 7);

    expect(items).toEqual([1, 2, 3]);
  });
});

describe("prepareExam", () => {
  const context = { manifestId: MANIFEST_ID, examUrl: EXAM_URL };

  it("keeps identity out of the shuffled position", () => {
    const first = prepareExam(exam(), context, 11);
    const second = prepareExam(exam(), context, 22);

    const idOf = (questions: typeof first, number: number) =>
      questions.find((question) => question.number === number)?.id;

    expect(idOf(first, 14)).toBe(idOf(second, 14));
    expect(idOf(first, 14)).toBe(`${MANIFEST_ID}|248|14`);
  });

  it("tracks the correct answer after shuffling it", () => {
    for (const question of prepareExam(exam(), context, 4242)) {
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.answers[question.correctIndex]?.correct).toBe(true);
      expect(question.answers.filter((answer) => answer.correct)).toHaveLength(1);
    }
  });

  it("preserves the two-answer question instead of padding it", () => {
    const prepared = prepareExam(exam(), context, 5);
    const question = prepared.find((candidate) => candidate.number === 14);

    expect(question?.answers).toHaveLength(2);
  });

  it("renders question text verbatim", () => {
    const source = exam();
    const prepared = prepareExam(source, context, 8);

    for (const question of prepared) {
      const original = source.questions.find((candidate) => candidate.number === question.number);
      expect(question.title).toBe(original?.title ?? "");
    }
  });

  it("resolves images against the exam, not the manifest", () => {
    const withImage = prepareExam(exam(), context, 3).find((question) => question.imageUrl);

    expect(withImage?.imageUrl).toStartWith("https://example.com/dgt/exam-248/image-");
  });

  it("is stable for the same seed", () => {
    expect(prepareExam(exam(), context, 777)).toEqual(prepareExam(exam(), context, 777));
  });

  it("reorders questions between seeds", () => {
    const order = (seed: number) => prepareExam(exam(), context, seed).map((q) => q.number);

    expect(order(1)).not.toEqual(order(2));
  });
});
