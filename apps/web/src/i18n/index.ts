import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, type SupportedLanguage } from "./resources";

export const defaultLanguage: SupportedLanguage = "zh-CN";

void i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: Object.keys(resources),
  initAsync: false,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function resolveSystemLanguage(language = globalThis.navigator?.language): SupportedLanguage {
  return language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

export { i18n };
export type { SupportedLanguage } from "./resources";
