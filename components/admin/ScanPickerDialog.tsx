"use client";

import { ReviewBadge } from "@/components/admin/ReviewBadge";
import { binLabel, reviewState, scanFacts, userName } from "@/components/admin/adminLabels";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/States";
import { BINS } from "@/lib/data/bins";
import type { ScanRecord, UserProfile } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface ScanPickerDialogProps {
  open: boolean;
  onClose: () => void;
  scans: ScanRecord[];
  allScans: ScanRecord[];
  users: Map<string, UserProfile>;
  selectedId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSelect: (scanId: string) => void;
}

function pointsText(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

/** Modal daftar ringkas untuk mencari dan langsung melompat ke scan tertentu tanpa menekan Berikutnya satu per satu. */
export function ScanPickerDialog({
  open,
  onClose,
  scans,
  allScans,
  users,
  selectedId,
  query,
  onQueryChange,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelect,
}: ScanPickerDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={`Pilih scan (${scans.length})`} className="sm:max-w-4xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="cari-scan-modal" className="text-sm font-bold">
            Cari di daftar ini
          </label>
          <input
            id="cari-scan-modal"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ketik nama, email, barang, lokasi, atau ID scan"
            autoComplete="off"
            className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base"
          />
        </div>

        {scans.length === 0 ? (
          <EmptyState
            title="Tidak ada scan yang cocok"
            description="Coba kata kunci lain atau hapus pencarian."
            action={
              query.trim() !== "" ? (
                <Button variant="outline" onClick={() => onQueryChange("")}>
                  Hapus pencarian
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {scans.map((scan) => {
                const selected = scan.scanId === selectedId;
                const facts = scanFacts(scan, allScans);
                return (
                  <li key={scan.scanId}>
                    <button
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      onClick={() => onSelect(scan.scanId)}
                      className={cn(
                        "flex min-h-11 w-full flex-col gap-1.5 rounded-plate border-2 p-3 text-left transition-colors duration-150",
                        selected
                          ? "border-pick bg-pick text-on-pick"
                          : "border-line bg-surface text-ink hover:bg-cobalt-soft",
                      )}
                    >
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className="min-w-0 break-words font-bold">{userName(scan, users)}</span>
                        <span className="shrink-0 font-display text-2xl font-extrabold leading-none tabular-nums">
                          {pointsText(scan.pointsEarned)}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden="true"
                          className={cn("size-3 shrink-0 rounded-sm border-2 border-ink", BINS[scan.categoryBin]?.tone.solid)}
                        />
                        <span className="min-w-0 break-words">
                          {binLabel(scan.categoryBin)}, {facts.itemLabel}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <ReviewBadge state={reviewState(scan)} />
                        <span className={cn("text-xs", selected ? "text-mist" : "text-muted")}>
                          {formatDateTime(scan.timestamp)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-plate border-2 border-line bg-surface md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Daftar scan untuk lompat cepat</caption>
                <thead>
                  <tr className="bg-night text-white">
                    <th scope="col" className="px-3 py-2.5 font-bold">
                      Mahasiswa
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold">
                      Tong dan barang
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-bold">
                      Poin
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold">
                      Keputusan
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold">
                      Waktu
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => {
                    const selected = scan.scanId === selectedId;
                    const facts = scanFacts(scan, allScans);
                    return (
                      <tr
                        key={scan.scanId}
                        className={cn(
                          "border-b border-rule last:border-0",
                          selected ? "bg-cobalt-soft" : "hover:bg-paper",
                        )}
                      >
                        <td className="px-3 py-2.5 align-middle">
                          <p className="font-bold">{userName(scan, users)}</p>
                          <p className="text-xs text-muted">{scan.locationName || scan.location}</p>
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "size-3 shrink-0 rounded-sm border-2 border-ink",
                                BINS[scan.categoryBin]?.tone.solid,
                              )}
                            />
                            <span>
                              {binLabel(scan.categoryBin)}, {facts.itemLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle font-display text-2xl font-extrabold tabular-nums">
                          {pointsText(scan.pointsEarned)}
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <ReviewBadge state={reviewState(scan)} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-xs text-muted">
                          {formatDateTime(scan.timestamp)}
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle">
                          <Button
                            variant={selected ? "dark" : "outline"}
                            onClick={() => onSelect(scan.scanId)}
                          >
                            {selected ? "Sedang dibuka" : "Buka"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-1">
            <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="w-full sm:w-auto">
              {loadingMore ? "Memuat..." : "Muat scan lebih lama"}
            </Button>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
