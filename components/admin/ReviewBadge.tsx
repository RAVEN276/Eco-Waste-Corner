import { CheckIcon, ClockIcon, CloseIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export type ReviewState = "pending" | "approved" | "rejected";

const VIEW = {
  pending: { label: "Menunggu", Icon: ClockIcon, tone: "border-dashed border-edge bg-surface text-ink" },
  approved: { label: "Disetujui", Icon: CheckIcon, tone: "border-organik bg-organik-soft text-ink" },
  rejected: { label: "Ditolak", Icon: CloseIcon, tone: "border-brick-text bg-brick-soft text-brick-ink" },
} as const;

export const USER_REVIEW_LABELS: Record<ReviewState, string> = {
  pending: "Menunggu verifikasi admin",
  approved: "Disetujui admin",
  rejected: "Ditolak admin",
};

/** Keadaan tinjauan sebuah scan. Dibawa oleh kata dan ikon, tidak oleh warna saja. */
export function ReviewBadge({
  state,
  labels,
  className,
}: {
  state: ReviewState;
  labels?: Partial<Record<ReviewState, string>>;
  className?: string;
}) {
  const { label, Icon, tone } = VIEW[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-ctl border-2 px-2 py-0.5 text-xs font-bold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {labels?.[state] ?? label}
    </span>
  );
}
