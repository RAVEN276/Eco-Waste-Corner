"use client";

import { useEffect, useRef, useState } from "react";
import { BinArt } from "@/components/art/BinArt";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { LoadingState } from "@/components/ui/States";
import { BINS, BIN_LIST } from "@/lib/data/bins";
import { WASTE_ITEMS, pickPracticeRound } from "@/lib/data/items";
import type { BinCategory, WasteItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROUND_SIZE = 10;

// Latihan singkat dengan barang dari kamus yang sama. Tiap putaran menampilkan 10 barang
// yang diacak dari seluruh kamus. Pengacakan baru jalan di browser (setelah tampil, atau saat
// tombol ulang ditekan), karena Math.random tidak boleh dipanggil saat prerender. Sebelum itu
// yang tampil hanya penanda memuat. Tidak menyimpan apa pun dan tidak menambah poin.
export function SortGame() {
  const [items, setItems] = useState<WasteItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<BinCategory | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const itemRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    queueMicrotask(() => setItems(pickPracticeRound(ROUND_SIZE)));
  }, []);

  const item = items ? items[index] : null;
  const answered = picked !== null;
  const isRight = item !== null && picked === item.category;
  const isLast = items !== null && index === items.length - 1;

  const choose = (id: BinCategory) => {
    if (answered || !item) return;
    setPicked(id);
    if (id === item.category) setCorrect((n) => n + 1);
  };

  const next = () => {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
    queueMicrotask(() => itemRef.current?.focus());
  };

  const restart = () => {
    setItems(pickPracticeRound(ROUND_SIZE));
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  return (
    <section id="latihan" aria-labelledby="judul-latihan" className="border-b-2 border-ink bg-cobalt-soft">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-latihan" className="text-5xl sm:text-6xl">
            Coba pilah sekarang
          </h2>
          <p className="mt-4 text-lg">
            Satu barang, tiga tong. Pilih tong yang benar. Setiap main, {ROUND_SIZE} barang diacak
            dari {WASTE_ITEMS.length} barang di kamus. Latihan ini tidak menambah poin dan tidak
            perlu login.
          </p>
        </div>

        {!items || !item ? (
          <LoadingState
            label={`Menyiapkan ${ROUND_SIZE} barang acak`}
            className="mt-10 min-h-[24rem] bg-white"
          />
        ) : done ? (
          <div className="mt-10 grid items-center gap-8 rounded-sheet border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8 md:grid-cols-[auto_1fr]">
            <p className="font-display text-[8rem] font-extrabold leading-[0.85] text-cobalt">
              <AnimatedCounter value={correct} />
              <span className="text-5xl text-ink">/{items.length}</span>
            </p>
            <div>
              <h3 className="text-4xl">Latihan selesai</h3>
              <p className="mt-2 text-lg">
                {correct} dari {items.length} barang kamu taruh di tong yang benar. Latihan ini tidak
                menambah poin.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={restart}>
                  Main lagi dengan barang baru
                </Button>
                <Button href="/scan" size="lg" variant="outline">
                  Scan sungguhan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.4fr]">
            <div className="flex min-h-[15rem] flex-col justify-between gap-6 rounded-sheet border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)]">
              <p className="font-display text-3xl font-extrabold text-cobalt">
                Barang {index + 1} dari {items.length}
              </p>
              <p ref={itemRef} tabIndex={-1} className="font-display text-6xl font-extrabold leading-none">
                <span key={index} className="fade-up inline-block">
                  {item.label}
                </span>
              </p>
              <p className="text-muted">Masuk tong yang mana?</p>
            </div>

            <div>
              <ul className="grid grid-cols-3 gap-3">
                {BIN_LIST.map((bin) => {
                  const isAnswer = answered && bin.id === item.category;
                  const isWrongPick = answered && picked === bin.id && bin.id !== item.category;
                  return (
                    <li key={bin.id}>
                      <button
                        type="button"
                        disabled={answered}
                        onClick={() => choose(bin.id)}
                        className={cn(
                          "flex h-full w-full flex-col items-center gap-2 rounded-plate border-2 p-3 text-center",
                          isWrongPick ? "shake border-brick bg-brick-soft" : "border-ink bg-white hover:bg-paper",
                          isAnswer && "ring-4 ring-ink ring-offset-2 ring-offset-cobalt-soft",
                          answered && !isAnswer && !isWrongPick && "opacity-50",
                        )}
                      >
                        <BinArt
                          key={picked === bin.id ? `drop-${index}` : "idle"}
                          id={bin.id}
                          space
                          drop={picked === bin.id ? item.category : undefined}
                          className="w-full max-w-[7.5rem]"
                        />
                        <span className="font-display text-2xl font-extrabold leading-none">
                          {bin.label}
                        </span>
                        <span className="flex min-h-5 items-center gap-1 text-xs font-bold">
                          {isAnswer ? (
                            <>
                              <CheckIcon className="pop size-3.5" />
                              Tong yang benar
                            </>
                          ) : null}
                          {isWrongPick ? (
                            <>
                              <CloseIcon className="pop size-3.5 text-brick" />
                              Pilihanmu
                            </>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div role="status" aria-live="polite" className="mt-4">
                {answered ? (
                  <div
                    className={cn(
                      "fade-up rounded-plate border-2 p-4",
                      isRight
                        ? "border-organik bg-organik-soft"
                        : "border-brick bg-brick-soft text-brick-ink",
                    )}
                  >
                    <p className="font-bold">
                      {isRight ? "Benar." : "Belum tepat."} {item.label} masuk tong{" "}
                      {BINS[item.category].label}.
                    </p>
                    <p className="mt-1 text-sm">{BINS[item.category].tip}</p>
                    <Button className="mt-3" onClick={next}>
                      {isLast ? "Lihat hasil latihan" : "Barang berikutnya"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Pilih salah satu tong di atas.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
