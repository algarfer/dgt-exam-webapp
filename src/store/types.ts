import type { Question } from "@/data/types";

export type Theme = "system" | "light" | "dark";

export type RevealMode = "select" | "submit";

export type Attempt = {
  at: string;
  correct: number;
  total: number;
  seconds: number;
  passed: boolean;
};

export type FailedQuestion = {
  id: string;
  manifestId: string;
  examNumber: number;
  examTitle: string;
  /** Resolved exam URL */
  examUrl: string;
  question: Question;
  addedAt: string;
};

export type Settings = {
  theme: Theme;
  reveal: RevealMode;
};

export type ManifestRegistry = {
  /** Extra manifests added by the user. */
  urls: string[];
  activeId: string | null;
};

export type PersistedState = {
  settings: Settings;
  manifests: ManifestRegistry;
  progress: Record<string, Attempt[]>;
  failed: Record<string, FailedQuestion>;
};
