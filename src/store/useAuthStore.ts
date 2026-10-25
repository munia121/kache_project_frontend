import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IUser } from "@/types/user.types";

export type AuthModalView = "login" | "register" | "otp";

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
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
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
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

      setUser: (user: IUser) => {
        set({ user });
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

      setHasHydrated: (hasHydrated: boolean) => {
        set({
          hasHydrated,
        });
      },
    }),
    {
      name: "kache-auth-storage",
      storage: createJSONStorage(() => localStorage),
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
