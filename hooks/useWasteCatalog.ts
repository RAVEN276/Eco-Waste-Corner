"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_WASTE_CATALOG } from "@/lib/data/catalog";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import {
  clearWasteCatalogCache,
  fetchWasteCatalog,
  subscribeWasteCatalogUpdates,
} from "@/lib/firebase/firestore";
import type { DataSource, WasteCatalogItem } from "@/lib/types";

export type CatalogStatus = "loading" | "ready" | "error";

const FETCH_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject({ code: "timeout" }), FETCH_TIMEOUT_MS);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Mengambil kamus sampah dan soal cek cepat dari Firestore, jatuh mulus ke 30 barang bawaan bila
 * belum diatur atau sedang luring. Terhubung ke invalidasi admin supaya perubahan langsung tersinkron.
 */
export function useWasteCatalog() {
  const [items, setItems] = useState<WasteCatalogItem[]>(DEFAULT_WASTE_CATALOG);
  const [hiddenBuiltIns, setHiddenBuiltIns] = useState<WasteCatalogItem[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [source, setSource] = useState<DataSource>("default");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeWasteCatalogUpdates(() => {
      setAttempt((n) => n + 1);
    });

    if (!isFirebaseConfigured) {
      queueMicrotask(() => {
        if (!cancelled) {
          setItems(DEFAULT_WASTE_CATALOG);
          setHiddenBuiltIns([]);
          setSource("default");
          setStatus("ready");
          setError(null);
        }
      });
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    withTimeout(fetchWasteCatalog())
      .then((result) => {
        if (cancelled) return;
        setItems(result.active);
        setHiddenBuiltIns(result.hiddenBuiltIns);
        setSource(result.source);
        setStatus("ready");
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItems(DEFAULT_WASTE_CATALOG);
        setHiddenBuiltIns([]);
        setSource("default");
        setStatus("error");
        setError(describeFirebaseError(err));
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    clearWasteCatalogCache();
  }, []);

  /** Memaksa baca ulang terbaru dari Firestore untuk ronde acak berikutnya; jatuh ke daftar saat ini jika luring. */
  const fetchLatest = useCallback(async (): Promise<WasteCatalogItem[]> => {
    if (!isFirebaseConfigured) return items;
    try {
      const result = await withTimeout(fetchWasteCatalog(true));
      setItems(result.active);
      setHiddenBuiltIns(result.hiddenBuiltIns);
      setSource(result.source);
      setStatus("ready");
      setError(null);
      return result.active;
    } catch {
      return items;
    }
  }, [items]);

  return { items, hiddenBuiltIns, status, source, error, reload, fetchLatest };
}
