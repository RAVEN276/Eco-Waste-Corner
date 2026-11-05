import { CheckIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export const SCAN_STEPS = ["Pilih slot", "Kuis kilat", "Foto bukti", "Hasil"] as const;

// Empat segmen tebal seperti empat slot: yang sudah dilewati terisi ink, yang aktif cobalt.
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Langkah scan">
      {SCAN_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex min-w-0 flex-col gap-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative block h-3 overflow-hidden rounded-ctl border-2 bg-white",
                active ? "border-cobalt" : done ? "border-ink" : "border-edge",
              )}
            >
              {done ? <span className="absolute inset-0 bg-ink" /> : null}
              {active ? <span className="fill-x absolute inset-0 bg-cobalt" /> : null}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-bold sm:text-sm",
                active ? "text-cobalt" : done ? "text-ink" : "text-muted",
              )}
            >
              {done ? <CheckIcon className="size-3.5 shrink-0" /> : null}
              <span className="truncate">{label}</span>
              {done ? <span className="sr-only">, selesai</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
