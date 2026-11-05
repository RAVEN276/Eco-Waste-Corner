"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { BINS } from "@/lib/data/bins";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { fetchScanPhoto } from "@/lib/firebase/firestore";
import type { ScanRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type PhotoState =
  | { status: "loading" }
  | { status: "ready"; dataUrl: string }
  | { status: "missing" }
  | { status: "error"; message: string };

function PhotoContent({ scan }: { scan: ScanRecord }) {
  const [state, setState] = useState<PhotoState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchScanPhoto(scan.scanId)
      .then((dataUrl) => {
        if (cancelled) return;
        setState(dataUrl ? { status: "ready", dataUrl } : { status: "missing" });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: describeFirebaseError(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [scan.scanId, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      {state.status === "loading" ? (
        <LoadingState label="Memuat foto" className="py-14" />
      ) : state.status === "error" ? (
        <ErrorState title="Foto gagal dimuat" message={state.message} onRetry={retry} className="py-8" />
      ) : state.status === "missing" ? (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-plate border-2 border-dashed border-edge bg-paper px-4 text-center text-sm text-muted">
          Foto untuk scan ini tidak ditemukan.
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- data URL from Firestore, nothing to optimise
        <img
          src={state.dataUrl}
          alt={`Foto bukti scan ${BINS[scan.categoryBin]?.label ?? scan.categoryBin}, ${formatDateTime(scan.timestamp)}`}
          className="max-h-[60dvh] w-full rounded-plate bg-paper object-contain"
        />
      )}
      <p className="text-sm text-muted">
        {BINS[scan.categoryBin]?.label ?? scan.categoryBin}, {scan.locationName || scan.location},{" "}
        {formatDateTime(scan.timestamp)}
      </p>
    </div>
  );
}

export function PhotoDialog({ scan, onClose }: { scan: ScanRecord | null; onClose: () => void }) {
  return (
    <Dialog open={scan !== null} onClose={onClose} title="Foto bukti">
      {scan ? <PhotoContent key={scan.scanId} scan={scan} /> : null}
    </Dialog>
  );
}
