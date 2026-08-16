import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type DesktopBridge } from "../shared/desktop-bridge";

const bridge: DesktopBridge = {
  platform: "desktop",
  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.appInfo),
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.openFile),
  saveFile: (content, suggestedName) => ipcRenderer.invoke(IPC_CHANNELS.saveFile, content, suggestedName),
  openExternal: (url) => ipcRenderer.invoke(IPC_CHANNELS.openExternal, url),
  getBackendConnection: () => ipcRenderer.invoke(IPC_CHANNELS.backendConnection),
  getWorkspaceCwd: () => ipcRenderer.invoke(IPC_CHANNELS.workspaceCwd)
};

contextBridge.exposeInMainWorld("pi", bridge);
