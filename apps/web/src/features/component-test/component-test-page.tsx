import { useState } from "react";
import { AlertCircle, Bell, Check, ChevronsUpDown, Info, Settings2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ComponentTestPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <main className="min-h-full overflow-y-auto bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header>
          <Badge variant="secondary">Debug</Badge>
          <h1 className="mt-3 text-2xl font-semibold">Shadcn 组件测试</h1>
          <p className="mt-1 text-sm text-muted-foreground">常用组件、交互状态与主题适配。</p>
        </header>

        <Tabs defaultValue="controls">
          <TabsList>
            <TabsTrigger value="controls">表单控件</TabsTrigger>
            <TabsTrigger value="feedback">反馈与弹层</TabsTrigger>
          </TabsList>
          <TabsContent value="controls" className="mt-5 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>按钮与标记</CardTitle><CardDescription>常用命令与状态展示。</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button>主要按钮</Button><Button variant="secondary">次要按钮</Button><Button variant="outline">描边按钮</Button><Button variant="ghost">幽灵按钮</Button>
                <Separator className="my-2 w-full" />
                <Badge>默认</Badge><Badge variant="secondary">次要</Badge><Badge variant="outline">描边</Badge><Badge variant="destructive">错误</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>输入组件</CardTitle><CardDescription>输入、选择和长文本。</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="项目名称" />
                <Select defaultValue="frontend"><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger><SelectContent><SelectItem value="frontend">前端</SelectItem><SelectItem value="backend">后端</SelectItem><SelectItem value="design">设计</SelectItem></SelectContent></Select>
                <Textarea placeholder="补充说明" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>选择状态</CardTitle><CardDescription>二元选项和偏好设置。</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 text-sm"><Checkbox defaultChecked />自动保存改动</label>
                <label className="flex items-center justify-between gap-4 text-sm"><span><span className="block font-medium">通知</span><span className="text-muted-foreground">任务完成后显示提醒</span></span><Switch checked={notifications} onCheckedChange={setNotifications} /></label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>组合示例</CardTitle><CardDescription>可直接复用的设置面板。</CardDescription></CardHeader>
              <CardContent className="space-y-4"><div className="flex items-center gap-3"><Settings2 className="size-5 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">执行模式</p><p className="text-xs text-muted-foreground">控制任务运行策略</p></div><Button variant="outline" size="sm">配置<ChevronsUpDown /></Button></div></CardContent>
              <CardFooter className="justify-end"><Button size="sm"><Check />保存</Button></CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-5 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Alert</CardTitle><CardDescription>重要状态与说明信息。</CardDescription></CardHeader>
              <CardContent className="space-y-3"><Alert><Info /><AlertTitle>配置已同步</AlertTitle><AlertDescription>本地设置已应用到当前工作区。</AlertDescription></Alert><Alert variant="destructive"><AlertCircle /><AlertTitle>连接中断</AlertTitle><AlertDescription>请检查后端服务是否正常运行。</AlertDescription></Alert></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Dialog 与 Tooltip</CardTitle><CardDescription>临时操作和补充提示。</CardDescription></CardHeader>
              <CardContent className="flex items-center gap-3">
                <Dialog><DialogTrigger asChild><Button variant="outline">打开对话框</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>确认执行测试？</DialogTitle><DialogDescription>此操作只会更新当前调试页面状态。</DialogDescription></DialogHeader><DialogFooter><Button>确认</Button></DialogFooter></DialogContent></Dialog>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="通知说明"><Bell /></Button></TooltipTrigger><TooltipContent>查看通知状态</TooltipContent></Tooltip>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
