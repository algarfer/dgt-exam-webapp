import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { rail } from "@/components/ui/Rail";
import { fetchManifest } from "@/data/repository";
import { cn } from "@/lib/cn";
import { errorCopy } from "@/lib/error-copy";
import { manifestId } from "@/lib/manifest-id";
import { activeManifestUrl, DEFAULT_MANIFEST_ID, manifestUrls, useStore } from "@/store/store";

export function Manifests() {
  const { t } = useTranslation();
  const state = useStore();
  const active = manifestId(activeManifestUrl(state));

  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const urls = manifestUrls(state);

  const add = async () => {
    setProblem(null);

    const candidate = url.trim();
    if (!candidate) return;

    setChecking(true);
    try {
      // Validate before storing, so a bad URL never enters the registry.
      await fetchManifest(candidate);
    } catch (error) {
      const copy = errorCopy(error);
      setProblem(`${copy.title}. ${copy.recovery}`);
      setChecking(false);
      return;
    }
    setChecking(false);

    const result = state.addManifest(candidate);
    if (!result.ok) {
      setProblem(result.reason === "duplicate" ? t("manifests.duplicate") : t("manifests.invalid"));
      return;
    }

    setUrl("");
  };

  return (
    <section className="py-run">
      <Heading>{t("manifests.title")}</Heading>
      <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("manifests.intro")}</p>

      <ul className="mt-run">
        {urls.map((candidate) => {
          const id = manifestId(candidate);
          const isDefault = id === DEFAULT_MANIFEST_ID;

          return (
            <li
              key={id}
              className={cn(
                rail(id === active ? "committed" : "open"),
                "flex flex-wrap items-baseline gap-gap py-gap",
                "border-t border-[var(--seam-color)]",
              )}
            >
              <span className="min-w-0 flex-1 break-all font-mono text-sm">{candidate}</span>

              {isDefault ? (
                <span className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)]">
                  {t("manifests.included")}
                </span>
              ) : null}

              {id === active ? (
                <span className="text-xs uppercase tracking-[0.1em] text-temporary">
                  {t("manifests.active")}
                </span>
              ) : (
                <Button variant="secondary" onClick={() => state.setActiveManifest(id)}>
                  {t("manifests.use")}
                </Button>
              )}

              {isDefault ? null : (
                <Button variant="danger" onClick={() => state.removeManifest(id)}>
                  {t("manifests.remove")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <form
        className="mt-run border-t border-[var(--seam-color)] pt-interval"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <Heading level={3}>{t("manifests.add.title")}</Heading>

        <div className="mt-gap flex flex-wrap gap-gap">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t("manifests.add.placeholder")}
            className="min-w-0 flex-1 border border-[var(--seam-color)] bg-transparent px-gap py-dash font-mono text-sm focus:border-[var(--ink)] focus:outline-none"
          />
          <Button type="submit" disabled={checking || url.trim().length === 0}>
            {checking ? t("manifests.add.checking") : t("manifests.add.submit")}
          </Button>
        </div>

        {problem ? <p className="mt-gap max-w-[65ch] text-sm text-temporary">{problem}</p> : null}
      </form>
    </section>
  );
}
