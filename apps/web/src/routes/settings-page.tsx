import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  return <div className="mx-auto max-w-5xl p-6"><h1 className="mb-6 text-2xl font-semibold">设置</h1><Card><CardHeader><CardTitle>应用设置</CardTitle><CardDescription>这里可以继续接入主题、语言和更新通道。</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">基础架构已就绪。</p></CardContent></Card></div>;
}
