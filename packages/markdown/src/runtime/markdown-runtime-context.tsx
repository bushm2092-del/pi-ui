import { createContext, useContext, type ReactNode } from "react";
import type { PluginConfig } from "streamdown";

interface MarkdownRuntimeValue {
  plugins?: PluginConfig;
}

const MarkdownRuntimeContext = createContext<MarkdownRuntimeValue>({});

export function MarkdownRuntimeProvider({ children, plugins }: { children: ReactNode; plugins?: PluginConfig }) {
  return <MarkdownRuntimeContext.Provider value={{ plugins }}>{children}</MarkdownRuntimeContext.Provider>;
}

export function useMarkdownRuntime() {
  return useContext(MarkdownRuntimeContext);
}
