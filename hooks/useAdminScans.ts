"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { fetchAdminScans, fetchScanPhoto, fetchUsersByIds, saveScanReview } from "@/lib/firebase/firestore";
import type { ReviewDecision, ScanRecord, ScanReview, UserProfile } from "@/lib/types";

export type AdminStatus = "loading" | "ready" | "error";

interface AdminScansState {
  scans: ScanRecord[];
  status: AdminStatus;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
}

/** Penolakan dari aturan Firestore paling mungkin berarti aturannya belum dideploy, bukan salah login. */
function describeAdminError(error: unknown): string {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
  if (code === "permission-denied") {
    return "Akses ke data scan ditolak. Pastikan kamu masuk dengan akun Google admin dan aturan Firestore terbaru sudah dideploy.";
  }
  return describeFirebaseError(error);
}

/** Scan semua pengguna, terbaru dulu, dimuat per halaman. Keputusan admin langsung ditempelkan ke daftar. */
export function useAdminScans() {
  const [state, setState] = useState<AdminScansState>({
    scans: [],
    status: "loading",
    error: null,
    hasMore: false,
    loadingMore: false,
  });
  const [attempt, setAttempt] = useState(0);
  const cursor = useRef<QueryDocumentSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminScans(null)
      .then((page) => {
        if (cancelled) return;
        cursor.current = page.cursor;
        setState({ scans: page.scans, status: "ready", error: null, hasMore: page.hasMore, loadingMore: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ scans: [], status: "error", error: describeAdminError(error), hasMore: false, loadingMore: false });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    setAttempt((n) => n + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return;
    setState((prev) => ({ ...prev, loadingMore: true }));
    try {
      const page = await fetchAdminScans(cursor.current);
      cursor.current = page.cursor;
      setState((prev) => {
        const known = new Set(prev.scans.map((s) => s.scanId));
        return {
          ...prev,
          scans: [...prev.scans, ...page.scans.filter((s) => !known.has(s.scanId))],
          hasMore: page.hasMore,
          loadingMore: false,
        };
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loadingMore: false, error: describeAdminError(error) }));
    }
  }, [state.loadingMore, state.hasMore]);

  /** Menyimpan keputusan lalu memperbarui scan di daftar. Galatnya dilempar ke pemanggil untuk ditampilkan di formulir. */
  const review = useCallback(async (scanId: string, decision: ReviewDecision, note: string): Promise<ScanReview> => {
    try {
      const saved = await saveScanReview(scanId, decision, note);
      setState((prev) => ({
        ...prev,
        scans: prev.scans.map((s) => (s.scanId === scanId ? { ...s, review: saved } : s)),
      }));
      return saved;
    } catch (error) {
      throw new Error(describeAdminError(error));
    }
  }, []);

  return { ...state, reload, loadMore, review };
}

/** Profil pengguna untuk scan yang tampil, diambil sekali per pengguna. */
export function useAdminUsers(scans: ScanRecord[]) {
  const [users, setUsers] = useState<Map<string, UserProfile>>(() => new Map());
  const asked = useRef(new Set<string>());

  useEffect(() => {
    const missing = [...new Set(scans.map((s) => s.userId))].filter((id) => id !== "" && !asked.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => asked.current.add(id));
    fetchUsersByIds(missing)
      .then((found) => setUsers((prev) => new Map([...prev, ...found])))
      .catch(() => missing.forEach((id) => asked.current.delete(id)));
  }, [scans]);

  return users;
}

const PHOTO_CACHE_LIMIT = 20;

/** Memuat foto bukti satu per satu. Hasilnya disimpan sebentar supaya membuka ulang scan yang sama tidak membaca ulang. */
export function useScanPhotoLoader() {
  const cache = useRef(new Map<string, Promise<string | null>>());
  return useCallback((scanId: string) => {
    let pending = cache.current.get(scanId);
    if (!pending) {
      pending = fetchScanPhoto(scanId);
      cache.current.set(scanId, pending);
      pending.catch(() => cache.current.delete(scanId));
      if (cache.current.size > PHOTO_CACHE_LIMIT) {
        const oldest = cache.current.keys().next().value;
        if (oldest !== undefined) cache.current.delete(oldest);
      }
    }
    return pending;
  }, []);
}
