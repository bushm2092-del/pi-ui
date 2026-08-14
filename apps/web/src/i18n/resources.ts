import { enUS } from "./locales/en-US";
import { zhCN } from "./locales/zh-CN";

export const resources = {
  "zh-CN": { translation: zhCN },
  "en-US": { translation: enUS },
} as const;

export type SupportedLanguage = keyof typeof resources;
