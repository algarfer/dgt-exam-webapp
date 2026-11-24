import type { StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

let quotaExceeded = false;

function backend(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof globalThis.localStorage !== "undefined") return globalThis.localStorage;

  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => void memory.set(key, value),
    removeItem: (key) => void memory.delete(key),
  };
}

function flagQuotaExceeded() {
  if (quotaExceeded) return;
  quotaExceeded = true;
  for (const listener of listeners) listener();
}

export const safeStorage: StateStorage = {
  getItem: (name) => backend().getItem(name),
  setItem: (name, value) => {
    try {
      backend().setItem(name, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        flagQuotaExceeded();
        return;
      }
      throw error;
    }
  },
  removeItem: (name) => backend().removeItem(name),
};

export function subscribeToQuota(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function isQuotaExceeded(): boolean {
  return quotaExceeded;
}

export function resetQuotaFlag(): void {
  quotaExceeded = false;
}
