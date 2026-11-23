import type { ScanRecord } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

/** Menampilkan catatan tinjauan admin (terutama alasan penolakan) pada riwayat dan dialog foto. */
export function ReviewNote({
  review,
  showTimestamp = false,
  className,
}: {
  review: ScanRecord["review"];
  showTimestamp?: boolean;
  className?: string;
}) {
  if (!review) return null;
  const note = review.note.trim();

  if (review.status === "rejected") {
    return (
      <div
        className={cn(
          "rounded-ctl border-2 border-brick-text bg-brick-soft px-3 py-2 text-brick-ink",
          className,
        )}
      >
        <p className="font-bold">
          Alasan penolakan admin
          {showTimestamp && review.reviewedAt ? ` (${formatDateTime(review.reviewedAt)})` : ""}:
        </p>
        <p className="mt-0.5 break-words">{note || "Scan ditolak oleh admin."}</p>
      </div>
    );
  }

  if (note === "") return null;
  return (
    <p className={cn("break-words rounded-ctl border-2 border-rule bg-paper px-3 py-2 text-ink", className)}>
      <span className="font-bold">Catatan admin:</span> {note}
    </p>
  );
}
