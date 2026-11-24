import type { RevealMode } from "@/store/types";
import { Button } from "./ui/Button";

type TurnControlsProps = {
  reveal: RevealMode;
  revealed: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onNext: () => void;
  nextLabel?: string;
  onToggleReveal: () => void;
};

export function TurnControls({
  reveal,
  revealed,
  canSubmit,
  onSubmit,
  onNext,
  nextLabel = "Siguiente pregunta",
  onToggleReveal,
}: TurnControlsProps) {
  return (
    <nav className="mt-run flex flex-wrap items-center gap-gap border-t border-[var(--seam-color)] pt-gap">
      {reveal === "submit" && !revealed ? (
        <Button onClick={onSubmit} disabled={!canSubmit}>
          Comprobar
        </Button>
      ) : null}

      <Button variant={revealed ? "primary" : "secondary"} onClick={onNext}>
        {nextLabel}
      </Button>

      <button
        type="button"
        onClick={onToggleReveal}
        className="ms-auto text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] underline hover:text-[var(--ink)]"
      >
        {reveal === "select" ? "Ver respuesta al seleccionar" : "Ver respuesta al enviar"}
      </button>
    </nav>
  );
}
