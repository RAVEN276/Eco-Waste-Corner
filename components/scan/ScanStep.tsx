"use client";

import { useState } from "react";
import { BinArt } from "@/components/art/BinArt";
import { QrScanner } from "@/components/scan/QrScanner";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { BINS } from "@/lib/data/bins";
import { parseQrText, type ScanTarget } from "@/lib/qr";
import { BASE_POINTS } from "@/lib/scoring";
import type { CampusLocation } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ListStatus } from "@/hooks/useRemoteList";
import { usePageVisible } from "@/hooks/usePageVisible";

interface ScanStepProps {
  locations: CampusLocation[];
  locationsStatus: ListStatus;
  /** Lokasi dan tong yang terbaca dari QR, atau null jika belum ada. */
  target: ScanTarget | null;
  onTarget: (target: ScanTarget | null) => void;
  /** Dipakai saat halaman dibuka dari tautan QR yang rusak atau tidak lengkap. */
  initialNotice: string | null;
  onStart: () => void;
  blocked: boolean;
}

const NOT_OURS = "QR itu bukan kode tong Eco Waste Corner. Pindai QR yang tertempel di tong.";
const NATIVE_CAMERA_HINT =
  "Bisa juga lewat aplikasi kamera bawaan ponsel. Pindai QR di tong, dan tautannya membuka halaman ini dengan lokasi dan tong yang sudah terisi.";

export function ScanStep({ locations, locationsStatus, target, onTarget, initialNotice, onStart, blocked }: ScanStepProps) {
  const [scannerKey, setScannerKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(initialNotice);
  const pageVisible = usePageVisible();

  const location = target ? (locations.find((item) => item.locationId === target.locationId) ?? null) : null;
  const bin = target ? BINS[target.category] : null;

  const rescan = () => {
    setNotice(null);
    onTarget(null);
  };

  const handleDetect = (text: string) => {
    const found = parseQrText(text);
    if (!found) {
      setNotice(NOT_OURS);
      return;
    }
    setNotice(null);
    onTarget(found);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-extrabold">1. Pindai QR di tong</h2>
        <p className="mt-1 text-sm text-muted">
          Setiap tong punya kode QR sendiri. Lokasi dan jenis tong terbaca dari kode itu, jadi tidak ada yang perlu dipilih.
        </p>
      </div>

      {notice ? <InlineNotice tone="warning">{notice}</InlineNotice> : null}

      {target && !location && locationsStatus === "loading" ? <LoadingState label="Memuat lokasi" className="py-8" /> : null}

      {target && !location && locationsStatus !== "loading" ? (
        <ErrorState
          title="Lokasi di QR tidak dikenal"
          message="Kode ini menyebut lokasi yang tidak ada di daftar. Pindai QR lain di tong, atau laporkan ke pengelola."
          onRetry={rescan}
          className="py-6"
        />
      ) : null}

      {target && location && bin ? (
        <>
          <div className={cn("rounded-plate border-2 border-line p-5", bin.tone.soft)}>
            <div className="flex items-center gap-4">
              <BinArt id={bin.id} className="w-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <CheckIcon className="size-4 shrink-0" />
                  QR terbaca
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold leading-none">{bin.label}</p>
                <p className="mt-1.5 text-sm">{location.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-display text-6xl font-extrabold leading-none">{BASE_POINTS[bin.id]}</span>
                <span className="text-xs font-bold">poin dasar</span>
              </div>
            </div>
          </div>

          {blocked ? (
            <InlineNotice tone="warning">Scan baru bisa dimulai setelah jeda selesai. Hitung mundur ada di atas.</InlineNotice>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="w-full sm:w-auto" disabled={blocked} onClick={onStart}>
              Mulai kuis
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={rescan}>
              Pindai ulang
            </Button>
          </div>
        </>
      ) : null}

      {/* Kamera menyala selama langkah ini terbuka dan tab terlihat, lalu mati sendiri saat QR terbaca atau pengguna pergi. */}
      {!target && pageVisible ? (
        <div className="space-y-4">
          {/* -mx-5 menyamai padding plat di ScanFlow, supaya kamera menempel ke tepi plat di ponsel. */}
          <div className="-mx-5 sm:mx-0">
            <QrScanner key={scannerKey} onDetect={handleDetect} onRetry={() => setScannerKey((n) => n + 1)} />
          </div>
          <p className="text-sm text-muted">{NATIVE_CAMERA_HINT}</p>
        </div>
      ) : null}
    </div>
  );
}
