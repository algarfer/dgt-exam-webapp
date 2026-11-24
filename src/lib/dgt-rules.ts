const DGT_QUESTIONS = 30;
const DGT_ALLOWED_ERRORS = 3;

export function allowedErrors(questionCount: number): number {
  return Math.max(1, Math.floor((questionCount * DGT_ALLOWED_ERRORS) / DGT_QUESTIONS));
}

export function hasPassed(errors: number, questionCount: number): boolean {
  return errors <= allowedErrors(questionCount);
}
