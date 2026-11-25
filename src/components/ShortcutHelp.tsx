import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ADVANCE_KEYS,
  ANSWER_KEYS,
  HELP_KEYS,
  NEXT_KEYS,
  PREVIOUS_KEYS,
  useKeybinds,
} from "@/hooks/useKeybinds";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";

const named: Record<string, string> = {
  " ": "Espacio",
  ArrowRight: "→",
  ArrowLeft: "←",
  ArrowDown: "↓",
  ArrowUp: "↑",
};

/** Read off the real bindings, so this list cannot drift from them. */
function labels(keys: string[]): string[] {
  const seen = new Set<string>();

  for (const key of keys) {
    seen.add(named[key] ?? (key.length === 1 ? key.toUpperCase() : key));
  }

  return [...seen];
}

export function ShortcutHelp() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { keys: labels(ANSWER_KEYS), what: t("shortcuts.answer") },
    { keys: labels(ADVANCE_KEYS), what: t("shortcuts.advance") },
    { keys: labels(NEXT_KEYS), what: t("shortcuts.next") },
    { keys: labels(PREVIOUS_KEYS), what: t("shortcuts.previous") },
    { keys: [t("shortcuts.escape")], what: t("shortcuts.closeDialog") },
    { keys: labels(HELP_KEYS), what: t("shortcuts.help") },
  ];
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
        aria-label={t("shortcuts.triggerLabel")}
      >
        {t("shortcuts.trigger")}
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
        <Heading level={2}>{t("shortcuts.title")}</Heading>
        <p className="mt-dash text-sm text-[var(--ink-dim)]">{t("shortcuts.note")}</p>

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
          <Button onClick={() => setOpen(false)}>{t("common.close")}</Button>
        </div>
      </dialog>
    </>
  );
}
