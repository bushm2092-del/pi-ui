# Runtime 与 Session 生命周期

## 1. 目的

本文定义当前 Pi UI 后端中 Runtime 与 Session 的唯一生命周期规范。设计以现有单进程实现为准：
`RuntimeService` 在 Server 进程内直接持有 `AgentSessionRuntime`，不涉及 Worker、IPC、lease 或跨进程恢复。

设计目标：

- 一个 Runtime Slot 只拥有一个 Agent Session。
- 不维护与 Pi SDK 重复的 Runtime 状态机。
- Agent 活动状态以 `AgentSession` 为唯一事实来源。
- 创建失败不留下半初始化对象，删除和关机必须完整释放资源。
- Socket Snapshot、实时事件和 SQLite 元数据各自只有一种明确职责。

## 2. 核心模型

```text
RuntimeService
  -> Map<runtimeSlotId, ActiveRuntime>
       -> AgentSessionRuntime
            -> AgentSession
            -> AgentSessionServices
```

```ts
interface ActiveRuntime {
  runtime: AgentSessionRuntime;
  unsubscribe?: () => void;
}
```

Registry 只有一个含义：

```text
存在 runtimeSlotId   Runtime 已完成初始化并可调用
不存在 runtimeSlotId Runtime 不存在或已删除
```

创建中和删除中不写入额外状态字段，由对应请求的 Promise 是否完成表示。创建失败通过结构化错误返回，
不会保存 `starting` 或 `unavailable` Entry。

## 3. 不变量

1. 一个 `runtimeSlotId` 在 Registry 中至多对应一个 `AgentSessionRuntime`。
2. 一个 Runtime 生命周期内只使用创建时确定的 Session，不调用 `newSession()`、`switchSession()`、
   `fork()` 或 `importFromJsonl()` 替换 Session。
3. 新建、打开、分叉或导入另一个会话时，应创建新的 Runtime Slot。
4. Registry 中的 Runtime 必须已经完成 Session 创建、扩展绑定和事件订阅。
5. Runtime 是否正在生成、压缩或重试，只能从当前 `AgentSession` 获取。Service 和 SQLite 不维护
   第二份可变状态；前端只保存事件投影，并允许 Snapshot 随时覆盖校准。
6. `runtimeSlotId` 是 Pi UI 运行实例身份；`sessionId` 是 Pi Session 身份，两者不得混用。
7. Pi Session JSONL 是消息和会话内容的真值；SQLite `runtime_session` 只保存索引元数据。

## 4. 创建生命周期

客户端调用 `runtime:create`，服务端按以下顺序执行：

```text
校验 runtimeSlotId 未被占用
  -> createPiRuntime(options)
     -> 确定 agentDir
     -> 创建或打开 SessionManager
     -> 创建 AgentSessionServices
     -> 创建 AgentSession
     -> 创建 AgentSessionRuntime
  -> bindHeadlessExtensions(session)
  -> subscribe(session events)
  -> 写入 Registry
  -> 生成并保存 Snapshot
  -> 返回 Snapshot
```

当前实现先创建 Runtime，再写入 Registry，因此不对外暴露 `starting` 状态。调用方以 `runtime:create`
请求 pending 表示创建中。

任一步骤失败时必须：

```text
从 Registry 删除可能的 Entry
  -> dispose 已创建的 AgentSessionRuntime
  -> 返回结构化错误
```

创建失败后 `runtime:get` 必须返回 `runtime_not_found`，调用方可重新发起 `runtime:create`。

## 5. Session 活动状态

Snapshot 直接暴露 Pi SDK 的真实状态：

```ts
interface RuntimeSnapshotDto {
  isStreaming: boolean;
  isIdle: boolean;
  isCompacting: boolean;
  retryAttempt: number;
}
```

字段语义：

| 字段           | 含义                                              |
| -------------- | ------------------------------------------------- |
| `isStreaming`  | Session 正在处理 Agent Run 或其后续 continuation  |
| `isIdle`       | 没有 Agent Run、重试、自动压缩或排队 continuation |
| `isCompacting` | 正在压缩上下文或生成分支摘要                      |
| `retryAttempt` | 当前自动重试次数，`0` 表示未重试                  |

如 UI 需要单一显示状态，只能临时推导，不能持久化：

```ts
function deriveActivity(snapshot: RuntimeSnapshotDto) {
  if (snapshot.isCompacting) return "compacting";
  if (snapshot.retryAttempt > 0) return "retrying";
  if (snapshot.isStreaming) return "running";
  if (snapshot.isIdle) return "idle";
  return "busy";
}
```

## 6. Agent Run 生命周期

一次 Prompt 可能包含多个 Turn、工具调用、压缩或重试：

```text
prompt
  -> agent_start
  -> turn/message/tool events
  -> agent_end
  -> 可选 retry/compaction/follow-up
  -> agent_settled
```

`agent_end` 只表示一次底层 Agent Run 结束，之后仍可能重试或继续处理；`agent_settled` 才表示整个
Session 已稳定空闲。前端通过 Pi 原生 `agent.event` 实时更新界面，不使用额外的 `runtime.phase` 事件。

## 7. 命令规则

| 命令              | 规则                                                  |
| ----------------- | ----------------------------------------------------- |
| `runtime:create`  | 创建一个新 Runtime；重复 `runtimeSlotId` 返回错误     |
| `runtime:get`     | 返回从当前 Runtime 实时生成的 Snapshot                |
| `runtime:prompt`  | Session 运行中再次提交必须指定 `steer` 或 `followUp`  |
| `runtime:abort`   | 中止当前 Agent 工作，完成后返回实时 Snapshot          |
| `runtime:rename`  | 修改当前 Session 名称并保存 Snapshot                  |
| `runtime:remove`  | 取消订阅、abort、dispose、删除元数据和 Registry Entry |
| `runtime:watch`   | 加入 Runtime 房间，并通过 ACK 返回当前 Snapshot       |
| `runtime:unwatch` | 离开 Runtime 房间，不影响 Runtime 本身                |

本阶段假设同一 Runtime Slot 的生命周期命令按顺序调用，不定义并发 create/remove/prompt 的冲突处理。
Pi SDK 自身允许运行中的 `steer`、`followUp` 和 `abort`，不应使用会阻断这些能力的普通互斥锁。

## 8. 实时事件与校准

服务端只发送以下 Runtime 相关事件：

| 事件               | 作用                                 |
| ------------------ | ------------------------------------ |
| `runtime.snapshot` | 完整状态校准                         |
| `agent.event`      | Pi SDK 原生 Session 事件的 JSON 表示 |
| `extension.error`  | Headless Extension 执行错误          |

前端实时状态以 `agent.event` 驱动；首次 watch、重连或怀疑事件丢失时，以 Snapshot 为准。不得根据
`agent_end` 将 UI 标记为空闲，应等待 `agent_settled` 或使用 Snapshot 的 `isIdle`。

## 9. Snapshot 与持久化

Snapshot 在以下时机生成：

- Runtime 创建并绑定成功。
- `runtime:get` 或 `runtime:watch` 请求。
- Prompt 完成。
- Abort 完成。
- Session Rename 完成。

SQLite `runtime_session` 保存 `runtimeSlotId`、Session 身份、cwd、Session 文件、名称和模型索引，
不保存 `isStreaming`、`isIdle`、`isCompacting`、`retryAttempt` 等瞬时状态。

后端重启后不会根据 `runtime_session` 自动重建 Runtime。需要继续历史会话时，客户端使用保存的
`sessionFile` 发起新的 `runtime:create`。

## 10. 删除与关机

删除一个 Runtime 必须逐项尝试清理，不能因前一步失败跳过后续步骤：

```text
unsubscribe
  -> abort Session
  -> dispose AgentSessionRuntime
  -> 删除 Registry Entry
  -> 删除 runtime_session 元数据
  -> 汇总并返回清理错误
```

`stopAll()` 使用 `Promise.allSettled()` 等待所有 Runtime 完成清理尝试。Backend 关闭顺序为：

```text
停止 Socket Server
  -> stopAll Runtime
  -> 关闭 SQLite
  -> 汇总清理错误
```

任一环节失败都不能阻止后续资源清理。

## 11. Session 替换

Pi SDK 的 `AgentSessionRuntime` 支持 `newSession()`、`switchSession()`、`fork()` 和
`importFromJsonl()`，但当前 Pi UI 不调用这些方法。`setRebindSession()` 因此不属于当前生命周期，
不注册该回调。

如果未来改为一个 Runtime 内替换 Session，必须单独设计替换失败语义、旧 Session 失效处理、事件
重绑定和命令冲突；不得直接扩展本文的简单 Registry 模型。

## 12. 验收标准

1. Snapshot 不包含手工维护的 Runtime `state`，包含四个 Pi Session 状态字段。
2. Server 不发送 `runtime.phase`。
3. `ActiveRuntime` 只包含 `runtime` 和取消订阅函数。
4. 创建失败后 Registry 中不存在对应 Slot，已创建资源被 dispose。
5. Prompt 运行中未提供 `streamingBehavior` 时返回错误。
6. Remove 即使 abort 失败也继续 dispose 和删除 Entry。
7. `stopAll()` 等待全部 Runtime 的清理尝试完成。
8. SQLite Schema 和 Mapper 不保存 Runtime `state`。
9. 前端使用 `agent_start`、`agent_settled`、compaction 和 retry 事件更新活动状态，并由 Snapshot 校准。

验证命令：

```bash
pnpm typecheck
pnpm test
pnpm build:backend
```
