"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Check, CheckCheck, MessageSquare } from "lucide-react";
import { IMessage } from "@/services/chat.service";

interface MessageListProps {
  messages: IMessage[];
  currentUserId?: string;
  isLoading?: boolean;
  counterpartName?: string;
}

const formatMessageTime = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  counterpartName = "বিক্রেতা",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const prevConvIdRef = useRef<string | undefined>(undefined);
  const prevMessagesCountRef = useRef(0);

  // Ensure message array is strictly unique by ID
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((msg, index) => {
      const id =
        msg.id ||
        (msg as { _id?: string })._id ||
        `fallback-${msg.senderId}-${msg.createdAt}-${index}`;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }, [messages]);

  // Track whether user is near the bottom (< 80px from bottom)
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;
  };

  // Only auto-scroll to the bottom if the user is already near the bottom (scrollHeight - scrollTop - clientHeight < 80),
  // or on initial load / conversation change / when sending a new message.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentConvId = uniqueMessages[0]?.conversationId;
    const isDifferentConv = prevConvIdRef.current !== currentConvId;

    if (isInitialLoadRef.current || isDifferentConv) {
      isInitialLoadRef.current = false;
      prevConvIdRef.current = currentConvId;
      prevMessagesCountRef.current = uniqueMessages.length;
      container.scrollTop = container.scrollHeight;
      isNearBottomRef.current = true;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 80 || isNearBottomRef.current;

    const lastMessage = uniqueMessages[uniqueMessages.length - 1];
    const isMyMessage =
      Boolean(lastMessage?.senderId && lastMessage.senderId === currentUserId) &&
      uniqueMessages.length > prevMessagesCountRef.current;

    prevMessagesCountRef.current = uniqueMessages.length;

    if (isNearBottom || isMyMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isNearBottomRef.current = true;
    }
  }, [uniqueMessages, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto bg-slate-50/50">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`h-12 w-48 rounded-2xl animate-pulse ${
                i % 2 === 0 ? "bg-orange-200/60" : "bg-slate-200"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (uniqueMessages.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
          <MessageSquare className="h-8 w-8 text-[#FF6F0F]" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm mb-1">
          {counterpartName}-এর সাথে চ্যাট শুরু করুন
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          পণ্য সম্পর্কে জানতে, দাম নিয়ে কথা বলতে বা সাক্ষাতের স্থান ঠিক করতে মেসেজ
          পাঠান।
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-slate-50/40"
    >
      {uniqueMessages.map((msg, index) => {
        const isMe = msg.senderId === currentUserId;
        const time = formatMessageTime(msg.createdAt);
        const uniqueKey =
          msg.id ||
          (msg as { _id?: string })._id ||
          `msg-${index}-${msg.createdAt || index}`;

        return (
          <div
            key={uniqueKey}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-2.5 max-w-[85%] sm:max-w-[70%] break-words text-sm shadow-xs ${
                isMe
                  ? "bg-[#FF6F0F] text-white rounded-2xl rounded-tr-xs"
                  : "bg-white text-slate-800 rounded-2xl rounded-tl-xs border border-slate-200/80"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

              {/* Timestamp & Read Status */}
              <div
                className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                  isMe ? "text-orange-100" : "text-slate-400"
                }`}
              >
                <span>{time}</span>
                {isMe && (
                  <span>
                    {msg.isRead ? (
                      <CheckCheck className="h-3 w-3 text-orange-200" />
                    ) : (
                      <Check className="h-3 w-3 text-orange-200/80" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
