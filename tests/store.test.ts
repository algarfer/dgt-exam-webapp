import { beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_MANIFEST_URL } from "@/data/repository";
import type { Question } from "@/data/types";
import { questionKey } from "@/lib/keys";
import { manifestId } from "@/lib/manifest-id";
import { buildExport, ImportError, parseImport } from "@/store/export";
import { defaultState, migrate } from "@/store/migrations";
import { activeManifestUrl, DEFAULT_MANIFEST_ID, manifestUrls, useStore } from "@/store/store";
import type { Attempt, FailedQuestion } from "@/store/types";

const OTHER_MANIFEST = "https://example.com/dgt/manifest.json";
const OTHER_ID = manifestId(OTHER_MANIFEST);

const question: Question = {
  number: 3,
  title: "¿Qué sistema reduce el riesgo de bloqueo de las ruedas?",
  answers: [
    { text: "El servofreno.", correct: false },
    { text: "El ABS.", correct: true },
  ],
};

function failedEntry(manifest: string, examNumber: number, questionNumber: number): FailedQuestion {
  return {
    id: questionKey(manifest, examNumber, questionNumber),
    manifestId: manifest,
    examNumber,
    examTitle: "Febrero 2014",
    examUrl: `https://example.com/dgt/exam-${examNumber}/index.json`,
    question: { ...question, number: questionNumber },
    addedAt: "2026-11-24T10:00:00.000Z",
  };
}

const attempt: Attempt = {
  at: "2026-11-24T10:00:00.000Z",
  correct: 9,
  total: 10,
  seconds: 320,
  passed: true,
};

beforeEach(() => {
  useStore.setState(structuredClone(defaultState));
});

describe("manifest registry", () => {
  it("lists the built-in manifest first and never stores it", () => {
    expect(manifestUrls(useStore.getState())).toEqual([DEFAULT_MANIFEST_URL]);
    expect(useStore.getState().manifests.urls).toEqual([]);
  });

  it("adds a manifest by url", () => {
    expect(useStore.getState().addManifest(OTHER_MANIFEST)).toEqual({ ok: true });
    expect(manifestUrls(useStore.getState())).toEqual([DEFAULT_MANIFEST_URL, OTHER_ID]);
  });

  it("refuses a url that is not http or https", () => {
    expect(useStore.getState().addManifest("file:///manifest.json")).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("refuses the same manifest twice, even spelled differently", () => {
    useStore.getState().addManifest(OTHER_MANIFEST);

    expect(useStore.getState().addManifest(`${OTHER_MANIFEST}#again`)).toEqual({
      ok: false,
      reason: "duplicate",
    });
  });

  it("refuses the built-in manifest as a duplicate", () => {
    expect(useStore.getState().addManifest(DEFAULT_MANIFEST_URL)).toEqual({
      ok: false,
      reason: "duplicate",
    });
  });

  it("falls back to the built-in manifest when the active one is gone", () => {
    useStore.getState().addManifest(OTHER_MANIFEST);
    useStore.getState().setActiveManifest(OTHER_ID);
    expect(activeManifestUrl(useStore.getState())).toBe(OTHER_ID);

    useStore.getState().removeManifest(OTHER_ID);

    expect(activeManifestUrl(useStore.getState())).toBe(DEFAULT_MANIFEST_URL);
    expect(useStore.getState().manifests.activeId).toBeNull();
  });
});

describe("progress", () => {
  it("keeps every attempt so the list can show last, best and tries", () => {
    const store = useStore.getState();
    store.recordAttempt(DEFAULT_MANIFEST_ID, 279, attempt);
    store.recordAttempt(DEFAULT_MANIFEST_ID, 279, { ...attempt, correct: 7, passed: false });

    const attempts = useStore.getState().progress[`${DEFAULT_MANIFEST_ID}|279`];

    expect(attempts).toHaveLength(2);
    expect(attempts?.at(-1)?.correct).toBe(7);
  });
});

describe("failed pool", () => {
  it("stores a snapshot keyed by identity, not by position", () => {
    useStore.getState().addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));

    const entry = useStore.getState().failed[questionKey(DEFAULT_MANIFEST_ID, 279, 3)];

    expect(entry?.question.title).toContain("bloqueo");
    expect(entry?.examUrl).toContain("exam-279/index.json");
  });

  it("replaces an entry instead of duplicating it", () => {
    useStore.getState().addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));
    useStore.getState().addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));

    expect(Object.keys(useStore.getState().failed)).toHaveLength(1);
  });

  it("drops an entry once answered correctly", () => {
    const id = questionKey(DEFAULT_MANIFEST_ID, 279, 3);
    useStore.getState().addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));

    useStore.getState().removeFailed(id);

    expect(useStore.getState().failed[id]).toBeUndefined();
  });
});

describe("wiping", () => {
  beforeEach(() => {
    const store = useStore.getState();
    store.recordAttempt(DEFAULT_MANIFEST_ID, 279, attempt);
    store.recordAttempt(DEFAULT_MANIFEST_ID, 278, attempt);
    store.recordAttempt(OTHER_ID, 279, attempt);
    store.addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));
    store.addFailed(failedEntry(DEFAULT_MANIFEST_ID, 278, 1));
    store.addFailed(failedEntry(OTHER_ID, 279, 3));
  });

  it("wipes a single exam of a single manifest", () => {
    useStore.getState().wipeExam(DEFAULT_MANIFEST_ID, 279);
    const state = useStore.getState();

    expect(state.progress[`${DEFAULT_MANIFEST_ID}|279`]).toBeUndefined();
    expect(state.progress[`${DEFAULT_MANIFEST_ID}|278`]).toHaveLength(1);
    expect(state.progress[`${OTHER_ID}|279`]).toHaveLength(1);
    expect(Object.keys(state.failed)).toHaveLength(2);
  });

  it("wipes every exam of one manifest and leaves the others alone", () => {
    useStore.getState().wipeManifest(DEFAULT_MANIFEST_ID);
    const state = useStore.getState();

    expect(Object.keys(state.progress)).toEqual([`${OTHER_ID}|279`]);
    expect(Object.values(state.failed).every((entry) => entry.manifestId === OTHER_ID)).toBe(true);
  });

  it("wipes everything but keeps settings and manifests", () => {
    useStore.getState().setTheme("dark");
    useStore.getState().addManifest(OTHER_MANIFEST);

    useStore.getState().wipeAll();
    const state = useStore.getState();

    expect(state.progress).toEqual({});
    expect(state.failed).toEqual({});
    expect(state.settings.theme).toBe("dark");
    expect(state.manifests.urls).toEqual([OTHER_ID]);
  });
});

describe("migrate", () => {
  it("falls back to defaults for anything unrecognisable", () => {
    expect(migrate(null, 0)).toEqual(defaultState);
    expect(migrate("nonsense", 0)).toEqual(defaultState);
  });

  it("repairs an invalid theme instead of keeping it", () => {
    const migrated = migrate({ settings: { theme: "neon", reveal: "submit" } }, 1);

    expect(migrated.settings.theme).toBe("system");
    expect(migrated.settings.reveal).toBe("submit");
  });

  it("drops non-string manifest urls", () => {
    const migrated = migrate({ manifests: { urls: [OTHER_MANIFEST, 42, null] } }, 1);

    expect(migrated.manifests.urls).toEqual([OTHER_MANIFEST]);
  });
});

describe("export and import", () => {
  it("round-trips the persisted state", () => {
    const store = useStore.getState();
    store.setTheme("dark");
    store.addManifest(OTHER_MANIFEST);
    store.recordAttempt(DEFAULT_MANIFEST_ID, 279, attempt);
    store.addFailed(failedEntry(DEFAULT_MANIFEST_ID, 279, 3));

    const before = useStore.getState();
    const text = JSON.stringify(buildExport(before));

    useStore.setState(structuredClone(defaultState));
    expect(useStore.getState().progress).toEqual({});

    useStore.getState().replaceState(parseImport(text));
    const after = useStore.getState();

    expect(after.settings.theme).toBe("dark");
    expect(after.manifests.urls).toEqual([OTHER_ID]);
    expect(after.progress[`${DEFAULT_MANIFEST_ID}|279`]).toHaveLength(1);
    expect(Object.keys(after.failed)).toHaveLength(1);
  });

  it("rejects a file that is not JSON", () => {
    expect(() => parseImport("nope")).toThrow(ImportError);
  });

  it("rejects an export from another app", () => {
    expect(() => parseImport(JSON.stringify({ app: "something-else", version: 1 }))).toThrow(
      ImportError,
    );
  });

  it("rejects an export written by a newer version", () => {
    expect(() =>
      parseImport(JSON.stringify({ app: "dgt-exam-webapp", version: 99, state: {} })),
    ).toThrow(ImportError);
  });
});
