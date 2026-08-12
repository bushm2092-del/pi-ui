import { mountApp } from "@pi/app";
import "@pi/app/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found");
document.documentElement.dataset.platform = "desktop";
const backend = await window.pi.getBackendConnection();
const cwd = await window.pi.getWorkspaceCwd();
mountApp(root, { platform: window.pi.platform, backend, cwd });
