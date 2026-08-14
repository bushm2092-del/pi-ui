import type { zhCN } from "./zh-CN";

type TranslationShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TranslationShape<T[K]>;
};

export const enUS = {
  sidebar: {
    navigation: "Scheduled task folders",
    resize: "Resize sidebar",
    mode: "Switch mode, current mode: {{mode}}",
    search: "Search",
    priority: "Priority, needs attention",
    newConversation: "New conversation",
    shortcuts: {
      pullRequests: "Pull requests",
      scheduled: "Scheduled",
      plugins: "Plugins",
    },
    sections: {
      pinned: "Pinned",
      projects: "Projects",
      recents: "Chats",
    },
    actions: {
      projectOptions: "Project sidebar options",
      addProject: "Add project",
      conversationOptions: "Chat sidebar options",
      projectMenu: "Project actions for {{project}}",
      startConversationInProject: "Start a new chat in {{project}}",
      pinConversation: "Pin chat",
      unpinConversation: "Unpin chat",
      archiveConversation: "Archive chat",
      openProfile: "Open profile menu",
      more: "More",
    },
    emptyProject: "No chats",
    showMore: "Show more",
    scheduledTasksInProject: "Scheduled tasks in {{project}}",
    dragInstructions:
      "Press Space to pick up a draggable item. While dragging, use the arrow keys to move it. Press Space again to drop it, or Escape to cancel.",
    preferences: {
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
      system: "System",
      chinese: "Simplified Chinese",
      english: "English",
    },
  },
} satisfies TranslationShape<typeof zhCN>;
