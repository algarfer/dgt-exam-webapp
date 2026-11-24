export function examKey(manifestId: string, examNumber: number): string {
  return `${manifestId}|${examNumber}`;
}

export function questionKey(
  manifestId: string,
  examNumber: number,
  questionNumber: number,
): string {
  return `${manifestId}|${examNumber}|${questionNumber}`;
}
