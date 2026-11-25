import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** A native dialog, so focus trapping and Esc come from the platform. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-w-[48ch] border border-[var(--ink)] bg-[var(--ground)] p-interval text-[var(--ink)] backdrop:bg-black/60"
    >
      <Heading level={2}>{title}</Heading>
      <p className="mt-gap text-sm text-[var(--ink-dim)]">{body}</p>

      <div className="mt-interval flex flex-wrap gap-dash">
        <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel ?? t("common.back")}
        </Button>
      </div>
    </dialog>
  );
}
