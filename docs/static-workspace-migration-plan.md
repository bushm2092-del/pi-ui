# Workspace 页面移植完成记录

## 当前结果

截至 2026-08-04，静态桌面页面已经成为 `features/workspace` 下的真实 React 实现：

- 页面结构按 `sidebar`、`main`、`thread`、`composer`、`summary` 模块归属。
- 71 个视觉状态已转换为模块内的显式 TSX Layout 组件。
- 集中的大型 JSX 已拆入各模块 `layouts/` 目录，每个文件只承载一个视觉组件。
- 组件直接 import Layout，不存在 HTML parser、字符串片段 key 或中央 JSX 注册表。
- 项目折叠、会话选择、摘要开关和 Composer 输入发送由 React 状态驱动。
- 完整 class、CSS、73 个 SVG 和原 DOM 层级得到保留。
- Web 和 Electron renderer 使用同一个 `WorkspacePage` 组件树。

## 完成步骤

1. 冻结桌面页面的 HTML、CSS、SVG、节点统计和多视口截图。
2. 将静态 DOM 转换为显式 TSX，验证默认 DOM 与视觉基线一致。
3. 建立 Sidebar、Main、Thread、Composer 和 Summary 所有权边界。
4. 将项目、会话、消息、标题和摘要内容迁入类型化 `workspaceData`。
5. 接入项目展开、会话选中、编辑器输入、发送清空和摘要开关。
6. 将 JSX 拆入各业务模块，删除迁移期字符串 getter、渲染器和注册表。
7. 删除运行时及开发时 HTML parser 依赖与重复快照副本。
8. 通过类型检查、测试、lint、Web/Electron 构建和多视口像素验收。
9. 将侧栏 1502 行、会话 575 行等集中式 Layout 文件拆成最大约 132 行的单组件文件。

## 验收要求

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build:web
pnpm build:desktop
```

浏览器验收同时检查：73 个 SVG、77 个按钮、零占位节点、零错误日志，以及
`590x742`、`990x721`、`1440x900`、`390x844` 四个视口。

当前允许的视觉差异只有项目品牌文字和非确定性的加载动画帧；其余静态区域必须保持像素一致。
