export const APP_NAME = "Pi Desktop";

export type RuntimePlatform = "desktop" | "web";

export interface AppInfo {
  name: string;
  version: string;
  platform: RuntimePlatform;
}
