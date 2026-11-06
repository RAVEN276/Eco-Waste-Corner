"use client";

import { useEffect } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
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
    // Pengguna dan status verifikasi yang terakhir diproses. onIdTokenChanged juga menyala tiap
    // token diperbarui (sekitar tiap jam), dan itu tidak boleh memulai ulang langganan profil.
    let lastKey = "";
    const auth = getFirebaseAuth();

    const stopProfile = () => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
    };

    const handleUser = async (user: User | null) => {
      const key = user ? `${user.uid}:${user.emailVerified}` : "none";
      if (key === lastKey) return;
      lastKey = key;

      stopProfile();
      const state = useUserStore.getState();

      // Akun email dan kata sandi baru bisa dipakai setelah emailnya terverifikasi, karena
      // firestore.rules mensyaratkan email_verified. Sebelum itu aplikasi menganggapnya belum
      // masuk, dan LoginPanel yang menuntun verifikasinya. Akun Google sudah terverifikasi.
      // Tidak ada pengecekan domain di sini: email apa pun boleh.
      if (!user || !user.emailVerified) {
        state.setSignedOut();
        return;
      }

      state.setSignedIn(user.photoURL);
      state.setProfileLoading();

      try {
        // Rules membaca klaim email_verified dari token. Setelah verifikasi, token lama masih
        // berklaim false, jadi segarkan dulu sebelum menyentuh Firestore.
        const claims = await user.getIdTokenResult();
        if (!claims.claims.email_verified) await user.getIdToken(true);
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

  return <>{children}</>;
}
