# Pi UI

基于 Electron Vite、React、shadcn 风格组件、Tailwind CSS、Zustand 和 React Router 的跨端桌面应用架构。

## 项目结构

- `apps/app`：平台无关的 React 应用，也可独立作为 Web 应用运行
- `apps/desktop`：Electron main、preload 与 renderer 入口
- `packages/ui`：共享 UI 组件与主题样式
- `packages/platform`：跨端能力接口及 Web 实现
- `packages/shared`：共享类型、常量和纯业务代码

## 架构文档

- [Pi UI 后端宏观架构](docs/backend/architecture-overview.md)：整体分层、进程、文件夹、模块、数据和依赖边界
- [后端功能设计索引](docs/backend/feature-design-index.md)：按功能分别设计和评审的文档入口
- [Pi UI 后端详细架构草案](docs/pi-backend-architecture.md)：早期完整能力草案，后续内容将拆入各功能设计
- [静态工作台 React 重建架构](docs/static-workspace-rebuild.md)：基于参考快照重建 React 工作台的组件、CSS、实施与验收规划
- [静态工作台逐步移植计划](docs/static-workspace-migration-plan.md)：按可独立验收的步骤逐项完成页面移植

## 开发

```bash
pnpm install
pnpm dev       # Electron 桌面端
pnpm dev:web   # Web 端，默认 http://localhost:5173
```

## 验证与构建

```bash
pnpm typecheck
pnpm build:web
pnpm build:desktop
```

桌面能力必须经由 `preload` 的 `window.pi` 调用。不要在 `apps/app` 或 renderer 中直接导入 Electron/Node API。
