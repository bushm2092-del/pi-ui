# HTTP 与 WebSocket 接入协议

## 1. 目标

为 Web、Electron Desktop 和后续客户端提供同一套 Control Plane 接口。HTTP 负责命令和快照，
WebSocket 负责 Runtime 实时事件、订阅和断线续传。Gateway 不直接依赖 Pi SDK，只调用
`RuntimeService`。

## 2. 进程与模块

```text
Client
  |-- HTTP command/snapshot --> PiGateway --> RuntimeService --> AgentWorkerSupervisor
  `-- WebSocket events <------ PiGateway <-- EventStreamRegistry <-- Agent Worker IPC
```

- `http-app`：Express 5 路由、JSON body、认证、Origin 和统一错误处理中间件。
- `PiGateway`：Node HTTP Server、WebSocket upgrade、连接、订阅和心跳。
- `RuntimeService`：Runtime 用例入口，隔离 Gateway 与 Supervisor。
- `EventStreamRegistry`：按 `streamId` 保存有界事件窗口并提供 cursor replay。
- `startPiBackend`：初始化 Journal、Supervisor、事件缓存和 Gateway，统一执行关闭。

## 3. HTTP API

除 `GET /health` 外，所有接口要求 `Authorization: Bearer <token>`。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/health` | 进程存活检查 |
| `POST` | `/v1/runtimes` | 创建新 Runtime 或从 Session JSONL 恢复 |
| `GET` | `/v1/runtimes/:runtimeSlotId` | 获取实时 Snapshot |
| `POST` | `/v1/runtimes/:runtimeSlotId/prompt` | 执行 Prompt |
| `POST` | `/v1/runtimes/:runtimeSlotId/abort` | 中断当前生成 |
| `PATCH` | `/v1/runtimes/:runtimeSlotId` | 修改 Session 名称 |
| `DELETE` | `/v1/runtimes/:runtimeSlotId` | 关闭并移除 Runtime |

错误统一返回：

```json
{
  "error": {
    "code": "runtime_not_found",
    "message": "Unknown runtime slot: slot-1",
    "retryable": false,
    "requestId": "..."
  }
}
```

## 4. WebSocket

连接地址为 `/v1/events`。Node 客户端可以使用 Authorization header；浏览器使用子协议：

```text
pi-ui.v1
pi-ui-token.<token>
```

连接成功后服务端发送 `connection.ready`。客户端通过 `subscribe` 动态订阅 Runtime：

```json
{
  "v": 1,
  "kind": "subscribe",
  "subscriptionId": "sub-1",
  "runtimeSlotId": "slot-1",
  "resume": {
    "streamId": "previous-stream-id",
    "afterCursor": 42
  }
}
```

无 `resume` 时，服务端返回当前 Snapshot，随后只推送新事件。有有效 resume 时，服务端先发送
`subscription.ready`，再补发 cursor 之后的事件。缓存缺失、cursor 过期或 Worker 替换时返回
`subscription.reset_required` 和最新 Snapshot，客户端必须以 Snapshot 重新校准。

## 5. 内存边界

事件缓存默认每个 Stream 最多保存 2,000 条或 8 MiB，最多保存 256 个 Stream。达到限制后淘汰
旧事件，禁止无限缓存模型输出和工具结果。缓存是断线续传窗口，不是持久化真值；Session 内容仍以
Pi JSONL 为准。

## 6. 安全边界

- 默认监听随机 `127.0.0.1` 端口。
- 非 loopback 地址启动时必须显式配置 `PI_UI_TOKEN`。
- 浏览器 Origin 必须出现在 `PI_UI_ALLOWED_ORIGINS`。
- HTTP 请求体限制为 1 MiB。
- Token 使用常量时间比较。
- Agent Worker 和 Pi SDK 不向浏览器开放端口。

## 7. 当前边界

- Prompt HTTP 请求目前保持到 Agent 完成，流式内容同时从 WebSocket 到达。
- 事件窗口当前在内存中，Server 重启后客户端使用 Snapshot 回退。
- 尚未实现 `ConnectionRegistry`、多客户端 controller lease 和 durable event log。
- `packages/agent-client` 已实现 HTTP 命令、自动重连、cursor 恢复、事件去重和 Snapshot 校准；
  React Provider 尚未接入。
