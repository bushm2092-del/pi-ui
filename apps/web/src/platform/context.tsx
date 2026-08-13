import { createContext, useContext, type PropsWithChildren } from "react";
import { webPlatform, type PlatformAdapter } from "@pi/platform";

const PlatformContext = createContext<PlatformAdapter>(webPlatform);

export function PlatformProvider({ adapter, children }: PropsWithChildren<{ adapter: PlatformAdapter }>) {
  return <PlatformContext.Provider value={adapter}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  return useContext(PlatformContext);
}
