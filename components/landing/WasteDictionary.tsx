"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/States";
import { useWasteCatalog } from "@/hooks/useWasteCatalog";
import { BINS, BIN_LIST } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "semua" | BinCategory;

// Kamus barang: cari nama barang atau saring per tong. Daftar lengkap tampil dulu dari data bawaan,
// lalu tersinkron dengan kamus yang ditambah atau diubah admin.
export function WasteDictionary() {
  const { items } = useWasteCatalog();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

  const needle = query.trim().toLowerCase();
  const results = items.filter(
    (item) =>
      (filter === "semua" || item.category === filter) &&
      (needle === "" || item.label.toLowerCase().includes(needle)),
  );

  return (
    <section
      aria-labelledby="judul-kamus"
      className="bg-paper"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 id="judul-kamus" className="text-4xl sm:text-5xl lg:text-6xl">
            Kamus sampah: masuk tong mana?
          </h2>
          <p className="mt-4 text-lg text-muted">
            {items.length} barang yang sering ditemui di kampus. Ketik nama barangnya, atau
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
          Menampilkan {results.length} dari {items.length} barang.
        </p>

        {results.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Barangnya belum ada di kamus"
            description="Coba kata yang lebih pendek, atau pakai cek cepat kondisi di atas untuk menentukan tongnya."
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
