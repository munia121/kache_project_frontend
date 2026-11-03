import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/user.types";

export interface IParticipant {
  id: string;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface IProductSummary {
  id: string;
  title: string;
  price: number;
  slug?: string;
  imageUrl?: string;
  images?: string[];
  status?: string;
  sellerId?: string;
  currency?: string;
  condition?: string;
  location?: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  text: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  sender?: IParticipant;
}

export interface IConversation {
  id: string;
  productId: string;
  sellerId: string;
  buyerId?: string;
  product?: IProductSummary;
  participants?: IParticipant[];
  counterpart?: IParticipant;
  lastMessage?: IMessage | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalizes URL path to avoid duplicate '/api' prefix when apiClient baseURL already has '/api'.
 */
const resolveEndpoint = (path: string): string => {
  const base = apiClient.defaults.baseURL || "";
  if (base.replace(/\/+$/, "").endsWith("/api") && path.startsWith("/api/")) {
    return path.replace(/^\/api/, "");
  }
  return path;
};

export const chatService = {
  /**
   * Initiate or retrieve an existing conversation with a seller for a product.
   * POST /api/chats/conversations
   */
  async initiateConversation(
    productId: string,
    sellerId: string
  ): Promise<ApiResponse<IConversation>> {
    const response = await apiClient.post<ApiResponse<IConversation>>(
      resolveEndpoint("/api/chats/conversations"),
      {
        productId,
        sellerId,
      }
    );
    return response.data;
  },

  /**
   * Fetch all conversations for the authenticated user.
   * GET /api/chats/conversations
   */
  async getMyConversations(): Promise<ApiResponse<IConversation[]>> {
    const response = await apiClient.get<ApiResponse<IConversation[]>>(
      resolveEndpoint("/api/chats/conversations")
    );
    return response.data;
  },

  /**
   * Fetch paginated message history for a conversation.
   * GET /api/chats/conversations/${conversationId}/messages
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<IMessage[]>> {
    const response = await apiClient.get<ApiResponse<IMessage[]>>(
      resolveEndpoint(`/api/chats/conversations/${conversationId}/messages`),
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Mark all unread messages in a conversation as read.
   * PATCH /api/chats/conversations/${conversationId}/read
   */
  async markAsRead(
    conversationId: string
  ): Promise<ApiResponse<{ count: number } | unknown>> {
    const response = await apiClient.patch<ApiResponse<{ count: number } | unknown>>(
      resolveEndpoint(`/api/chats/conversations/${conversationId}/read`)
    );
    return response.data;
  },

  /**
   * Send a new text message inside a conversation.
   * POST /api/chats/conversations/${conversationId}/messages
   */
  async sendMessage(
    conversationId: string,
    text: string
  ): Promise<ApiResponse<IMessage>> {
    const response = await apiClient.post<ApiResponse<IMessage>>(
      resolveEndpoint(`/api/chats/conversations/${conversationId}/messages`),
      {
        text,
      }
    );
    return response.data;
  },
};

export default chatService;
