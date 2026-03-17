import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface RichContentProps {
  content: string;
  className?: string;
}

const RichContent = ({ content, className = "" }: RichContentProps) => {
  return (
    <div className={`rich-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="ml-4 mb-2 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-4 mb-2 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children, className: codeClass }) => {
            const isInline = !codeClass;
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
                {children}
              </code>
            ) : (
              <code className="block rounded-lg bg-muted p-3 font-mono text-xs overflow-x-auto">
                {children}
              </code>
            );
          },
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/40 pl-3 italic text-muted-foreground my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default RichContent;
