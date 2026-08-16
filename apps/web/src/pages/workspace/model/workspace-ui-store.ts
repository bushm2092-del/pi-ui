import { createStore } from "zustand/vanilla";
import type { WorkspaceData } from "../data/workspace-data";

export interface WorkspaceUiState {
  activeThreadId: string | null;
  draftByConversationId: Record<string, string>;
  expandedProjectIds: string[];
  sidebarOpen: boolean;
  sidebarWidth: number;
  summaryOpen: boolean;
}

export interface WorkspaceUiActions {
  selectThread(threadId: string): void;
  setDraft(conversationId: string, draft: string): void;
  toggleSidebar(): void;
  setSidebarWidth(width: number): void;
  toggleProject(projectId: string): void;
  toggleSummary(): void;
}

export type WorkspaceUiStoreState = WorkspaceUiState & WorkspaceUiActions;
export type WorkspaceUiStore = ReturnType<typeof createWorkspaceUiStore>;

export function getInitialWorkspaceUiState(data: WorkspaceData): WorkspaceUiState {
  const projects = data.sidebar.items.filter((item) => item.kind === "project");
  const activeThreadId = projects.flatMap((project) => project.threads).find((thread) => thread.initialActive)?.id ?? data.conversation.id;

  return {
    activeThreadId,
    draftByConversationId: {
      [data.conversation.id]: data.composer.initialDraft,
    },
    expandedProjectIds: projects.filter((project) => project.initialExpanded).map((project) => project.id),
    sidebarOpen: true,
    sidebarWidth: 240,
    summaryOpen: false,
  };
}

export function createWorkspaceUiStore(data: WorkspaceData) {
  return createStore<WorkspaceUiStoreState>()((set) => ({
    ...getInitialWorkspaceUiState(data),
    selectThread: (activeThreadId) => set({ activeThreadId }),
    setDraft: (conversationId, draft) =>
      set((state) => ({
        draftByConversationId: {
          ...state.draftByConversationId,
          [conversationId]: draft,
        },
      })),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
    toggleProject: (projectId) =>
      set((state) => ({
        expandedProjectIds: state.expandedProjectIds.includes(projectId)
          ? state.expandedProjectIds.filter((id) => id !== projectId)
          : [...state.expandedProjectIds, projectId],
      })),
    toggleSummary: () => set((state) => ({ summaryOpen: !state.summaryOpen })),
  }));
}
