import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "ai" | "user" | "system";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "system") {
    return (
      <div className="flex justify-center my-6">
        <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  const isAI = role === "ai";

  return (
    <div
      className={cn(
        "flex w-full mb-8",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex gap-4 max-w-[85%]",
          isAI ? "flex-row" : "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
            isAI
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted text-muted-foreground border border-border"
          )}
        >
          {isAI ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "px-5 py-4 rounded-2xl text-[14px] leading-relaxed shadow-sm",
            isAI
              ? "bg-card border border-border rounded-tl-none text-foreground"
              : "bg-primary text-primary-foreground rounded-tr-none"
          )}
        >
          {isAI ? (
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
