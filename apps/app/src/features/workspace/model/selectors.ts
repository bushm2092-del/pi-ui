import type { WorkspaceUiStoreState } from "./workspace-ui-store";

export const selectActiveThreadId = (state: WorkspaceUiStoreState) =>
  state.activeThreadId;
export const selectExpandedProjectIds = (state: WorkspaceUiStoreState) =>
  state.expandedProjectIds;
export const selectSidebarOpen = (state: WorkspaceUiStoreState) =>
  state.sidebarOpen;
export const selectSummaryOpen = (state: WorkspaceUiStoreState) =>
  state.summaryOpen;
export const selectSelectThread = (state: WorkspaceUiStoreState) =>
  state.selectThread;
export const selectSetDraft = (state: WorkspaceUiStoreState) => state.setDraft;
export const selectToggleSidebar = (state: WorkspaceUiStoreState) =>
  state.toggleSidebar;
export const selectToggleProject = (state: WorkspaceUiStoreState) =>
  state.toggleProject;
export const selectToggleSummary = (state: WorkspaceUiStoreState) =>
  state.toggleSummary;

export const selectDraft = (conversationId: string) =>
  (state: WorkspaceUiStoreState) => state.draftByConversationId[conversationId] ?? "";
