import { BINS } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { lead: string; question: string; bin: BinCategory }[] = [
  {
    lead: "Jika ya, masuk ke",
    question: "Apakah ini sisa makanan atau bahan alami, seperti kulit buah, daun, atau ampas kopi?",
    bin: "organik",
  },
  {
    lead: "Jika ya, masuk ke",
    question: "Kalau bukan: apakah ini plastik atau kertas yang bersih dan kering?",
    bin: "plastik_kertas",
  },
  {
    lead: "Selebihnya masuk ke",
    question: "Kalau bukan juga, misalnya kotor, berminyak, atau berlapis campuran bahan.",
    bin: "residu",
  },
];

// Jalan pintas untuk orang yang ragu: tiga pertanyaan berurutan, berhenti di "ya" pertama.
// Pita putih dengan garis ink memisahkannya dari panduan tong di atas dan kolom kesalahan di bawah.
export function SortSteps() {
  return (
    <section aria-labelledby="judul-tiga-tanya" className="border-y-2 border-ink bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-tiga-tanya" className="text-5xl sm:text-6xl">
            Ragu? Tanyakan tiga hal ini, berurutan.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Mulai dari pertanyaan pertama dan berhenti di jawaban &quot;ya&quot; yang pertama.
          </p>
        </div>

        <ol className="mt-10 grid overflow-hidden rounded-sheet border-2 border-ink md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.bin}
              className={cn(
                "reveal flex flex-col justify-between gap-6 p-5 sm:p-6",
                index > 0 && "border-t-2 border-ink md:border-l-2 md:border-t-0",
              )}
              style={{
                ["--delay" as string]: `${index * 140}ms`,
              }}
            >
              <div>
                <span
                  aria-hidden="true"
                  className="font-display text-8xl font-extrabold leading-none text-cobalt"
                >
                  {index + 1}
                </span>
                <p className="mt-3 text-lg">{step.question}</p>
              </div>
              <p
                className={cn("wipe flex flex-col gap-1 rounded-plate p-4", BINS[step.bin].tone.solid)}
                style={{ ["--delay" as string]: `${index * 140 + 350}ms` }}
              >
                <span className="text-sm font-bold">{step.lead}</span>
                <span className="font-display text-4xl font-extrabold leading-none">
                  {BINS[step.bin].label}
                </span>
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-sm text-muted">
          Botol dan gelas dikosongkan dan dibilas singkat dulu. Masih ragu dengan barangnya? Cari di
          kamus sampah di bawah.
        </p>
      </div>
    </section>
  );
}
