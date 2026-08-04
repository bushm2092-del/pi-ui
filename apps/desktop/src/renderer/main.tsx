import { mountApp } from "@pi/app";
import "@pi/app/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found");
document.documentElement.dataset.platform = "desktop";
const backend = await window.pi.getBackendConnection();
mountApp(root, { platform: window.pi.platform, backend });
