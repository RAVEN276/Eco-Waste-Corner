import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { BINS } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const MISTAKES: { item: string; wrong: BinCategory; right: BinCategory; reason: string }[] = [
  {
    item: "Tisu bekas pakai",
    wrong: "plastik_kertas",
    right: "residu",
    reason:
      "Tisu memang dari kertas, tapi seratnya pendek dan sudah terkena kotoran, jadi tidak bisa didaur ulang.",
  },
  {
    item: "Kardus atau kertas berminyak",
    wrong: "plastik_kertas",
    right: "residu",
    reason: "Minyak meresap ke serat dan mengganggu daur ulang. Kertas harus bersih dan kering.",
  },
  {
    item: "Puntung rokok",
    wrong: "organik",
    right: "residu",
    reason: "Filternya mengandung serat plastik, jadi tidak bisa dikomposkan seperti sisa makanan.",
  },
  {
    item: "Permen karet",
    wrong: "organik",
    right: "residu",
    reason: "Dasarnya polimer sintetis, tidak membusuk seperti bahan organik.",
  },
  {
    item: "Botol plastik kosong",
    wrong: "residu",
    right: "plastik_kertas",
    reason:
      "Plastik yang bersih masih bisa didaur ulang. Kosongkan dan bilas singkat, jangan dicampur ke residu.",
  },
  {
    item: "Sisa makanan tanpa kemasan",
    wrong: "residu",
    right: "organik",
    reason: "Sisa makanan bisa diolah jadi kompos selama tidak bercampur plastik pembungkus.",
  },
];

function Chip({ bin, kind }: { bin: BinCategory; kind: "wrong" | "right" }) {
  const label = BINS[bin].label;
  if (kind === "wrong") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-ctl border-2 border-dashed border-edge bg-surface px-2.5 py-1 text-sm font-bold text-muted">
        <CloseIcon className="size-3.5 shrink-0 text-brick-text" />
        <span className="line-through">{label}</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-ctl px-2.5 py-1 text-sm font-bold",
        BINS[bin].tone.solid,
      )}
    >
      <CheckIcon className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

// Satu panel berbaris, bukan deretan kartu: tiap baris memuat barang, tebakan yang keliru,
// jawaban yang benar, dan alasannya. Warna hanya penanda tambahan, nama tong selalu tertulis.
export function CommonMistakes() {
  return (
    <section aria-labelledby="judul-salah-kaprah" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <div className="reveal max-w-2xl">
        <h2 id="judul-salah-kaprah" className="text-5xl sm:text-6xl">
          Yang sering salah tong.
        </h2>
        <p className="mt-4 text-lg text-muted">
          Barang yang mirip satu kategori tapi sebenarnya masuk kategori lain.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-sheet border-2 border-line bg-surface">
        <div
          aria-hidden="true"
          className="hidden bg-night px-6 py-3 text-sm font-bold text-white md:grid md:grid-cols-[1.1fr_0.9fr_0.9fr_1.6fr] md:gap-6"
        >
          <span>Barang</span>
          <span>Sering salah ke</span>
          <span>Seharusnya</span>
          <span>Alasannya</span>
        </div>
        <ul className="divide-y-2 divide-rule">
          {MISTAKES.map((row, index) => (
            <li
              key={row.item}
              className="reveal grid gap-3 px-5 py-5 sm:px-6 md:grid-cols-[1.1fr_0.9fr_0.9fr_1.6fr] md:items-center md:gap-6"
              style={{
                ["--delay" as string]: `${index * 70}ms`,
              }}
            >
              <p className="font-display text-3xl font-extrabold leading-none">{row.item}</p>
              <p>
                <span className="mb-1 block text-xs font-bold text-muted md:hidden">Sering salah ke</span>
                <Chip bin={row.wrong} kind="wrong" />
              </p>
              <p>
                <span className="mb-1 block text-xs font-bold text-muted md:hidden">Seharusnya</span>
                <Chip bin={row.right} kind="right" />
              </p>
              <p className="text-sm">{row.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
