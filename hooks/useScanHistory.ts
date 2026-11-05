"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { subscribeScans } from "@/lib/firebase/firestore";
import type { ScanRecord } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

export type HistoryStatus = "loading" | "ready" | "error";

export function useScanHistory() {
  const uid = useUserStore((s) => s.profile?.uid ?? null);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [status, setStatus] = useState<HistoryStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    const unsubscribe = subscribeScans(
      uid,
      (next) => {
        setScans(next);
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

  return { scans, status, error, retry };
}
