import { describe, expect, it } from "vitest";
import { workspaceData } from "../data/workspace-data";
import {
  createWorkspaceUiStore,
  getInitialWorkspaceUiState,
} from "./workspace-ui-store";

describe("workspace UI store", () => {
  it("derives its initial navigation state from workspace data", () => {
    const data = withProject();
    const state = getInitialWorkspaceUiState(data);

    expect(state.activeThreadId).toBe("thread-a");
    expect(state.expandedProjectIds).toContain("project-a");
    expect(state.draftByConversationId[workspaceData.conversation.id]).toBe(
      workspaceData.composer.initialDraft,
    );
    expect(state.sidebarOpen).toBe(true);
  });

  it("toggles projects without changing other project state", () => {
    const store = createWorkspaceUiStore(withProject());
    const projectId = "project-a";

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

function withProject(): typeof workspaceData {
  return {
    ...workspaceData,
    sidebar: {
      items: [{
        kind: "project",
        id: "project-a",
        label: "Project A",
        initialExpanded: true,
        threads: [{
          kind: "thread",
          id: "thread-a",
          label: "Thread A",
          initialActive: true,
        }],
      }],
    },
  };
}
