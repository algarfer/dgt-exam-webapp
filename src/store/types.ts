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
  examUrl: string;
  number: number;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  feedback: string | null;
  answers: { text: string; correct: boolean }[];
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
