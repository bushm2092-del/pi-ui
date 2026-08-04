import { describe, expect, it } from "vitest";
import { workspaceData } from "../data/workspace-data";
import {
  createWorkspaceUiStore,
  getInitialWorkspaceUiState,
} from "./workspace-ui-store";

describe("workspace UI store", () => {
  it("derives its initial navigation state from workspace data", () => {
    const state = getInitialWorkspaceUiState(workspaceData);

    expect(state.activeThreadId).toBe(
      "local:019fc7cf-24ff-77a0-a094-966a0cd02845",
    );
    expect(state.expandedProjectIds).toContain(
      "939fa940-5326-4daf-9e1f-503d1b499533",
    );
    expect(state.draftByConversationId[workspaceData.conversation.id]).toBe(
      workspaceData.composer.initialDraft,
    );
    expect(state.sidebarOpen).toBe(true);
  });

  it("toggles projects without changing other project state", () => {
    const store = createWorkspaceUiStore(workspaceData);
    const projectId = "939fa940-5326-4daf-9e1f-503d1b499533";

    store.getState().toggleProject(projectId);
    expect(store.getState().expandedProjectIds).not.toContain(projectId);

    store.getState().toggleProject(projectId);
    expect(store.getState().expandedProjectIds).toContain(projectId);
  });

  it("selects threads and keeps drafts isolated by conversation", () => {
    const store = createWorkspaceUiStore(workspaceData);

    store.getState().selectThread("conversation-b");
    store.getState().setDraft("conversation-b", "second draft");

    expect(store.getState().activeThreadId).toBe("conversation-b");
    expect(store.getState().draftByConversationId).toMatchObject({
      [workspaceData.conversation.id]: workspaceData.composer.initialDraft,
      "conversation-b": "second draft",
    });
  });

  it("toggles the summary panel", () => {
    const store = createWorkspaceUiStore(workspaceData);
    store.getState().toggleSummary();
    expect(store.getState().summaryOpen).toBe(true);
  });

  it("toggles the workspace sidebar", () => {
    const store = createWorkspaceUiStore(workspaceData);

    store.getState().toggleSidebar();
    expect(store.getState().sidebarOpen).toBe(false);

    store.getState().toggleSidebar();
    expect(store.getState().sidebarOpen).toBe(true);
  });
});
