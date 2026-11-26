import { ItemGraphic } from "@/components/art/ItemArt";
import { BINS } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PrepRule {
  itemId: string;
  title: string;
  detail: string;
  bins: BinCategory[];
}

const PREP_RULES: PrepRule[] = [
  {
    itemId: "botol-plastik",
    title: "Kosongkan dan bilas botol atau gelas",
    detail:
      "Buang sisa minuman lebih dulu supaya cairan tidak mengotori kertas atau kardus di dalam tong.",
    bins: ["plastik_kertas"],
  },
  {
    itemId: "sisa-makanan",
    title: "Pisahkan makanan dari pembungkusnya",
    detail:
      "Tuang sisa nasi atau lauk ke Organik, lalu masukkan bungkus atau tisu kotor ke Residu.",
    bins: ["organik", "residu"],
  },
  {
    itemId: "kertas-berminyak",
    title: "Periksa noda minyak dan basah pada kertas",
    detail:
      "Kardus dan kertas yang kering masuk Plastik / Kertas. Jika sudah berminyak atau basah, taruh di Residu.",
    bins: ["residu"],
  },
];

// Bagian khusus untuk aturan persiapan fisik sampah sebelum masuk ke tong.
export function PrepGuide() {
  return (
    <section aria-labelledby="judul-persiapan" className="border-y-2 border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-persiapan" className="text-4xl sm:text-5xl lg:text-6xl">
            Siapkan dulu sebelum dibuang
          </h2>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
            Barang daur ulang yang basah atau tercampur sisa makanan bisa merusak satu tong. Ikuti tiga langkah
            persiapan singkat ini sebelum membuang sampah.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-3 md:gap-5">
          {PREP_RULES.map((rule, index) => (
            <li
              key={rule.itemId}
              className="reveal flex flex-col justify-between gap-4 rounded-plate border-2 border-line bg-paper p-5"
              style={{ ["--delay" as string]: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3.5 sm:flex-col sm:gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-plate border-2 border-line bg-surface p-2 sm:size-16">
                  <svg viewBox="-2 -2 34 42" className="size-full" aria-hidden="true">
                    <ItemGraphic category={rule.bins[0]} item={rule.itemId} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl leading-tight text-ink sm:text-3xl">{rule.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{rule.detail}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 border-t-2 border-rule pt-3">
                {rule.bins.map((bin) => (
                  <span
                    key={bin}
                    className={cn(
                      "inline-flex items-center rounded-ctl border border-line px-2.5 py-1 text-xs font-bold",
                      BINS[bin].tone.solid,
                    )}
                  >
                    {BINS[bin].label}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
