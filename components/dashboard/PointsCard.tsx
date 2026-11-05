"use client";

import Link from "next/link";
import { StationScene } from "@/components/art/BinArt";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { buttonClasses } from "@/components/ui/Button";
import { useCooldown } from "@/hooks/useCooldown";
import { COOLDOWN_MINUTES } from "@/lib/scoring";
import { useUserStore } from "@/store/useUserStore";

// Papan skor: poin JSDP adalah syarat kelulusan, jadi angkanya yang paling besar di layar ini.
// Tiga tong di sudut hanya mengikat papan ini ke aktivitasnya (memilah).
export function PointsCard() {
  const poin = useUserStore((s) => s.poinJSDP);
  const totalScan = useUserStore((s) => s.profile?.totalScan ?? 0);
  const cooldown = useCooldown();

  return (
    <section
      aria-labelledby="judul-poin"
      className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-sheet border-2 border-ink bg-cobalt p-6 text-white shadow-[8px_8px_0_var(--color-ink)] sm:p-8"
    >
      <div>
        <h2 id="judul-poin" className="text-3xl">
          Total poin JSDP
        </h2>
        <p className="mt-4 font-display text-[8rem] font-extrabold leading-[0.85] sm:text-[11rem]">
          <AnimatedCounter value={poin} />
        </p>
        <p className="mt-4 max-w-md text-sm">
          Dari {totalScan} scan pemilahan yang lolos pemeriksaan. Poin JSDP adalah poin Jaya Soft
          Skills Development Program.
        </p>
        <p className="mt-2 max-w-md text-sm font-bold">
          Poin ini dihitung sebagai syarat kelulusan. Poin tidak bisa ditukar dengan hadiah.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="flex items-center gap-3">
          {cooldown.active ? (
            <>
              <span className="font-display text-5xl font-extrabold leading-none tabular-nums">
                {cooldown.label}
              </span>
              <span className="text-sm">sampai scan berikutnya</span>
            </>
          ) : (
            <span className="text-sm font-bold">
              Siap scan (jeda {COOLDOWN_MINUTES} menit antar scan)
            </span>
          )}
        </p>
        <Link href="/scan" className={buttonClasses("light", "lg", "sm:shrink-0")}>
          {cooldown.active ? "Lihat status scan" : "Scan sekarang"}
        </Link>
      </div>

      <div className="absolute right-4 top-4 hidden w-56 rounded-plate border-2 border-ink bg-paper p-2 xl:block">
        <StationScene drops={false} className="block w-full" />
      </div>
    </section>
  );
}
