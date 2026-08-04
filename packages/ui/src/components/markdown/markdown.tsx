import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownCodeBlock } from "./code-block";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className} dir="auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="_markdownText_1q3nk_112 _paragraph_1q3nk_103">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="_markdownText_1q3nk_112 _list_1q3nk_159 _unorderedList_1q3nk_173">
              {children}
            </ul>
          ),
          ol: ({ children }) => <ol className="list-decimal ps-6">{children}</ol>,
          li: ({ children }) => (
            <li className="_markdownText_1q3nk_112 _listItem_1q3nk_194">{children}</li>
          ),
          a: ({ children, href }) => (
            <a
              className="text-token-text-link-foreground underline underline-offset-2"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const language = /language-([^ ]+)/.exec(className ?? "")?.[1];
            const code = String(children).replace(/\n$/, "");
            return language ? (
              <MarkdownCodeBlock code={code} language={language} />
            ) : (
              <code
                className="inline-markdown _inlineMarkdown_1q3nk_449 _inlineMarkdownIsolate_1q3nk_466"
                dir="ltr"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-left">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-token-border p-2">{children}</th>,
          td: ({ children }) => <td className="border border-token-border p-2">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
