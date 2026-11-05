"use client";

import { motion } from "framer-motion";
import { Camera, HelpCircle, QrCode, Timer } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { useUserStore } from "@/store/useUserStore";

const GRID = 21;

/** Deterministic QR-like pattern so server and client render the same markup. */
function buildPattern(): boolean[][] {
  let seed = 20240612;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const cells = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => next() > 0.52),
  );
  const finder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || cc < 0 || rr >= GRID || cc >= GRID) continue;
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[rr][cc] = r >= 0 && r <= 6 && c >= 0 && c <= 6 ? edge || core : false;
      }
    }
  };
  finder(0, 0);
  finder(0, GRID - 7);
  finder(GRID - 7, 0);
  return cells;
}

const PATTERN = buildPattern();

function ScanFrame() {
  const size = 220;
  const cell = size / GRID;
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[260px] rounded-2xl bg-mint p-6"
      style={{ ["--scan-distance" as string]: "205px" }}
      role="img"
      aria-label="Ilustrasi kode QR pada slot tong sampah yang sedang dipindai"
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-full"
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        {PATTERN.flatMap((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill="#1B4D3E"
              />
            ) : null,
          ),
        )}
      </svg>
      {(
        [
          "left-2 top-2 border-l-4 border-t-4",
          "right-2 top-2 border-r-4 border-t-4",
          "bottom-2 left-2 border-b-4 border-l-4",
          "bottom-2 right-2 border-b-4 border-r-4",
        ] as const
      ).map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`absolute size-7 rounded-sm border-forest ${pos}`}
        />
      ))}
      <span
        aria-hidden="true"
        className="scan-line absolute left-4 right-4 top-6 h-1 rounded-full bg-sun"
      />
    </div>
  );
}

export function Hero() {
  const authStatus = useUserStore((s) => s.authStatus);
  const ctaHref = authStatus === "authenticated" ? "/scan" : "/login?next=/scan";

  return (
    <section className="bg-forest text-white" aria-labelledby="judul-hero">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.25fr_1fr] md:py-20 lg:gap-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1
            id="judul-hero"
            className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            <span className="text-mint">Eco Waste Corner:</span> Ruang Edukasi &amp; Pemilahan
            Sampah Kampus UPJ
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
            Pindai kode di slot tong, jawab kuis kilat, unggah foto buktimu, lalu kumpulkan poin
            JSDP untuk syarat kelulusanmu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ctaHref} variant="sun" size="lg">
              Login Email Student UPJ / Scan QR Sekarang
            </Button>
            <a
              href="#edukasi"
              className={buttonClasses(
                "ghost",
                "lg",
                "border-2 border-white/40 text-white hover:bg-white/10 active:bg-white/20",
              )}
            >
              Pelajari cara memilah
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <ScanFrame />
          <GlassCard className="mx-auto mt-5 w-full max-w-sm">
            <p className="text-sm font-semibold text-mint">Satu scan, empat langkah</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <QrCode aria-hidden="true" className="size-4 shrink-0 text-mint" />
                Pilih slot yang kamu pindai
              </li>
              <li className="flex items-center gap-2.5">
                <HelpCircle aria-hidden="true" className="size-4 shrink-0 text-mint" />
                Jawab 2 pertanyaan kuis
              </li>
              <li className="flex items-center gap-2.5">
                <Camera aria-hidden="true" className="size-4 shrink-0 text-mint" />
                Foto sampah yang kamu buang
              </li>
              <li className="flex items-center gap-2.5">
                <Timer aria-hidden="true" className="size-4 shrink-0 text-mint" />
                Jeda 15 menit sebelum scan berikutnya
              </li>
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
