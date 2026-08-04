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

### 阶段 C：服务端状态

- 接入 TanStack Query 和 repository Provider。
- 消息发送改 mutation/streaming 流。
- 增加 loading、empty、error、retry 和 disconnected 状态。
- 使用 MSW 覆盖成功、延迟、断流和失败场景。

验收：Mock repository 与真实 adapter 可互换，组件代码不变。

### 阶段 D：侧栏与 Layout 收敛

- 合并 active/inactive、open/closed 重复 Layout。
- 固定项目数量和数组下标 Layout 改为数据驱动列表。
- 将通用按钮、菜单和 tooltip 收敛到 `packages/ui`。
- 删除失去调用方的静态 Layout 和 CSS。

验收：任意数量 project/thread 都可渲染，视觉与交互基线通过。

### 阶段 E：CSS 基建

- 为 Workspace 建立语义 token 映射。
- 按组件建立 CSS 依赖闭包，再删除未使用的静态导出 CSS。
- 保留必要的原始 class 兼容层，逐步迁入 `packages/ui` token。

验收：CSS 体积下降、Web/Electron 一致、明暗主题和响应式视口通过。

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

优先完成阶段 A 的消息垂直切片。它能最早验证新架构是否能够承接真实模型输出，同时改动范围集中；确认 Markdown、消息发送和 Mock streaming 稳定后，再迁移全局状态和侧栏，避免同时重写整个页面。
