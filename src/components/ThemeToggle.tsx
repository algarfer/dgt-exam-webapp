import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { useStore } from "@/store/store";
import type { Theme } from "@/store/types";

const order: Theme[] = ["system", "light", "dark"];
const label: Record<Theme, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
};

export function ThemeToggle() {
  const theme = useStore((state) => state.settings.theme);
  const setTheme = useStore((state) => state.setTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme("system");
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [theme]);

  const next = order[(order.indexOf(theme) + 1) % order.length] ?? "system";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors"
      aria-label={`Tema: ${label[theme]}. Cambiar a ${label[next]}`}
    >
      Tema · {label[theme]}
    </button>
  );
}
