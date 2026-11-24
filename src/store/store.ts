import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_MANIFEST_URL } from "@/data/repository";
import { examKey } from "@/lib/keys";
import { isValidManifestUrl, manifestId } from "@/lib/manifest-id";
import { defaultState, migrate, STORAGE_VERSION } from "./migrations";
import { safeStorage } from "./storage";
import type { Attempt, FailedQuestion, PersistedState, RevealMode, Theme } from "./types";

export const STORAGE_KEY = "dgt-exam-webapp";

export type AddManifestResult = { ok: true } | { ok: false; reason: "invalid" | "duplicate" };

type Actions = {
  setTheme: (theme: Theme) => void;
  setReveal: (reveal: RevealMode) => void;
  addManifest: (url: string) => AddManifestResult;
  removeManifest: (id: string) => void;
  setActiveManifest: (id: string) => void;
  recordAttempt: (manifestId: string, examNumber: number, attempt: Attempt) => void;
  addFailed: (entry: FailedQuestion) => void;
  removeFailed: (id: string) => void;
  wipeExam: (manifestId: string, examNumber: number) => void;
  wipeManifest: (manifestId: string) => void;
  wipeAll: () => void;
  replaceState: (state: PersistedState) => void;
};

export type Store = PersistedState & Actions;

export const DEFAULT_MANIFEST_ID = manifestId(DEFAULT_MANIFEST_URL);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...structuredClone(defaultState),

      setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),

      setReveal: (reveal) => set((state) => ({ settings: { ...state.settings, reveal } })),

      addManifest: (url) => {
        if (!isValidManifestUrl(url)) return { ok: false, reason: "invalid" };

        const id = manifestId(url);
        const known = [DEFAULT_MANIFEST_ID, ...get().manifests.urls.map(manifestId)];
        if (known.includes(id)) return { ok: false, reason: "duplicate" };

        set((state) => ({
          manifests: { ...state.manifests, urls: [...state.manifests.urls, id] },
        }));
        return { ok: true };
      },

      removeManifest: (id) =>
        set((state) => {
          const urls = state.manifests.urls.filter((url) => manifestId(url) !== id);
          const activeId = state.manifests.activeId === id ? null : state.manifests.activeId;
          return { manifests: { urls, activeId } };
        }),

      setActiveManifest: (id) =>
        set((state) => ({ manifests: { ...state.manifests, activeId: id } })),

      recordAttempt: (manifest, examNumber, attempt) =>
        set((state) => {
          const key = examKey(manifest, examNumber);
          return {
            progress: { ...state.progress, [key]: [...(state.progress[key] ?? []), attempt] },
          };
        }),

      addFailed: (entry) => set((state) => ({ failed: { ...state.failed, [entry.id]: entry } })),

      removeFailed: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.failed;
          return { failed: rest };
        }),

      wipeExam: (manifest, examNumber) =>
        set((state) => {
          const key = examKey(manifest, examNumber);
          const { [key]: _removed, ...progress } = state.progress;
          const failed = Object.fromEntries(
            Object.entries(state.failed).filter(
              ([, entry]) => entry.manifestId !== manifest || entry.examNumber !== examNumber,
            ),
          );
          return { progress, failed };
        }),

      wipeManifest: (manifest) =>
        set((state) => {
          const prefix = `${manifest}|`;
          const progress = Object.fromEntries(
            Object.entries(state.progress).filter(([key]) => !key.startsWith(prefix)),
          );
          const failed = Object.fromEntries(
            Object.entries(state.failed).filter(([, entry]) => entry.manifestId !== manifest),
          );
          return { progress, failed };
        }),

      wipeAll: () => set({ progress: {}, failed: {} }),

      replaceState: (state) => set(structuredClone(state)),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      migrate,
      partialize: ({ settings, manifests, progress, failed }) => ({
        settings,
        manifests,
        progress,
        failed,
      }),
    },
  ),
);

/** The built-in manifest always comes first and is never stored. */
export function manifestUrls(state: PersistedState): string[] {
  return [DEFAULT_MANIFEST_URL, ...state.manifests.urls];
}

export function activeManifestUrl(state: PersistedState): string {
  const urls = manifestUrls(state);
  return urls.find((url) => manifestId(url) === state.manifests.activeId) ?? DEFAULT_MANIFEST_URL;
}
