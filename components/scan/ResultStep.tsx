"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Timer } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useCooldown } from "@/hooks/useCooldown";
import type { SubmitScanResult } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";

export function ResultStep({ result, onAgain }: { result: SubmitScanResult; onAgain: () => void }) {
  const cooldown = useCooldown();
  const { breakdown, applied } = result;
  const penalized = breakdown.status === "penalized";

  return (
    <div className="space-y-6" role="status">
      <div
        className={cn(
          "rounded-2xl p-6 sm:p-8",
          penalized ? "bg-[#fbe4e1] text-[#5c1a14]" : "bg-forest text-white",
        )}
      >
        <div className="flex items-center gap-3">
          {penalized ? (
            <AlertTriangle aria-hidden="true" className="size-7 shrink-0 text-brick" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="size-7 shrink-0 text-mint" />
          )}
          <h2 className="text-xl font-bold">{penalized ? "Pelanggaran terdeteksi" : "Scan tercatat"}</h2>
        </div>
        <p className="mt-4 font-display text-6xl font-extrabold leading-none">
          {applied > 0 ? "+" : ""}
          {applied}
          <span className="ml-2 text-lg font-semibold">poin</span>
        </p>
        <p className="mt-3 text-sm">{breakdown.tierLabel}</p>
        {penalized && applied === 0 ? (
          <p className="mt-1 text-sm">Saldo sudah 0, jadi tidak ada poin yang dipotong.</p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-line bg-white p-4">
          <dt className="text-muted">Saldo poin JSDP</dt>
          <dd className="mt-1 font-display text-3xl font-extrabold text-forest">
            <AnimatedCounter value={result.balance} />
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <dt className="flex items-center gap-1.5 text-muted">
            <Timer aria-hidden="true" className="size-4" />
            Scan berikutnya
          </dt>
          <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums text-forest">
            {cooldown.active ? cooldown.label : "Siap"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row">
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
