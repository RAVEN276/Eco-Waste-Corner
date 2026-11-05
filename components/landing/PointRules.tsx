import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { BIN_LIST } from "@/lib/data/bins";
import {
  BASE_POINTS,
  COOLDOWN_MINUTES,
  FULL_PROOF_BONUS,
  PENALTY_LABEL,
  PENALTY_POINTS,
  SCORE_TABLE_ROWS,
} from "@/lib/scoring";

const STEPS = [
  { title: "Pilih slot", text: "Pilih lokasi dan slot tong yang kamu pindai: Organik, Plastik/Kertas, atau Residu." },
  { title: "Kuis kilat", text: "Jawab 2 pertanyaan acak tentang kategori slot itu." },
  { title: "Foto bukti", text: "Unggah foto sampah yang dibuang dan pilih jenis sampahnya." },
  { title: "Poin masuk", text: `Poin JSDP dihitung otomatis. Scan berikutnya terbuka setelah jeda ${COOLDOWN_MINUTES} menit.` },
];

export function PointRules() {
  return (
    <section id="aturan-poin" className="border-y border-line bg-white" aria-labelledby="judul-aturan">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <h2 id="judul-aturan" className="text-3xl font-bold text-forest sm:text-4xl">
            Cara kerja dan aturan poin
          </h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span
                  aria-hidden="true"
                  className="font-display text-4xl font-extrabold leading-none text-leaf-deep"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0 space-y-8">
          <div>
            <h3 className="text-lg font-bold">Poin dasar per slot</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {BIN_LIST.map((bin) => (
                <li key={bin.id} className={`rounded-lg px-4 py-3 ${bin.tone.soft}`}>
                  <p className="text-sm font-semibold">{bin.label}</p>
                  <p className="font-display text-3xl font-extrabold">{BASE_POINTS[bin.id]}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <caption className="pb-3 text-left text-lg font-bold">
                Poin berjenjang (bonus foto lengkap: +{FULL_PROOF_BONUS})
              </caption>
              <thead>
                <tr className="border-b-2 border-forest text-forest">
                  <th scope="col" className="py-2 pr-4 font-semibold">Kuis</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Foto bukti</th>
                  <th scope="col" className="py-2 font-semibold">Poin</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_TABLE_ROWS.map((row) => (
                  <tr key={`${row.quiz}-${row.photo}`} className="border-b border-line">
                    <td className="py-2.5 pr-4">{row.quiz}</td>
                    <td className="py-2.5 pr-4">{row.photo}</td>
                    <td className="py-2.5 font-semibold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-bold">Pengurangan poin otomatis</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(PENALTY_POINTS) as (keyof typeof PENALTY_POINTS)[]).map((key) => (
                <li key={key} className="flex items-start gap-3 rounded-lg border border-brick/30 bg-[#fdf3f2] px-4 py-3">
                  <span className="shrink-0 font-display text-lg font-extrabold text-brick">
                    -{PENALTY_POINTS[key]}
                  </span>
                  <span className="text-[#5c1a14]">{PENALTY_LABEL[key]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">Saldo poin tidak pernah turun di bawah 0.</p>
          </div>

          <Link href="/scan" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
            Mulai scan pertama
          </Link>
        </div>
      </div>
    </section>
  );
}
