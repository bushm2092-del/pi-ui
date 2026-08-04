import { ComposerSendLayout } from "./layouts";

interface ComposerSendProps {
  disabled?: boolean;
  onSend: () => void | Promise<void>;
}

export function ComposerSend({ disabled, onSend }: ComposerSendProps) {
  return <ComposerSendLayout rootProps={{ disabled, onClick: onSend }} />;
}
