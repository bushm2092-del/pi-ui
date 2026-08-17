import { workspaceData } from "./data/workspace-data";

export function installWorkspaceDocument() {
  document.title = workspaceData.chrome.product.appName;
  document.documentElement.dataset.codexOs = getPlatform();
}

function getPlatform(): "darwin" | "win32" | "linux" {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("windows")) return "win32";
  if (userAgent.includes("macintosh") || userAgent.includes("mac os")) return "darwin";
  return "linux";
}
