import { createContext, useContext } from "react";
import type { WorkspaceRepository } from "./workspace-repository";

const WorkspaceRepositoryContext = createContext<WorkspaceRepository | null>(null);

export const WorkspaceRepositoryProvider = WorkspaceRepositoryContext.Provider;

export function useWorkspaceRepository() {
  const repository = useContext(WorkspaceRepositoryContext);
  if (!repository) throw new Error("Workspace repository is unavailable");
  return repository;
}
