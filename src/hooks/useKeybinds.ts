import { useEffect, useRef } from "react";

export type Keybinding = {
  keys: string[];
  run: () => void;
  when?: boolean;
};

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

export function useKeybinds(bindings: Keybinding[]): void {
  const latest = useRef(bindings);
  latest.current = bindings;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      if (document.querySelector("dialog[open]")) return;

      for (const binding of latest.current) {
        if (binding.when === false) continue;
        if (!binding.keys.includes(event.key)) continue;

        event.preventDefault();
        binding.run();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

export const ANSWER_KEYS = ["1", "2", "3"];
export const ADVANCE_KEYS = ["Enter", " ", "l", "L"];
export const NEXT_KEYS = ["ArrowRight", "j", "J"];
export const PREVIOUS_KEYS = ["ArrowLeft", "k", "K"];
export const HELP_KEYS = ["?"];
