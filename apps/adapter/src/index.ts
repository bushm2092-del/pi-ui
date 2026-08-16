import type { AppInfo, RuntimePlatform } from "@pi/shared";

export interface Adapter {
  readonly platform: RuntimePlatform;
  getAppInfo(): Promise<AppInfo>;
  openFile(): Promise<{ path: string; content: string } | null>;
  saveFile(content: string, suggestedName?: string): Promise<string | null>;
  openExternal(url: string): Promise<void>;
}

/**
 * 桌面端（Electron）preload 通过 contextBridge 注入 window.pi，
 * 直接提供这些方法（见 apps/desktop/src/preload/index.ts）。
 */
const desktopAdapter = (): Adapter | undefined =>
  (window as unknown as { pi?: Adapter }).pi;

const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i;

const isMobileBrowser = (): boolean =>
  MOBILE_UA.test(navigator.userAgent) ||
  // iPadOS 13+ 上报为桌面版 Safari UA，需借助多点触控识别。
  (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

const browserPlatform = (): RuntimePlatform => (isMobileBrowser() ? "mobile" : "web");

const unsupported = (capability: string): Promise<never> =>
  Promise.reject(new Error(`${capability} is unavailable in this browser`));

const webAppInfo = (): Promise<AppInfo> =>
  Promise.resolve({ name: "Pi Web", version: "0.0.0", platform: browserPlatform() });

const openInNewTab = (url: string): Promise<void> => {
  window.open(url, "_blank", "noopener,noreferrer");
  return Promise.resolve();
};

/**
 * 单一运行时适配器：桌面端（window.pi）与浏览器端分别提供方法，
 * 这里按环境调用对应实现。
 */
export const adapter: Adapter = {
  get platform() {
    return desktopAdapter()?.platform ?? browserPlatform();
  },
  getAppInfo: () => desktopAdapter()?.getAppInfo() ?? webAppInfo(),
  openFile: () => desktopAdapter()?.openFile() ?? unsupported("Native file picker"),
  saveFile: (content, suggestedName) =>
    desktopAdapter()?.saveFile(content, suggestedName) ?? unsupported("Native file saving"),
  openExternal: (url) => desktopAdapter()?.openExternal(url) ?? openInNewTab(url)
};
