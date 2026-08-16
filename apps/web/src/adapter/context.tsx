import { createContext, useContext, type PropsWithChildren } from "react";
import { adapter, type Adapter } from "@pi/adapter";

const AdapterContext = createContext<Adapter>(adapter);

export function AdapterProvider({ adapter, children }: PropsWithChildren<{ adapter: Adapter }>) {
  return <AdapterContext.Provider value={adapter}>{children}</AdapterContext.Provider>;
}

export function useAdapter() {
  return useContext(AdapterContext);
}
