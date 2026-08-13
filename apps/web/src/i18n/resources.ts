export const resources = {
  "zh-CN": {
    translation: {
      sidebar: {
        navigation: "已安排任务文件夹",
        resize: "调整边栏宽度",
        mode: "切换模式，当前模式：{{mode}}",
        search: "搜索",
        priority: "优先级，需要关注",
        newConversation: "新对话",
        shortcuts: {
          pullRequests: "拉取请求",
          scheduled: "已安排",
          plugins: "插件",
        },
        sections: {
          pinned: "置顶",
          projects: "项目",
          recents: "对话",
        },
        actions: {
          projectOptions: "项目侧边栏选项",
          addProject: "添加新项目",
          conversationOptions: "聊天侧边栏选项",
          projectMenu: "{{project}} 的项目操作",
          startConversationInProject: "在 {{project}} 中开始新聊天",
          pinConversation: "置顶聊天",
          unpinConversation: "取消置顶聊天",
          archiveConversation: "归档聊天",
          openProfile: "打开个人资料菜单",
          more: "更多",
        },
        emptyProject: "没有聊天",
        showMore: "展开显示",
        scheduledTasksInProject: "{{project}}中的已安排任务",
        dragInstructions:
          "按空格键拾取可拖动项目。拖动时，使用方向键移动项目。再次按空格键放下项目，或按 Esc 键取消。",
        preferences: {
          theme: "主题",
          light: "亮色",
          dark: "暗色",
          language: "语言",
          system: "跟随系统",
          chinese: "简体中文",
          english: "English",
        },
      },
    },
  },
  "en-US": {
    translation: {
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
    },
  },
} as const;

export type SupportedLanguage = keyof typeof resources;
