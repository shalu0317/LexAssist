import {
  Bot,
  Check,
  Copy,
  EllipsisVertical,
  Menu,
  MenuIcon,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { defaultSchema } from "hast-util-sanitize";
import { Button } from "@/components/ui/button";
import PdfModalViewer from "./PdfModalViewer";
import { useState } from "react";
import { useLayout } from "@/layouts/LayoutContext";
import { FileChip } from "./FileChip";
import { X, FileText, Image, FileArchive, File, Loader2 } from "lucide-react";

export function ChatMessage({
  role,
  content,
  isTyping,
  sources,
  openSidebar,
  files,
}) {
  const isAssistant = role === "assistant";

  const isUser = role === "user";
  const { toggleSource } = useLayout();
  const { openSourceWithData } = useLayout();
  const handleShow = () => {
    openSourceWithData(sources);
  };

  const [justCopied, setJustCopied] = useState(false);
  const copy = async (text) => {
    try {
      console.log("----inside copy method---");
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CodeBlock = ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <pre className="rounded-md bg-gray-900 text-gray-100 overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    ) : (
      <code
        className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded"
        {...props}
      >
        {children}
      </code>
    );
  };

  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code || []), ["className"]],
      pre: [...(defaultSchema.attributes?.pre || []), ["className"]],
      a: [...(defaultSchema.attributes?.a || []), ["target"], ["rel"]],
      table: [...(defaultSchema.attributes?.table || []), ["className"]],
    },
  };

  return (
    <div>
      <div
        className={cn(
          "flex gap-4 p-6 rounded-xl",
          isAssistant ? "bg-card" : "bg-transparent",
        )}
      >
        <div
          className={cn(
            "w-9 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            isAssistant ? "gradient-primary" : "bg-secondary",
          )}
        >
          {isAssistant ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isUser && files && files.length > 0 && (
            <div className="flex-1 min-w-0">
              {files.map((file, index) => (
                <FileChip
                  key={`${file.name}-${index}`}
                  file={file}
                  action="view"
                />
              ))}
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <div className="prose prose-invert max-w-full whitespace-normal">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, schema],
                    rehypeKatex,
                    rehypeHighlight,
                  ]}
                  components={{
                    code: (props) => <CodeBlock {...props} />,
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto rounded-lg border">
                        <table
                          className="w-full table-fixed text-sm"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="bg-gray-200 dark:bg-gray-800 p-2 text-left font-semibold
                          break-words break-all whitespace-normal"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="px-3 py-2 align-top
                          break-words break-all whitespace-normal"
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/30 p-3 italic"
                        {...props}
                      />
                    ),
                    img: ({ node, ...props }) => (
                      <img
                        className="my-3 rounded-xl border shadow-sm"
                        loading="lazy"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="leading-7 mb-4 text-[0.9rem]" {...props} />
                    ),

                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-3xl font-bold tracking-tight mt-8 mb-4"
                        {...props}
                      />
                    ),

                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-semibold tracking-tight mt-7 mb-3"
                        {...props}
                      />
                    ),

                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-semibold tracking-tight mt-6 mb-2"
                        {...props}
                      />
                    ),

                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc space-y-2 my-4 pl-6"
                        {...props}
                      />
                    ),

                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal space-y-2 my-4 pl-6"
                        {...props}
                      />
                    ),

                    hr: () => <hr className="my-6 border-t" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </p>
        </div>
      </div>

      {isAssistant && sources && sources.length != 0 && (
        <div className="py-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                SOURCE DOCUMENTS
              </p>
              <button
                onClick={handleShow}
                className="text-xs font-medium text-primary hover:underline"
              >
                See All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {sources.map((source, index) => {
                const isObject = typeof source === "object";
                const filePath = isObject
                  ? source.path || source.filename || source
                  : source;
                const pages = isObject ? source.pages : index === 0 ? 24 : 112;
                const lastModified = isObject
                  ? source.lastModified || source.date
                  : index === 0
                    ? "JAN 22, 2024"
                    : "JAN 15, 2024";
                const description = isObject
                  ? source.description
                  : "Income Tax Appellate Tribunal Order";

                return (
                  <div key={index}>
                    <PdfModalViewer
                      filename={filePath}
                      pages={pages}
                      lastModified={lastModified}
                      description={description}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-left gap-2 pt-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => copy(content)}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
    </div>
    <span className="ml-2 text-sm opacity-70">Thinking...</span>
  </div>
);
