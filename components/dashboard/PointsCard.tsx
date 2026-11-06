"use client";

import Link from "next/link";
import { StationScene } from "@/components/art/BinArt";
import { buttonClasses } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollLinked } from "@/components/ui/ScrollLinked";
import { useCooldown } from "@/hooks/useCooldown";
import { COOLDOWN_MINUTES } from "@/lib/scoring";
import { useUserStore } from "@/store/useUserStore";

// Papan skor: poin adalah angka terbesar karena itu yang dikumpulkan lewat scan. Poin JSDP
// dan penukarannya ada di panel tukar poin tepat di bawah, jadi papan ini punya satu tombol
// saja: scan. Tiga tong di sudut hanya mengikat papan ini ke aktivitasnya (memilah).
// Saat digulir lewat, papan mundur pelan (ScrollLinked) supaya perhatian pindah ke panel tukar poin.
export function PointsCard() {
  const poin = useUserStore((s) => s.poin);
  const totalScan = useUserStore((s) => s.profile?.totalScan ?? 0);
  const cooldown = useCooldown();

  return (
    <ScrollLinked
      className="h-full"
      originClassName="h-full origin-top"
      y={[0, 24]}
      scale={[1, 0.96]}
      range="exit"
    >
      <section
        aria-labelledby="judul-poin"
        className="reveal relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-sheet border-2 border-ink bg-cobalt p-6 text-white shadow-[8px_8px_0_var(--color-ink)] sm:p-8"
      >
        <div>
          <h2 id="judul-poin" className="text-3xl">
            Poin kamu
          </h2>
          <p className="mt-4 font-display text-[8rem] font-extrabold leading-[0.85] sm:text-[11rem]">
            <CountUp value={poin} duration={1.1} />
          </p>
          <p className="mt-4 max-w-md text-sm">
            Dari {totalScan} scan pemilahan yang lolos pemeriksaan. Poin ini bisa ditukar jadi poin
            JSDP di panel tukar poin di bawah.
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
    </ScrollLinked>
  );
}
