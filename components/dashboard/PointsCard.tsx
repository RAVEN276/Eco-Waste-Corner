"use client";

import Link from "next/link";
import { QrCode, Timer } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { buttonClasses } from "@/components/ui/Button";
import { useCooldown } from "@/hooks/useCooldown";
import { COOLDOWN_MINUTES } from "@/lib/scoring";
import { useUserStore } from "@/store/useUserStore";

export function PointsCard() {
  const poin = useUserStore((s) => s.poinJSDP);
  const totalScan = useUserStore((s) => s.profile?.totalScan ?? 0);
  const cooldown = useCooldown();

  return (
    <section
      aria-labelledby="judul-poin"
      className="flex flex-col justify-between gap-8 rounded-2xl bg-forest p-6 text-white sm:p-8"
    >
      <div>
        <h2 id="judul-poin" className="text-base font-semibold text-mint">
          Total Poin JSDP
        </h2>
        <p className="mt-1 font-display text-7xl font-extrabold leading-none text-white sm:text-8xl">
          <AnimatedCounter value={poin} />
        </p>
        <p className="mt-3 text-sm text-white/85">
          Dari {totalScan} scan pemilahan yang lolos pemeriksaan. Poin JSDP adalah poin Jaya Soft
          Skills Development Program.
        </p>
        <p className="mt-2 text-sm font-semibold text-mint">
          Poin ini dihitung sebagai syarat kelulusan. Poin tidak bisa ditukar dengan hadiah.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-semibold"
          role="status"
        >
          <Timer aria-hidden="true" className="size-4 text-mint" />
          {cooldown.active ? (
            <span>
              Jeda scan: <span className="tabular-nums">{cooldown.label}</span>
            </span>
          ) : (
            <span>Siap scan (jeda {COOLDOWN_MINUTES} menit antar scan)</span>
          )}
        </p>
        <Link href="/scan" className={buttonClasses("sun", "md", "sm:shrink-0")}>
          <QrCode aria-hidden="true" className="size-4" />
          {cooldown.active ? "Lihat status scan" : "Scan sekarang"}
        </Link>
      </div>
    </section>
  );
}
