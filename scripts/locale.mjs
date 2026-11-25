import { readFileSync } from "node:fs";

/**
 * index.html is emitted at build time and cannot call t(), so its copy is
 * lifted out of the same locale file the app uses.
 */
const source = new URL("../src/locales/es.json", import.meta.url);

/** @type {{ app: { title: string, description: string, noscript: { title: string, body: string, hint: string } } }} */
export const locale = JSON.parse(readFileSync(source, "utf8"));

export const htmlCopy = {
  appTitle: locale.app.title,
  appDescription: locale.app.description,
  noscriptTitle: locale.app.noscript.title,
  noscriptBody: locale.app.noscript.body,
  noscriptHint: locale.app.noscript.hint,
};
