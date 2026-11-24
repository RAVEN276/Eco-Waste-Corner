"use client";

import { useEffect } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { isAdminUser } from "@/lib/admin";
import { signOut } from "@/lib/firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";
import { ensureUserProfile, subscribeUser } from "@/lib/firebase/firestore";
import { describeFirebaseError } from "@/lib/firebase/errors";
import {
  SESSION_HEARTBEAT_MS,
  SITE_EXPIRE_MS,
  clearSessionActivity,
  ensureSessionActivity,
  getExpireMessage,
  touchSessionActivity,
  type SessionExpireReason,
} from "@/lib/firebase/session";

import { useUserStore } from "@/store/useUserStore";

/**
 * Keeps the Zustand user store in sync with Firebase Auth and the user's
 * Firestore document, so points and cooldown update in real time. Also enforces
 * session expiration (10 minutes away from the site, 1 hour while on the site).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const retryToken = useUserStore((s) => s.retryToken);
  const authStatus = useUserStore((s) => s.authStatus);
  const uid = useUserStore((s) => s.profile?.uid ?? null);

  useEffect(() => {
    const store = useUserStore.getState();

    if (!isFirebaseConfigured) {
      store.setSignedOut();
      return;
    }

    let unsubscribeProfile: (() => void) | undefined;
    // onIdTokenChanged juga menyala tiap token diperbarui (~tiap jam), jadi cukup proses ulang saat uid berubah.
    let lastKey = "";
    const auth = getFirebaseAuth();

    const stopProfile = () => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
    };

    const expireSession = async (reason: SessionExpireReason) => {
      stopProfile();
      const state = useUserStore.getState();
      state.setSignedOut();
      state.setSessionNotice(getExpireMessage(reason));
      await signOut().catch(() => {});
    };

    const handleUser = async (user: User | null) => {
      const key = user ? user.uid : "none";
      if (key === lastKey) return;
      lastKey = key;

      stopProfile();
      const state = useUserStore.getState();

      if (!user) {
        clearSessionActivity();
        state.setSignedOut();
        return;
      }

      const session = ensureSessionActivity(user.uid, Date.now(), !document.hidden);
      if (session.reason) {
        await expireSession(session.reason);
        return;
      }

      state.setSignedIn(user.photoURL, isAdminUser(user));
      state.setProfileLoading();

      try {
        await ensureUserProfile({
          uid: user.uid,
          email: user.email ?? `${user.uid}@no-email.invalid`,
          displayName: user.displayName,
        });
        unsubscribeProfile = subscribeUser(
          user.uid,
          (profile) => {
            if (profile) useUserStore.getState().setProfile(profile);
          },
          (error) => useUserStore.getState().setError(describeFirebaseError(error)),
        );
      } catch (error) {
        useUserStore.getState().setError(describeFirebaseError(error));
      }
    };

    const unsubscribeAuth = onIdTokenChanged(
      auth,
      (user) => void handleUser(user),
      (error) => {
        const current = useUserStore.getState();
        current.setSignedOut();
        current.setError(describeFirebaseError(error));
      },
    );

    return () => {
      unsubscribeAuth();
      stopProfile();
    };
  }, [retryToken]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !uid || !isFirebaseConfigured) return;

    let expired = false;
    const expire = (reason: SessionExpireReason) => {
      if (expired) return;
      expired = true;
      const state = useUserStore.getState();
      state.setSignedOut();
      state.setSessionNotice(getExpireMessage(reason));
      void signOut().catch(() => {});
    };

    const checkAndTouch = (updateVisible: boolean) => {
      const result = touchSessionActivity(uid, Date.now(), updateVisible);
      if (result.reason) {
        expire(result.reason);
        return null;
      }
      return result.loginAt;
    };

    const initialLoginAt = checkAndTouch(!document.hidden);
    if (initialLoginAt === null) return;

    const remainingSiteMs = Math.max(0, initialLoginAt + SITE_EXPIRE_MS - Date.now());
    const siteTimer = window.setTimeout(() => expire("site"), remainingSiteMs);

    const heartbeat = window.setInterval(() => {
      if (!document.hidden) checkAndTouch(true);
    }, SESSION_HEARTBEAT_MS);

    const onVisibility = () => {
      // Saat tab baru ditinggalkan, simpan waktu terakhir terlihat; saat kembali terlihat, cek batas 10 menit.
      checkAndTouch(true);
    };
    const onFocusOrShow = () => {
      if (!document.hidden) checkAndTouch(true);
    };
    const onPageHide = () => {
      checkAndTouch(true);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocusOrShow);
    window.addEventListener("pageshow", onFocusOrShow);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearTimeout(siteTimer);
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocusOrShow);
      window.removeEventListener("pageshow", onFocusOrShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [authStatus, uid]);

  return <>{children}</>;
}
