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
|-- document.ts
|-- document-attributes.ts
|-- api/
|   |-- conversation-cache.ts
|   `-- conversation-hooks.ts
|-- data/
|   |-- http/
|   |   `-- http-workspace-repository.ts
|   |-- mock/
|   |   `-- mock-workspace-repository.ts
|   |-- workspace-repository-context.tsx
|   |-- workspace-repository.ts
|   `-- workspace-data.ts
|-- model/
|   |-- workspace-ui-store.ts
|   |-- workspace-ui-context.tsx
|   `-- selectors.ts
|-- sidebar/
|   |-- index.ts
|   |-- layouts/
|   |   |-- index.ts
|   |   |-- project-item-layout.tsx
|   |   |-- project-row-layout.tsx
|   |   |-- project-threads-layout.tsx
|   |   `-- thread-item-layout.tsx
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

apps/app/src/styles/codex/
|-- app-globals.css
|-- codex-vscode-theme.css
|-- ui-token-bridge.css
`-- runtime.css

apps/app/src/styles/
`-- tailwind.css

packages/ui/src/components/markdown/
|-- markdown.tsx
|-- code-block.tsx
`-- markdown.css

packages/ui/src/styles/
|-- foundation-properties.css
|-- foundation-reset.css
|-- foundation-components.css
`-- vendor/
    |-- prose-mirror.css
    `-- code-display.css

apps/app/src/features/workspace/
|-- main/main.css
|-- composer/composer.css
|-- composer/utility-bar.css
`-- sidebar/sidebar.css
```

## 模块职责

- `workspace-page.tsx` 只组合 `Sidebar` 和 `MainSurface`，并安装页面级状态。
- `sidebar` 持有导航、项目展开、会话选择及其精确布局；项目与线程列表不依赖数组下标。
- `main` 持有工具栏和主视口，不访问消息模块的内部文件。
- `thread` 持有 Conversation、Turn、消息、代码块和底部区域。
- `composer` 持有编辑器、权限、推理和发送交互。
- `summary` 持有开关、面板和摘要内容。
- `data/workspace-data.ts` 是当前静态工作区数据模型，不使用测试夹具命名。
- `data/workspace-repository.ts` 定义数据访问边界，Mock 与 HTTP adapter 可互换。
- `api/conversation-hooks.ts` 使用 TanStack Query 管理会话读取和发送 mutation。
- `api/conversation-cache.ts` 提供可独立测试的乐观消息状态转换。
- `model/workspace-ui-store.ts` 保存项目展开、会话选择、摘要和按会话草稿等客户端 UI 状态。
- 服务端会话对象只存在于 Query Cache，不复制到 Zustand 或 React Context。
- 各模块的 `layouts/` 按视觉组件拆分真实 JSX，保留已验收的 DOM、class 和 SVG。
- Layout 组件只负责保真 DOM/CSS，组合关系通过明确的 typed props 和 `ReactNode` 表达。

## 依赖规则

1. 应用入口只从 `features/workspace/index.ts` 导入。
2. 模块之间只从对方 `index.ts` 导入，不访问其他模块的叶组件。
3. 组件直接 import 对应 Layout 组件，不通过字符串选择 JSX。
4. 动态视觉状态通过明确 React props 传入，例如 `active`、`open` 和 `status`。
5. App 公共 CSS 由 `apps/app/src/styles.css` 安装，Web 与 Electron 使用同一份组件树和样式；
   feature 不通过模块副作用安装全局样式。
6. 一个 Layout 文件只导出一个视觉组件；业务状态、数据遍历和事件仍留在对应业务组件中。
7. `apps/app/src/query/query-provider.tsx` 是应用级服务端状态入口，feature 不自行创建 QueryClient。
8. 列表使用 React `map` 和稳定领域 id；禁止通过数字 slot 或 Layout 注册表限制数据数量。
9. Sidebar/Main 的组合关系使用具名 `ReactNode` props，文本使用 `string` props；不通过字符串
   slot key 连接本来已知的父子组件。
10. Composer/Summary/Thread/Workspace 根布局全部使用 typed props；互斥视觉状态由一个组件的
    状态 prop 表达，不复制整棵 JSX。通用 `LayoutSlot`、`LayoutProps` 和字符串 slot 已删除。
11. Sidebar 的开合属于 Workspace UI 状态；关闭时卸载侧栏并扩展 MainSurface，同时必须保留不与
    标题内容重叠的恢复按钮占位。

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

样式按所有权分为三层：`packages/ui` 保存跨应用组件样式，`apps/app/src/styles` 保存当前应用
所有页面共享的 Codex 设计基建，`features/*` 只保存确实属于单个业务功能的组合样式。依赖只能
从 feature 指向 app/UI 公共层，公共层不能反向依赖 feature。

App 公共 Codex 基建位于 `apps/app/src/styles/codex`；thread、composer、sidebar 的私有连续规则块
位于对应 feature 目录。`apps/app/src/styles.css` 是唯一 composition root，按原快照顺序组合 App、
UI 与 Feature 样式；迁移期间不重命名 class、不改变层顺序。Markdown 渲染器及其 `_1q3nk` 样式共同位于 `packages/ui`，
并通过 `@pi/ui/markdown.css` 子路径在原级联位置加载。边界完整的 ProseMirror 与代码高亮/ANSI
规则也已分别通过 `@pi/ui/prose-mirror.css`、`@pi/ui/code-display.css` 上移为共享基建；混合了
Command Menu 与 Process Manager 的 `cmdk` 兼容段继续留在 App 层，Composer 专属块已回归 feature。
原 `components.css` 是完整的 `@layer components`，仅包含图标尺寸、标题排版、滚动渐隐、面板
过渡和 shimmer 等 primitive，现整体迁入 `packages/ui/src/styles/foundation-components.css`，并通过
`@pi/ui/foundation-components.css` 保持原级联位置加载。
原 `base.css` 是完整的标准元素 reset，现整体迁入 `packages/ui/src/styles/foundation-reset.css`，
通过 `@pi/ui/foundation-reset.css` 保持原位置加载。原 `theme.css` 已重命名为
`codex-vscode-theme.css`：它的声明块混合通用尺度、Codex token 与 VS Code 映射，在建立明确的
语义 token 映射表之前不做声明级拆分。

`ui-token-bridge.css` 是 App 主题与共享 UI 之间唯一的适配边界。它不定义新的颜色常量，而是把
26 个 `packages/ui` 语义 token 映射到现有 Codex/VS Code token，覆盖 surface、foreground、
control、interaction、border 和 status。共享组件不得直接读取 `--vscode-*` 或
`--color-token-*`；新增语义 token 时必须同时补充桥接映射，`pnpm audit:workspace-css` 会检查缺失项。

Tailwind 的 `@layer properties` 初始化层已整体迁入
`packages/ui/src/styles/foundation-properties.css`。App 的 `styles/tailwind.css` 现在是源码生成入口，
显式声明当前 JSX 所需的 Codex token、尺寸和 browser/extension/electron variant。原静态
`codex-utilities.css` 全量快照已删除，Vite 只为当前 App 与 `packages/ui` 源码生成实际使用的工具类。

原 `app-shell.css` 也已按所有权拆分：全局文档尺寸保留在 `app-globals.css`；Workspace main
布局进入 `features/workspace/main/main.css`；Composer utility bar 进入对应 feature。无源码节点的
搜索高亮、Placeholder、Dropdown、Card、Command Menu 和平台兼容规则已完成不可达确认并删除。

Markdown 已开始从快照兼容进入真实组件 API：`Markdown` 自己安装 `pi-markdown-content` 根类，
段落、列表、列表项和 inline code 使用 `pi-markdown-*` 语义类。Workspace Assistant 不再传入
Markdown 内部类名，User message 也只使用公开语义类。该阶段仅重命名已接入选择器，声明值与
级联位置不变；后续验收使用散列引用扫描、组件测试和产物构建。
标题 `h1-h6`、ordered list、blockquote 与 horizontal rule 也已注册为显式 renderer，并使用
`pi-markdown-*` 语义类；相应规则不再是无法确认是否生效的静态快照。
GFM task list 会保留解析器状态并映射到语义 task 类；table 使用 container/scroller/wrapper/table
及 body/row/cell 结构接入原 Codex 表格规则；代码块也通过 `pi-markdown-code-block` 使用组件私有间距。
剩余 `_1q3nk` 规则已完成闭包检查：Mermaid、媒体网格、文件引用、流式 fade 和占位代码块没有
parser、renderer 或状态来源，相关 CSS 与私有 keyframes 已删除。共享 Markdown CSS 现只包含真实
组件能够生成的语义选择器；未来增加上述能力时必须连同解析、组件、状态和样式一起接入。

已确认不可达的例外：当前 Markdown 只支持 GFM，不含数学插件，因此已删除静态导出中的 KaTeX
CSS/字体；不存在本地文件的 OpenAI Sans 声明也已删除，继续使用原本实际生效的系统字体栈。
后续新增公式能力时，由 `packages/ui` 同时负责解析插件、KaTeX 样式和官方字体资源。

CSS 依赖闭包通过根命令 `pnpm audit:workspace-css` 辅助审计。该命令扫描 App 公共 Codex CSS、
Workspace 源码、整个 `packages/ui/src` 以及共享样式，将选择器分为源码引用、运行时/工具类保留及人工复核候选，
不执行自动删除；同时验证共享 UI 所需的语义 token 是否全部存在于 App 桥接层。
启动闪屏、Blossom loader、xterm、Storybook 和 writing-block editor 已在确认没有 HTML、React、
依赖包或运行时入口后按完整模块移除；Composer 使用的通用 ProseMirror 样式继续保留。任何后续
清理都必须经过 Web/Electron 构建、真实交互和目标视口视觉回归。

审计报告同时按 CSS Module hash 汇总零源码命中模块。浏览器 favicon/throbber、旧模型功率设置、
旧模型选择器动画和 marquee 文本已按连续模块边界移除；不能仅凭单个 class 未命中就删除规则。
设计器输入、区域标注及其独立动效等未接入工具样式也按连续工具簇移除，ProseMirror 和 cmdk
两侧基建保持原样。

对于懒挂载功能，删除前还需在默认态和相关控制打开态验证真实 DOM。inline mention、cadenced
shimmer、Composer top tray、agent identicon、推荐弹窗和跨应用转场已通过该验证并按模块移除。
Tailwind 生成 utilities 作为独立层治理，不随功能模块做选择性裁剪。

点阵、旧占位、chip/status pill、ready/enter、pulsing dot 和 scrub rail 等无入口纯动画也已按
相邻真实规则为锚点移除。允许不执行浏览器自动化时，至少必须通过源码反查、花括号结构检查、
组件测试以及 Web/Electron 双端构建。
