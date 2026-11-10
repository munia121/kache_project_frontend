"use client";

import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void> | void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = "একটি বার্তা লিখুন...",
}) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (val.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart?.();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop?.();
      }, 1500);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop?.();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isSending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    try {
      setIsSending(true);
      setText("");
      await onSendMessage(trimmed);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-200 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="flex-1 h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-[#FF6F0F] px-4"
        />
        <Button
          type="submit"
          disabled={!text.trim() || disabled || isSending}
          className="h-11 w-11 p-0 rounded-2xl bg-[#FF6F0F] hover:bg-[#E5630D] text-white shrink-0 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center shadow-xs"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
