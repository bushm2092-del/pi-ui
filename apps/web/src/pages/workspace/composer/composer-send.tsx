import { ComposerSendLayout } from "./layouts";

interface ComposerSendProps {
  disabled?: boolean;
  mode: "send" | "stop";
  onAction: () => void | Promise<void>;
}

export function ComposerSend({ disabled, mode, onAction }: ComposerSendProps) {
  return <ComposerSendLayout disabled={disabled} mode={mode} onClick={onAction} />;
}
