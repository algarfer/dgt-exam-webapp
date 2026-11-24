import { useEffect, useRef, useState } from "react";
import { HELP_KEYS, useKeybinds } from "@/hooks/useKeybinds";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";

const shortcuts = [
  { keys: ["1", "2", "3"], what: "Elegir la respuesta, hasta las que tenga la pregunta" },
  { keys: ["Enter", "Espacio"], what: "Comprobar, entregar o avanzar, según el modo" },
  { keys: ["N", "→"], what: "Siguiente pregunta" },
  { keys: ["P", "←"], what: "Pregunta anterior, solo en modo examen" },
  { keys: ["Esc"], what: "Cerrar el diálogo abierto" },
  { keys: ["?"], what: "Abrir y cerrar esta ayuda" },
];

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useKeybinds([{ keys: HELP_KEYS, run: () => setOpen(true) }]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors"
        aria-label="Ver los atajos de teclado"
      >
        Atajos
      </button>

      <dialog
        ref={ref}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "?") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className="m-auto max-w-[52ch] border border-[var(--ink)] bg-[var(--ground)] p-interval text-[var(--ink)] backdrop:bg-black/60"
      >
        <Heading level={2}>Atajos de teclado</Heading>
        <p className="mt-dash text-sm text-[var(--ink-dim)]">
          Todo lo que hacen estos atajos está también en un botón.
        </p>

        <dl className="mt-interval space-y-dash">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.what} className="flex flex-wrap items-baseline gap-gap">
              <dt className="flex shrink-0 gap-dash">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="border border-[var(--seam-color)] px-dash font-mono text-xs"
                  >
                    {key}
                  </kbd>
                ))}
              </dt>
              <dd className="min-w-0 flex-1 text-sm text-[var(--ink-dim)]">{shortcut.what}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-interval">
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </div>
      </dialog>
    </>
  );
}
