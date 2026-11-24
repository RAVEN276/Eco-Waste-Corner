import { cn } from "@/lib/utils";
import type { ReviewFilter } from "@/components/admin/adminLabels";

const TABS: { id: ReviewFilter; label: string }[] = [
  { id: "pending", label: "Menunggu" },
  { id: "approved", label: "Disetujui" },
  { id: "rejected", label: "Ditolak" },
  { id: "all", label: "Semua" },
];

/** Bar tab saringan ringkas sekaligus ringkasan jumlah scan per status keputusan dari data yang sudah dimuat. */
export function ReviewPlates({
  counts,
  active,
  onChange,
}: {
  counts: Record<ReviewFilter, number>;
  active: ReviewFilter;
  onChange: (filter: ReviewFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Saring scan berdasarkan keputusan"
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-11 items-center justify-between gap-2 rounded-ctl border-2 px-3.5 py-2 text-sm font-bold transition-colors duration-150 sm:justify-center",
              selected
                ? "border-pick bg-pick text-on-pick"
                : "border-line bg-surface text-ink hover:bg-cobalt-soft",
            )}
          >
            <span>{tab.label}</span>
            <span className="font-display text-xl font-extrabold leading-none tabular-nums">
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
