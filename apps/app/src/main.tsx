import { webPlatform } from "@pi/platform";
import { mountApp } from ".";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found");
document.documentElement.dataset.platform = "web";
const backend = readWebBackend();
mountApp(root, { platform: webPlatform, backend, cwd: import.meta.env.VITE_PI_CWD });

function readWebBackend() {
  const httpUrl = import.meta.env.VITE_PI_HTTP_URL;
  const webSocketUrl = import.meta.env.VITE_PI_WEBSOCKET_URL;
  const token = import.meta.env.VITE_PI_TOKEN;
  return httpUrl && webSocketUrl && token ? { httpUrl, webSocketUrl, token } : undefined;
}
