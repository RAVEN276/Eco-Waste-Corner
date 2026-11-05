import { CheckCircle2, CircleAlert, CircleDot } from "lucide-react";
import type { CapacityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEW: Record<CapacityStatus, { filled: number; icon: typeof CheckCircle2; tone: string; bar: string }> = {
  Kosong: { filled: 0, icon: CheckCircle2, tone: "bg-mint text-forest", bar: "bg-forest" },
  Terisi: { filled: 2, icon: CircleDot, tone: "bg-sun-soft text-charcoal", bar: "bg-charcoal" },
  Penuh: { filled: 3, icon: CircleAlert, tone: "bg-brick text-white", bar: "bg-white" },
};

/** Status is carried by text, icon, and a 3-step meter, never by color alone. */
export function CapacityBadge({ status, className }: { status: CapacityStatus; className?: string }) {
  const view = VIEW[status];
  const Icon = view.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold", view.tone, className)}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>
        <span className="sr-only">Kapasitas tong: </span>
        {status}
      </span>
      <span aria-hidden="true" className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-3 w-1.5 rounded-sm", i < view.filled ? view.bar : "bg-current opacity-25")}
          />
        ))}
      </span>
    </span>
  );
}
