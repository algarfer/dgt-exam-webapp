import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/cn";
import { downloadExport, readImportFile } from "@/store/export";
import { useStore } from "@/store/store";
import type { RevealMode, Theme } from "@/store/types";

type Option<T extends string> = { value: T; label: string };

function Choice<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  name: string;
}) {
  return (
    <fieldset className="mt-gap">
      <legend className="sr-only">{name}</legend>

      <div className="flex flex-wrap gap-dash">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "cursor-pointer border px-gap py-dash text-sm motion-safe:transition-colors",
              "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-temporary",
              option.value === value
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--ground)]"
                : "border-[var(--seam-color)] hover:border-[var(--ink)]",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Settings() {
  const { t } = useTranslation();
  const settings = useStore((state) => state.settings);
  const setTheme = useStore((state) => state.setTheme);
  const setReveal = useStore((state) => state.setReveal);
  const replaceState = useStore((state) => state.replaceState);

  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const importFile = async (file: File) => {
    setNotice(null);
    setProblem(null);

    try {
      replaceState(await readImportFile(file));
      setNotice(t("settings.data.imported"));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      setProblem(
        reason === "not-json"
          ? t("settings.data.notJson")
          : reason === "newer-version"
            ? t("settings.data.newerVersion")
            : t("settings.data.notExport"),
      );
    }
  };

  const themes: Option<Theme>[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("theme.light") },
    { value: "dark", label: t("theme.dark") },
  ];

  const reveals: (Option<RevealMode> & { help: string })[] = [
    { value: "select", label: t("settings.reveal.select"), help: t("settings.reveal.selectHelp") },
    { value: "submit", label: t("settings.reveal.submit"), help: t("settings.reveal.submitHelp") },
  ];

  const reveal = reveals.find((option) => option.value === settings.reveal);

  return (
    <section className="py-run">
      <Heading>{t("settings.title")}</Heading>

      <Heading level={2} className="mt-run">
        {t("settings.theme")}
      </Heading>
      <Choice
        options={themes}
        value={settings.theme}
        onChange={setTheme}
        name={t("settings.theme")}
      />

      <Heading level={2} className="mt-run">
        {t("settings.reveal.title")}
      </Heading>
      <Choice
        options={reveals}
        value={settings.reveal}
        onChange={setReveal}
        name={t("settings.reveal.title")}
      />
      {reveal ? (
        <p className="mt-dash max-w-[65ch] text-sm text-[var(--ink-dim)]">{reveal.help}</p>
      ) : null}

      <Heading level={2} className="mt-run">
        {t("settings.data.title")}
      </Heading>
      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">{t("settings.data.body")}</p>

      <div className="mt-interval flex flex-wrap items-center gap-gap">
        <Button onClick={() => downloadExport(useStore.getState())}>
          {t("settings.data.export")}
        </Button>

        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          {t("settings.data.import")}
        </Button>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {notice ? <p className="mt-gap text-sm">{notice}</p> : null}
      {problem ? <p className="mt-gap text-sm text-temporary">{problem}</p> : null}
    </section>
  );
}
