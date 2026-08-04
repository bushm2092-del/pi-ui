import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  session,
  shell,
  type IpcMainInvokeEvent
} from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentBackendConnection } from "@pi/agent-client";
import { startPiBackend, type PiBackendHandle } from "@pi/server";
import { APP_NAME } from "@pi/shared";
import { IPC_CHANNELS } from "../shared/desktop-bridge";

let backend: PiBackendHandle | undefined;
let backendConnection: AgentBackendConnection | undefined;
let mainWindow: BrowserWindow | undefined;
let shutdownStarted = false;

function registerIpc(): void {
  ipcMain.handle(IPC_CHANNELS.appInfo, (event) => {
    assertTrustedSender(event);
    return { name: APP_NAME, version: app.getVersion(), platform: "desktop" as const };
  });
  ipcMain.handle(IPC_CHANNELS.backendConnection, (event) => {
    assertTrustedSender(event);
    if (!backendConnection) throw new Error("Pi backend is not ready");
    return backendConnection;
  });
  ipcMain.handle(IPC_CHANNELS.openFile, async (event) => {
    assertTrustedSender(event);
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Text", extensions: ["txt", "md", "json"] }]
    });
    const path = result.filePaths[0];
    if (result.canceled || !path) return null;
    return { path, content: await readFile(path, "utf8") };
  });
  ipcMain.handle(IPC_CHANNELS.saveFile, async (event, content: unknown, suggestedName: unknown) => {
    assertTrustedSender(event);
    if (typeof content !== "string") throw new TypeError("File content must be a string");
    const defaultPath = typeof suggestedName === "string" ? suggestedName.replaceAll(/[\\/]/g, "-") : "pi-note.txt";
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: "Text", extensions: ["txt", "md"] }]
    });
    if (result.canceled || !result.filePath) return null;
    await writeFile(result.filePath, content, "utf8");
    return result.filePath;
  });
  ipcMain.handle(IPC_CHANNELS.openExternal, async (event, rawUrl: unknown) => {
    assertTrustedSender(event);
    if (typeof rawUrl !== "string") throw new TypeError("URL must be a string");
    await openExternal(rawUrl);
  });
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#f8f9fa",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow = window;
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = undefined;
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    void openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    void openExternal(url);
  });

  if (process.env.ELECTRON_RENDERER_URL) void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  else void window.loadFile(join(__dirname, "../renderer/index.html"));
}

async function bootstrap(): Promise<void> {
  const rendererOrigin = process.env.ELECTRON_RENDERER_URL
    ? new URL(process.env.ELECTRON_RENDERER_URL).origin
    : "null";
  backend = await startPiBackend({
    dataDir: join(app.getPath("userData"), "backend"),
    allowedOrigins: [rendererOrigin],
    onWorkerStderr(runtimeSlotId, text) {
      process.stderr.write(`[agent-worker:${runtimeSlotId}] ${text}`);
    }
  });
  backendConnection = {
    httpUrl: backend.address.httpUrl,
    webSocketUrl: backend.address.webSocketUrl,
    token: backend.token
  };
  registerIpc();
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

function assertTrustedSender(event: IpcMainInvokeEvent): void {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Untrusted IPC sender");
}

async function openExternal(rawUrl: string): Promise<void> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported external URL protocol");
  await shell.openExternal(url.toString());
}

app.whenReady().then(bootstrap).catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  dialog.showErrorBox("Pi Desktop failed to start", message);
  app.exit(1);
});

app.on("before-quit", (event) => {
  if (!backend || shutdownStarted) return;
  event.preventDefault();
  shutdownStarted = true;
  const activeBackend = backend;
  backend = undefined;
  backendConnection = undefined;
  void activeBackend.stop()
    .catch((error) => process.stderr.write(`Failed to stop Pi backend: ${String(error)}\n`))
    .finally(() => app.quit());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
