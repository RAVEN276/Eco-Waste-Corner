"use client";

import Link from "next/link";
import { BinArt, BinDrop } from "@/components/art/BinArt";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button, buttonClasses } from "@/components/ui/Button";
import { AlertIcon, CheckIcon } from "@/components/ui/Icons";
import { useCooldown } from "@/hooks/useCooldown";
import type { SubmitScanResult } from "@/lib/firebase/firestore";
import { EXCHANGE_JSDP, maxExchangePackages } from "@/lib/scoring";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ResultStep({
  result,
  category,
  onAgain,
}: {
  result: SubmitScanResult;
  category: BinCategory | null;
  onAgain: () => void;
}) {
  const cooldown = useCooldown();
  const { breakdown, applied } = result;
  const penalized = breakdown.status === "penalized";
  const packages = maxExchangePackages(result.balance);

  return (
    <div className="space-y-6" role="status">
      <div
        className={cn(
          "stamp relative rounded-plate p-6 sm:min-h-[14rem] sm:p-8",
          penalized ? "border-2 border-brick bg-brick-soft text-brick-ink" : "bg-ink text-white",
        )}
      >
        {category ? (
          <div className="absolute right-4 top-4 hidden w-24 rounded-plate border-2 border-ink bg-paper p-2 sm:block">
            {penalized ? (
              <BinArt id={category} className="block w-full" />
            ) : (
              <BinDrop id={category} className="block w-full" />
            )}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          {penalized ? (
            <AlertIcon className="size-7 shrink-0 text-brick" />
          ) : (
            <CheckIcon className="size-7 shrink-0" />
          )}
          <h2 className="text-4xl">{penalized ? "Pelanggaran terdeteksi" : "Scan tercatat"}</h2>
        </div>
        <p className="mt-4 font-display text-8xl font-extrabold leading-none">
          {applied > 0 ? "+" : ""}
          <AnimatedCounter value={applied} />
          <span className="ml-3 text-3xl font-bold">poin</span>
        </p>
        <p className="mt-3 text-sm">{breakdown.tierLabel}</p>
        {penalized && applied === 0 ? (
          <p className="mt-1 text-sm">Saldo sudah 0, jadi tidak ada poin yang dipotong.</p>
        ) : null}
      </div>

      <dl className="fade-up grid grid-cols-2 gap-3 text-sm" style={{ ["--delay" as string]: "300ms" }}>
        <div className="rounded-plate border-2 border-rule bg-white p-4">
          <dt className="text-muted">Saldo poin</dt>
          <dd className="mt-1 font-display text-5xl font-extrabold leading-none text-ink">
            <AnimatedCounter value={result.balance} />
          </dd>
        </div>
        <div className="rounded-plate border-2 border-rule bg-white p-4">
          <dt className="text-muted">Scan berikutnya</dt>
          <dd className="mt-1 font-display text-5xl font-extrabold leading-none tabular-nums text-ink">
            {cooldown.active ? cooldown.label : "Siap"}
          </dd>
        </div>
      </dl>

      {packages > 0 ? (
        <div
          className="fade-up flex flex-col gap-3 rounded-plate border-2 border-cobalt bg-cobalt-soft p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ ["--delay" as string]: "420ms" }}
        >
          <p className="text-sm">
            Saldo poinmu cukup untuk ditukar jadi <strong>{packages * EXCHANGE_JSDP} poin JSDP</strong>
            , syarat kelulusan.
          </p>
          <Link href="/dashboard#tukar-poin" className={buttonClasses("dark", "md", "sm:shrink-0")}>
            Tukar di dashboard
          </Link>
        </div>
      ) : null}

      <div className="fade-up flex flex-col gap-2 sm:flex-row" style={{ ["--delay" as string]: "540ms" }}>
        <Link href="/dashboard" className={buttonClasses("primary", "lg")}>
          Lihat dashboard
        </Link>
        <Button variant="outline" size="lg" onClick={onAgain} disabled={cooldown.active}>
          {cooldown.active ? "Scan lagi setelah jeda" : "Scan lagi"}
        </Button>
      </div>
    </div>
  );
}
