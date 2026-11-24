/**
 * A manifest is identified by URL, which is far too long for a header. Show
 * the owning repository or host instead, which is what the user recognises.
 */
export function manifestLabel(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "raw.githubusercontent.com") {
      const [, repo] = parsed.pathname.split("/").filter(Boolean);
      if (repo) return repo;
    }

    return parsed.hostname;
  } catch {
    return url;
  }
}
