import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SCAN_STEPS = ["Pilih slot", "Kuis kilat", "Foto bukti", "Hasil"] as const;

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Langkah scan">
      {SCAN_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col gap-1.5"
          >
            <span
              aria-hidden="true"
              className={cn("h-1.5 rounded-full", done || active ? "bg-forest" : "bg-line")}
            />
            <span
              className={cn(
                "flex items-center gap-1 truncate text-xs font-semibold sm:text-sm",
                active ? "text-forest" : done ? "text-leaf-deep" : "text-muted",
              )}
            >
              {done ? <Check aria-hidden="true" className="size-3.5 shrink-0" /> : null}
              <span className="truncate">{label}</span>
              {done ? <span className="sr-only">, selesai</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
