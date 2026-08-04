# 前端架构优化方案

## 1. 背景与目标

当前 `apps/app` 已经完成静态页面的 React 化和像素复刻，但代码仍处于“可运行的视觉快照”阶段：

- 大量 `layouts/` 组件保留原始 DOM、class 和 SVG，适合作为视觉基线，不适合长期承载业务变化。
- `workspace-data.ts` 同时定义类型、Mock 数据、产品文案和会话内容。
- 页面组件直接读取全局静态数据，缺少稳定的数据访问边界。
- 助手消息由手工定义的 paragraph/list/code-block 结构渲染，无法直接消费模型输出的 Markdown。
- 项目展开、会话选择、摘要和 Composer 状态分散在多个组件中。
- Mock 数据与未来的 HTTP、WebSocket、Agent Client 没有统一接口。

本轮优化的目标不是重新设计页面，而是建立可以持续开发的前端架构：

1. 保留当前像素基线和已有 SVG。
2. 将视觉壳、领域组件、状态和数据访问分层。
3. 助手消息直接消费 Markdown 字符串。
4. Mock 与真实后端通过同一个 repository 接口切换。
5. 动态功能使用真实 React 状态和异步流程，不再依赖静态 active/open Layout。
6. 控制迁移范围，允许旧 Layout 与新组件在一段时间内共存。

## 2. 技术选型

| 关注点 | 方案 | 说明 |
| --- | --- | --- |
| UI 框架 | React 19 | 保持现有技术栈 |
| 路由 | React Router | 页面级 URL、设置页和会话路由 |
| 本地 UI 状态 | Zustand | 侧栏宽度、展开状态、摘要开关、草稿等客户端状态 |
| 服务端状态 | TanStack Query | 会话列表、消息历史、发送状态、失败重试和缓存失效 |
| Markdown | `react-markdown` + `remark-gfm` | 支持标准 Markdown、表格、任务列表和删除线 |
| 代码高亮 | Shiki，异步加载 | 仅在代码块出现时加载，桌面/Web 输出一致 |
| Mock API | MSW | 在网络边界 Mock HTTP/SSE，避免业务组件感知 Mock |
| 运行时校验 | Zod | 校验后端响应和 IPC payload，不代替 TypeScript 类型 |
| 通用组件 | `packages/ui` | Button、Tooltip、Menu、ScrollArea、CodeBlock 等无业务组件 |
| Feature 组件 | `apps/app/src/features` | Workspace、Conversation、Composer 等业务组件 |

第一阶段只需要引入 Markdown；TanStack Query、MSW、Zod 和 Shiki 在对应迁移阶段再加入，避免一次性扩大改动面。

## 3. 目标目录

```text
apps/app/src/
|-- app/
|   |-- app.tsx
|   |-- providers.tsx
|   `-- router.tsx
|-- components/
|   `-- layout/                 # 跨 feature 的应用壳
|-- features/
|   `-- workspace/
|       |-- api/
|       |   |-- workspace-repository.ts
|       |   |-- http-workspace-repository.ts
|       |   `-- query-options.ts
|       |-- domain/
|       |   |-- conversation.ts
|       |   |-- message.ts
|       |   |-- project.ts
|       |   `-- workspace.ts
|       |-- mocks/
|       |   |-- fixtures.ts
|       |   |-- handlers.ts
|       |   `-- mock-workspace-repository.ts
|       |-- model/
|       |   |-- workspace-store.ts
|       |   `-- selectors.ts
|       |-- components/
|       |   |-- workspace-shell.tsx
|       |   |-- sidebar/
|       |   |-- conversation/
|       |   |-- composer/
|       |   `-- summary/
|       |-- presentation/      # 迁移期间保留精确视觉壳
|       |   |-- sidebar/
|       |   |-- thread/
|       |   |-- composer/
|       |   `-- summary/
|       |-- hooks/
|       |-- index.ts
|       `-- workspace-page.tsx
|-- mocks/
|   `-- browser.ts             # MSW 应用级启动入口
`-- styles/

packages/ui/src/
|-- components/
|   |-- markdown/
|   |   |-- markdown.tsx
|   |   `-- code-block.tsx
|   `-- ...                    # 无 workspace 业务语义
`-- styles/
```

### 目录规则

- `domain/` 只包含领域类型和纯函数，不依赖 React、DOM、Zustand 或网络。
- `api/` 只负责外部数据访问和 DTO 到领域模型的转换。
- `mocks/` 是数据源实现，不允许业务组件通过 `if (mock)` 分支访问。
- `model/` 只放跨组件客户端状态；服务端数据不复制进 Zustand。
- `components/` 负责业务组合和交互。
- `presentation/` 暂时承载复刻的 DOM/class/SVG，迁移完成后逐步缩小。
- 模块外部只能从 feature 的 `index.ts` 导入，不跨目录访问叶文件。

## 4. 领域模型

消息应保存原始内容，而不是保存渲染后的 block：

```ts
type MessageRole = "user" | "assistant" | "system";
type MessageStatus = "pending" | "streaming" | "complete" | "failed";

interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  format: "text" | "markdown";
  status: MessageStatus;
  createdAt: string;
}

interface Conversation {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
}
```

原则：

- 模型输出原样保存为 Markdown，展示层解析。
- streaming 只更新当前 assistant message 的 `content` 和 `status`。
- 代码块语言来自 fenced code info string，不使用数组下标选择静态 Layout。
- copy、wrap、retry 等是组件行为，不进入消息内容模型。

## 5. Markdown 渲染层

新增统一的 `Markdown` 组件，由 `react-markdown` 解析，并通过 `components` 映射到项目组件：

```text
Markdown
|-- paragraph
|-- unordered/ordered list
|-- inline code
|-- fenced CodeBlock
|-- safe external link
|-- table (GFM)
`-- task list (GFM)
```

约束：

- 不启用任意 HTML 渲染；默认忽略模型输出中的原始 HTML。
- 外链使用安全的 `target`/`rel` 策略，并为桌面端预留 `openExternal` adapter。
- `CodeBlock` 支持语言名、复制、自动换行和横向滚动。
- Shiki 通过动态 import 加载；首屏没有代码块时不进入主 bundle。
- Markdown 的元素样式使用稳定语义类，不复制解析器内部 DOM 选择器。
- 用户消息默认按纯文本展示，只有产品明确支持时才启用 Markdown。

## 6. 状态边界

### Zustand 保存

- 当前选中的 conversation id。
- project 展开/收起状态。
- sidebar 宽度和可见状态。
- summary 是否打开。
- 每个 conversation 的本地草稿。
- Composer 权限、模型和 reasoning 选择。

### TanStack Query 保存

- project/conversation 列表。
- conversation 消息历史。
- summary 和服务端生成结果。
- 发送消息 mutation、错误和重试状态。

### 组件本地状态保存

- tooltip/menu/dialog 的瞬时开关。
- code block 的 copied、wrap 状态。
- 输入法组合状态和局部 focus 状态。

禁止将 Query 返回的完整会话对象再次复制到 Zustand。Store 只保存 id、偏好和纯客户端状态。

## 7. 数据访问与 Mock

业务层依赖稳定接口：

```ts
interface WorkspaceRepository {
  getProjects(): Promise<Project[]>;
  getConversation(id: string): Promise<Conversation>;
  sendMessage(input: SendMessageInput): AsyncIterable<MessageEvent>;
}
```

实现可以是：

- `MockWorkspaceRepository`：开发早期的内存/定时流实现。
- `HttpWorkspaceRepository`：Web API + SSE/WebSocket。
- `AgentWorkspaceRepository`：通过现有 `@pi/agent-client` 通信。

组件不 import Mock fixtures。应用 Provider 根据启动配置注入 repository；MSW 用于验证真实网络调用形状，而内存 repository 用于单元测试。

## 8. 组件定义规则

### Container 组件

- 读取 Query/store/hooks。
- 组织 mutation 和错误处理。
- 将领域数据和回调传给展示组件。
- 示例：`ConversationPane`、`ComposerContainer`、`ProjectSidebar`。

### 展示组件

- props 驱动，不直接访问 repository 或全局 Mock。
- 保留当前 class、SVG 和可访问性属性。
- 示例：`MessageBubble`、`AssistantMessage`、`ProjectRow`、`ComposerSurface`。

### 通用 UI 组件

- 不包含 workspace 名称、conversation 数据或 agent 逻辑。
- 放入 `packages/ui`。
- 示例：`Markdown`、`CodeBlock`、`IconButton`、`Tooltip`。

### 文件约束

- 默认一个文件一个导出组件。
- 组件超过约 150 行时检查是否混入了数据访问、多个独立区域或重复 SVG。
- 小型私有子组件只有在不复用且与父组件强耦合时留在同一文件。
- 不使用数字命名的业务组件，如 `CodeBlockLayout0`；视觉差异应由 props/variant 表达。
- 不为每个 `<div>` 建组件，只按行为、状态边界或可独立测试区域拆分。

## 9. Layout 迁移策略

当前 `presentation/layouts/` 不需要一次性删除。采用“外壳稳定、内容替换”的方式：

1. 保留 Workspace、Sidebar、Main、Thread 的尺寸和定位壳。
2. 将助手正文 slot 替换为真实 `Markdown`。
3. 将 code block 数字 Layout 替换为一个 `CodeBlock` variant。
4. 将 active/inactive thread Layout 合并为 `active` prop。
5. 将 project/thread 的固定 id、title 和 ARIA 属性改为 props。
6. 每迁移一个区域就删除对应的静态 Layout 文件。

最终 `presentation/` 只保留确实复杂且稳定的页面壳，不再保存数据状态的 JSX 副本。

## 10. 分阶段实施

### 阶段 A：消息垂直切片

- 拆出领域模型、Mock fixture 和 repository。
- 接入 `react-markdown`、`remark-gfm`。
- 建立动态 `Markdown`、`CodeBlock` 和 link renderer。
- Conversation 改为 `messages.map(...)`。
- Composer 发送后立即追加 user message，并显示 pending/streaming assistant message。

验收：Markdown 段落、列表、inline code、代码块、复制、链接和发送流程可用。

实施状态（2026-08-04）：已完成。消息领域模型、repository 注入、Mock 异步回复、
`react-markdown` + `remark-gfm`、动态代码块、Composer 发送和 pending/failed 状态已经接入。
旧的数字 CodeBlock Layout 与固定 Turn Layout 已删除。

### 阶段 B：状态集中

- 建立 workspace Zustand store 和 selectors。
- 迁移项目展开、会话选择、摘要开关和草稿。
- URL 中保存 conversation id；刷新后恢复当前页面。

验收：状态所有权唯一，无重复本地 state，无组件直接修改 fixture。

实施状态（2026-08-04）：已完成。Workspace 使用 feature-scoped Zustand vanilla store，
项目展开、会话选择、摘要开关和按会话草稿通过细粒度 selectors 订阅；消息数组和发送生命周期
没有复制进 Zustand，并已在阶段 C 迁出 React Context。

### 阶段 C：服务端状态

- 接入 TanStack Query 和 repository Provider。
- 消息发送改 mutation/streaming 流。
- 增加 loading、empty、error、retry 和 disconnected 状态。
- 使用 MSW 覆盖成功、延迟、断流和失败场景。

验收：Mock repository 与真实 adapter 可互换，组件代码不变。

实施状态（2026-08-04）：核心数据层已完成。应用级 `QueryProvider`、conversation query keys、
读取 query、发送 mutation 和乐观 pending/complete/failed 缓存转换已接入；旧的
`ConversationRuntimeProvider` 已删除。Repository 同时提供内存 Mock 与 HTTP adapter，HTTP
路径、请求负载、成功响应和 503 错误由 MSW 契约测试覆盖。流式事件、显式 retry/disconnected
界面仍作为接入真实 Agent 后端时的增量任务。

### 阶段 D：侧栏与 Layout 收敛

- 合并 active/inactive、open/closed 重复 Layout。
- 固定项目数量和数组下标 Layout 改为数据驱动列表。
- 将通用按钮、菜单和 tooltip 收敛到 `packages/ui`。
- 删除失去调用方的静态 Layout 和 CSS。

验收：任意数量 project/thread 都可渲染，视觉与交互基线通过。

实施状态（2026-08-04）：侧栏核心列表已完成。6 个项目外壳、5 个项目行、4 个线程列表、
16 个 active/inactive 线程 Layout 和 `layout-map` 已收敛为 4 个数据驱动语义 Layout，净删除
约 1,400 行固定 JSX。项目/线程 id、label、active、expanded、indicator、muted 和创建权限均由
数据或状态表达；任意线程数量、空项目、show-more 和唯一 active 状态已有 SSR 测试覆盖。
Sidebar Header/Footer/Scroll 与 Main 的固定字符串 slot 也已改为显式 `ReactNode`、文本或数组
props；Sidebar/Main 内部不再依赖字符串 slot。

Composer 与 Summary 的固定 slot 已进一步迁为具名节点和 typed props。旧的静态 Composer
编辑器 Layout 已删除；Summary open/closed 两份 JSX 已合并为一个 `open` 状态组件，并有 SSR
测试覆盖动画与文案状态。

Thread 的消息内容、操作区、处理状态、Conversation、Timeline、Footer 与 Summary 组合也已迁为
具名 `ReactNode` 和状态 props；Workspace 根布局直接接收 Sidebar/Main 节点。两份通用
`LayoutSlot`/`LayoutProps` 兼容实现已删除，SSR 测试覆盖消息状态、区域边界和节点顺序。至此
Workspace 全组件树不再依赖静态导出遗留的字符串 slot 架构。

Workspace 左侧栏也已接入 feature 级 Zustand store。标题栏按钮可在 `240px` 展开态和卸载侧栏的
关闭态之间切换，关闭后主内容自动扩展；标题栏保留 `124px` 安全占位，确保恢复按钮不会与项目
按钮重叠。状态、按钮语义和开关布局已有 store、SSR 与真实浏览器点击回归覆盖。

### 阶段 E：CSS 基建

- 为 Workspace 建立语义 token 映射。
- 按组件建立 CSS 依赖闭包，再删除未使用的静态导出 CSS。
- 保留必要的原始 class 兼容层，逐步迁入 `packages/ui` token。

验收：CSS 体积下降、Web/Electron 一致、明暗主题和响应式视口通过。

实施状态（2026-08-04）：已完成第一批有明确依赖证据的清理。当前 Markdown 仅启用 GFM，项目
没有 KaTeX/remark-math/rehype-katex 依赖；静态导出中 252 行不可达 KaTeX 样式、内嵌字体与
指向不存在文件的 OpenAI Sans `@font-face` 已删除。Web CSS 从约 `742 kB` 降至 `713.27 kB`
（gzip `108.21 kB` 降至 `99.86 kB`），Web/Electron 构建不再出现字体解析警告。页面继续使用
已验收的 macOS 系统字体栈，浏览器确认无字体网络请求、无布局溢出。未来若启用数学公式，
应在 `packages/ui` 显式接入公式插件和官方 KaTeX 资源，不恢复静态导出的散列路径。

第二批清理建立了可重复执行的 `pnpm audit:workspace-css` 审计入口。脚本扫描 Workspace 与共享
Markdown 源码，区分源码已引用 class、需要保守保留的运行时/工具类和人工复核候选；它只提供
依赖闭包线索，不自动修改 CSS。当前已按完整模块边界删除没有 HTML、React、依赖包或运行时入口
的启动闪屏、Blossom loader、xterm、Storybook 和 writing-block editor 样式，同时保留 Composer
真实依赖的通用 ProseMirror 规则。Web 产物 CSS 进一步降至约 `686.12 kB`（gzip `93.91 kB`）。

后续删除规则必须同时满足：源码无引用、运行时 DOM 无入口、所属模块未接入、删除边界完整；
并依次通过 CSS 审计、Web/Electron 构建、交互检查和目标视口视觉回归。动态拼接 class、第三方
组件内部 class、伪状态和平台选择器默认保守保留。

第三批清理将审计报告扩展为按 CSS Module hash 分组，输出每组 class 数量及源码命中情况，便于
以完整模块而非零散选择器为单位复核。已删除未接入的浏览器 favicon/throbber、旧模型功率设置、
旧模型选择器动画和 marquee 文本模块；人工复核候选由 `210` 降至 `156`，Web 产物 CSS 降至
约 `668.43 kB`（gzip `90.72 kB`）。当前 Composer 中的模型按钮是独立真实组件，本批没有修改
其 JSX、交互或实际命中的 class。

第四批按连续工具簇移除了未接入的 progression donut、浏览器区域标注、设计器数字/颜色输入、
Design Editor 入口、旋转/截图/缩放动效、结果 shimmer 和滚动数字样式。该簇位于 ProseMirror
基础规则与 cmdk 基建之间，删除边界不包含两侧规则；人工复核候选降至 `142`，Web 产物 CSS
降至约 `661.92 kB`（gzip `89.52 kB`）。Composer overlay、侧栏滚动时间线、toast 和第三方
编辑器运行时规则仍保守保留。

第五批在源码无引用之外增加了真实 DOM 闭包验证：分别在默认态和 Composer 懒控制打开态检查
模块 hash 与功能 data 属性。确认均无节点后，移除了未接入的 inline mention、cadenced shimmer、
Composer top tray、agent identicon、推荐弹窗装饰以及 Codex-to-ChatGPT 转场模块。人工复核候选
降至 `116`，Web 产物 CSS 降至约 `652.33 kB`（gzip `87.73 kB`）。Tailwind 共享 utilities 中仍
可能保留指向旧功能 token 的任意值工具类；它们由生成层统一治理，不在功能模块清理时零散删除。

随后按源码闭包继续移除了未接入的点阵/占位/chip/status pill、ready/enter、pulsing dot 与 scrub
rail 纯动画模块，保留相邻的侧栏 fade、Navigation、Composer navigation 和 Markdown preview。
人工复核候选降至 `99`，Web 产物 CSS 降至约 `646.59 kB`（gzip `86.70 kB`）。本轮按项目要求
不使用浏览器自动化，验收以源码反查、CSS 结构检查、组件测试及 Web/Electron 构建为准。

样式所有权迁移已启动。原 `features/workspace/workspace.css` 按原始级联顺序迁到 App 公共
`apps/app/src/styles/codex`，拆为 app-shell、应用 compatibility、Codex/VS Code 主题适配、
生成 utilities 兼容层和 runtime，由 `apps/app/src/styles.css` 统一加载。共享 Markdown 的连续 `_1q3nk`
样式块迁入 `packages/ui/src/components/markdown/markdown.css`，通过 `@pi/ui/markdown.css` 导出。
ProseMirror 与代码高亮/ANSI 两个边界完整的基础块也迁入 `packages/ui/src/styles/vendor`，分别通过
`@pi/ui/prose-mirror.css` 和 `@pi/ui/code-display.css` 导出；包含 Command Menu、Process Manager、
Composer 和应用壳选择器的规则继续保留在 App 层。
通用 `@layer components` 也已整体迁入 `packages/ui/src/styles/foundation-components.css`，覆盖图标
尺寸、标题排版、滚动边缘渐隐、面板过渡和加载 shimmer，并通过独立子路径在原位置加载。
标准元素 `@layer base` reset 已整体迁入 `packages/ui/src/styles/foundation-reset.css`。原主题文件
重命名为 `codex-vscode-theme.css`，明确它仍是 App 适配层；由于首个声明块已混合通用尺度、Codex
token 和 VS Code 映射，需先建立语义映射表再拆分，避免声明重排和双重 token 体系。
App 已新增 `ui-token-bridge.css`，将共享 UI 当前需要的 26 个 surface、foreground、control、
interaction、border 和 status token 映射到既有 Codex/VS Code token。该桥接层是平台主题依赖的
唯一入口：`packages/ui` 组件只消费语义 token，不直接依赖 `--vscode-*` 或 `--color-token-*`。
CSS 审计会校验映射完整性，防止新增共享语义类后出现未解析变量。
Tailwind `@layer properties` 初始化已迁入 `packages/ui/src/styles/foundation-properties.css`。
App 已建立 `styles/tailwind.css` 源码生成入口，显式维护 Codex token、尺寸和平台 variant；原
`codex-utilities.css` 静态快照已删除，构建只生成当前 App 与 `packages/ui` 源码使用的工具类。
Thread actions、Composer surface/frame、Sidebar fade/navigation 三个边界明确的连续规则块已迁入
各自 feature 目录。`apps/app/src/styles.css` 现在是唯一 CSS composition root，按原始级联顺序组合
App、共享 UI 和 feature 样式；App 公共 Codex 目录不再反向导入 workspace feature。
原 `app-shell.css` 进一步拆为 App globals、Workspace main 布局与 Composer utility bar。无源码
节点的 legacy primitives、Command Menu 和平台兼容选择器已删除，现有组件不再依赖散列类。
共享 `Markdown` 已拥有自己的 `pi-markdown-content` 根类，并将当前接入的段落、列表、列表项和
inline code 散列类替换为 `pi-markdown-*` 语义类。业务组件不再传递 Markdown 内部散列类。
此前所有权迁移阶段保持源码拼接 SHA 一致；从本阶段开始进入语义组件迁移，声明值和级联位置
仍保持不变，但选择器源码 SHA 会有意变化。Codex 快照 token 暂留 App 公共层，待语义映射完成后
再与 `packages/ui` token 合并，避免一次性替换变量造成像素漂移。
Markdown 的 `h1-h6`、ordered list、blockquote 和 horizontal rule 已补齐显式 renderer 与语义类，
GFM task list、table 和代码块也已接入语义结构。表格采用 container/scroller/wrapper 与
body/row/cell 组件边界，代码块不再依赖临时 margin utility；人工 CSS 复核候选相应下降。
Markdown 中剩余的 Mermaid、媒体、文件引用、streaming fade 和 placeholder 散列规则因无 parser、
renderer 或状态来源而删除，`_1q3nk` 已从共享组件源码清零。新增能力必须按完整垂直能力接入，
不再预埋不可达样式。

## 11. 测试策略

- 领域层：纯函数和 DTO mapper 单元测试。
- Store：selector、展开、选择、草稿和 summary action 测试。
- Markdown：GFM、代码块、危险 HTML、链接策略和长文本快照测试。
- Repository：契约测试，同一套测试运行 Mock 与真实 adapter。
- Component：发送、复制、retry、切换会话等交互测试。
- E2E：Web 与 Electron 的核心会话流程。
- Visual：`390x844`、`590x742`、`990x721`、`1440x900` 截图回归。

## 12. 完成标准

- 助手消息来自 Markdown 字符串，不再使用手工 block 数组。
- 页面组件不直接 import Mock fixture。
- 服务端状态和客户端状态边界清晰。
- 新增项目或会话不需要新增 Layout 文件。
- active/open/loading/error 由 props 和状态表达，不由静态 JSX 副本表达。
- `packages/ui` 不依赖 workspace feature。
- Web、Electron 构建及类型检查通过。
- 核心交互和四个目标视口视觉回归通过。

## 13. 推荐执行顺序

阶段 A-D 已经落地，Thread 和 Workspace 根布局的 slot 兼容 API 也已删除。阶段 E 已完成多批
不可达模块清理，并建立 App/UI/Feature 三层样式所有权；下一步继续把公共 primitive 与 token
从 Codex 兼容层迁入 `packages/ui`，同时为消息区补齐 streaming、failed 和 retry 交互。
