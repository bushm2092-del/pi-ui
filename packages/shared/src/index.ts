export const APP_NAME = "Pi Desktop";

export type RuntimePlatform = "desktop" | "web";

export interface AppInfo {
  name: string;
  version: string;
  platform: RuntimePlatform;
}

export * from "./a2ui.js";
export * from "./json.js";
export * from "./runtime.js";
export * from "./result.js";
export * from "./sidebar.js";
