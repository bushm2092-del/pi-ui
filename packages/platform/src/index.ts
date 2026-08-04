import type { AppInfo, RuntimePlatform } from "@pi/shared";

export interface PlatformAdapter {
  readonly platform: RuntimePlatform;
  getAppInfo(): Promise<AppInfo>;
  openFile(): Promise<{ path: string; content: string } | null>;
  saveFile(content: string, suggestedName?: string): Promise<string | null>;
  openExternal(url: string): Promise<void>;
}

const unsupported = (capability: string) =>
  Promise.reject(new Error(`${capability} is unavailable in this browser`));

export const webPlatform: PlatformAdapter = {
  platform: "web",
  async getAppInfo() {
    return { name: "Pi Web", version: "0.0.0", platform: "web" };
  },
  openFile: () => unsupported("Native file picker"),
  saveFile: () => unsupported("Native file saving"),
  async openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
