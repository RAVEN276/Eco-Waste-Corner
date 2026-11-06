import type { CapacityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEW: Record<CapacityStatus, { filled: number; tone: string }> = {
  Kosong: { filled: 0, tone: "border-organik bg-organik-soft text-ink" },
  Terisi: { filled: 2, tone: "border-line bg-kertas text-night" },
  Penuh: { filled: 3, tone: "border-brick bg-brick text-white" },
};

/** Status dibawa oleh teks dan meter tiga langkah, tidak pernah oleh warna saja. */
export function CapacityBadge({ status, className }: { status: CapacityStatus; className?: string }) {
  const view = VIEW[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-ctl border-2 px-2.5 py-1 text-sm font-bold",
        view.tone,
        className,
      )}
    >
      <span>
        <span className="sr-only">Kapasitas tong: </span>
        {status}
      </span>
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {["h-2", "h-3", "h-4"].map((height, i) => (
          <span
            key={height}
            className={cn("grow-y w-1.5 border-2 border-current", height, i < view.filled && "bg-current")}
            style={{ ["--delay" as string]: `${200 + i * 110}ms` }}
          />
        ))}
      </span>
    </span>
  );
}
