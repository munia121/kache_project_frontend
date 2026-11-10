"use client";

import React, {
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import {
  chatService,
  IConversation,
  IMessage,
  IParticipant,
} from "@/services/chat.service";
import ConversationList from "@/components/modules/chat/ConversationList";
import ChatHeader from "@/components/modules/chat/ChatHeader";
import MessageList from "@/components/modules/chat/MessageList";
import MessageInput from "@/components/modules/chat/MessageInput";
import { Button } from "@/components/ui/button";

interface SocketTypingPayload {
  conversationId?: string;
  userId?: string;
  senderId?: string;
}

interface SocketMessagePayload {
  conversationId?: string;
  id?: string;
  senderId?: string;
  text?: string;
  createdAt?: string;
  isRead?: boolean;
}

function ChatInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryConversationId = searchParams.get("id");

  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);

  // Active conversation is driven by query parameter or local selection
  const activeConversationId = queryConversationId || selectedId;

  const fetchConversationsList = useCallback(() => {
    if (!isAuthenticated) return;
    chatService
      .getMyConversations()
      .then((res) => {
        const list =
          (res as { data?: IConversation[] })?.data ||
          (Array.isArray(res) ? (res as unknown as IConversation[]) : []);
        setConversations(list);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingConversations(false);
      });
  }, [isAuthenticated]);

  // Load conversations on mount or auth change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchConversationsList();
  }, [isAuthenticated, fetchConversationsList]);

  // Load messages whenever activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    let isMounted = true;

    chatService
      .getMessages(activeConversationId)
      .then((res) => {
        if (!isMounted) return;
        const msgs =
          (res as { data?: IMessage[] })?.data ||
          (Array.isArray(res) ? (res as unknown as IMessage[]) : []);

        const seen = new Set<string>();
        const unique: IMessage[] = [];
        for (const m of msgs) {
          const mid = m.id || (m as { _id?: string })._id || "";
          const normalized: IMessage = { ...m, id: mid };
          if (mid) {
            if (!seen.has(mid)) {
              seen.add(mid);
              unique.push(normalized);
            }
          } else {
            unique.push(normalized);
          }
        }
        setMessages(unique);
        setIsLoadingMessages(false);
      })
      .catch(() => {
        if (isMounted) {
          toast.error("বার্তা লোড করা সম্ভব হয়নি");
          setIsLoadingMessages(false);
        }
      });

    chatService
      .markAsRead(activeConversationId)
      .then(() => {
        if (!isMounted) return;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Ref to track active conversation inside socket callbacks
  const activeConversationIdRef = useRef<string | null>(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Join/Leave socket rooms
  useEffect(() => {
    if (!socket || !isConnected || !activeConversationId) return;

    socket.emit("join_conversation", activeConversationId);
    socket.emit("join_conversation", { conversationId: activeConversationId });

    return () => {
      socket.emit("leave_conversation", activeConversationId);
      socket.emit("leave_conversation", { conversationId: activeConversationId });
    };
  }, [socket, isConnected, activeConversationId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incomingMsg: IMessage) => {
      if (!incomingMsg || !incomingMsg.conversationId) return;

      const currentActive = activeConversationIdRef.current;
      const incomingId =
        incomingMsg.id || (incomingMsg as { _id?: string })._id || "";
      const normalizedMsg: IMessage = {
        ...incomingMsg,
        id: incomingId,
      };

      if (normalizedMsg.conversationId === currentActive) {
        setMessages((prev) => {
          // ১. Jodi database ID diye already theke thake, skip korbe
          if (incomingId && prev.some((m) => m.id === incomingId)) {
            return prev;
          }

          // ২. Jodi optimistic temp message thake (same sender ebong same text), oita ke real message diye replace korbe
          const incomingText = (normalizedMsg.text || "").trim();
          const incomingSender = normalizedMsg.senderId;

          const tempIndex = prev.findIndex((m) => {
            const isTemp = m.id?.startsWith("temp-");
            const sameSender = m.senderId === incomingSender;
            const sameText = (m.text || "").trim() === incomingText;
            return isTemp && sameSender && sameText;
          });

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = normalizedMsg;
            return updated;
          }

          // ৩. Jodi kono duplicate text o sender eksathe thake (5 second-er moddhe ashche), reject korbe
          const isDuplicateContent = prev.some(
            (m) =>
              m.senderId === incomingSender &&
              (m.text || "").trim() === incomingText &&
              Math.abs(new Date(m.createdAt || 0).getTime() - new Date(normalizedMsg.createdAt || 0).getTime()) < 3000
          );

          if (isDuplicateContent) {
            return prev;
          }

          return [...prev, normalizedMsg];
        });

        if (normalizedMsg.senderId !== user?.id && currentActive) {
          chatService.markAsRead(currentActive).catch(() => {});
        }
      }

      // Sidebar update (unchanged)
      setConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.id === normalizedMsg.conversationId
        );
        if (index === -1) {
          fetchConversationsList();
          return prev;
        }

        const existing = prev[index];
        const isCurrentlyActive = existing.id === currentActive;
        const isFromMe = normalizedMsg.senderId === user?.id;

        const updatedConv: IConversation = {
          ...existing,
          lastMessage: normalizedMsg,
          updatedAt: normalizedMsg.createdAt || new Date().toISOString(),
          unreadCount:
            isCurrentlyActive || isFromMe
              ? 0
              : (existing.unreadCount || 0) + 1,
        };

        const remaining = prev.filter(
          (c) => c.id !== normalizedMsg.conversationId
        );
        return [updatedConv, ...remaining];
      });
    };

    const handleTyping = (data: SocketTypingPayload | string) => {
      const convId =
        typeof data === "string" ? data : data?.conversationId;
      const senderId =
        typeof data === "string" ? null : data?.userId || data?.senderId;

      if (
        convId === activeConversationIdRef.current &&
        (!senderId || senderId !== user?.id)
      ) {
        setIsCounterpartTyping(true);
      }
    };

    const handleStopTyping = (data: SocketTypingPayload | string) => {
      const convId =
        typeof data === "string" ? data : data?.conversationId;

      if (convId === activeConversationIdRef.current) {
        setIsCounterpartTyping(false);
      }
    };

    // Clean up any existing listeners before attaching to prevent duplicates
    socket.off("receive_message");
    socket.off("new_message");
    socket.off("typing");
    socket.off("stop_typing");

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, user?.id, fetchConversationsList]);

  // Handle typing emissions
  const handleTypingStart = () => {
    if (!socket || !isConnected || !activeConversationId) return;
    socket.emit("typing", {
      conversationId: activeConversationId,
      userId: user?.id,
    });
  };

  const handleTypingStop = () => {
    if (!socket || !isConnected || !activeConversationId) return;
    socket.emit("stop_typing", {
      conversationId: activeConversationId,
      userId: user?.id,
    });
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;

    const trimmedText = text.trim();
    if (!trimmedText) return;

    // Create unique temporary ID for optimistic UI update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const optimisticMsg: IMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: user?.id || "",
      text: trimmedText,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // 1. Optimistically append message to feed
    setMessages((prev) => [...prev, optimisticMsg]);

    // 2. Optimistically update sidebar conversation preview
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === activeConversationId);
      if (index === -1) return prev;
      const current = prev[index];
      const updated: IConversation = {
        ...current,
        lastMessage: optimisticMsg,
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
      };
      const rest = prev.filter((c) => c.id !== activeConversationId);
      return [updated, ...rest];
    });

    try {
      const res = await chatService.sendMessage(activeConversationId, trimmedText);
      const rawSent =
        (res as { data?: IMessage })?.data || (res as unknown as IMessage);

      const realId =
        rawSent?.id || (rawSent as { _id?: string })?._id || tempId;
      const sentMsg: IMessage = {
        ...rawSent,
        id: realId,
      };

      // 3. Emit socket event
      if (socket && isConnected) {
        const payload: SocketMessagePayload = {
          conversationId: activeConversationId,
          text: trimmedText,
          id: realId,
          senderId: user?.id,
          createdAt: sentMsg.createdAt,
        };
        socket.emit("send_message", payload);
      }

      // 4. Replace the optimistic message with the confirmed server message
      setMessages((prev) => {
        // If the server message with this real ID already arrived via socket receive_message:
        const alreadyHasReal = prev.some(
          (m) =>
            (m.id && m.id === realId && m.id !== tempId) ||
            ((m as { _id?: string })._id &&
              (m as { _id?: string })._id === realId)
        );

        return prev
          .map((m) => {
            if (m.id === tempId) {
              return alreadyHasReal ? null : sentMsg;
            }
            return m;
          })
          .filter(Boolean) as IMessage[];
      });

      // 5. Update sidebar with confirmed message
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === activeConversationId);
        if (index === -1) return prev;
        const current = prev[index];
        const updated: IConversation = {
          ...current,
          lastMessage: sentMsg,
          updatedAt: sentMsg.createdAt || new Date().toISOString(),
          unreadCount: 0,
        };
        const rest = prev.filter((c) => c.id !== activeConversationId);
        return [updated, ...rest];
      });
    } catch (error: unknown) {
      // Revert optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message || err?.message || "বার্তা পাঠানো সম্ভব হয়নি"
      );
      throw error;
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setIsLoadingMessages(true);
    setIsCounterpartTyping(false);
    router.push(`/chat?id=${id}`);
  };

  const handleBackToSidebar = () => {
    setSelectedId(null);
    setMessages([]);
    router.push("/chat");
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const getCounterpart = (conv?: IConversation): IParticipant | undefined => {
    if (!conv) return undefined;
    if (conv.counterpart) return conv.counterpart;
    if (conv.participants && conv.participants.length > 0) {
      const other = conv.participants.find((p) => p.id !== user?.id);
      if (other) return other;
    }
    return {
      id:
        conv.sellerId === user?.id
          ? conv.buyerId || "unknown"
          : conv.sellerId,
      fullName: "বিক্রেতা",
    };
  };

  const counterpart = getCounterpart(activeConversation);

  // Unauthenticated view
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-[#FF6F0F]">
          <LogIn className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          চ্যাট করার জন্য লগইন করুন
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          আপনার কথোপকথন এবং মেসেজ দেখতে কাছে অ্যাকাউন্টে প্রবেশ করুন।
        </p>
        <Button
          onClick={() => openAuthModal("login")}
          className="rounded-2xl bg-[#FF6F0F] hover:bg-[#E5630D] text-white px-6 font-bold cursor-pointer shadow-xs"
        >
          লগইন করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-6 h-[calc(100vh-5rem)]">
      <div className="grid grid-cols-12 h-full bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Left Sidebar (Conversation List) */}
        <div
          className={`h-full col-span-12 md:col-span-5 lg:col-span-4 min-h-0 ${
            activeConversationId ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?.id}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* Right Active Chat Window */}
        <div
          className={`h-full col-span-12 md:col-span-7 lg:col-span-8 flex flex-col min-h-0 ${
            !activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversationId ? (
            <>
              <ChatHeader
                counterpart={counterpart}
                product={activeConversation?.product}
                isTyping={isCounterpartTyping}
                onBack={handleBackToSidebar}
              />
              <MessageList
                messages={messages}
                currentUserId={user?.id}
                isLoading={isLoadingMessages}
                counterpartName={counterpart?.fullName}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-[#FF6F0F]">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                একটি কথোপকথন নির্বাচন করুন
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                বাঁ দিকের তালিকা থেকে কোনো চ্যাট নির্বাচন করে বার্তা আদান-প্রদান
                শুরু করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
