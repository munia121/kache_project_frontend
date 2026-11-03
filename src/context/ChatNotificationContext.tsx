"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { chatService, IConversation } from "@/services/chat.service";

export interface ChatNotificationContextType {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  clearUnread: () => void;
}

interface MessageNotificationData {
  conversationId?: string;
  senderName?: string;
  sender?: {
    fullName?: string;
    name?: string;
  };
  text?: string;
  message?:
    | string
    | {
        text?: string;
        content?: string;
      };
}

export const ChatNotificationContext = createContext<
  ChatNotificationContextType | undefined
>(undefined);

/**
 * Socket listener decoupled in a Suspense-wrapped component
 * to comply with Next.js Partial Prerendering (PPR) when reading usePathname()
 */
function NotificationListener() {
  const { setUnreadCount } = useChatNotification();
  const { socket } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: MessageNotificationData) => {
      const currentPath =
        pathnameRef.current ||
        (typeof window !== "undefined" ? window.location.pathname : "");

      const conversationId = data?.conversationId;
      let snippet = "নতুন বার্তা এসেছে";

      if (typeof data?.text === "string" && data.text.trim()) {
        snippet = data.text;
      } else if (typeof data?.message === "string" && data.message.trim()) {
        snippet = data.message;
      } else if (
        typeof data?.message === "object" &&
        data.message &&
        "text" in data.message &&
        typeof data.message.text === "string"
      ) {
        snippet = data.message.text;
      }

      const sender =
        data?.senderName ||
        data?.sender?.fullName ||
        data?.sender?.name ||
        "ব্যবহারকারী";

      // If user is NOT currently on the /chat route, increment badge and show toast
      if (!currentPath?.startsWith("/chat")) {
        setUnreadCount((prev) => prev + 1);

        const displaySnippet =
          snippet.length > 50 ? `${snippet.slice(0, 50)}...` : snippet;

        toast(`${sender} থেকে নতুন মেসেজ`, {
          description: displaySnippet,
          action: {
            label: "দেখুন",
            onClick: () => {
              if (conversationId) {
                router.push(`/chat?id=${conversationId}`);
              } else {
                router.push("/chat");
              }
            },
          },
        });
      }
    };

    socket.on("new_message_notification", handleNotification);

    return () => {
      socket.off("new_message_notification", handleNotification);
    };
  }, [socket, router, setUnreadCount]);

  return null;
}

export const ChatNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isAuthenticated } = useAuthStore();

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Fetch initial unread count on mount or auth change
  useEffect(() => {
    if (!isAuthenticated) {
      Promise.resolve().then(() => {
        setUnreadCount(0);
      });
      return;
    }

    let isMounted = true;

    chatService
      .getMyConversations()
      .then((res) => {
        if (!isMounted) return;
        const list =
          (res as { data?: IConversation[] })?.data ||
          (Array.isArray(res) ? (res as IConversation[]) : []);

        const totalUnread = list.reduce(
          (acc, conv) => acc + (conv.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <ChatNotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        clearUnread,
      }}
    >
      <Suspense fallback={null}>
        <NotificationListener />
      </Suspense>
      {children}
    </ChatNotificationContext.Provider>
  );
};

export const useChatNotification = (): ChatNotificationContextType => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error(
      "useChatNotification must be used within a ChatNotificationProvider"
    );
  }
  return context;
};

export default ChatNotificationProvider;
