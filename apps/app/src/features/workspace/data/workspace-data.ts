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
    recents: "最近",
    account: "OpenAI",
  },
  conversation: {
    id: "local:019fc7cf-24ff-77a0-a094-966a0cd02845",
    title: "搭建 pi-desktop 跨端架构",
    processingLabel: "已处理 35s",
    summary: {
      sectionLabel: "输出",
      actionLabel: "创建文件或站点",
    },
    messages: [
      {
        id: "message-user-1",
        role: "user",
        status: "complete",
        createdAt: "2026-08-03T10:00:00.000Z",
        content: "我准备构建一个pi-desktop端使用electorn-vite react + shadcn  + tainwindcss + zustand + react-router ，desktop提供桌面端能力，app作为前端，因为会做跨端",
      },
      {
        id: "message-assistant-1",
        role: "assistant",
        status: "complete",
        createdAt: "2026-08-03T10:00:35.000Z",
        content: `这个技术方向适合做跨端。当前仓库还是空目录，建议从一开始就把“跨端业务 UI”和“Electron 桌面能力”分离，而不是让 React 应用直接依赖 Electron。

推荐使用 monorepo：

\`\`\`text
pi-ui/
├── apps/
│   ├── app/                    # 跨端 React 前端
│   │   └── src/
│   └── desktop/                # electron-vite
├── packages/
│   ├── ui/                     # 公共组件
│   ├── shared/                 # 类型与纯业务逻辑
│   └── platform/               # 跨端能力接口
└── package.json
\`\`\`

关键边界建议：

- \`apps/app\` 只负责 React、路由、状态和业务界面，不直接导入 \`electron\`。
- \`apps/desktop\` 管理主进程、窗口、托盘、文件系统、自动更新和 IPC。
- \`preload\` 通过 \`contextBridge\` 暴露类型明确的最小 API。
- 跨端代码调用统一的 \`PlatformAdapter\`，桌面端和 Web 端分别实现。
- Zustand 只存客户端状态；持久化、服务端数据和 IPC 状态不要全部塞进全局 store。
- React Router 建议使用 \`createHashRouter\`，避免打包后通过 \`file://\` 加载时刷新路由失效。
- shadcn 组件放进共享 \`packages/ui\`，但平台相关组件留在对应应用中。
- Electron 保持 \`contextIsolation: true\`、\`nodeIntegration: false\`。

例如跨端能力可以统一为：

\`\`\`ts
export interface PlatformAdapter {
  platform: "desktop" | "web";
  openFile(): Promise<string | null>;
  saveFile(content: string): Promise<void>;
  openExternal(url: string): Promise<void>;
}
\`\`\`

这样未来增加 Web、移动端或其他桌面壳时，业务页面基本不需要重写。

你下一步只需明确一个选择：是让我直接在这个空仓库中搭建完整可运行的 monorepo 骨架，还是先输出详细架构与模块设计、不写代码。`,
      },
    ],
  },
  composer: {
    ariaLabel: "随心输入",
    initialDraft: "可以先这么搭建一个架构出来",
  },
  sidebar: {
    items: [
      {
        kind: "project",
        id: "939fa940-5326-4daf-9e1f-503d1b499533",
        label: "pi-ui",
        initialExpanded: true,
        threads: [
          {
            kind: "thread",
            id: "local:019fc7cf-3317-7581-9a84-b831acb22c44",
            label: "Launch ChatGPT with debugging",
            indicator: "running",
          },
          {
            kind: "thread",
            id: "local:019fc7cf-24ff-77a0-a094-966a0cd02845",
            label: "搭建 pi-desktop 跨端架构",
            initialActive: true,
          },
        ],
      },
      {
        kind: "project",
        id: "65f3bd4e-46a1-4589-a068-445c4eebdce8",
        label: "pi",
        initialExpanded: true,
        muted: true,
        canCreateThread: false,
        threads: [],
      },
      {
        kind: "project",
        id: "05854728-1bb5-415f-880a-68e7c5ff9cff",
        label: "pandora-core",
        initialExpanded: true,
        threads: [],
      },
      {
        kind: "project",
        id: "local-928679e41378791b9dc7f32353473f8f",
        label: "desktop",
        initialExpanded: true,
        threads: [
          {
            kind: "thread",
            id: "local:019fb2a3-cda8-7691-9b76-9fd411b6d3a9",
            label: "将 MCP 描述改为中文",
          },
          {
            kind: "thread",
            id: "local:019fb26f-cce8-7200-b651-2c033d66cfd5",
            label: "修复模型选择前置数字",
          },
          {
            kind: "thread",
            id: "local:019fb1b8-2419-7cd1-a415-f2ff746a8f4d",
            label: "修复定时任务模型配置报错",
            indicator: "unread",
          },
          {
            kind: "thread",
            id: "local:019fb282-50a6-7930-8a59-b34b0d18f8af",
            label: "确认启动桌宠是否持久化",
          },
          {
            kind: "thread",
            id: "local:019fb215-2210-7093-8ef7-4b86f84bc1cf",
            label: "回应用户问候",
          },
          {
            kind: "show-more",
            id: "desktop-show-more",
            label: "展开显示",
          },
        ],
      },
      {
        kind: "project",
        id: "a0bd3b14-ae64-4c18-828f-9fdfa2339bd2",
        label: "casdoor",
        initialExpanded: false,
        threads: [],
      },
      {
        kind: "show-more",
        label: "展开显示",
      },
    ],
  },
};
