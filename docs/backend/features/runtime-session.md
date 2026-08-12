# Runtime 与 Session 生命周期

## 1. 当前目标

建立 Control Plane 到 Agent Worker 再到 Pi SDK 的第一条生产边界，验证 Runtime 创建、事件转发、
Session 单写者、操作状态和 JSONL 恢复。当前阶段不包含 HTTP/WebSocket Gateway 和完整 Session
replacement API。

## 2. 已实现

- `packages/shared`：前后端共享的 Runtime Snapshot、A2UI 和结构化错误类型。
- `apps/server/src/Pi`：Pi Runtime 创建、事件 JSON 化、A2UI Tool 和 Snapshot 映射。
- `apps/server` 的 `RuntimeService`：进程内管理 Pi Runtime、event stream、prompt、abort、Session 命名和 shutdown。
- `apps/server`：SocketServer、Controller、Service、SQLite Mapper 和全局拦截器。
- Pi Session 可通过相同 JSONL 文件重新创建 Runtime。

## 3. 当前不变量

- Worker 稳定身份是 `runtimeSlotId`，不是 `sessionId`。
- 一个 Session ID 或 canonical Session file 只能注册一个可写 Runtime。
- Control Plane 不直接修改活动 Session JSONL。
- Prompt 接受和 Prompt 完成是不同状态。
- Pi event 在离开 Worker 前转换为 JSON-compatible DTO。
- Worker 意外退出后 Registry 和 Storage lease 自动释放。

## 4. Provisional Session

Pi 为新 Session 预先分配 `sessionId` 和 `sessionFile`，但在首个 Assistant 回复产生前不会创建
JSONL 文件。因此后台必须允许以下状态：

```text
provisional -> active persisted -> closed
            -> discarded
```

provisional Session 可以显示在活动 UI 中，但应用重启后无法从 JSONL 恢复。后续 Session Catalog
需要决定是否在 SQLite 保存 provisional metadata；不能伪造或提前写 Pi JSONL。

## 5. 操作状态

```text
accepted -> running -> completed
                    -> failed
                    -> uncertain
```

`uncertain` 表示 Worker 退出时无法判断工具副作用和最终回复是否完整。此状态必须展示给用户，
不得自动重放 Prompt。

## 6. 尚未实现

- `newSession`、`switchSession`、`fork`、`clone`、`import` replacement 事务。
- replacement 时 Storage lease、Registry 和订阅的原子迁移。
- 跨 Control Plane 进程的 durable lease/fencing。
- 外部 Pi CLI 修改活动 JSONL 的检测与冻结。
- Extension Web UI Bridge 和完整 commandContextActions。
- WebSocket cursor replay 和 Session snapshot API。
- SQLite Session Catalog 和 provisional Session 恢复策略。
- 使用真实模型完成首个回复后的新 Session 持久化端到端测试。

## 7. 验证

```bash
pnpm typecheck:backend
pnpm test
pnpm build:backend
```

集成测试使用真实 `@earendil-works/pi-coding-agent` Runtime 和独立 Node 子进程，但不调用模型。
