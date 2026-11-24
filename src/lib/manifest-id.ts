/**
 * Stable identity for a manifest, used as the key of every cache, progress
 * entry and failed question. Two URLs that differ only in case, default port
 * or fragment must produce the same id, or the same manifest would be tracked
 * twice.
 */
export function manifestId(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase();

  return parsed.href;
}

export function isValidManifestUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
