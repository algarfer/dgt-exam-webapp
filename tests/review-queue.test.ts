import { describe, expect, it } from "bun:test";
import { prepareSnapshot } from "@/lib/prepare";
import type { FailedQuestion } from "@/store/types";

function advance(queue: string[], correct: boolean): string[] {
  const [head, ...rest] = queue;
  if (head === undefined) return queue;
  if (correct) return rest;
  return rest.length > 0 ? [...rest, head] : queue;
}

function snapshot(id: string): FailedQuestion {
  return {
    id,
    manifestId: "https://example.com/m.json",
    examNumber: 279,
    examTitle: "Octubre 2026",
    examUrl: "https://example.com/exam-279/index.json",
    number: 3,
    title: "¿Qué sistema reduce el riesgo de bloqueo de las ruedas?",
    imageUrl: "https://example.com/exam-279/image-3.jpg",
    imageAlt: null,
    feedback: null,
    answers: [
      { text: "El servofreno.", correct: false },
      { text: "La tracción total.", correct: false },
      { text: "El ABS.", correct: true },
    ],
    addedAt: "2026-11-24T10:00:00.000Z",
  };
}

describe("review queue", () => {
  it("pops a question answered correctly", () => {
    expect(advance(["a", "b", "c"], true)).toEqual(["b", "c"]);
  });

  it("sends a question answered wrongly to the back", () => {
    expect(advance(["a", "b", "c"], false)).toEqual(["b", "c", "a"]);
  });

  it("keeps the last question when it is still wrong", () => {
    expect(advance(["a"], false)).toEqual(["a"]);
  });

  it("empties once the last question is right", () => {
    expect(advance(["a"], true)).toEqual([]);
  });

  it("drains only through correct answers", () => {
    let queue = ["a", "b"];
    queue = advance(queue, false);
    queue = advance(queue, false);
    expect(queue).toEqual(["a", "b"]);

    queue = advance(queue, true);
    queue = advance(queue, true);
    expect(queue).toEqual([]);
  });
});

describe("prepareSnapshot", () => {
  it("rebuilds a playable question with no network", () => {
    const question = prepareSnapshot(snapshot("x"), 42);

    expect(question.answers).toHaveLength(3);
    expect(question.answers[question.correctIndex]?.text).toBe("El ABS.");
    expect(question.imageUrl).toBe("https://example.com/exam-279/image-3.jpg");
  });

  it("reshuffles between turns but keeps the correct answer tracked", () => {
    const entry = snapshot("x");

    for (const seed of [1, 2, 3, 4, 5]) {
      const question = prepareSnapshot(entry, seed);
      expect(question.answers[question.correctIndex]?.correct).toBe(true);
    }
  });

  it("keeps the stored identity", () => {
    expect(prepareSnapshot(snapshot("mi-id"), 7).id).toBe("mi-id");
  });
});
