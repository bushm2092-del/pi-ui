import { Streamdown } from "@/components/ui/markdown";

export function AssistantMarkdown({
  content,
  isAnimating = false,
}: {
  content: string;
  isAnimating?: boolean;
}) {
  return <Streamdown content={content} isAnimating={isAnimating} />;
}
