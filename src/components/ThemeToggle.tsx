import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { applyTheme } from "@/lib/theme";
import { useStore } from "@/store/store";
import type { Theme } from "@/store/types";

const order: Theme[] = ["system", "light", "dark"];
const labelKeys = {
  system: "theme.system",
  light: "theme.light",
  dark: "theme.dark",
} as const;

export function ThemeToggle() {
  const { t } = useTranslation();
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
      aria-label={t("theme.toggle", { current: t(labelKeys[theme]), next: t(labelKeys[next]) })}
    >
      {t("theme.current", { theme: t(labelKeys[theme]) })}
    </button>
  );
}
