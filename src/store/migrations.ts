import type { PersistedState } from "./types";

export const STORAGE_VERSION = 1;

export const defaultState: PersistedState = {
  settings: { theme: "system", reveal: "select" },
  manifests: { urls: [], activeId: null },
  progress: {},
  failed: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrate(persisted: unknown, _version: number): PersistedState {
  if (!isRecord(persisted)) return structuredClone(defaultState);

  const settings = isRecord(persisted.settings) ? persisted.settings : {};
  const manifests = isRecord(persisted.manifests) ? persisted.manifests : {};

  return {
    settings: {
      theme:
        settings.theme === "light" || settings.theme === "dark" || settings.theme === "system"
          ? settings.theme
          : defaultState.settings.theme,
      reveal:
        settings.reveal === "select" || settings.reveal === "submit"
          ? settings.reveal
          : defaultState.settings.reveal,
    },
    manifests: {
      urls: Array.isArray(manifests.urls)
        ? manifests.urls.filter((url): url is string => typeof url === "string")
        : [],
      activeId: typeof manifests.activeId === "string" ? manifests.activeId : null,
    },
    progress: isRecord(persisted.progress)
      ? (persisted.progress as PersistedState["progress"])
      : {},
    failed: isRecord(persisted.failed) ? (persisted.failed as PersistedState["failed"]) : {},
  };
}
