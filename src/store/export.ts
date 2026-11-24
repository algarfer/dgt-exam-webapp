import { migrate, STORAGE_VERSION } from "./migrations";
import type { PersistedState } from "./types";

const APP_ID = "dgt-exam-webapp";

export type ExportPayload = {
  app: string;
  version: number;
  exportedAt: string;
  state: PersistedState;
};

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

export function buildExport(state: PersistedState): ExportPayload {
  return {
    app: APP_ID,
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function parseImport(text: string): PersistedState {
  let payload: unknown;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new ImportError("not-json");
  }

  if (typeof payload !== "object" || payload === null) {
    throw new ImportError("not-an-export");
  }

  const { app, version, state } = payload as Partial<ExportPayload>;

  if (app !== APP_ID) throw new ImportError("not-an-export");
  if (typeof version !== "number") throw new ImportError("not-an-export");
  if (version > STORAGE_VERSION) throw new ImportError("newer-version");

  return migrate(state, version);
}

export function exportFileName(now = new Date()): string {
  return `${APP_ID}-${now.toISOString().slice(0, 10)}.json`;
}

export function downloadExport(state: PersistedState): void {
  const blob = new Blob([JSON.stringify(buildExport(state), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = exportFileName();
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function readImportFile(file: File): Promise<PersistedState> {
  return parseImport(await file.text());
}
