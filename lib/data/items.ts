import type { WasteItem } from "@/lib/types";

/**
 * Items a student can declare they threw away. The declared item is checked
 * against the bin that was scanned: a mismatch triggers the sorting penalty.
 */
export const WASTE_ITEMS: WasteItem[] = [
  { id: "sisa-makanan", label: "Sisa nasi atau lauk", category: "organik" },
  { id: "kulit-buah", label: "Kulit buah atau sayur", category: "organik" },
  { id: "ampas-kopi", label: "Ampas kopi atau teh", category: "organik" },
  { id: "botol-plastik", label: "Botol plastik kosong", category: "plastik_kertas" },
  { id: "gelas-plastik", label: "Gelas plastik bersih", category: "plastik_kertas" },
  { id: "kardus-kertas", label: "Kardus atau kertas kering", category: "plastik_kertas" },
  { id: "puntung-rokok", label: "Puntung rokok", category: "residu" },
  { id: "masker", label: "Masker sekali pakai", category: "residu" },
  { id: "tisu-bekas", label: "Tisu bekas pakai", category: "residu" },
  { id: "sachet", label: "Bungkus sachet multilayer", category: "residu" },
];

export function findWasteItem(id: string): WasteItem | undefined {
  return WASTE_ITEMS.find((item) => item.id === id);
}
