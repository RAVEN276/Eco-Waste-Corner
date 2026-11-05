"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Leaf, Recycle, Trash2, X } from "lucide-react";
import { BIN_LIST, type BinInfo } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<BinCategory, typeof Leaf> = {
  organik: Leaf,
  plastik_kertas: Recycle,
  residu: Trash2,
};

function Panel({ bin, active, onSelect }: { bin: BinInfo; active: boolean; onSelect: () => void }) {
  const Icon = ICONS[bin.id];
  const panelId = `panel-${bin.id}`;
  return (
    <motion.article
      layout
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "overflow-hidden rounded-2xl",
        bin.tone.solid,
        active ? "md:flex-[2.4]" : "md:flex-1",
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={active}
          aria-controls={panelId}
          onClick={onSelect}
          className="flex min-h-20 w-full items-center gap-4 p-5 text-left sm:p-6"
        >
          <Icon aria-hidden="true" className="size-9 shrink-0" strokeWidth={1.75} />
          <span className="flex-1">
            <span className="block text-xl font-bold sm:text-2xl">{bin.label}</span>
            <span className="mt-0.5 block text-sm opacity-90">{bin.short}</span>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-label={`Panduan ${bin.label}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="space-y-5 px-5 pb-6 sm:px-6">
              <div>
                <p className="text-sm font-bold">Masukkan ke sini</p>
                <ul className="mt-2 space-y-1.5">
                  {bin.accepts.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold">Jangan dimasukkan</p>
                <ul className="mt-2 space-y-1.5">
                  {bin.avoid.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="rounded-lg bg-black/10 px-3 py-2 text-sm">{bin.tip}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export function WasteCategories() {
  const [active, setActive] = useState<BinCategory>("organik");

  return (
    <section id="edukasi" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24" aria-labelledby="judul-edukasi">
      <div className="max-w-2xl">
        <h2 id="judul-edukasi" className="text-3xl font-bold text-forest sm:text-4xl">
          Tiga slot, satu aturan: pilah dari awal
        </h2>
        <p className="mt-3 text-lg text-muted">
          Ketuk sebuah slot untuk melihat jenis sampah yang benar dan kesalahan yang paling sering terjadi.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-start">
        {BIN_LIST.map((bin) => (
          <Panel key={bin.id} bin={bin} active={active === bin.id} onSelect={() => setActive(bin.id)} />
        ))}
      </div>
    </section>
  );
}
