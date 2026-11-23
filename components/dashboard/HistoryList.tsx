"use client";

import { useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { ReviewBadge, USER_REVIEW_LABELS } from "@/components/admin/ReviewBadge";
import { reviewState, type ReviewFilter } from "@/components/admin/adminLabels";
import { PhotoDialog } from "@/components/dashboard/PhotoDialog";
import { ReviewNote } from "@/components/dashboard/ReviewNote";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CheckIcon } from "@/components/ui/Icons";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
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

const FILTER_OPTIONS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "approved", label: "Disetujui" },
  { id: "rejected", label: "Ditolak" },
];

const STAGE1_VIEW: Record<ScanStatus, { label: string; className: string }> = {
  verified: { label: "Cek otomatis: Lolos", className: "bg-cobalt-soft text-ink" },
  unverified: { label: "Cek otomatis: Tanpa foto", className: "bg-kertas-soft text-ink" },
  penalized: { label: "Cek otomatis: Penalti", className: "bg-brick-soft text-brick-ink" },
};

function Stage1Badge({ scan }: { scan: ScanRecord }) {
  const view = STAGE1_VIEW[scan.status] ?? STAGE1_VIEW.unverified;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-ctl border-2 border-transparent px-2 py-0.5 text-xs font-bold",
        view.className,
      )}
    >
      {scan.status === "verified" ? <CheckIcon className="size-3.5 shrink-0" /> : null}
      {scan.status === "penalized" ? <AlertIcon className="size-3.5 shrink-0" /> : null}
      {view.label}
    </span>
  );
}

function VerificationDetails({ scan }: { scan: ScanRecord }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Stage1Badge scan={scan} />
        <ReviewBadge state={reviewState(scan)} labels={USER_REVIEW_LABELS} />
      </div>
      {scan.penaltyReason ? (
        <p className="mt-1.5 text-xs text-brick-ink">{PENALTY_LABEL[scan.penaltyReason]}</p>
      ) : null}
      <ReviewNote review={scan.review} showTimestamp className="mt-2 text-xs" />
    </div>
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

function ScanPoints({ scan }: { scan: ScanRecord }) {
  const value = scan.pointsEarned;
  if (value > 0) {
    const decision = reviewState(scan);
    if (decision === "rejected") {
      return (
        <div className="inline-flex flex-col items-end">
          <span className="inline-flex items-baseline gap-1.5 font-display font-extrabold leading-none tabular-nums">
            <span className="text-2xl text-muted line-through">+{value}</span>
            <span className="text-4xl text-brick-text">0</span>
          </span>
          <span className="mt-1 text-xs font-bold text-brick-text">Ditolak</span>
        </div>
      );
    }
    return (
      <div className="inline-flex flex-col items-end">
        <span
          className={cn(
            "font-display text-4xl font-extrabold leading-none tabular-nums",
            decision === "approved" ? "text-ink" : "text-muted",
          )}
        >
          +{value}
        </span>
        <span className="mt-1 text-xs font-bold text-muted">
          {decision === "approved" ? "Masuk saldo" : "Menunggu"}
        </span>
      </div>
    );
  }
  return (
    <span
      className={cn(
        "font-display text-4xl font-extrabold leading-none tabular-nums",
        value < 0 ? "text-brick-text" : "text-ink",
      )}
    >
      {value}
    </span>
  );
}

export function HistoryList() {
  const { scans, status, error, retry } = useScanHistory();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [photoScan, setPhotoScan] = useState<ScanRecord | null>(null);

  const counts = useMemo(() => {
    const total: Record<ReviewFilter, number> = { all: scans.length, pending: 0, approved: 0, rejected: 0 };
    for (const scan of scans) total[reviewState(scan)] += 1;
    return total;
  }, [scans]);

  const filtered = useMemo(
    () => (filter === "all" ? scans : scans.filter((scan) => reviewState(scan) === filter)),
    [scans, filter],
  );
  const rows = filtered.slice(0, MAX_ROWS);

  // Activity keeps hidden pages mounted, so close the dialog when the page is hidden.
  useLayoutEffect(() => {
    return () => setPhotoScan(null);
  }, []);

  return (
    <section aria-labelledby="judul-riwayat">
      <div className="reveal flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="judul-riwayat" className="text-5xl">
          Riwayat pembuangan sampah
        </h2>
        <p className="text-sm text-muted">
          Tahap 1 cek otomatis, tahap 2 verifikasi admin.
        </p>
      </div>

      <div className="mt-5">
        {status === "loading" ? (
          <LoadingState label="Memuat riwayat" />
        ) : status === "error" ? (
          <ErrorState
            title="Riwayat gagal dimuat"
            message={error ?? "Terjadi kesalahan."}
            onRetry={retry}
          />
        ) : scans.length === 0 ? (
          <EmptyState
            title="Belum ada aktivitas"
            description="Scan QR tong pertamamu untuk mulai mengumpulkan poin."
          />
        ) : (
          <>
            {counts.rejected > 0 ? (
              <InlineNotice tone="error" className="mb-4">
                Ada <strong>{counts.rejected} scan</strong> yang ditolak admin. Periksa alasan penolakan dan catatannya di daftar di bawah.
              </InlineNotice>
            ) : null}

            <div
              role="group"
              aria-label="Saring riwayat berdasarkan verifikasi admin"
              className="mb-4 flex flex-wrap gap-2"
            >
              {FILTER_OPTIONS.map((option) => {
                const selected = option.id === filter;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFilter(option.id)}
                    className={cn(
                      "min-h-11 rounded-ctl border-2 px-3 py-2 text-sm font-bold transition-colors duration-150",
                      selected
                        ? "border-pick bg-pick text-on-pick"
                        : "border-line bg-surface text-ink hover:bg-cobalt-soft",
                    )}
                  >
                    {option.label} ({counts[option.id]})
                  </button>
                );
              })}
            </div>

            {rows.length === 0 ? (
              <EmptyState
                title="Tidak ada scan di kategori ini"
                description="Belum ada riwayat scan dengan status verifikasi admin yang dipilih."
                action={
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Lihat semua riwayat
                  </Button>
                }
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
                        <ScanPoints scan={scan} />
                      </div>
                      <div className="mt-3 space-y-2">
                        <VerificationDetails scan={scan} />
                        <time className="block text-xs text-muted">{formatDateTime(scan.timestamp)}</time>
                      </div>
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
                          <td className="whitespace-nowrap px-4 py-3 align-top">
                            {formatDateTime(scan.timestamp)}
                          </td>
                          <td className="px-4 py-3 align-top font-bold">
                            {BINS[scan.categoryBin]?.label ?? scan.categoryBin}
                          </td>
                          <td className="px-4 py-3 align-top">{scan.locationName || scan.location}</td>
                          <td className="px-4 py-3 text-right align-top">
                            <ScanPoints scan={scan} />
                          </td>
                          <td className="max-w-sm px-4 py-3 align-top">
                            <VerificationDetails scan={scan} />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <PhotoButton scan={scan} onOpen={setPhotoScan} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length > MAX_ROWS ? (
                  <p className="mt-3 text-sm text-muted">Menampilkan {MAX_ROWS} aktivitas terbaru.</p>
                ) : null}
              </>
            )}
          </>
        )}
      </div>

      <PhotoDialog scan={photoScan} onClose={() => setPhotoScan(null)} />
    </section>
  );
}
