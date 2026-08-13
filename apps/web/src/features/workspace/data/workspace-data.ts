import type { Conversation } from "../domain";

export interface ComposerData {
  ariaLabel: string;
  initialDraft: string;
}

export interface Project {
  kind: "project";
  id: string;
  label: string;
  initialExpanded: boolean;
  muted?: boolean;
  canCreateThread?: boolean;
  threads: ThreadItem[];
}

export interface ThreadItem {
  kind: "thread" | "show-more";
  id: string;
  label: string;
  initialActive?: boolean;
  indicator?: "running" | "unread";
}

export interface ShowMoreItem {
  kind: "show-more";
  label: string;
}

export type SidebarItem =
  | Project
  | ShowMoreItem;

export interface SidebarData {
  items: SidebarItem[];
}

export interface WorkspaceData {
  composer: ComposerData;
  sidebar: SidebarData;
  conversation: Conversation;
  chrome: {
    product: {
      appName: string;
      modeAriaLabel: string;
      modeLabelParts: { text: string; color: string }[];
    };
    newConversation: string;
    shortcuts: [string, string, string];
    pinned: string;
    projects: string;
    recents: string;
    account: string;
  };
}

export const workspaceData: WorkspaceData = {
  chrome: {
    product: {
      appName: "PI-Codex :UI",
      modeAriaLabel: "切换模式，当前模式：PI-Codex :UI",
      modeLabelParts: [
        { text: "PI-", color: "#4285ff" },
        { text: "C", color: "#3fa7ff" },
        { text: "od", color: "#34c779" },
        { text: "e", color: "#ffb63d" },
        { text: "x :UI", color: "#ff5b45" },
      ],
    },
    newConversation: "新对话",
    shortcuts: ["拉取请求", "已安排", "插件"],
    pinned: "置顶",
    projects: "项目",
    recents: "对话",
    account: "OpenAI",
  },
  conversation: {
    id: "local:019fc7cf-24ff-77a0-a094-966a0cd02845",
    title: "Pi 工作区",
    processingLabel: "已就绪",
    summary: {
      sectionLabel: "输出",
      actionLabel: "创建文件或站点",
    },
    messages: [],
  },
  composer: {
    ariaLabel: "随心输入",
    initialDraft: "",
  },
  sidebar: {
    items: [],
  },
};
