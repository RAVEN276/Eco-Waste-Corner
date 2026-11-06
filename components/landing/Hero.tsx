"use client";

import type { CSSProperties } from "react";
import { StationScene } from "@/components/art/BinArt";
import { Button } from "@/components/ui/Button";
import { ScrollLinked } from "@/components/ui/ScrollLinked";
import { BIN_LIST } from "@/lib/data/bins";
import { BASE_POINTS, COOLDOWN_MINUTES, EXCHANGE_JSDP, EXCHANGE_POIN } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const STEPS = [
  "Pilih slot yang kamu pindai",
  "Jawab 2 soal kuis",
  "Foto sampah yang kamu buang",
  `Tunggu jeda ${COOLDOWN_MINUTES} menit untuk scan berikutnya`,
];

function delay(ms: number): CSSProperties {
  return { ["--delay" as string]: `${ms}ms` };
}

// Hero berwarna penuh: cobalt di belakang, panggung kertas di depan. Gambar stasiun pilah
// menunjukkan produknya (tiga tong menerima barang), lalu satu baris ink memuat empat langkah scan.
export function Hero() {
  const signedIn = useUserStore((s) => s.authStatus === "authenticated");

  return (
    <section
      aria-labelledby="judul-hero"
      data-replay=""
      className="border-b-2 border-ink bg-cobalt text-white"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-12 md:pb-16 md:pt-14">
        <div className="fade-up">
          <h1 id="judul-hero" className="text-6xl sm:text-7xl lg:text-8xl">
            Pilah sampah di kampus, kumpulkan{" "}
            <mark
              className="wipe mt-[0.3em] inline-block bg-white px-2 leading-none text-cobalt"
              style={delay(450)}
            >
              poin.
            </mark>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">
            Pindai slot tong, jawab 2 soal kuis, lalu unggah foto buktimu. Tukar {EXCHANGE_POIN} poin
            jadi {EXCHANGE_JSDP} poin JSDP, syarat kelulusanmu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={signedIn ? "/scan" : "/login?next=/scan"} variant="light" size="lg">
              {signedIn ? "Mulai scan" : "Masuk untuk mulai scan"}
            </Button>
            <a
              href="#edukasi"
              className="inline-flex min-h-12 items-center px-2 text-base font-bold underline decoration-2 underline-offset-4 hover:text-mist"
            >
              Baca panduan memilah
            </a>
          </div>
        </div>

        <div className="fade-up" style={delay(150)}>
          <ScrollLinked
            y={[0, 28]}
            scale={[1, 0.94]}
            range="exit"
            originClassName="origin-top"
          >
            <div className="overflow-hidden rounded-sheet border-2 border-ink bg-paper text-ink shadow-[8px_8px_0_var(--color-ink)]">
              <StationScene className="block w-full px-3 pt-2" />
              <ul className="grid grid-cols-3 border-t-2 border-ink">
                {BIN_LIST.map((bin, index) => (
                  <li
                    key={bin.id}
                    className={cn("p-3 sm:p-4", bin.tone.solid, index > 0 && "border-l-2 border-ink")}
                  >
                    <span className="block font-display text-5xl font-extrabold leading-none sm:text-6xl">
                      {BASE_POINTS[bin.id]}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-tight">{bin.label}</span>
                    <span className="block text-xs">poin dasar</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollLinked>
        </div>
      </div>

      <div className="border-t-2 border-ink bg-ink">
        <h2 className="sr-only">Satu scan, empat langkah</h2>
        <ol className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/25 md:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="fade-up flex items-start gap-3 bg-ink px-4 py-5 sm:px-6"
              style={delay(600 + index * 120)}
            >
              <span aria-hidden="true" className="font-display text-5xl font-extrabold leading-none">
                {index + 1}
              </span>
              <span className="pt-1 text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
