"use client";

import { useEffect, useState } from "react";
import { BinArt } from "@/components/art/BinArt";
import { ItemGraphic } from "@/components/art/ItemArt";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon, RefreshIcon } from "@/components/ui/Icons";
import { LoadingState } from "@/components/ui/States";
import { useWasteCatalog } from "@/hooks/useWasteCatalog";
import { BINS } from "@/lib/data/bins";
import { toQuickCheckPrompts } from "@/lib/data/catalog";
import {
  QUICK_CHECK_ROUND_SIZE,
  pickQuickCheckRound,
  type QuickCheckPrompt,
} from "@/lib/data/quick-check";
import { cn } from "@/lib/utils";

// Pengecek kondisi mengambil 3 soal acak dari kamus aktif (termasuk barang baru dari admin).
// Pengacakan baru jalan di useEffect atau tombol acak ulang karena Cache Components melarang Math.random saat render.
export function SortSteps() {
  const { items, status, fetchLatest } = useWasteCatalog();
  const [deck, setDeck] = useState<QuickCheckPrompt[] | null>(null);
  const [index, setIndex] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<0 | 1 | null>(null);

  useEffect(() => {
    if (status === "loading" || deck !== null) return;
    const pool = toQuickCheckPrompts(items);
    queueMicrotask(() => setDeck(pickQuickCheckRound([], QUICK_CHECK_ROUND_SIZE, pool)));
  }, [status, items, deck]);

  const prompt = deck ? deck[index] : null;
  const answered = pickedIndex !== null;
  const isCorrect = prompt !== null && pickedIndex === prompt.correctIndex;
  const isLastInRound = deck !== null && index + 1 >= deck.length;

  const dealNewRound = async () => {
    const currentIds = deck ? deck.map((item) => item.itemId) : [];
    const latest = await fetchLatest();
    const pool = toQuickCheckPrompts(latest);
    setDeck(pickQuickCheckRound(currentIds, QUICK_CHECK_ROUND_SIZE, pool));
    setIndex(0);
    setPickedIndex(null);
  };

  const nextPrompt = () => {
    if (!deck) return;
    if (index + 1 >= deck.length) {
      void dealNewRound();
    } else {
      setIndex((n) => n + 1);
      setPickedIndex(null);
    }
  };

  return (
    <section aria-labelledby="judul-cek-kondisi" className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-cek-kondisi" className="text-4xl sm:text-5xl lg:text-6xl">
            Cek cepat kondisi sampah
          </h2>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
            Tiap sesi mengambil {QUICK_CHECK_ROUND_SIZE} soal acak dari {items.length} barang kamus. Pilih
            jawaban paling tepat untuk melihat tong dan alasannya.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          {!prompt || !deck ? (
            <LoadingState
              label={`Menyiapkan ${QUICK_CHECK_ROUND_SIZE} soal acak dari kamus`}
              className="min-h-[18rem] bg-surface"
            />
          ) : (
            <div
              aria-live="polite"
              className="mx-auto max-w-4xl rounded-sheet border-2 border-line bg-surface p-4 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-rule pb-3">
                <p className="font-display text-2xl font-extrabold leading-none text-link sm:text-3xl">
                  Soal {index + 1} dari {deck.length}
                </p>
                <button
                  type="button"
                  onClick={() => void dealNewRound()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-ctl px-2.5 text-sm font-bold text-link hover:bg-cobalt-soft"
                >
                  <RefreshIcon className="size-4 shrink-0" />
                  Acak ulang
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-bold text-muted sm:text-sm">Contoh barang</p>
                  <h3 className="mt-1 break-words text-3xl text-ink sm:text-4xl">{prompt.label}</h3>
                  <p className="mt-2.5 text-base leading-relaxed text-ink sm:text-lg">{prompt.question}</p>
                </div>

                {!answered ? (
                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    {prompt.choices.map((choice, choiceIndex) => (
                      <Button
                        key={choice}
                        size="lg"
                        variant={choiceIndex === 0 ? "primary" : "outline"}
                        onClick={() => setPickedIndex(choiceIndex as 0 | 1)}
                        className="w-full"
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "fade-up flex items-start gap-2.5 rounded-ctl border-2 p-3.5 text-sm font-bold sm:p-4 sm:text-base",
                        isCorrect
                          ? "border-organik bg-organik-soft text-ink"
                          : "border-brick-text bg-brick-soft text-brick-ink",
                      )}
                    >
                      {isCorrect ? (
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-organik" />
                      ) : (
                        <CloseIcon className="mt-0.5 size-5 shrink-0 text-brick-text" />
                      )}
                      <div>
                        <p>{isCorrect ? "Benar." : `Kurang tepat. Jawaban yang tepat: "${prompt.choices[prompt.correctIndex]}".`}</p>
                        <p className="mt-1 font-normal text-ink">{prompt.reason}</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-plate border-2 border-line p-4 sm:p-5",
                        BINS[prompt.category].tone.solid,
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <BinArt id={prompt.category} className="w-14 shrink-0 sm:w-16" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold sm:text-sm">Masuk ke tong</p>
                          <p className="mt-0.5 font-display text-3xl font-extrabold leading-none sm:text-4xl">
                            {BINS[prompt.category].label}
                          </p>
                        </div>
                      </div>
                      {/* Gambar barang baru tampil setelah dijawab supaya warnanya tidak membocorkan tong yang benar. */}
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-ctl border-2 border-line bg-surface p-1.5 sm:size-14">
                        <svg viewBox="-2 -2 34 42" className="size-full" aria-hidden="true">
                          <ItemGraphic category={prompt.category} item={prompt.itemId} />
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                      <Button size="lg" onClick={nextPrompt} className="w-full sm:w-auto">
                        {isLastInRound ? "Acak 3 soal baru" : "Soal berikutnya"}
                      </Button>
                      <a
                        href="#judul-kamus"
                        className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-bold text-link underline decoration-2 underline-offset-4 hover:text-ink sm:justify-start"
                      >
                        Cari barang lain di kamus
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
