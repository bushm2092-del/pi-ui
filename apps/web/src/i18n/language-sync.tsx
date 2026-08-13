import { useEffect } from "react";
import { i18n, resolveSystemLanguage } from ".";
import { useAppStore } from "../stores/app-store";

export function LanguageSync() {
  const language = useAppStore((state) => state.language);

  useEffect(() => {
    const mediaLanguage = language === "system" ? resolveSystemLanguage() : language;
    void i18n.changeLanguage(mediaLanguage);
    document.documentElement.lang = mediaLanguage;
  }, [language]);

  return null;
}
