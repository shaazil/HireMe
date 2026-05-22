import React, { useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Type your response...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground rounded-xl"
        title="Voice input coming soon"
      >
        <Mic className="w-5 h-5" />
      </Button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 max-h-[150px] min-h-[52px] bg-transparent resize-none py-3.5 px-2 text-[14px] leading-relaxed focus:outline-none disabled:opacity-50"
        rows={1}
      />

      <Button
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        size="icon"
        className="shrink-0 h-10 w-10 rounded-xl transition-all"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
