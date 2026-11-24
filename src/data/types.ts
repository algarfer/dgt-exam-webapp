export type Answer = {
  text: string;
  correct?: boolean;
};

export type Question = {
  number: number;
  title: string;
  image?: string | null;
  image_alt?: string | null;
  image_source?: string | null;
  feedback?: string;
  answers: Answer[];
};

export type Exam = {
  $schema?: string;
  number: number;
  title: string;
  url: string;
  scraped_at: string;
  questions: Question[];
};

export type ManifestEntry = {
  number: number;
  title: string;
  path: string;
};

export type Manifest = {
  $schema?: string;
  generated_at: string;
  source: string;
  exams: ManifestEntry[];
};
