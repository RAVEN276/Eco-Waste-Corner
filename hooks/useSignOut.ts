"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";

/** Keluar dari akun lalu kembali ke beranda, apa pun hasil sign-out di Firebase. */
export function useSignOut() {
  const router = useRouter();
  return useCallback(async () => {
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  }, [router]);
}
