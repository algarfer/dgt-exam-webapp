export type RailState = "open" | "committed" | "correct" | "barred";

const railStyles: Record<RailState, string> = {
  open: "rail rail-open",
  committed: "rail rail-committed",
  correct: "rail rail-correct",
  barred: "rail rail-barred",
};

export function rail(state: RailState): string {
  return railStyles[state];
}
