import { useEffect, useState } from "react";
import { AlertCircle, Bell, Bold, Check, ChevronsUpDown, Code2, Copy, FilePlus2, GripVertical, Info, Italic, Link, LoaderCircle, Mail, MoreHorizontal, Search, Settings2, Trash2, Underline, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ComponentTestPage() {
  const [notifications, setNotifications] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

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
            <TabsTrigger value="groups">组合组件</TabsTrigger>
            <TabsTrigger value="shortcuts">快捷键</TabsTrigger>
            <TabsTrigger value="messages">消息与拖拽</TabsTrigger>
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

          <TabsContent value="shortcuts" className="mt-5 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Kbd</CardTitle><CardDescription>在按钮、菜单和帮助文本中显示快捷键。</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm"><span>打开命令面板</span><KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></div>
                <div className="flex items-center justify-between gap-4 text-sm"><span>保存当前文件</span><KbdGroup><Kbd>⌘</Kbd><Kbd>S</Kbd></KbdGroup></div>
                <div className="flex items-center justify-between gap-4 text-sm"><span>关闭面板</span><Kbd>Esc</Kbd></div>
                <Button variant="outline" onClick={() => setCommandOpen(true)}><Search />打开命令面板<KbdGroup className="ml-2"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Command</CardTitle><CardDescription>支持搜索、方向键选择和 Enter 执行。</CardDescription></CardHeader>
              <CardContent>
                <Command className="h-72 rounded-lg border">
                  <CommandInput placeholder="搜索命令..." />
                  <CommandList><CommandEmpty>没有匹配的命令。</CommandEmpty><CommandGroup heading="工作区"><CommandItem><FilePlus2 />新建对话<CommandShortcut>⌘N</CommandShortcut></CommandItem><CommandItem><Search />搜索项目<CommandShortcut>⌘P</CommandShortcut></CommandItem></CommandGroup><CommandSeparator /><CommandGroup heading="设置"><CommandItem><Settings2 />打开设置<CommandShortcut>⌘,</CommandShortcut></CommandItem></CommandGroup></CommandList>
                </Command>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Context Menu</CardTitle><CardDescription>在区域内点击右键打开操作菜单。</CardDescription></CardHeader>
              <CardContent>
                <ContextMenu><ContextMenuTrigger className="flex min-h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">右键点击此区域</ContextMenuTrigger><ContextMenuContent className="w-48"><ContextMenuItem><Copy />复制<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem><ContextMenuItem><FilePlus2 />新建副本<ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem><ContextMenuSeparator /><ContextMenuItem variant="destructive"><Trash2 />删除<ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem></ContextMenuContent></ContextMenu>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-5 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Button Group</CardTitle><CardDescription>关联命令保持紧凑且边界连续。</CardDescription></CardHeader>
              <CardContent className="flex flex-col items-start gap-4">
                <ButtonGroup><Button variant="outline">预览</Button><Button variant="outline">发布</Button><Button variant="outline" size="icon" aria-label="更多发布选项"><MoreHorizontal /></Button></ButtonGroup>
                <ButtonGroup><ButtonGroupText><Code2 />main</ButtonGroupText><ButtonGroupSeparator /><Button variant="outline">运行测试</Button></ButtonGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Toggle Group</CardTitle><CardDescription>单选或多选工具状态。</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <ToggleGroup type="multiple" variant="outline" spacing={0} defaultValue={["bold"]} aria-label="文本格式">
                  <ToggleGroupItem value="bold" aria-label="粗体"><Bold /></ToggleGroupItem><ToggleGroupItem value="italic" aria-label="斜体"><Italic /></ToggleGroupItem><ToggleGroupItem value="underline" aria-label="下划线"><Underline /></ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup type="single" variant="outline" defaultValue="code" aria-label="内容类型"><ToggleGroupItem value="text">文本</ToggleGroupItem><ToggleGroupItem value="code">代码</ToggleGroupItem><ToggleGroupItem value="link">链接</ToggleGroupItem></ToggleGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Input Group</CardTitle><CardDescription>输入框与图标、单位、动作组合。</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <InputGroup><InputGroupAddon><Mail /></InputGroupAddon><InputGroupInput placeholder="name@example.com" /><InputGroupAddon align="inline-end"><InputGroupText>必填</InputGroupText></InputGroupAddon></InputGroup>
                <InputGroup><InputGroupTextarea placeholder="粘贴链接或输入说明" /><InputGroupAddon align="block-end"><InputGroupText><Link />支持 Markdown</InputGroupText><InputGroupButton className="ml-auto">提交</InputGroupButton></InputGroupAddon></InputGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Field Group</CardTitle><CardDescription>统一标签、描述和校验信息。</CardDescription></CardHeader>
              <CardContent>
                <FieldSet><FieldLegend>账户信息</FieldLegend><FieldGroup><Field><FieldLabel htmlFor="group-name">显示名称</FieldLabel><Input id="group-name" placeholder="输入名称" /><FieldDescription>在协作空间中展示给其他成员。</FieldDescription></Field><Field data-invalid="true"><FieldLabel htmlFor="group-email">邮箱</FieldLabel><Input id="group-email" defaultValue="invalid-email" aria-invalid="true" /><FieldError>请输入有效的邮箱地址。</FieldError></Field></FieldGroup></FieldSet>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Item Group</CardTitle><CardDescription>适用于设置、资源和操作列表。</CardDescription></CardHeader>
              <CardContent>
                <ItemGroup>
                  <Item variant="outline"><ItemMedia variant="icon"><UserRound /></ItemMedia><ItemContent><ItemTitle>个人资料</ItemTitle><ItemDescription>管理头像、名称和公开信息。</ItemDescription></ItemContent><ItemActions><Button variant="outline" size="sm">编辑</Button></ItemActions></Item>
                  <ItemSeparator />
                  <Item variant="muted"><ItemMedia variant="icon"><Bell /></ItemMedia><ItemContent><ItemTitle>任务通知</ItemTitle><ItemDescription>在任务完成或需要确认时发送提醒。</ItemDescription></ItemContent><ItemActions><Switch defaultChecked /></ItemActions></Item>
                </ItemGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-5 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Sonner 消息</CardTitle><CardDescription>成功、错误、加载和带操作的消息通知。</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.success("任务已完成", { description: "所有文件已成功生成。" })}>成功消息</Button>
                <Button variant="outline" onClick={() => toast.error("连接失败", { description: "无法连接到本地服务。" })}>错误消息</Button>
                <Button variant="outline" onClick={() => toast.promise(new Promise((resolve) => window.setTimeout(resolve, 1200)), { loading: "正在同步...", success: "同步完成", error: "同步失败" })}><LoaderCircle />加载消息</Button>
                <Button variant="outline" onClick={() => toast("草稿已保存", { action: { label: "撤销", onClick: () => toast.info("已撤销") } })}>带操作消息</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>消息状态</CardTitle><CardDescription>通知组件全局挂载并跟随亮暗主题。</CardDescription></CardHeader>
              <CardContent className="space-y-3 text-sm"><div className="flex items-center justify-between rounded-lg border p-3"><span>任务完成通知</span><Badge>Success</Badge></div><div className="flex items-center justify-between rounded-lg border p-3"><span>后台同步进度</span><Badge variant="secondary">Loading</Badge></div><div className="flex items-center justify-between rounded-lg border p-3"><span>服务连接异常</span><Badge variant="destructive">Error</Badge></div></CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>水平实时拖拽</CardTitle><CardDescription>拖动中间手柄调整编辑区与预览区宽度。</CardDescription></CardHeader>
              <CardContent>
                <ResizablePanelGroup orientation="horizontal" className="h-64 overflow-hidden rounded-lg border">
                  <ResizablePanel defaultSize={55} minSize={25}><div className="flex h-full flex-col bg-muted/20 p-4"><span className="text-sm font-medium">编辑器</span><pre className="mt-3 flex-1 overflow-auto rounded-md bg-muted p-3 text-xs">{`const message = "Hello"\nconsole.log(message)`}</pre></div></ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={45} minSize={25}><div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">实时预览</div></ResizablePanel>
                </ResizablePanelGroup>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>垂直实时拖拽</CardTitle><CardDescription>拖动手柄调整内容区与控制台高度。</CardDescription></CardHeader>
              <CardContent>
                <ResizablePanelGroup orientation="vertical" className="h-64 overflow-hidden rounded-lg border">
                  <ResizablePanel defaultSize={65} minSize={30}><div className="flex h-full items-center justify-center text-sm">主内容区域</div></ResizablePanel>
                  <ResizableHandle withHandle><GripVertical /></ResizableHandle>
                  <ResizablePanel defaultSize={35} minSize={20}><div className="h-full bg-muted/30 p-3 font-mono text-xs text-muted-foreground">$ pnpm test<br />35 tests passed</div></ResizablePanel>
                </ResizablePanelGroup>
              </CardContent>
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
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="命令面板" description="搜索并执行调试命令">
        <Command><CommandInput placeholder="输入命令或搜索..." /><CommandList><CommandEmpty>没有匹配的命令。</CommandEmpty><CommandGroup heading="建议"><CommandItem onSelect={() => setCommandOpen(false)}><FilePlus2 />新建对话<CommandShortcut>⌘N</CommandShortcut></CommandItem><CommandItem onSelect={() => setCommandOpen(false)}><Search />搜索项目<CommandShortcut>⌘P</CommandShortcut></CommandItem><CommandItem onSelect={() => setCommandOpen(false)}><Settings2 />打开设置<CommandShortcut>⌘,</CommandShortcut></CommandItem></CommandGroup></CommandList></Command>
      </CommandDialog>
    </main>
  );
}
