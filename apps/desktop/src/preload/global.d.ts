import type { DesktopBridge } from "../shared/desktop-bridge";

declare global {
  interface Window { pi: DesktopBridge; }
}

export {};
