import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpError, NetworkError, ParseError, SchemaValidationError } from "@/data/errors";
import { clearCache, examUrl, fetchExam, fetchManifest, questionImageUrl } from "@/data/repository";
import { isValidManifestUrl, manifestId } from "@/lib/manifest-id";
import examFixture from "./fixtures/exam-248.json";
import manifestFixture from "./fixtures/manifest.json";

const MANIFEST_URL =
  "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/dist/manifest.json";

const originalFetch = globalThis.fetch;
let calls: string[] = [];

function stubFetch(handler: (url: string) => Response | Promise<Response>) {
  globalThis.fetch = ((input: string | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push(url);
    return Promise.resolve(handler(url));
  }) as typeof fetch;
}

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  calls = [];
  clearCache();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("url resolution", () => {
  it("resolves an exam path against the manifest directory", () => {
    expect(examUrl(MANIFEST_URL, "exam-279/index.json")).toBe(
      "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/dist/exam-279/index.json",
    );
  });

  it("resolves a question image against its own exam, not the manifest", () => {
    const exam = examUrl(MANIFEST_URL, "exam-279/index.json");

    expect(questionImageUrl(exam, "image-1.jpg")).toBe(
      "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/dist/exam-279/image-1.jpg",
    );
  });
});

describe("manifestId", () => {
  it("strips the fragment", () => {
    expect(manifestId(`${MANIFEST_URL}#latest`)).toBe(MANIFEST_URL);
  });

  it("lowercases the host so one manifest is never tracked twice", () => {
    expect(manifestId("https://RAW.githubusercontent.com/a/b/manifest.json")).toBe(
      "https://raw.githubusercontent.com/a/b/manifest.json",
    );
  });

  it("keeps the query string, which can select a revision", () => {
    expect(manifestId(`${MANIFEST_URL}?ref=v1`)).toBe(`${MANIFEST_URL}?ref=v1`);
  });
});

describe("isValidManifestUrl", () => {
  it("accepts http and https", () => {
    expect(isValidManifestUrl(MANIFEST_URL)).toBe(true);
    expect(isValidManifestUrl("http://localhost:8080/manifest.json")).toBe(true);
  });

  it("rejects other protocols and anything unparseable", () => {
    expect(isValidManifestUrl("file:///etc/passwd")).toBe(false);
    expect(isValidManifestUrl("javascript:alert(1)")).toBe(false);
    expect(isValidManifestUrl("manifest.json")).toBe(false);
  });
});

describe("fetchManifest", () => {
  it("returns the validated manifest", async () => {
    stubFetch(() => json(manifestFixture));

    const manifest = await fetchManifest(MANIFEST_URL);

    expect(manifest.exams).toHaveLength(3);
  });

  it("serves a second request from the session cache", async () => {
    stubFetch(() => json(manifestFixture));

    await fetchManifest(MANIFEST_URL);
    await fetchManifest(MANIFEST_URL);

    expect(calls).toHaveLength(1);
  });

  it("collapses concurrent requests into one", async () => {
    stubFetch(() => json(manifestFixture));

    await Promise.all([fetchManifest(MANIFEST_URL), fetchManifest(MANIFEST_URL)]);

    expect(calls).toHaveLength(1);
  });

  it("reports a blocked or offline request as a NetworkError", async () => {
    stubFetch(() => {
      throw new TypeError("Failed to fetch");
    });

    await expect(fetchManifest(MANIFEST_URL)).rejects.toBeInstanceOf(NetworkError);
  });

  it("reports a missing file as an HttpError carrying the status", async () => {
    stubFetch(() => new Response("", { status: 404, statusText: "Not Found" }));

    try {
      await fetchManifest(MANIFEST_URL);
      throw new Error("expected fetchManifest to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(404);
    }
  });

  it("reports a non-JSON response as a ParseError", async () => {
    stubFetch(() => new Response("<html>nope</html>", { status: 200 }));

    await expect(fetchManifest(MANIFEST_URL)).rejects.toBeInstanceOf(ParseError);
  });

  it("reports JSON that is not a manifest as a SchemaValidationError", async () => {
    stubFetch(() => json({ hello: "world" }));

    await expect(fetchManifest(MANIFEST_URL)).rejects.toBeInstanceOf(SchemaValidationError);
  });

  it("does not cache a failure, so a retry can still succeed", async () => {
    let attempt = 0;
    stubFetch(() => {
      attempt += 1;
      return attempt === 1 ? new Response("", { status: 500 }) : json(manifestFixture);
    });

    await expect(fetchManifest(MANIFEST_URL)).rejects.toBeInstanceOf(HttpError);
    const manifest = await fetchManifest(MANIFEST_URL);

    expect(manifest.exams).toHaveLength(3);
    expect(calls).toHaveLength(2);
  });
});

describe("fetchExam", () => {
  it("fetches the exam from the path resolved against its manifest", async () => {
    stubFetch(() => json(examFixture));

    const exam = await fetchExam(MANIFEST_URL, "exam-248/index.json");

    expect(exam.number).toBe(248);
    expect(calls[0]).toBe(
      "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/dist/exam-248/index.json",
    );
  });

  it("serves a second request from the session cache", async () => {
    stubFetch(() => json(examFixture));

    await fetchExam(MANIFEST_URL, "exam-248/index.json");
    await fetchExam(MANIFEST_URL, "exam-248/index.json");

    expect(calls).toHaveLength(1);
  });
});
