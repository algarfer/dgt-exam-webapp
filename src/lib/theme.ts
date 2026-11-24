import type { Theme } from "@/store/types";

export const THEME_STORAGE_KEY = "dgt-exam-webapp";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;

  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
}
