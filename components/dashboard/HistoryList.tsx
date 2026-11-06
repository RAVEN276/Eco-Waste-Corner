"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";
import { PhotoDialog } from "@/components/dashboard/PhotoDialog";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CheckIcon } from "@/components/ui/Icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useScanHistory } from "@/hooks/useScanHistory";
import { BINS } from "@/lib/data/bins";
import { PENALTY_LABEL } from "@/lib/scoring";
import type { ScanRecord, ScanStatus } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const MAX_ROWS = 50;

// Baris muncul bergantian dalam kelompok empat (jeda 0 sampai 135 ms) dan diulang tiap baris
// masuk layar lagi (lihat ScrollMotion). Jeda tidak terus bertambah, supaya baris yang jauh
// di bawah tidak menunggu lama saat akhirnya digulir ke sana.
function rowDelay(index: number): CSSProperties {
  return { ["--delay" as string]: `${(index % 4) * 45}ms` };
}

const STATUS_VIEW: Record<ScanStatus, { label: string; className: string }> = {
  verified: { label: "Terverifikasi", className: "bg-organik-soft text-ink" },
  unverified: { label: "Tanpa foto bukti", className: "bg-kertas-soft text-ink" },
  penalized: { label: "Penalti", className: "bg-brick-soft text-brick-ink" },
};

function StatusBadge({ scan }: { scan: ScanRecord }) {
  const view = STATUS_VIEW[scan.status] ?? STATUS_VIEW.unverified;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-ctl px-2 py-1 text-xs font-bold",
        view.className,
      )}
    >
      {scan.status === "verified" ? <CheckIcon className="size-3.5" /> : null}
      {scan.status === "penalized" ? <AlertIcon className="size-3.5" /> : null}
      {view.label}
    </span>
  );
}

function PhotoButton({ scan, onOpen }: { scan: ScanRecord; onOpen: (scan: ScanRecord) => void }) {
  if (!scan.photoUrl) {
    return <span className="text-xs text-muted">Tanpa foto</span>;
  }
  return (
    <Button
      variant="outline"
      onClick={() => onOpen(scan)}
      aria-label={`Lihat foto bukti scan ${formatDateTime(scan.timestamp)}`}
      aria-haspopup="dialog"
    >
      Lihat foto
    </Button>
  );
}

function Points({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-display text-4xl font-extrabold leading-none tabular-nums",
        value < 0 ? "text-brick-text" : "text-ink",
      )}
    >
      {value > 0 ? `+${value}` : value}
    </span>
  );
}

export function HistoryList() {
  const { scans, status, error, retry } = useScanHistory();
  const rows = scans.slice(0, MAX_ROWS);
  const [photoScan, setPhotoScan] = useState<ScanRecord | null>(null);

  // Activity keeps hidden pages mounted, so close the dialog when the page is hidden.
  useLayoutEffect(() => {
    return () => setPhotoScan(null);
  }, []);

  return (
    <section aria-labelledby="judul-riwayat">
      <h2 id="judul-riwayat" className="reveal text-5xl">
        Riwayat pembuangan sampah
      </h2>

      <div className="mt-5">
        {status === "loading" ? (
          <LoadingState label="Memuat riwayat" />
        ) : status === "error" ? (
          <ErrorState
            title="Riwayat gagal dimuat"
            message={error ?? "Terjadi kesalahan."}
            onRetry={retry}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada aktivitas"
            description="Scan QR tong pertamamu untuk mulai mengumpulkan poin."
          />
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((scan, index) => (
                <li
                  key={scan.scanId}
                  className="fade-up rounded-plate border-2 border-rule bg-surface p-4"
                  style={rowDelay(index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {BINS[scan.categoryBin]?.label ?? scan.categoryBin}
                      </p>
                      <p className="text-sm text-muted">{scan.locationName || scan.location}</p>
                    </div>
                    <Points value={scan.pointsEarned} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge scan={scan} />
                    <time className="text-xs text-muted">{formatDateTime(scan.timestamp)}</time>
                  </div>
                  {scan.penaltyReason ? (
                    <p className="mt-2 text-sm text-brick-ink">{PENALTY_LABEL[scan.penaltyReason]}</p>
                  ) : null}
                  <div className="mt-3">
                    <PhotoButton scan={scan} onOpen={setPhotoScan} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-plate border-2 border-line bg-surface md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Riwayat scan, terbaru di atas</caption>
                <thead>
                  <tr className="bg-night text-white">
                    <th scope="col" className="px-4 py-3 font-bold">
                      Tanggal
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Kategori bin
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Lokasi
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Poin
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Status verifikasi
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Foto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((scan, index) => (
                    <tr
                      key={scan.scanId}
                      className="fade-up border-b border-rule last:border-0"
                      style={rowDelay(index)}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDateTime(scan.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {BINS[scan.categoryBin]?.label ?? scan.categoryBin}
                      </td>
                      <td className="px-4 py-3">{scan.locationName || scan.location}</td>
                      <td className="px-4 py-3 text-right">
                        <Points value={scan.pointsEarned} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge scan={scan} />
                        {scan.penaltyReason ? (
                          <p className="mt-1 max-w-xs text-xs text-brick-ink">
                            {PENALTY_LABEL[scan.penaltyReason]}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <PhotoButton scan={scan} onOpen={setPhotoScan} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scans.length > MAX_ROWS ? (
              <p className="mt-3 text-sm text-muted">Menampilkan {MAX_ROWS} aktivitas terbaru.</p>
            ) : null}
          </>
        )}
      </div>

      <PhotoDialog scan={photoScan} onClose={() => setPhotoScan(null)} />
    </section>
  );
}
