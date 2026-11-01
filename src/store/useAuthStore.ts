import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IUser } from "@/types/user.types";

export type AuthModalView = "login" | "register" | "otp";

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  hasHydrated: boolean;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  otpEmail: string;
  devOtp?: string;

  // Actions
  setAuth: (user: IUser, token: string) => void;
  setUser: (user: IUser) => void;
  logout: () => void;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  setOtpEmail: (email: string) => void;
  setDevOtp: (devOtp?: string) => void;
  setHasHydrated: (state: boolean) => void;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: typeof window !== "undefined",
      hasHydrated: typeof window !== "undefined",
      isAuthModalOpen: false,
      authModalView: "login",
      otpEmail: "",
      devOtp: undefined,

      setAuth: (user: IUser, token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("kache_access_token", token);
          localStorage.setItem("accessToken", token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          devOtp: undefined,
        });
      },

      // setUser: (user: IUser) => {
      //   set({ user });
      // },
      setUser: (user: IUser) => {
  set({
    user,
    isAuthenticated: true,
  });
},

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("kache_access_token");
          localStorage.removeItem("accessToken");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          devOtp: undefined,
        });
      },

      openAuthModal: (view: AuthModalView = "login") => {
        set({
          isAuthModalOpen: true,
          authModalView: view,
        });
      },

      closeAuthModal: () => {
        set({
          isAuthModalOpen: false,
        });
      },

      setAuthModalView: (view: AuthModalView) => {
        set({
          authModalView: view,
        });
      },

      setOtpEmail: (email: string) => {
        set({
          otpEmail: email,
        });
      },

      setDevOtp: (devOtp?: string) => {
        set({
          devOtp,
        });
      },

      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
          hasHydrated: state,
        });
      },
    }),
    {
      name: "kache-auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : dummyStorage
      ),
      // Only persist user, token, and isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Synchronously restore state on client initial evaluation to eliminate any delay/reload
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("kache-auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.user && parsed?.state?.isAuthenticated) {
        useAuthStore.setState({
          user: parsed.state.user,
          token: parsed.state.token || null,
          isAuthenticated: true,
          _hasHydrated: true,
          hasHydrated: true,
        });
      }
    }
  } catch {
    // ignore
  }
}
