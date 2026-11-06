"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/States";
import { BINS, BIN_LIST } from "@/lib/data/bins";
import { WASTE_ITEMS } from "@/lib/data/items";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "semua" | BinCategory;

// Kamus barang: cari nama barang atau saring per tong. Daftar lengkap tampil dulu (tanpa JS pun
// terbaca), jadi pencarian hanya menyempitkan. Warna tong hanya penanda tambahan, nama tong tertulis.
export function WasteDictionary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

  const needle = query.trim().toLowerCase();
  const results = WASTE_ITEMS.filter(
    (item) =>
      (filter === "semua" || item.category === filter) &&
      (needle === "" || item.label.toLowerCase().includes(needle)),
  );

  return (
    <section
      aria-labelledby="judul-kamus"
      className="border-y-2 border-line bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-kamus" className="text-5xl sm:text-6xl">
            Kamus sampah: masuk tong mana?
          </h2>
          <p className="mt-4 text-lg text-muted">
            {WASTE_ITEMS.length} barang yang sering ditemui di kampus. Ketik nama barangnya, atau
            saring berdasarkan tong.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label htmlFor="cari-barang" className="text-sm font-bold">
              Cari barang
            </label>
            <input
              id="cari-barang"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: tisu, kardus, kopi"
              autoComplete="off"
              className="mt-1 min-h-12 w-full rounded-ctl border-2 border-edge bg-surface px-4 text-base"
            />
          </div>

          <div role="group" aria-label="Saring per tong" className="flex flex-wrap gap-2">
            {[{ id: "semua" as const, label: "Semua" }, ...BIN_LIST].map((option) => {
              const selected = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-ctl border-2 px-4 text-sm font-bold transition-colors duration-150",
                    selected
                      ? "border-pick bg-pick text-on-pick"
                      : "border-edge bg-surface hover:bg-cobalt-soft",
                  )}
                >
                  {option.id !== "semua" ? (
                    <span
                      aria-hidden="true"
                      className={cn("size-3 shrink-0 border border-on-pick", BINS[option.id].tone.solid)}
                    />
                  ) : null}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <p role="status" aria-live="polite" className="mt-5 text-sm text-muted">
          Menampilkan {results.length} dari {WASTE_ITEMS.length} barang.
        </p>

        {results.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Barangnya belum ada di kamus"
            description="Coba kata yang lebih pendek, atau pakai tiga pertanyaan di atas untuk menentukan tongnya."
          />
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <li
                key={item.id}
                className="flex items-stretch overflow-hidden rounded-ctl border-2 border-line bg-surface"
              >
                <span
                  aria-hidden="true"
                  className={cn("w-3 shrink-0", BINS[item.category].tone.solid)}
                />
                <span className="px-3 py-2.5">
                  <span className="block font-bold">{item.label}</span>
                  <span className="block text-sm text-muted">
                    Tong {BINS[item.category].label}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
