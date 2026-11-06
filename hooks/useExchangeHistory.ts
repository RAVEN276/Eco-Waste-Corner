"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { subscribeExchanges } from "@/lib/firebase/firestore";
import type { ExchangeRecord } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

export type ExchangeHistoryStatus = "loading" | "ready" | "error";

export function useExchangeHistory() {
  const uid = useUserStore((s) => s.profile?.uid ?? null);
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);
  const [status, setStatus] = useState<ExchangeHistoryStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    const unsubscribe = subscribeExchanges(
      uid,
      (next) => {
        setExchanges(next);
        setStatus("ready");
        setError(null);
      },
      (err) => {
        setStatus("error");
        setError(describeFirebaseError(err));
      },
    );
    return unsubscribe;
  }, [uid, attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { exchanges, status, error, retry };
}
