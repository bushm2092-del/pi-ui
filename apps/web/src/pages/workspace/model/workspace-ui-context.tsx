import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { workspaceData } from "../data/workspace-data";
import {
  createWorkspaceUiStore,
  type WorkspaceUiStore,
  type WorkspaceUiStoreState,
} from "./workspace-ui-store";

const WorkspaceUiStoreContext = createContext<WorkspaceUiStore | null>(null);

export function WorkspaceUiProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<WorkspaceUiStore | null>(null);
  if (!storeRef.current) storeRef.current = createWorkspaceUiStore(workspaceData);

  return (
    <WorkspaceUiStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceUiStoreContext.Provider>
  );
}

export function useWorkspaceUi<T>(
  selector: (state: WorkspaceUiStoreState) => T,
) {
  const store = useContext(WorkspaceUiStoreContext);
  if (!store) throw new Error("Workspace UI store is unavailable");
  return useStore(store, selector);
}
