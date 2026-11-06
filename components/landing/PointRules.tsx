import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { ExchangeRate } from "@/components/ui/ExchangeRate";
import { BIN_LIST } from "@/lib/data/bins";
import {
  BASE_POINTS,
  COOLDOWN_MINUTES,
  EXCHANGE_JSDP,
  EXCHANGE_POIN,
  FULL_PROOF_BONUS,
  PENALTY_LABEL,
  PENALTY_POINTS,
  SCORE_TABLE_ROWS,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Pindai QR",
    text: "Pindai QR yang tertempel di tong. Lokasi dan jenis tong (Organik, Plastik/Kertas, atau Residu) terbaca otomatis.",
  },
  { title: "Kuis kilat", text: "Jawab 2 pertanyaan acak tentang jenis tong itu." },
  { title: "Foto bukti", text: "Foto sampah yang dibuang langsung dengan kamera, lalu pilih jenis sampahnya." },
  {
    title: "Poin masuk",
    text: `Poin dihitung otomatis. Scan berikutnya terbuka setelah jeda ${COOLDOWN_MINUTES} menit.`,
  },
  {
    title: "Tukar jadi JSDP",
    text: `Di dashboard, tukar ${EXCHANGE_POIN} poin jadi ${EXCHANGE_JSDP} poin JSDP. Poin JSDP adalah syarat kelulusan.`,
  },
];

// Bagian gelap: ritme halaman berganti dari panduan terang ke aturan yang harus dibaca teliti.
export function PointRules() {
  return (
    <section id="aturan-poin" className="bg-night text-white" aria-labelledby="judul-aturan">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <h2 id="judul-aturan" className="text-5xl sm:text-6xl">
            Cara kerja dan aturan poin
          </h2>
          <ol className="mt-8 divide-y divide-white/25 border-y border-white/25">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="reveal grid grid-cols-[3rem_1fr] gap-4 py-5"
                style={{
                  ["--delay" as string]: `${index * 100}ms`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-5xl font-extrabold leading-none"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-2xl">{step.title}</h3>
                  <p className="mt-1 text-mist">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal min-w-0 space-y-10">
          <div>
            <h3 className="text-3xl">Poin dasar per tong</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {BIN_LIST.map((bin) => (
                <li
                  key={bin.id}
                  className={cn("flex items-end justify-between gap-3 rounded-plate p-4", bin.tone.solid)}
                >
                  <span className="text-sm font-bold">{bin.label}</span>
                  <CountUp
                    value={BASE_POINTS[bin.id]}
                    className="font-display text-6xl font-extrabold leading-none"
                  />
                </li>
              ))}
            </ul>
          </div>

          <table className="w-full border-collapse text-left text-sm">
            <caption className="pb-3 text-left font-display text-3xl font-extrabold">
              Poin berjenjang (bonus foto lengkap: +{FULL_PROOF_BONUS})
            </caption>
            <thead>
              <tr className="border-b-2 border-white text-mist">
                <th scope="col" className="py-2 pr-4 font-bold">
                  Kuis
                </th>
                <th scope="col" className="py-2 pr-4 font-bold">
                  Foto bukti
                </th>
                <th scope="col" className="py-2 font-bold">
                  Poin
                </th>
              </tr>
            </thead>
            <tbody>
              {SCORE_TABLE_ROWS.map((row) => (
                <tr key={`${row.quiz}-${row.photo}`} className="border-b border-white/25">
                  <td className="py-3 pr-4">{row.quiz}</td>
                  <td className="py-3 pr-4">{row.photo}</td>
                  <td className="py-3 font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h3 className="text-3xl">Pengurangan poin otomatis</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(PENALTY_POINTS) as (keyof typeof PENALTY_POINTS)[]).map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-plate bg-brick-soft px-4 py-3 text-brick-ink"
                >
                  <span className="shrink-0 font-display text-3xl font-extrabold leading-none text-brick-text">
                    -{PENALTY_POINTS[key]}
                  </span>
                  <span className="pt-0.5">{PENALTY_LABEL[key]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-mist">Saldo poin tidak pernah turun di bawah 0.</p>
          </div>

          <div>
            <h3 className="text-3xl">Tukar poin jadi poin JSDP</h3>
            <ExchangeRate className="mt-3" />
            <p className="mt-3 text-sm text-mist">
              Ditukar per kelipatan {EXCHANGE_POIN} poin, sisanya tetap tersimpan. Penukaran tidak
              bisa dibatalkan.
            </p>
          </div>

          <Link href="/scan" className={buttonClasses("light", "lg", "w-full sm:w-auto")}>
            Mulai scan pertama
          </Link>
        </div>
      </div>
    </section>
  );
}
