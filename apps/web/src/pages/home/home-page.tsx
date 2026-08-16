import { useEffect, useState } from "react";
import { FileInput, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppInfo } from "@pi/shared";
import { useAdapter } from "../../adapter/context";
import { useAppStore } from "../../stores/app-store";

export function HomePage() {
  const adapter = useAdapter();
  const { recentFiles, addRecentFile } = useAppStore();
  const [appInfo, setAppInfo] = useState<AppInfo>();
  const [content, setContent] = useState("欢迎使用 Pi。这里的业务界面可以同时运行在 Web 和 Electron 中。");
  const [message, setMessage] = useState("");

  useEffect(() => { void adapter.getAppInfo().then(setAppInfo); }, [adapter]);

  async function openFile() {
    try {
      const file = await adapter.openFile();
      if (file) { setContent(file.content); addRecentFile(file.path); setMessage(`已打开 ${file.path}`); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "打开失败"); }
  }

  async function saveFile() {
    try {
      const path = await adapter.saveFile(content, "pi-note.txt");
      if (path) { addRecentFile(path); setMessage(`已保存至 ${path}`); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败"); }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">工作台</h1><p className="mt-1 text-sm text-muted-foreground">当前运行于 {appInfo?.platform ?? "..."} · v{appInfo?.version ?? "..."}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openFile}><FileInput className="size-4" />打开</Button>
          <Button onClick={saveFile}><Save className="size-4" />保存</Button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader><CardTitle>跨端编辑器示例</CardTitle><CardDescription>文件操作通过平台适配器调用，组件不感知 Electron。</CardDescription></CardHeader>
          <CardContent>
            <textarea className="min-h-72 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" value={content} onChange={(event) => setContent(event.target.value)} />
            <p className="mt-2 min-h-5 text-xs text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>最近文件</CardTitle><CardDescription>由 Zustand 持久化保存。</CardDescription></CardHeader>
          <CardContent>
            {recentFiles.length ? <ul className="space-y-2">{recentFiles.map((file) => <li className="truncate text-sm" title={file} key={file}>{file}</li>)}</ul> : <p className="text-sm text-muted-foreground">暂无记录</p>}
            <Button className="mt-5 w-full" variant="secondary" onClick={() => adapter.openExternal("https://react.dev")}><ExternalLink className="size-4" />React 文档</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
