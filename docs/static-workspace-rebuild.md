# Workspace React 架构

## 目标

`apps/app` 直接渲染真实 React 组件。桌面页面的 DOM、class、CSS 变量和 SVG 保持像素基线，
但产品代码不依赖 HTML 字符串解析、片段 key、中央注册表或占位标签。

## 目录

```text
apps/app/src/features/workspace/
|-- index.ts
|-- workspace-page.tsx
|-- workspace-layout.tsx
|-- layout.tsx
|-- workspace-state.tsx
|-- document.ts
|-- document-attributes.ts
|-- workspace.css
|-- data/
|   `-- workspace-data.ts
|-- sidebar/
|   |-- index.ts
|   |-- layouts/
|   |   |-- index.ts
|   |   `-- one visual layout per file
|   |-- layout-map.ts
|   `-- sidebar-*.tsx
|-- main/
|   |-- index.ts
|   |-- layouts/
|   `-- main-*.tsx
|-- thread/
|   |-- index.ts
|   |-- layouts/
|   `-- message and timeline components
|-- composer/
|   |-- index.ts
|   |-- layouts/
|   `-- composer controls
`-- summary/
    |-- index.ts
    |-- layouts/
    `-- summary controls
```

## 模块职责

- `workspace-page.tsx` 只组合 `Sidebar` 和 `MainSurface`，并安装页面级状态。
- `sidebar` 持有导航、项目展开、会话选择及其精确布局。
- `main` 持有工具栏和主视口，不访问消息模块的内部文件。
- `thread` 持有 Conversation、Turn、消息、代码块和底部区域。
- `composer` 持有编辑器、权限、推理和发送交互。
- `summary` 持有开关、面板和摘要内容。
- `data/workspace-data.ts` 是当前静态工作区数据模型，不使用测试夹具命名。
- `workspace-state.tsx` 只保存需要跨模块共享的页面状态。
- 各模块的 `layouts/` 按视觉组件拆分真实 JSX，保留已验收的 DOM、class 和 SVG。
- `layout.tsx` 只提供跨模块一致的 Layout props 和显式 React slot，不保存页面 JSX。

## 依赖规则

1. 应用入口只从 `features/workspace/index.ts` 导入。
2. 模块之间只从对方 `index.ts` 导入，不访问其他模块的叶组件。
3. 组件直接 import 对应 Layout 组件，不通过字符串选择 JSX。
4. 动态视觉状态通过 React props 传入，例如 `rootProps`、active layout 和 open layout。
5. CSS 由 `document.ts` 安装，Web 与 Electron 使用同一份组件树和样式。
6. 一个 Layout 文件只导出一个视觉组件；业务状态、数据遍历和事件仍留在对应业务组件中。

## 组件树

```text
WorkspacePage
|-- Sidebar
|   |-- SidebarHeader
|   |-- SidebarScroll
|   |   `-- SidebarProjects
|   |       `-- SidebarProjectList
|   |           `-- SidebarProjectItem[]
|   |               |-- SidebarProjectRow
|   |               `-- SidebarProjectThreads
|   |                   `-- SidebarThreadItem[]
|   `-- SidebarFooter
`-- MainSurface
    |-- MainHeader
    |   `-- MainHeaderContext
    `-- MainViewport
        `-- ThreadFrame
            |-- TimelineScroll
            |   |-- Conversation
            |   |   `-- Turn
            |   `-- ThreadFooter
            |       `-- Composer
            `-- SummaryPanel
```

## CSS 约束

`workspace.css` 完整保留像素基线需要的规则、媒体查询和平台选择器。在形成逐组件的选择器依赖
闭包之前，不删除规则、不替换 SVG、不近似字体、阴影或 CSS 变量。模块重构必须通过多视口截图
差异验证，不能以视觉近似代替。
