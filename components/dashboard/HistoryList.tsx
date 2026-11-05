"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, History, Image as ImageIcon, MinusCircle } from "lucide-react";
import { PhotoDialog } from "@/components/dashboard/PhotoDialog";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useScanHistory } from "@/hooks/useScanHistory";
import { BINS } from "@/lib/data/bins";
import { PENALTY_LABEL } from "@/lib/scoring";
import type { ScanRecord, ScanStatus } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const MAX_ROWS = 50;

const STATUS_VIEW: Record<
  ScanStatus,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  verified: { label: "Terverifikasi", icon: BadgeCheck, className: "bg-mint text-forest" },
  unverified: {
    label: "Tanpa foto bukti",
    icon: MinusCircle,
    className: "bg-sun-soft text-charcoal",
  },
  penalized: { label: "Penalti", icon: AlertTriangle, className: "bg-[#fbe4e1] text-[#7a1810]" },
};

function StatusBadge({ scan }: { scan: ScanRecord }) {
  const view = STATUS_VIEW[scan.status] ?? STATUS_VIEW.unverified;
  const Icon = view.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold",
        view.className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
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
      <ImageIcon aria-hidden="true" className="size-4" />
      Lihat foto
    </Button>
  );
}

function Points({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-display text-lg font-extrabold tabular-nums",
        value < 0 ? "text-brick" : "text-forest",
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
      <h2 id="judul-riwayat" className="text-2xl font-bold text-forest">
        Riwayat pembuangan sampah
      </h2>

      <div className="mt-4">
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
            icon={<History aria-hidden="true" className="size-8" />}
            title="Belum ada aktivitas"
            description="Scan slot tong pertamamu untuk mulai mengumpulkan poin JSDP."
            action={
              <Link href="/scan" className={buttonClasses("primary")}>
                Mulai scan
              </Link>
            }
          />
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((scan) => (
                <li key={scan.scanId} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
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
                    <p className="mt-2 text-sm text-[#7a1810]">
                      {PENALTY_LABEL[scan.penaltyReason]}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <PhotoButton scan={scan} onOpen={setPhotoScan} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Riwayat scan, terbaru di atas</caption>
                <thead>
                  <tr className="border-b border-line bg-mint-soft text-forest">
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Tanggal
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Kategori bin
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Lokasi
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                      Poin
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status verifikasi
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Foto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((scan) => (
                    <tr key={scan.scanId} className="border-b border-line last:border-0">
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDateTime(scan.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {BINS[scan.categoryBin]?.label ?? scan.categoryBin}
                      </td>
                      <td className="px-4 py-3">{scan.locationName || scan.location}</td>
                      <td className="px-4 py-3 text-right">
                        <Points value={scan.pointsEarned} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge scan={scan} />
                        {scan.penaltyReason ? (
                          <p className="mt-1 max-w-xs text-xs text-[#7a1810]">
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
