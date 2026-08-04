import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib";
import { MarkdownCodeBlock } from "./code-block";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("pi-markdown-content", className)} dir="auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="pi-markdown-heading pi-markdown-heading-1">{children}</h1>,
          h2: ({ children }) => <h2 className="pi-markdown-heading pi-markdown-heading-2">{children}</h2>,
          h3: ({ children }) => <h3 className="pi-markdown-heading pi-markdown-heading-3">{children}</h3>,
          h4: ({ children }) => <h4 className="pi-markdown-heading pi-markdown-heading-4">{children}</h4>,
          h5: ({ children }) => <h5 className="pi-markdown-heading pi-markdown-heading-5">{children}</h5>,
          h6: ({ children }) => <h6 className="pi-markdown-heading pi-markdown-heading-6">{children}</h6>,
          p: ({ children }) => (
            <p className="pi-markdown-text pi-markdown-paragraph">{children}</p>
          ),
          ul: ({ children, className }) => (
            <ul
              className={cn(
                "pi-markdown-text pi-markdown-list pi-markdown-list-unordered",
                className?.includes("contains-task-list") && "pi-markdown-task-list",
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="pi-markdown-text pi-markdown-list pi-markdown-list-ordered">{children}</ol>
          ),
          li: ({ children, className }) => (
            <li
              className={cn(
                "pi-markdown-text pi-markdown-list-item",
                className?.includes("task-list-item") && "pi-markdown-task-list-item",
              )}
            >
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              className="text-foreground-link underline underline-offset-2"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="pi-markdown-blockquote">{children}</blockquote>
          ),
          hr: () => <hr className="pi-markdown-horizontal-rule" />,
          code: ({ children, className }) => {
            const language = /language-([^ ]+)/.exec(className ?? "")?.[1];
            const code = String(children).replace(/\n$/, "");
            return language ? (
              <MarkdownCodeBlock code={code} language={language} />
            ) : (
              <code
                className="pi-markdown-inline pi-markdown-inline-isolate"
                dir="ltr"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="pi-markdown-table-container">
              <div className="pi-markdown-table-scroller">
                <div className="pi-markdown-table-wrapper">
                  <table className="pi-markdown-table">{children}</table>
                </div>
              </div>
            </div>
          ),
          tbody: ({ children }) => <tbody className="pi-markdown-table-body">{children}</tbody>,
          tr: ({ children }) => <tr className="pi-markdown-table-row">{children}</tr>,
          th: ({ children }) => <th className="pi-markdown-table-header-cell">{children}</th>,
          td: ({ children }) => <td className="pi-markdown-table-cell">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
