"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ReviewPlates } from "@/components/admin/ReviewPlates";
import { ScanDetail } from "@/components/admin/ScanDetail";
import { ScanList } from "@/components/admin/ScanList";
import { ScanPickerDialog } from "@/components/admin/ScanPickerDialog";
import { binLabel, reviewState, scanFacts, userName, type ReviewFilter } from "@/components/admin/adminLabels";
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
  onDeleteScan?: (scanId: string) => Promise<unknown>;
  onManageUser?: (uid: string) => void;
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

function matchesQuery(scan: ScanRecord, allScans: ScanRecord[], users: Map<string, UserProfile>, needle: string): boolean {
  if (needle === "") return true;
  const user = users.get(scan.userId);
  const facts = scanFacts(scan, allScans);
  const haystack = [
    userName(scan, users),
    user?.email ?? "",
    user?.prodi ?? "",
    facts.itemLabel,
    binLabel(scan.categoryBin),
    scan.locationName,
    scan.location,
    scan.scanId,
    scan.review?.note ?? "",
    scan.status === "penalized" ? "penalti" : "",
    !facts.hasStoredPhoto && !facts.duplicatePhoto ? "tanpa foto" : "",
    facts.duplicatePhoto ? "foto ganda" : "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
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
  onDeleteScan,
  onManageUser,
}: AdminReviewProps) {
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const focusRef = useRef<HTMLElement>(null);

  // Activity keeps hidden pages mounted, so close the picker dialog when the page is hidden.
  useLayoutEffect(() => {
    return () => setPickerOpen(false);
  }, []);

  const counts = useMemo(() => {
    const total: Record<ReviewFilter, number> = { pending: 0, approved: 0, rejected: 0, all: scans.length };
    for (const scan of scans) total[reviewState(scan)] += 1;
    return total;
  }, [scans]);

  const needle = query.trim().toLowerCase();
  const byFilter = useMemo(() => scans.filter((scan) => matches(filter, scan)), [scans, filter]);
  const visible = useMemo(
    () => (needle === "" ? byFilter : byFilter.filter((scan) => matchesQuery(scan, scans, users, needle))),
    [byFilter, scans, users, needle],
  );

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

  const scrollToFocus = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    focusRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const selectFromQueue = (scanId: string) => {
    setSelectedId(scanId);
    scrollToFocus();
  };

  const selectFromPicker = (scanId: string) => {
    setSelectedId(scanId);
    setPickerOpen(false);
  };

  const openScan = (scanId: string) => {
    const target = scans.find((scan) => scan.scanId === scanId);
    if (target && !matches(filter, target)) setFilter("all");
    setQuery("");
    setSelectedId(scanId);
  };

  const stepQueue = useCallback(
    (delta: -1 | 1) => {
      const target = visible[selectedIndex + delta];
      if (target) setSelectedId(target.scanId);
    },
    [visible, selectedIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (pickerOpen || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepQueue(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepQueue(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pickerOpen, stepQueue]);

  const handleReview = async (scan: ScanRecord, decision: ReviewDecision, note: string) => {
    const next = visible[selectedIndex + 1] ?? visible[selectedIndex - 1] ?? null;
    await onReview(scan.scanId, decision, note);
    // Di tab "Menunggu" scan yang baru diputuskan keluar dari antrean, jadi lanjut ke scan berikutnya.
    if (filter === "pending") setSelectedId(next?.scanId ?? null);
  };

  const handleDelete = async (scan: ScanRecord) => {
    if (!onDeleteScan) return;
    const next = visible[selectedIndex + 1] ?? visible[selectedIndex - 1] ?? null;
    await onDeleteScan(scan.scanId);
    setSelectedId(next?.scanId ?? null);
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
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <ReviewPlates counts={counts} active={filter} onChange={changeFilter} />
          <Button variant="outline" onClick={onReload} className="w-full sm:w-auto sm:shrink-0">
            <RefreshIcon className="size-4" />
            Muat ulang
          </Button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label htmlFor="cari-scan-admin" className="text-sm font-bold">
              Cari scan
            </label>
            <input
              id="cari-scan-admin"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nama, email, barang, tong, lokasi, atau ID scan"
              autoComplete="off"
              className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setPickerOpen(true)}
            disabled={byFilter.length === 0}
            className="w-full sm:w-auto sm:shrink-0"
          >
            Pilih dari daftar ({visible.length})
          </Button>
        </div>

        <p className="text-xs text-muted sm:text-sm">
          {needle !== ""
            ? `Menampilkan ${visible.length} hasil cocok dari ${byFilter.length} scan pada tab ini.`
            : `Dihitung dari ${scans.length} scan terbaru yang sudah dimuat${hasMore ? ". Masih ada yang lebih lama." : "."}`}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-bold text-brick-text">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title={needle !== "" ? "Tidak ada scan yang cocok" : EMPTY_COPY[filter].title}
          description={
            needle !== ""
              ? "Coba kata kunci lain atau hapus pencarian untuk melihat daftar scan."
              : EMPTY_COPY[filter].description
          }
          action={
            needle !== "" ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Hapus pencarian
              </Button>
            ) : filter !== "all" ? (
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
            <section ref={focusRef} aria-label="Tinjauan scan aktif" className="scroll-mt-20">
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
                onManageUser={onManageUser}
                onDeleteScan={onDeleteScan ? () => handleDelete(selected) : undefined}
              />
            </section>
          ) : null}

          {filter === "pending" && visible.length > 1 ? (
            <section aria-labelledby="judul-antrean-scan" className="space-y-3 pt-1 sm:pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="judul-antrean-scan" className="text-2xl sm:text-3xl">
                  Antrean scan ({visible.length})
                </h2>
                {hasMore ? (
                  <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="w-full sm:w-auto">
                    {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                  </Button>
                ) : null}
              </div>

              <ScanList
                scans={visible}
                allScans={scans}
                users={users}
                selectedId={selected?.scanId ?? null}
                onSelect={selectFromQueue}
              />
            </section>
          ) : hasMore ? (
            <div className="flex justify-center pt-1">
              <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="w-full sm:w-auto">
                {loadingMore ? "Memuat..." : "Muat lebih banyak"}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <ScanPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        scans={visible}
        allScans={scans}
        users={users}
        selectedId={selected?.scanId ?? null}
        query={query}
        onQueryChange={setQuery}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
        onSelect={selectFromPicker}
      />
    </div>
  );
}
