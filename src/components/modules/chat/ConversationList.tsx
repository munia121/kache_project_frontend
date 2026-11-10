"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search } from "lucide-react";
import { IConversation, IParticipant } from "@/services/chat.service";

interface ConversationListProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId?: string;
  isLoading?: boolean;
}

const toBengaliNumber = (num: number | string): string => {
  return num
    .toString()
    .replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)] || d);
};

const formatChatTime = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "গতকাল";
    }

    return date.toLocaleDateString("bn-BD", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const getCounterpart = (
  conversation: IConversation,
  currentUserId?: string
): IParticipant => {
  if (conversation.counterpart) return conversation.counterpart;
  if (conversation.participants && conversation.participants.length > 0) {
    const other = conversation.participants.find((p) => p.id !== currentUserId);
    if (other) return other;
  }
  return {
    id:
      conversation.sellerId === currentUserId
        ? conversation.buyerId || "unknown"
        : conversation.sellerId,
    fullName: "ব্যবহারকারী",
  };
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const counterpart = getCounterpart(conv, currentUserId);
    const nameMatch = counterpart.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const productMatch = conv.product?.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || productMatch;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#FF6F0F]" />
            <h1 className="text-lg font-bold text-slate-800">মেসেজ (Messages)</h1>
          </div>
          {conversations.length > 0 && (
            <span className="text-xs bg-orange-100 text-[#FF6F0F] font-semibold px-2 py-0.5 rounded-full">
              {toBengaliNumber(conversations.length)}
            </span>
          )}
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="চ্যাট বা পণ্য খুঁজুন..."
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#FF6F0F]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded-sm w-1/2" />
                  <div className="h-2.5 bg-slate-100 rounded-sm w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-500">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <MessageSquare className="h-7 w-7 text-orange-300" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">
              {searchTerm ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো চ্যাট নেই"}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {searchTerm
                ? "ভিন্ন শব্দ দিয়ে আবার চেষ্টা করুন"
                : "পণ্যের পেজ থেকে বিক্রেতার সাথে চ্যাট শুরু করুন"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const counterpart = getCounterpart(conv, currentUserId);
            const isActive = conv.id === activeConversationId;
            const productImg =
              conv.product?.imageUrl || conv.product?.images?.[0];
            const unreadCount = conv.unreadCount || 0;
            const timeText = formatChatTime(
              conv.lastMessage?.createdAt || conv.updatedAt
            );

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative cursor-pointer ${
                  isActive
                    ? "border-l-4 border-l-[#FF6F0F] bg-orange-50/70"
                    : "border-l-4 border-l-transparent hover:bg-slate-50"
                }`}
              >
                {/* User Avatar with Online Indicator */}
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11 border border-slate-200">
                    <AvatarImage
                      src={counterpart.avatar || undefined}
                      alt={counterpart.fullName}
                    />
                    <AvatarFallback className="bg-orange-100 text-[#FF6F0F] font-bold text-sm">
                      {counterpart.fullName?.slice(0, 2).toUpperCase() || "ইউ"}
                    </AvatarFallback>
                  </Avatar>
                  {counterpart.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Chat Middle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h2
                      className={`text-sm truncate font-medium ${
                        unreadCount > 0
                          ? "font-bold text-slate-900"
                          : "text-slate-800"
                      }`}
                    >
                      {counterpart.fullName || "ব্যবহারকারী"}
                    </h2>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {timeText}
                    </span>
                  </div>

                  {/* Last Message Snippet */}
                  <p
                    className={`text-xs truncate ${
                      unreadCount > 0
                        ? "font-semibold text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {conv.lastMessage?.text || "কথোপকথন শুরু করুন..."}
                  </p>

                  {/* Product Snippet info */}
                  {conv.product && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="truncate max-w-[130px]">
                        {conv.product.title}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-[#FF6F0F]">
                        ৳{toBengaliNumber(conv.product.price || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Thumbnail & Unread Dot */}
                <div className="flex flex-col items-end justify-between shrink-0 h-11">
                  {productImg && (
                    <div className="relative h-7 w-7 rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                      <Image
                        src={productImg}
                        alt={conv.product?.title || "Product"}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                  )}

                  {unreadCount > 0 && (
                    <span className="bg-[#FF6F0F] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? "৯+" : toBengaliNumber(unreadCount)}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
