# @pi/agent-client

Web、Electron Desktop 和 Node 客户端访问 Pi UI Backend 的统一 SDK。该包不依赖 React、Zustand
或 Electron。

## 创建客户端

```ts
import { AgentClient } from "@pi/agent-client";

const client = new AgentClient({
  httpUrl: "http://127.0.0.1:62181",
  webSocketUrl: "ws://127.0.0.1:62181/v1/events",
  token: "backend-token"
});
```

## Runtime 命令

```ts
const runtime = await client.runtimes.create({
  cwd: "/path/to/project",
  sessionFile: "/path/to/session.jsonl"
});

await client.runtimes.prompt(runtime.runtimeSlotId, {
  message: "检查当前项目"
});

await client.runtimes.abort(runtime.runtimeSlotId);
await client.runtimes.rename(runtime.runtimeSlotId, "项目检查");
await client.runtimes.remove(runtime.runtimeSlotId);
```

Prompt HTTP 请求会等待 Agent 完成；流式事件同时由 Realtime Client 推送。

## 实时订阅

```ts
const subscription = client.realtime.subscribe(runtime.runtimeSlotId, {
  onSnapshot(snapshot, reason) {
    // 首次连接、重新连接或 cursor 失效时校准本地状态
  },
  onEvent(event) {
    // runtime.phase、agent.event、extension.error 等
  },
  onError(error) {
    console.error(error.code, error.retryable);
  }
});

await client.realtime.connect();

subscription.unsubscribe();
client.close();
```

Realtime Client 自动执行指数退避重连，并使用最后处理的 `streamId + cursor` 恢复订阅。服务端
要求 Snapshot 回退时调用 `onSnapshot(snapshot, "reset")`。相同 Stream 中 cursor 不大于已处理
位置的事件会被忽略。

## 状态归属

- Backend/Pi JSONL 是 Session 和消息真值。
- Agent Client 只维护连接、订阅和 cursor。
- React Store 可以缓存用于渲染的 Snapshot，但不能把它当成服务端持久化状态。
