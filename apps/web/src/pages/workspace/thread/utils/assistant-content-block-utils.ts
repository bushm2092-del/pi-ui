import { BookOpen, Pencil, SquareTerminal, Wrench } from "lucide-react";
import type { AssistantToolBlock } from "../../domain";

type ToolKind = "read" | "command" | "edit" | "other";

function getToolKind(name: string): ToolKind {
  const normalizedName = name.toLowerCase();
  if (/^(read|grep|find|ls)$/.test(normalizedName)) return "read";
  if (/^(bash|shell|terminal|终端命令)$/.test(normalizedName)) return "command";
  if (/^(edit|write|apply_patch)$/.test(normalizedName)) return "edit";
  return "other";
}

export function describeToolActivity(block: AssistantToolBlock): { icon: typeof Wrench; label: string } {
  const kind = getToolKind(block.name);
  const icon = { read: BookOpen, command: SquareTerminal, edit: Pencil, other: Wrench }[kind];
  const labels = {
    read: { failed: "读取文件失败", active: "正在读取文件", done: "已读取文件" },
    command: { failed: "运行命令失败", active: "正在运行命令", done: "运行了命令" },
    edit: { failed: "编辑文件失败", active: "正在编辑文件", done: "编辑了文件" },
  } as const;
  const labelSet = labels[kind as keyof typeof labels];
  if (labelSet) return { icon, label: block.status === "failed" ? labelSet.failed : block.status === "running" || block.status === "preparing" ? labelSet.active : labelSet.done };
  return { icon, label: block.status === "failed" ? `${block.name} 失败` : block.status === "running" || block.status === "preparing" ? `正在使用 ${block.name}` : `使用了 ${block.name}` };
}

export function formatToolDetails(block: AssistantToolBlock): string {
  const sections: string[] = [];
  const args = block.arguments !== undefined ? formatUnknown(block.arguments) : block.argumentText;
  if (args) sections.push(`参数\n${args}`);
  if (block.output) sections.push(`输出\n${block.output}`);
  if (block.details !== undefined && !block.a2ui) sections.push(`详情\n${formatUnknown(block.details)}`);
  return sections.join("\n\n");
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}
