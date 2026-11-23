import { create } from "zustand";
import type { UserProfile } from "@/lib/types";

export type AuthStatus = "initializing" | "unauthenticated" | "authenticated" | "error";
export type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface UserState {
  authStatus: AuthStatus;
  profileStatus: ProfileStatus;
  profile: UserProfile | null;
  /** Mirrors `profile.poin` so components can subscribe to just the balance. */
  poin: number;
  /** Mirrors `profile.poinJSDP`. */
  poinJSDP: number;
  /** Mirrors `profile.cooldownUntil`, epoch millis. */
  cooldownUntil: number | null;
  photoURL: string | null;
  /** Akun ini admin: masuk lewat Google dan emailnya terverifikasi. Hanya untuk tampilan, aturan Firestore yang melindungi data. */
  isAdmin: boolean;
  error: string | null;
  /** Bumped to make the auth provider re-subscribe after a profile error. */
  retryToken: number;

  retryProfile: () => void;
  setAuthInitializing: () => void;
  setSignedOut: () => void;
  setSignedIn: (photoURL: string | null, isAdmin: boolean) => void;
  setProfileLoading: () => void;
  setProfile: (profile: UserProfile) => void;
  setError: (message: string) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  authStatus: "initializing",
  profileStatus: "idle",
  profile: null,
  poin: 0,
  poinJSDP: 0,
  cooldownUntil: null,
  photoURL: null,
  isAdmin: false,
  error: null,
  retryToken: 0,

  retryProfile: () => set((s) => ({ retryToken: s.retryToken + 1, error: null })),
  setAuthInitializing: () => set({ authStatus: "initializing" }),
  setSignedOut: () =>
    set({
      authStatus: "unauthenticated",
      profileStatus: "idle",
      profile: null,
      poin: 0,
      poinJSDP: 0,
      cooldownUntil: null,
      photoURL: null,
      isAdmin: false,
    }),
  setSignedIn: (photoURL, isAdmin) => set({ authStatus: "authenticated", photoURL, isAdmin, error: null }),
  setProfileLoading: () => set({ profileStatus: "loading" }),
  setProfile: (profile) =>
    set({
      profile,
      profileStatus: "ready",
      poin: profile.poin,
      poinJSDP: profile.poinJSDP,
      cooldownUntil: profile.cooldownUntil,
      error: null,
    }),
  setError: (message) => set({ error: message, profileStatus: "error" }),
  clearError: () => set({ error: null }),
}));
