import { ArrowUp, Square } from "lucide-react";

export function ComposerSendLayout({
  disabled,
  mode,
  onClick,
}: {
  disabled?: boolean;
  mode: "send" | "stop";
  onClick: () => void | Promise<void>;
}) {
  const label = mode === "stop" ? "停止生成" : "发送";
  return (
    <button
      type="button"
      className="cursor-interaction size-token-button-composer flex items-center justify-center rounded-full bg-token-foreground p-0.5 text-token-dropdown-background transition-opacity focus-visible:outline-2 focus-visible:outline-token-button-background disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {mode === "stop" ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-5" />}
    </button>
  );
}
