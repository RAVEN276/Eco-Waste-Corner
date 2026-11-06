import { EXCHANGE_JSDP, EXCHANGE_POIN } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/** Two plates showing the exchange rate. Meant for dark backgrounds. */
export function ExchangeRate({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <div
        className="wipe rounded-plate bg-white px-4 py-3 text-night"
        style={{ ["--delay" as string]: "250ms" }}
      >
        <span className="block font-display text-6xl font-extrabold leading-none">
          {EXCHANGE_POIN}
        </span>
        <span className="text-sm font-bold">poin</span>
      </div>
      <span
        className="fade-up font-display text-5xl font-extrabold leading-none"
        style={{ ["--delay" as string]: "450ms" }}
      >
        =
      </span>
      <div
        className="wipe rounded-plate bg-cobalt px-4 py-3 text-white"
        style={{ ["--delay" as string]: "600ms" }}
      >
        <span className="block font-display text-6xl font-extrabold leading-none">
          {EXCHANGE_JSDP}
        </span>
        <span className="text-sm font-bold">poin JSDP</span>
      </div>
    </div>
  );
}
