# Electron Backend 生命周期

## 1. 启动顺序

```text
Electron app.whenReady
  -> startPiBackend(random loopback port, random token)
  -> register trusted IPC handlers
  -> create BrowserWindow
  -> preload getBackendConnection
  -> React AgentClientProvider
  -> HTTP + WebSocket connection
```

窗口只在 Backend ready 后创建，因此 Renderer 不需要轮询后台启动状态。Backend 数据位于
`app.getPath("userData")/backend`，不会写进项目目录。

## 2. Renderer 边界

preload 只暴露：

- `PlatformAdapter` 的文件选择、保存和打开外链能力。
- `getBackendConnection()` 返回当前 Backend 的 HTTP URL、WebSocket URL 和进程级随机 Token。

`contextIsolation` 保持开启，`nodeIntegration` 关闭，sandbox 开启。IPC Main handler 校验消息来自当前
主窗口，Renderer 不能访问 Node、Pi SDK、Worker IPC 或 Backend 生命周期对象。

## 3. 网络边界

- Desktop Backend 默认监听随机 `127.0.0.1` 端口。
- Token 每次应用启动随机生成，不写入 Renderer 持久化状态。
- 开发模式只允许 `ELECTRON_RENDERER_URL` 的 Origin。
- 打包模式允许本地 `file://` 页面对应的 `null` Origin。
- Backend 地址和 Token 仅由 preload IPC 传给 React 根 Provider。

## 4. 关闭顺序

Electron `before-quit` 首次触发时阻止退出，依次关闭 Gateway、全部 Agent Worker 并 flush Operation
Journal，完成后再次调用 `app.quit()`。macOS 关闭最后一个窗口时应用和 Backend 保持运行，显式退出
应用时才停止 Backend。

## 5. 当前边界

- Electron 打包器和 `extraResources` 尚未配置，发布包需要包含 `@pi/agent-worker/dist/main.js` 及其
  运行时依赖。
- 尚未实现 Backend 崩溃后的 Desktop 自动重启和诊断页面。
- 系统权限请求当前默认拒绝；通知等能力需要后续按权限类型加入白名单。
