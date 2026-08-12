# 后端功能设计索引

宏观架构见 [Pi UI 后端宏观架构](architecture-overview.md)。每个功能独立设计和评审，避免把
所有细节继续堆入总览文档。

数据库表、Migration 和 Mapper SQL 必须遵守 [SQL 书写指南](sql-writing-guide.md)。

| 功能 | 文档 | 状态 |
| --- | --- | --- |
| Runtime 与 Session 生命周期 | [features/runtime-session.md](features/runtime-session.md) | 第一阶段已实现 |
| WebSocket 连接与事件流 | [features/realtime-protocol.md](features/realtime-protocol.md) | 第一阶段已实现 |
| Electron Backend 生命周期 | [features/desktop-backend-lifecycle.md](features/desktop-backend-lifecycle.md) | 第一阶段已实现 |
| Workspace 与路径授权 | `features/workspaces.md` | 待设计 |
| 模型、Provider 和凭据 | `features/models-providers.md` | 待设计 |
| 权限审批与 Project Trust | `features/permissions-trust.md` | 待设计 |
| 消息与 Session 树 | `features/transcript-tree.md` | 待设计 |
| Package 与资源管理 | `features/packages-resources.md` | 待设计 |
| 文件、附件和搜索 | `features/files-search.md` | 待设计 |
| PTY | `features/pty.md` | 待设计 |
| 置顶、最近和归档 | `features/navigation-metadata.md` | 待设计 |
| Git、worktree 和 PR | `features/source-control.md` | 待设计 |
| 计划任务和通知 | `features/automations-notifications.md` | 待设计 |

## 单功能设计模板

```text
1. 目标与非目标
2. 用户流程
3. 领域对象与状态机
4. 数据真值和持久化
5. 模块职责
6. HTTP API
7. WebSocket/IPC 事件
8. 权限与安全
9. 并发、幂等和恢复
10. 前后端状态边界
11. 测试与验收标准
12. 未决问题
```
