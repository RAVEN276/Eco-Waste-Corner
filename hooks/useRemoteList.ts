"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { DEFAULT_LOCATIONS, fetchLocations, type CollectionResult } from "@/lib/firebase/firestore";
import { describeFirebaseError } from "@/lib/firebase/errors";
import type { CampusLocation, DataSource } from "@/lib/types";

export type ListStatus = "loading" | "ready" | "error";

const FETCH_TIMEOUT_MS = 10_000;

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

interface ListState<T> {
  items: T[];
  status: ListStatus;
  source: DataSource;
  error: string | null;
  reload: () => void;
}

function useRemoteList<T>(
  fetcher: () => Promise<CollectionResult<T>>,
  fallback: T[],
): ListState<T> {
  const [state, setState] = useState<Omit<ListState<T>, "reload">>({
    items: fallback,
    status: "loading",
    source: "default",
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!isFirebaseConfigured) {
      queueMicrotask(() => {
        if (!cancelled)
          setState({ items: fallback, status: "ready", source: "default", error: null });
      });
      return () => {
        cancelled = true;
      };
    }

    withTimeout(fetcher())
      .then((result) => {
        if (!cancelled)
          setState({ items: result.items, status: "ready", source: result.source, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            items: fallback,
            status: "error",
            source: "default",
            error: describeFirebaseError(error),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, fallback, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}

export function useLocations(): ListState<CampusLocation> {
  return useRemoteList(fetchLocations, DEFAULT_LOCATIONS);
}
