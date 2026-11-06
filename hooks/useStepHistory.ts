"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const MARK = "ewcStep";

interface StepHistoryOptions {
  /** Dipanggil saat pengguna kembali dari langkah lanjutan (tombol Back browser atau `back()`). */
  onBack: () => void;
  /** Dipanggil saat halaman disembunyikan atau dilepas, untuk mengembalikan alur ke awal. */
  onHide: () => void;
  /** Selama true, Back browser ditahan (misalnya saat data sedang dikirim). */
  locked: boolean;
}

/**
 * Langkah lanjutan satu halaman (kuis, foto, hasil) memakai satu entri riwayat browser, jadi Back
 * kembali ke langkah pertama dan tidak keluar dari halaman.
 */
export function useStepHistory({ onBack, onHide, locked }: StepHistoryOptions) {
  const entryRef = useRef(false);
  const leavingRef = useRef(false);
  const skippingRef = useRef(false);
  const latest = useRef({ onBack, onHide, locked });

  useEffect(() => {
    latest.current = { onBack, onHide, locked };
  });

  const enter = useCallback(() => {
    if (entryRef.current) return;
    window.history.pushState({ [MARK]: true }, "", window.location.href);
    entryRef.current = true;
  }, []);

  const back = useCallback(() => {
    if (!entryRef.current) {
      latest.current.onBack();
      return;
    }
    // Back kedua sebelum yang pertama selesai akan keluar dari halaman.
    if (leavingRef.current) return;
    leavingRef.current = true;
    window.history.back();
  }, []);

  // Sekali per kedatangan: React dev menjalankan efek dua kali saat halaman muncul lagi.
  const skipStaleEntry = useCallback(() => {
    if (skippingRef.current) return;
    skippingRef.current = true;
    window.history.back();
  }, []);

  useEffect(() => {
    const onPop = () => {
      leavingRef.current = false;
      if (window.history.state?.[MARK]) {
        // Forward ke entri langkah saat tidak ada alur berjalan: lewati.
        if (!entryRef.current) skipStaleEntry();
        return;
      }
      skippingRef.current = false;
      if (!entryRef.current) return;
      if (latest.current.locked) {
        window.history.pushState({ [MARK]: true }, "", window.location.href);
        return;
      }
      entryRef.current = false;
      latest.current.onBack();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [skipStaleEntry]);

  // Activity menyimpan halaman tersembunyi, jadi alur dikembalikan ke awal saat disembunyikan.
  useLayoutEffect(() => {
    // Back dari halaman lain ke entri lama terjadi saat halaman ini tersembunyi, jadi popstate-nya terlewat.
    if (window.history.state?.[MARK]) skipStaleEntry();
    return () => {
      entryRef.current = false;
      leavingRef.current = false;
      latest.current.onHide();
    };
  }, [skipStaleEntry]);

  return { enter, back };
}
