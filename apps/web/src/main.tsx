import { webPlatform, type PlatformAdapter } from "@pi/platform";
import { mountApp } from ".";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found");
const desktop = window.pi;
const platform: PlatformAdapter = desktop?.platform ?? webPlatform;
const backend = desktop ? await desktop.getBackendConnection() : readWebBackend();
const cwd = desktop ? await desktop.getWorkspaceCwd() : import.meta.env.VITE_PI_CWD;

document.documentElement.dataset.platform = platform.platform;
mountApp(root, { platform, backend, cwd });

function readWebBackend() {
  const url = import.meta.env.VITE_PI_SOCKET_URL;
  const token = import.meta.env.VITE_PI_TOKEN;
  return url && token ? { url, token } : undefined;
}
