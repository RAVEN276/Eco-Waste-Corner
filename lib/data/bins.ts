import type { BinCategory } from "@/lib/types";

export interface BinInfo {
  id: BinCategory;
  label: string;
  short: string;
  /** What belongs in this bin. */
  accepts: string[];
  /** Frequent mistakes for this bin. */
  avoid: string[];
  tip: string;
  /** Tailwind classes for the bin's identity color. */
  tone: {
    solid: string;
    soft: string;
    ring: string;
  };
}

export const BINS: Record<BinCategory, BinInfo> = {
  organik: {
    id: "organik",
    label: "Organik",
    short: "Sisa makanan dan bahan alami",
    accepts: ["Sisa nasi dan lauk", "Kulit buah dan sayur", "Ampas kopi dan teh", "Daun dan ranting kering"],
    avoid: ["Plastik pembungkus", "Tisu berminyak", "Puntung rokok"],
    tip: "Buang sisa makanan tanpa kemasan supaya bisa diolah jadi kompos.",
    tone: {
      solid: "bg-leaf-deep text-white",
      soft: "bg-mint text-forest",
      ring: "ring-leaf-deep",
    },
  },
  plastik_kertas: {
    id: "plastik_kertas",
    label: "Plastik / Kertas",
    short: "Bahan yang bisa didaur ulang",
    accepts: ["Botol plastik kosong", "Gelas plastik bersih", "Kardus dan kertas HVS", "Kertas bekas yang kering"],
    avoid: ["Kemasan yang masih berisi minuman", "Kertas berminyak", "Tisu bekas"],
    tip: "Kosongkan dan bilas singkat wadah plastik sebelum dibuang.",
    tone: {
      solid: "bg-sun text-charcoal",
      soft: "bg-sun-soft text-charcoal",
      ring: "ring-sun",
    },
  },
  residu: {
    id: "residu",
    label: "Residu",
    short: "Sampah yang belum bisa diolah",
    accepts: ["Puntung rokok", "Masker sekali pakai", "Tisu bekas pakai", "Kemasan sachet multilayer"],
    avoid: ["Sisa makanan", "Botol plastik bersih", "Kardus kering"],
    tip: "Residu adalah pilihan terakhir. Pilah dulu, sisanya baru ke sini.",
    tone: {
      solid: "bg-charcoal text-white",
      soft: "bg-stone-200 text-charcoal",
      ring: "ring-charcoal",
    },
  },
};

export const BIN_LIST: BinInfo[] = [BINS.organik, BINS.plastik_kertas, BINS.residu];

export function isBinCategory(value: unknown): value is BinCategory {
  return value === "organik" || value === "plastik_kertas" || value === "residu";
}
