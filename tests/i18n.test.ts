import { describe, expect, it } from "bun:test";
import { HttpError, NetworkError } from "@/data/errors";
import i18n from "@/i18n";
import { errorCopy } from "@/lib/error-copy";

const t = i18n.t.bind(i18n);

describe("the locale", () => {
  it("loads Spanish", () => {
    expect(i18n.language).toBe("es");
    expect(t("app.title")).toBe("DGT Tests");
  });

  it("interpolates", () => {
    expect(t("examRun.position", { current: 3, total: 30 })).toBe("Pregunta 3 de 30");
  });

  it("picks the singular and the plural", () => {
    expect(t("examList.tries", { count: 1 })).toBe("intento");
    expect(t("examList.tries", { count: 4 })).toBe("intentos");
    expect(t("examRun.confirm.body", { count: 1, total: 30 })).toContain(
      "1 pregunta sin responder",
    );
    expect(t("examRun.confirm.body", { count: 2, total: 30 })).toContain(
      "2 preguntas sin responder",
    );
  });

  it("leaves no key unresolved", () => {
    // A missing key returns the key itself, which is the shape of this failure.
    expect(t("recent.questions", { count: 14 })).toBe("14 preg.");
    expect(t("stats.scope.exam", { number: 279 })).toBe("el examen 279");
  });
});

describe("error copy", () => {
  it("translates a network failure", () => {
    const copy = errorCopy(new NetworkError("https://example.com/manifest.json"));

    expect(copy.title).toBe("No se ha podido conectar");
    expect(copy.detail).toContain("https://example.com/manifest.json");
  });

  it("separates a 404 from a server error", () => {
    const missing = errorCopy(new HttpError("https://example.com/a.json", 404, "Not Found"));
    const broken = errorCopy(new HttpError("https://example.com/a.json", 500, "Server Error"));

    expect(missing.title).toBe("El archivo no existe");
    expect(missing.recovery).toBe("Revisa la URL del manifiesto.");
    expect(broken.title).toBe("El servidor ha devuelto un error");
    expect(broken.detail).toContain("500");
  });
});
