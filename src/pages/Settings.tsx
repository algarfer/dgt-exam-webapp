import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/cn";
import { downloadExport, exportFileName, readImportFile } from "@/store/export";
import { useStore } from "@/store/store";
import type { RevealMode, Theme } from "@/store/types";

const themes: { value: Theme; label: string }[] = [
  { value: "system", label: "Como el sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

const reveals: { value: RevealMode; label: string; help: string }[] = [
  {
    value: "select",
    label: "Al elegir",
    help: "En repaso y sin fin, la respuesta correcta aparece en cuanto eliges una opción.",
  },
  {
    value: "submit",
    label: "Al comprobar",
    help: "En repaso y sin fin, puedes cambiar de opción hasta que pulsas Comprobar.",
  },
];

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
      setNotice("Datos importados.");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      setProblem(
        reason === "not-json"
          ? "Ese archivo no es un JSON."
          : reason === "newer-version"
            ? "Ese archivo lo escribió una versión más nueva de la aplicación."
            : "Ese archivo no es una exportación de esta aplicación.",
      );
    }
  };

  const reveal = reveals.find((option) => option.value === settings.reveal);

  return (
    <section className="py-run">
      <Heading>Ajustes</Heading>

      <Heading level={2} className="mt-run">
        Tema
      </Heading>
      <Choice options={themes} value={settings.theme} onChange={setTheme} name="Tema" />

      <Heading level={2} className="mt-run">
        Cuándo ver la respuesta
      </Heading>
      <Choice
        options={reveals}
        value={settings.reveal}
        onChange={setReveal}
        name="Cuándo ver la respuesta"
      />
      {reveal ? (
        <p className="mt-dash max-w-[65ch] text-sm text-[var(--ink-dim)]">{reveal.help}</p>
      ) : null}

      <Heading level={2} className="mt-run">
        Tus datos
      </Heading>
      <p className="mt-gap max-w-[65ch] text-sm text-[var(--ink-dim)]">
        Todo tu progreso vive en este navegador y en ningún otro sitio. Si borras los datos del
        sitio, se va con ellos. Expórtalo a un archivo para tener tu propia copia.
      </p>

      <div className="mt-interval flex flex-wrap items-center gap-gap">
        <Button onClick={() => downloadExport(useStore.getState())}>
          Exportar
        </Button>

        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          Importar
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
