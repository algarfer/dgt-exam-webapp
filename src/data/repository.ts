import { manifestId } from "@/lib/manifest-id";
import { HttpError, NetworkError, ParseError } from "./errors";
import type { Exam, Manifest } from "./types";

export const DEFAULT_MANIFEST_URL =
  process.env.DEFAULT_MANIFEST_URL ??
  "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/dist/manifest.json";

const manifests = new Map<string, Promise<Manifest>>();
const exams = new Map<string, Promise<Exam>>();

export function examUrl(manifestUrl: string, path: string): string {
  return new URL(path, manifestUrl).href;
}

/** Images are relative to the exam that owns them, not to the manifest. */
export function questionImageUrl(examHref: string, image: string): string {
  return new URL(image, examHref).href;
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (cause) {
    throw new NetworkError(url, cause);
  }

  if (!response.ok) {
    throw new HttpError(url, response.status, response.statusText);
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new ParseError(url, cause);
  }
}

export function fetchManifest(url: string): Promise<Manifest> {
  const id = manifestId(url);
  const cached = manifests.get(id);
  if (cached) return cached;

  const pending = (async () => {
    const data = await fetchJson(id);
    const { validateManifest } = await import("./validate");
    return validateManifest(data);
  })();

  manifests.set(id, pending);
  // A failed load must not be cached, or a retry could never succeed.
  pending.catch(() => manifests.delete(id));

  return pending;
}

export function fetchExam(manifestUrl: string, path: string): Promise<Exam> {
  const href = examUrl(manifestId(manifestUrl), path);
  const cached = exams.get(href);
  if (cached) return cached;

  const pending = (async () => {
    const data = await fetchJson(href);
    const { validateExam } = await import("./validate");
    return validateExam(data);
  })();

  exams.set(href, pending);
  pending.catch(() => exams.delete(href));

  return pending;
}

export function clearCache(): void {
  manifests.clear();
  exams.clear();
}
