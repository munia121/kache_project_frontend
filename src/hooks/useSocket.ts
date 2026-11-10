"use client";

import { useEffect, useSyncExternalStore } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

let globalSocket: Socket | null = null;
let activeToken: string | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSocketSnapshot(): Socket | null {
  return globalSocket;
}

function getConnectedSnapshot(): boolean {
  return Boolean(globalSocket && globalSocket.connected);
}

function getServerSnapshot(): boolean {
  return false;
}

function getServerSocketSnapshot(): Socket | null {
  return null;
}

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();

  const socket = useSyncExternalStore(
    subscribe,
    getSocketSnapshot,
    getServerSocketSnapshot
  );

  const isConnected = useSyncExternalStore(
    subscribe,
    getConnectedSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawToken =
      token ||
      localStorage.getItem("kache_access_token") ||
      localStorage.getItem("accessToken") ||
      "";
    const cleanToken = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7)
      : rawToken;

    // Disconnect socket if user is not authenticated or has no token
    if (!isAuthenticated || !cleanToken) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        activeToken = null;
        notifyListeners();
      }
      return;
    }

    // Re-create socket if token changed
    if (globalSocket && activeToken !== cleanToken) {
      globalSocket.disconnect();
      globalSocket = null;
      activeToken = null;
      notifyListeners();
    }

    // Connect using singleton pattern
    if (!globalSocket) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:5000";

      const cleanSocketUrl = socketUrl.replace(/\/api\/?$/, "");

      const s = io(cleanSocketUrl, {
        auth: { token: cleanToken },
        transports: ["websocket"],
      });

      globalSocket = s;
      activeToken = cleanToken;

      s.on("connect", notifyListeners);
      s.on("disconnect", notifyListeners);
      notifyListeners();
    }
  }, [token, isAuthenticated]);

  return {
    socket,
    isConnected,
  };
};

export default useSocket;
