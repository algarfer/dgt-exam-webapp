import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import es from "@/locales/es.json";

export const LANGUAGE = "es";

export const resources = { es: { translation: es } } as const;

void i18next.use(initReactI18next).init({
  resources,
  lng: LANGUAGE,
  fallbackLng: LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18next;
