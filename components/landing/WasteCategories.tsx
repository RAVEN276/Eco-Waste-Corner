import { BinArt } from "@/components/art/BinArt";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollLinked } from "@/components/ui/ScrollLinked";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { BIN_LIST } from "@/lib/data/bins";
import { BASE_POINTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

// Tiga kategori setara dan strukturnya sama, jadi kolomnya sengaja sama lebar.
// Pemotongan sudut memakai overflow-clip, bukan overflow-hidden: overflow-hidden menjadikan elemen
// "scroll container", sehingga gerak terikat gulir di dalamnya (tong di kepala kolom) mengira
// elemen itu yang digulir dan berhenti bergerak. overflow-clip memotong sama tanpa efek itu.
// Satu panel dengan garis tegas, bukan tiga kartu terpisah. Gambar tong mencuat dari
// kepala kolom supaya kode warna langsung dikenali.
export function WasteCategories() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20"
      aria-labelledby="judul-edukasi"
    >
      <div className="reveal max-w-2xl">
        <h2 id="judul-edukasi" className="text-5xl sm:text-6xl">
          Tiga tong, satu aturan: pilah dari awal.
        </h2>
        <p className="mt-4 text-lg text-muted">
          Cek jenis sampah yang benar dan kesalahan yang paling sering terjadi sebelum kamu
          membuang.
        </p>
      </div>

      {/*
        Di layar md ke atas, kolom dan kepalanya memakai subgrid bersarang. Lima baris dibagi
        bersama: judul, deskripsi, poin, isi, tips. Jadi tiap bagian sejajar antar kolom
        walau satu judul pindah baris (misalnya "Plastik / Kertas" di layar sedang).
      */}
      <div className="mt-10 grid overflow-clip rounded-sheet border-2 border-line md:grid-cols-3 md:grid-rows-[auto_auto_auto_1fr_auto]">
        {BIN_LIST.map((bin, index) => (
          <article
            key={bin.id}
            className={cn(
              "reveal flex flex-col md:row-span-5 md:grid md:grid-rows-subgrid",
              index > 0 && "border-t-2 border-line md:border-l-2 md:border-t-0",
            )}
            style={{
              ["--delay" as string]: `${index * 140}ms`,
            }}
          >
            <header
              className={cn(
                "relative flex min-h-44 flex-col overflow-clip p-5 sm:p-6 md:row-span-3 md:grid md:min-h-0 md:grid-rows-subgrid",
                bin.tone.solid,
              )}
            >
              <h3 className="relative z-10 text-4xl xl:whitespace-nowrap">{bin.label}</h3>
              <p className="relative z-10 mt-2 max-w-[60%] text-base">{bin.short}</p>
              <p className="relative z-10 mt-auto flex items-baseline gap-2 pt-4 md:mt-0 md:self-end">
                <CountUp
                  value={BASE_POINTS[bin.id]}
                  className="font-display text-5xl font-extrabold leading-none"
                />
                <span className="text-sm font-bold">poin dasar</span>
              </p>
              <ScrollLinked
                y={[44, -28]}
                className="absolute -bottom-8 -right-3 w-32 rotate-6 sm:w-36 md:w-24 lg:w-36"
              >
                <BinArt id={bin.id} className="block w-full" />
              </ScrollLinked>
            </header>

            <div className="flex-1 space-y-5 bg-surface p-5 sm:p-6">
              <div>
                <h4 className="text-sm font-bold">Masukkan ke sini</h4>
                <ul className="mt-2 space-y-2">
                  {bin.accepts.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-1 size-4 shrink-0 text-organik" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold">Jangan dimasukkan</h4>
                <ul className="mt-2 space-y-2">
                  {bin.avoid.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CloseIcon className="mt-1 size-4 shrink-0 text-brick-text" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className={cn("p-5 text-sm sm:p-6", bin.tone.soft)}>
              <strong>Tips:</strong> {bin.tip}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
