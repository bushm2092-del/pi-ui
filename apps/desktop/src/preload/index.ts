import { contextBridge, ipcRenderer } from "electron";
import type { PlatformAdapter } from "@pi/platform";
import { IPC_CHANNELS, type DesktopBridge } from "../shared/desktop-bridge";

const desktopPlatform: PlatformAdapter = {
  platform: "desktop",
  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.appInfo),
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.openFile),
  saveFile: (content, suggestedName) => ipcRenderer.invoke(IPC_CHANNELS.saveFile, content, suggestedName),
  openExternal: (url) => ipcRenderer.invoke(IPC_CHANNELS.openExternal, url)
};

const bridge: DesktopBridge = {
  platform: desktopPlatform,
  getBackendConnection: () => ipcRenderer.invoke(IPC_CHANNELS.backendConnection)
};

contextBridge.exposeInMainWorld("pi", bridge);
