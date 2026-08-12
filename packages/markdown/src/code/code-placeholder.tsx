import { serializeCodeFence } from "../runtime/copy-serializer";

export interface CodePlaceholderProps {
  code: string;
  language: string;
}

export function CodePlaceholder({ code, language }: CodePlaceholderProps) {
  return (
    <pre
      className="smk-markdown-code-placeholder"
      data-incomplete="true"
      data-language={language}
      data-markdown-copy="code-block"
      data-markdown-copy-text={serializeCodeFence(code, language)}
      data-markdown-node="code-placeholder"
    >
      <code>{code}</code>
    </pre>
  );
}
