"use client";

import { useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";
import { ensureUserProfile, subscribeUser } from "@/lib/firebase/firestore";
import { describeFirebaseError } from "@/lib/firebase/errors";

import { useUserStore } from "@/store/useUserStore";

/**
 * Keeps the Zustand user store in sync with Firebase Auth and the user's
 * Firestore document, so points and cooldown update in real time.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const retryToken = useUserStore((s) => s.retryToken);

  useEffect(() => {
    const store = useUserStore.getState();

    if (!isFirebaseConfigured) {
      store.setSignedOut();
      return;
    }

    let unsubscribeProfile: (() => void) | undefined;
    const auth = getFirebaseAuth();

    const stopProfile = () => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
    };

    const handleUser = async (user: User | null) => {
      stopProfile();
      const state = useUserStore.getState();

      if (!user) {
        state.setSignedOut();
        return;
      }

      // No domain check here: the email-link flow enforces @student.upj.ac.id itself,
      // and Google accounts of any domain are allowed.
      state.setSignedIn(user.photoURL);
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

    const unsubscribeAuth = onAuthStateChanged(
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

  return <>{children}</>;
}
