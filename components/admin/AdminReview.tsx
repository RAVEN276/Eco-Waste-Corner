"use client";

import { useMemo, useState } from "react";
import { ReviewPlates } from "@/components/admin/ReviewPlates";
import { ScanDetail } from "@/components/admin/ScanDetail";
import { ScanList } from "@/components/admin/ScanList";
import { reviewState, scanFacts, type ReviewFilter } from "@/components/admin/adminLabels";
import { Button } from "@/components/ui/Button";
import { RefreshIcon } from "@/components/ui/Icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import type { AdminStatus } from "@/hooks/useAdminScans";
import type { ReviewDecision, ScanRecord, UserProfile } from "@/lib/types";

export interface AdminReviewProps {
  scans: ScanRecord[];
  users: Map<string, UserProfile>;
  status: AdminStatus;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onReload: () => void;
  onLoadMore: () => void;
  loadPhoto: (scanId: string) => Promise<string | null>;
  onReview: (scanId: string, decision: ReviewDecision, note: string) => Promise<unknown>;
}

const EMPTY_COPY: Record<ReviewFilter, { title: string; description: string }> = {
  pending: { title: "Tidak ada scan yang menunggu", description: "Semua scan yang sudah dimuat sudah ditinjau." },
  approved: { title: "Belum ada yang disetujui", description: "Scan yang kamu setujui akan muncul di sini." },
  rejected: { title: "Belum ada yang ditolak", description: "Scan yang kamu tolak akan muncul di sini." },
  all: { title: "Belum ada scan masuk", description: "Scan yang dikirim pengguna akan muncul di sini." },
};

function matches(filter: ReviewFilter, scan: ScanRecord): boolean {
  return filter === "all" || reviewState(scan) === filter;
}

/**
 * Ruang kerja tinjauan bergaya antrean fokus: bar saringan tab kompak di atas, satu kartu fokus aktif
 * (foto bukti di kiri, fakta scan + kuis + keputusan di kanan) dengan navigasi antrean, lalu daftar antrean
 * ringkas di bawahnya. Komponen ini hanya menerima data lewat props.
 */
export function AdminReview({
  scans,
  users,
  status,
  error,
  hasMore,
  loadingMore,
  onReload,
  onLoadMore,
  loadPhoto,
  onReview,
}: AdminReviewProps) {
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const total: Record<ReviewFilter, number> = { pending: 0, approved: 0, rejected: 0, all: scans.length };
    for (const scan of scans) total[reviewState(scan)] += 1;
    return total;
  }, [scans]);

  const visible = useMemo(() => scans.filter((scan) => matches(filter, scan)), [scans, filter]);

  // Selalu fokus ke scan yang sedang dipilih, atau otomatis ke item pertama di antrean saat ini.
  const selectedIndex = useMemo(() => {
    if (visible.length === 0) return -1;
    const found = selectedId ? visible.findIndex((scan) => scan.scanId === selectedId) : -1;
    return found >= 0 ? found : 0;
  }, [visible, selectedId]);

  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null;

  const changeFilter = (next: ReviewFilter) => {
    setFilter(next);
    setSelectedId(null);
  };

  const openScan = (scanId: string) => {
    const target = scans.find((scan) => scan.scanId === scanId);
    if (target && !matches(filter, target)) setFilter("all");
    setSelectedId(scanId);
  };

  const stepQueue = (delta: -1 | 1) => {
    const target = visible[selectedIndex + delta];
    if (target) setSelectedId(target.scanId);
  };

  const handleReview = async (scan: ScanRecord, decision: ReviewDecision, note: string) => {
    const next = visible[selectedIndex + 1] ?? visible[selectedIndex - 1] ?? null;
    await onReview(scan.scanId, decision, note);
    // Di tab "Menunggu" scan yang baru diputuskan keluar dari antrean, jadi lanjut ke scan berikutnya.
    if (filter === "pending") setSelectedId(next?.scanId ?? null);
  };

  if (status === "loading") {
    return <LoadingState label="Memuat scan masuk" className="py-20" />;
  }

  if (status === "error") {
    return (
      <ErrorState title="Scan gagal dimuat" message={error ?? "Terjadi kesalahan."} onRetry={onReload} className="py-12" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ReviewPlates counts={counts} active={filter} onChange={changeFilter} />
          <Button variant="outline" onClick={onReload}>
            <RefreshIcon className="size-4" />
            Muat ulang
          </Button>
        </div>
        <p className="text-sm text-muted">
          Dihitung dari {scans.length} scan terbaru yang sudah dimuat{hasMore ? ". Masih ada yang lebih lama." : "."}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-bold text-brick-text">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title={EMPTY_COPY[filter].title}
          description={EMPTY_COPY[filter].description}
          action={
            filter !== "all" ? (
              <Button variant="outline" onClick={() => changeFilter("all")}>
                Lihat semua scan
              </Button>
            ) : hasMore ? (
              <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? "Memuat..." : "Muat scan lebih lama"}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {selected ? (
            <section aria-label="Tinjauan scan aktif">
              <ScanDetail
                key={selected.scanId}
                scan={selected}
                user={users.get(selected.userId)}
                facts={scanFacts(selected, scans)}
                position={selectedIndex + 1}
                total={visible.length}
                hasPrev={selectedIndex > 0}
                hasNext={selectedIndex < visible.length - 1}
                onPrev={() => stepQueue(-1)}
                onNext={() => stepQueue(1)}
                loadPhoto={loadPhoto}
                onReview={(decision, note) => handleReview(selected, decision, note)}
                onOpenScan={openScan}
              />
            </section>
          ) : null}

          <section aria-labelledby="judul-antrean-scan" className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="judul-antrean-scan" className="text-3xl">
                Antrean scan ({visible.length})
              </h2>
              {hasMore ? (
                <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
                  {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                </Button>
              ) : null}
            </div>

            <ScanList
              scans={visible}
              allScans={scans}
              users={users}
              selectedId={selected?.scanId ?? null}
              onSelect={setSelectedId}
            />
          </section>
        </>
      )}
    </div>
  );
}
