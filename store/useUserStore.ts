import { create } from "zustand";
import type { UserProfile } from "@/lib/types";

export type AuthStatus = "initializing" | "unauthenticated" | "authenticated" | "error";
export type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface UserState {
  authStatus: AuthStatus;
  profileStatus: ProfileStatus;
  profile: UserProfile | null;
  /** Mirrors `profile.poinJSDP` so components can subscribe to just the balance. */
  poinJSDP: number;
  /** Mirrors `profile.cooldownUntil`, epoch millis. */
  cooldownUntil: number | null;
  photoURL: string | null;
  error: string | null;
  /** Bumped to make the auth provider re-subscribe after a profile error. */
  retryToken: number;

  retryProfile: () => void;
  setAuthInitializing: () => void;
  setSignedOut: () => void;
  setSignedIn: (photoURL: string | null) => void;
  setProfileLoading: () => void;
  setProfile: (profile: UserProfile) => void;
  setError: (message: string) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  authStatus: "initializing",
  profileStatus: "idle",
  profile: null,
  poinJSDP: 0,
  cooldownUntil: null,
  photoURL: null,
  error: null,
  retryToken: 0,

  retryProfile: () => set((s) => ({ retryToken: s.retryToken + 1, error: null })),
  setAuthInitializing: () => set({ authStatus: "initializing" }),
  setSignedOut: () =>
    set({
      authStatus: "unauthenticated",
      profileStatus: "idle",
      profile: null,
      poinJSDP: 0,
      cooldownUntil: null,
      photoURL: null,
    }),
  setSignedIn: (photoURL) => set({ authStatus: "authenticated", photoURL, error: null }),
  setProfileLoading: () => set({ profileStatus: "loading" }),
  setProfile: (profile) =>
    set({
      profile,
      profileStatus: "ready",
      poinJSDP: profile.poinJSDP,
      cooldownUntil: profile.cooldownUntil,
      error: null,
    }),
  setError: (message) => set({ error: message, profileStatus: "error" }),
  clearError: () => set({ error: null }),
}));
