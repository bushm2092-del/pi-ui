import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssistantMessage } from "@/features/workspace/thread/assistant-message";
import { UserMessage } from "@/features/workspace/thread/user-message";
import type { Message } from "@/features/workspace/domain";

const typographyAssistantMessage: Message = {
  id: "message-test-assistant-typography",
  role: "assistant",
  status: "complete",
  createdAt: "2026-08-16T08:59:00.000Z",
  completedAt: "2026-08-16T08:59:02.000Z",
  content: `# 文本效果总览

这是一段用于检查中文排版的正文。它同时包含 **粗体文本**、*斜体文本*、***粗斜体***、~~删除线~~、\`行内代码\` 和 [外部链接](https://example.com)。

英文与数字混排：Streamdown renders **Markdown** incrementally in React 19, version \`2.5.0\`.

## 二级标题

正文需要保持稳定的 14px 字号、22px 行高以及自然的段落间距。很长的连续内容也应自动换行：abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789。

### 三级标题

特殊字符与转义：\*星号\*、\# 井号、\[方括号\]、\{花括号\}、路径 \`apps/web/src/components/ui/markdown\`。

#### 四级标题

> 引用内容使用正常字形与左侧竖线。
>
> 引用中可以包含 **强调**、\`代码\` 和第二个段落。

##### 五级标题

1. 第一层有序列表
   1. 第二层有序列表
   2. 第二个嵌套项目
2. 返回第一层

###### 六级标题

- 无序列表
  - 圆形标记
    - 方形标记
- 最后一个项目

---

文本效果样本结束。`,
};

const structuredAssistantMessage: Message = {
  id: "message-test-assistant-complete",
  role: "assistant",
  status: "complete",
  createdAt: "2026-08-16T09:00:01.000Z",
  completedAt: "2026-08-16T09:00:06.000Z",
  content: `# 消息渲染实现建议

AI 回复可以包含普通文本、**重点内容**、[安全链接](https://example.com)以及 \`inline code\`，并在同一套排版节奏中保持可读性。

---

## 稳定的内容层次

可以把消息渲染拆成三个稳定层次：

1. **消息数据**保存角色、状态和内容。
2. **消息容器**处理左右对齐与操作按钮。
3. **Markdown 渲染器**负责代码、表格和图表。

### 实现检查项

- [x] 支持完整 Markdown
- [x] 支持流式残缺语法
- [ ] 补充更多边界用例
  - 嵌套无序列表
  - 很长的表格单元格

| 内容类型 | 渲染方式 | 状态 | 说明 |
| --- | --- | --- | --- |
| 普通文本 | React | 已完成 | 保持紧凑的段落间距与自然换行 |
| 代码块 | Shiki | 已完成 | 使用 One Light 和 One Dark Pro 主题 |
| 流程图 | Mermaid | 已完成 | 容器占满正文宽度并支持缩放与下载 |
| 超长内容 | 内部滚动 | 验证中 | 这一列用于检查窄屏下表格不会撑破消息容器 |

\`\`\`typescript
type MessageStatus = "pending" | "complete" | "failed" | "stopped";

function isFinished(status: MessageStatus) {
  return status !== "pending";
}
\`\`\`

\`\`\`diff
- shikiTheme={["github-light", "github-dark"]}
+ shikiTheme={["one-light", "one-dark-pro"]}
\`\`\`

\`\`\`mermaid
flowchart LR
  User[用户消息] --> Thread[对话列表]
  Thread --> Assistant[AI 消息]
  Assistant --> Markdown[Streamdown]
  Markdown --> Code[Shiki]
  Markdown --> Diagram[Mermaid]
\`\`\`

\`\`\`json
{
  "renderer": "streamdown",
  "features": ["markdown", "shiki", "mermaid"],
  "streaming": true
}
\`\`\`

\`\`\`mermaid
sequenceDiagram
  participant U as 用户
  participant A as Assistant
  participant M as Markdown
  U->>A: 发送消息
  A-->>M: 持续追加分片
  M-->>U: 增量渲染
\`\`\`

> 这条回复直接使用工作区中的真实 AssistantMessage 组件渲染。
>
> 引用中的第二段用于验证连续内容的垂直节奏。`,
};

const incompleteAssistantMessage: Message = {
  id: "message-test-assistant-incomplete",
  role: "assistant",
  status: "pending",
  createdAt: "2026-08-16T09:01:00.000Z",
  content: `正在分析消息布局。当前收到的内容包含 **尚未结束的强调

- 已收到的列表项
- 第二个列表项包含 \`尚未闭合的代码`,
};

const emptyPendingAssistantMessage: Message = {
  id: "message-test-assistant-empty",
  role: "assistant",
  status: "pending",
  createdAt: "2026-08-16T09:02:00.000Z",
  content: "",
};

const streamingContent = `## 实时生成的回答

这段内容会以固定的小分片持续进入渲染器，用于观察段落、强调语法和块级内容在生成过程中的变化。

当前已启用 **增量 Markdown 解析**，尚未闭合的语法不会让消息区域发生明显跳动。

### 实现示例

\`\`\`typescript
async function streamMessage(onChunk: (chunk: string) => void) {
  for (const chunk of response.body) {
    onChunk(chunk);
  }
}
\`\`\`

| 阶段 | 消息状态 | 渲染结果 |
| --- | --- | --- |
| 首个分片前 | pending | 展示等待状态 |
| 持续接收 | pending | 增量更新 Markdown |
| 完成 | complete | 展示消息操作栏 |

\`\`\`mermaid
flowchart LR
  Request[用户请求] --> Stream[响应流]
  Stream --> Chunk[内容分片]
  Chunk --> Render[增量渲染]
  Render --> Complete[完整消息]
\`\`\`

> 流式输出完成后，消息状态会从 pending 切换为 complete。`;

const streamingCharacters = Array.from(streamingContent);
const streamingChunkSize = 4;

function StreamingMessageDemo() {
  const [cursor, setCursor] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const isComplete = cursor >= streamingCharacters.length;
  const isStreaming = isRunning && !isComplete;

  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    const interval = window.setInterval(() => {
      setCursor((value) => Math.min(value + streamingChunkSize, streamingCharacters.length));
    }, 45);

    return () => window.clearInterval(interval);
  }, [isStreaming]);

  const message = useMemo<Message>(
    () => ({
      id: "message-test-assistant-streaming",
      role: "assistant",
      status: isComplete ? "complete" : "pending",
      createdAt: "2026-08-16T09:03:00.000Z",
      ...(isComplete ? { completedAt: "2026-08-16T09:03:08.000Z" } : {}),
      content: streamingCharacters.slice(0, cursor).join(""),
    }),
    [cursor, isComplete],
  );

  const progress = Math.round((cursor / streamingCharacters.length) * 100);

  const togglePlayback = () => {
    if (isComplete) {
      setCursor(0);
      setIsRunning(true);
      return;
    }

    setIsRunning((value) => !value);
  };

  const restart = () => {
    setCursor(0);
    setIsRunning(true);
  };

  return (
    <>
      <div className="mb-5 flex min-h-8 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-token-text-tertiary">{progress}%</span>
          <div
            className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-token-bg-secondary"
            role="progressbar"
            aria-label="流式输出进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="h-full rounded-full bg-token-text-secondary transition-[width] duration-75" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <TooltipProvider>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={isStreaming ? "暂停流式输出" : isComplete ? "重新播放流式输出" : "继续流式输出"}
                  onClick={togglePlayback}
                >
                  {isStreaming ? <PauseIcon /> : <PlayIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isStreaming ? "暂停" : isComplete ? "重新播放" : "继续"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="重新开始流式输出" onClick={restart}>
                  <RotateCcwIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>重新开始</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <AssistantMessage message={message} />
    </>
  );
}

export function MessageTestPage() {
  return (
    <main className="h-dvh overflow-y-auto bg-token-main-surface-primary text-token-text-primary">
      <div className="mx-auto w-full max-w-(--thread-content-max-width) px-5 py-10 sm:px-8">
        <header className="mb-10 border-b border-token-border pb-5">
          <p className="text-xs font-medium text-token-text-tertiary">Debug</p>
          <h1 className="mt-1 text-xl font-semibold">消息渲染测试</h1>
        </header>

        <section aria-labelledby="typography-message-title">
          <h2 id="typography-message-title" className="mb-5 text-xs font-medium text-token-text-tertiary">
            文本排版
          </h2>
          <div className="flex flex-col gap-6" data-message-list="true">
            <UserMessage content="展示标题、正文、强调、引用、链接和多级列表的排版效果。" />
            <AssistantMessage message={typographyAssistantMessage} />
          </div>
        </section>

        <section aria-labelledby="structured-message-title" className="mt-12 border-t border-token-border pt-8">
          <h2 id="structured-message-title" className="mb-5 text-xs font-medium text-token-text-tertiary">
            结构化内容
          </h2>
          <div className="flex flex-col gap-6" data-message-list="true">
            <UserMessage content={"请给出消息渲染层的实现建议，并用代码、表格和流程图说明。\n需要同时兼容流式输出。"} />
            <AssistantMessage message={structuredAssistantMessage} />
          </div>
        </section>

        <section aria-labelledby="streaming-message-title" className="mt-12 border-t border-token-border pt-8">
          <h2 id="streaming-message-title" className="mb-5 text-xs font-medium text-token-text-tertiary">
            流式输出
          </h2>
          <StreamingMessageDemo />
        </section>

        <section aria-labelledby="incomplete-message-title" className="mt-12 border-t border-token-border pt-8">
          <h2 id="incomplete-message-title" className="mb-5 text-xs font-medium text-token-text-tertiary">
            未闭合语法
          </h2>
          <AssistantMessage message={incompleteAssistantMessage} />
        </section>

        <section aria-labelledby="empty-message-title" className="mt-12 border-t border-token-border pt-8">
          <h2 id="empty-message-title" className="mb-5 text-xs font-medium text-token-text-tertiary">
            等待首个内容块
          </h2>
          <AssistantMessage message={emptyPendingAssistantMessage} />
        </section>
      </div>
    </main>
  );
}
