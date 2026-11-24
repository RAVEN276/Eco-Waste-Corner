import { ReviewBadge } from "@/components/admin/ReviewBadge";
import { binLabel, reviewState, scanFacts, userName } from "@/components/admin/adminLabels";
import { BINS } from "@/lib/data/bins";
import type { ScanRecord, UserProfile } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface ScanListProps {
  scans: ScanRecord[];
  /** Seluruh scan yang dimuat, untuk mencari foto asli dari scan yang fotonya ganda. */
  allScans: ScanRecord[];
  users: Map<string, UserProfile>;
  selectedId: string | null;
  onSelect: (scanId: string) => void;
}

function pointsText(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

/** Daftar antrean scan dalam grid kartu ringkas untuk melompat ke scan mana pun. */
export function ScanList({ scans, allScans, users, selectedId, onSelect }: ScanListProps) {
  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {scans.map((scan) => {
        const selected = scan.scanId === selectedId;
        const facts = scanFacts(scan, allScans);
        const secondary = selected ? "text-mist" : "text-muted";
        const flags: string[] = [];
        if (!facts.hasStoredPhoto && !facts.duplicatePhoto) flags.push("Tanpa foto");
        if (facts.duplicatePhoto) flags.push("Foto ganda");
        if (scan.status === "penalized") flags.push("Penalti");
        return (
          <li key={scan.scanId} className="min-w-0">
            <button
              id={`scan-${scan.scanId}`}
              type="button"
              aria-current={selected ? "true" : undefined}
              onClick={() => onSelect(scan.scanId)}
              className={cn(
                "flex min-h-11 w-full flex-col gap-1.5 rounded-plate border-2 p-3 text-left transition-colors duration-150 sm:gap-2 sm:p-3.5",
                selected
                  ? "border-pick bg-pick text-on-pick"
                  : "border-line bg-surface text-ink hover:bg-cobalt-soft",
              )}
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="min-w-0 break-words font-bold">{userName(scan, users)}</span>
                <span className="shrink-0 font-display text-3xl font-extrabold leading-none tabular-nums">
                  {pointsText(scan.pointsEarned)}
                  <span className="sr-only"> poin</span>
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
              <span className={cn("text-xs", secondary)}>{formatDateTime(scan.timestamp)}</span>
              <span className="flex flex-wrap items-center gap-1.5">
                <ReviewBadge state={reviewState(scan)} />
                {flags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-ctl border-2 border-edge bg-surface px-2 py-0.5 text-xs font-bold text-ink"
                  >
                    {flag}
                  </span>
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
