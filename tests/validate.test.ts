import { describe, expect, it } from "bun:test";
import type { Exam, Manifest } from "@/data/types";
import { SchemaValidationError, validateExam, validateManifest } from "@/data/validate";
import examFixture from "./fixtures/exam-248.json";
import manifestFixture from "./fixtures/manifest.json";

function manifest(): Manifest {
  return structuredClone(manifestFixture) as Manifest;
}

function exam(): Exam {
  return structuredClone(examFixture) as Exam;
}

describe("validateManifest", () => {
  it("accepts a manifest scraped by dgt-exam-scraper", () => {
    expect(validateManifest(manifest()).exams).toHaveLength(3);
  });

  it("rejects a manifest without exams", () => {
    const broken = manifest() as Partial<Manifest>;
    delete broken.exams;

    expect(() => validateManifest(broken)).toThrow(SchemaValidationError);
  });

  it("rejects an exam path that is not exam-N/index.json", () => {
    const broken = manifest();
    broken.exams[0]!.path = "exams/279.json";

    expect(() => validateManifest(broken)).toThrow(SchemaValidationError);
  });

  it("reports the offending path in the error details", () => {
    const broken = manifest();
    broken.exams[1]!.number = 0;

    try {
      validateManifest(broken);
      throw new Error("expected validateManifest to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaValidationError);
      expect((error as SchemaValidationError).details.join("\n")).toContain("/exams/1/number");
    }
  });
});

describe("validateExam", () => {
  it("accepts an exam scraped by dgt-exam-scraper", () => {
    expect(validateExam(exam()).number).toBe(248);
  });

  it("accepts the one question in the corpus that has only two answers", () => {
    const question = exam().questions.find((candidate) => candidate.number === 14);

    expect(question?.answers).toHaveLength(2);
    expect(validateExam(exam())).toBeDefined();
  });

  it("accepts a question with no image at all", () => {
    const withoutImage = exam();
    const question = withoutImage.questions[0]!;
    delete question.image;
    delete question.image_alt;
    delete question.image_source;

    expect(validateExam(withoutImage)).toBeDefined();
  });

  it("accepts a question with an explicitly null image", () => {
    const nullImage = exam();
    const question = nullImage.questions[0]!;
    question.image = null;
    question.image_alt = null;
    question.image_source = null;

    expect(validateExam(nullImage)).toBeDefined();
  });

  it("accepts a question carrying feedback, which the current corpus never uses", () => {
    const withFeedback = exam();
    withFeedback.questions[0]!.feedback = "El ABS evita el bloqueo de las ruedas.";

    expect(validateExam(withFeedback)).toBeDefined();
  });

  it("rejects a question with an image but no image_source", () => {
    const broken = exam();
    const question = broken.questions[0]!;
    question.image = "image-1.jpg";
    delete question.image_source;

    expect(() => validateExam(broken)).toThrow(SchemaValidationError);
  });

  it("rejects a question with two correct answers", () => {
    const broken = exam();
    for (const answer of broken.questions[0]!.answers) {
      answer.correct = true;
    }

    expect(() => validateExam(broken)).toThrow(SchemaValidationError);
  });

  it("rejects a question with no correct answer", () => {
    const broken = exam();
    for (const answer of broken.questions[0]!.answers) {
      answer.correct = false;
    }

    expect(() => validateExam(broken)).toThrow(SchemaValidationError);
  });

  it("rejects an answer that still carries its scraped letter prefix", () => {
    const broken = exam();
    broken.questions[0]!.answers[0]!.text = "A. El servofreno.";

    expect(() => validateExam(broken)).toThrow(SchemaValidationError);
  });

  it("rejects a question title that still carries its scraped number prefix", () => {
    const broken = exam();
    broken.questions[0]!.title = "1. ¿Es recomendable el uso de cojines?";

    expect(() => validateExam(broken)).toThrow(SchemaValidationError);
  });
});
