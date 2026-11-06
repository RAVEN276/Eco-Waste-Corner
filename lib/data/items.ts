import type { BinCategory, Rejection, WasteItem } from "@/lib/types";

/**
 * Every item the app knows: the dictionary on the landing page and the sorting
 * practice draw from this list. Ids are stored in scan history, so never rename
 * or remove one. Items are listed by bin, ten for each.
 */
export const WASTE_ITEMS: WasteItem[] = [
  { id: "sisa-makanan", label: "Sisa nasi atau lauk", category: "organik" },
  { id: "kulit-buah", label: "Kulit buah atau sayur", category: "organik" },
  { id: "ampas-kopi", label: "Ampas kopi atau teh", category: "organik" },
  { id: "daun-kering", label: "Daun dan ranting kering", category: "organik" },
  { id: "cangkang-telur", label: "Cangkang telur", category: "organik" },
  { id: "sisa-roti", label: "Sisa roti atau kue", category: "organik" },
  { id: "sayur-layu", label: "Sayur yang sudah layu", category: "organik" },
  { id: "buah-busuk", label: "Buah yang sudah busuk", category: "organik" },
  { id: "bonggol-buah", label: "Bonggol atau biji buah", category: "organik" },
  { id: "rumput-bunga", label: "Rumput atau bunga layu", category: "organik" },

  { id: "botol-plastik", label: "Botol plastik kosong", category: "plastik_kertas" },
  { id: "gelas-plastik", label: "Gelas plastik bersih", category: "plastik_kertas" },
  { id: "kardus-kertas", label: "Kardus atau kertas kering", category: "plastik_kertas" },
  { id: "kertas-hvs", label: "Kertas HVS bekas", category: "plastik_kertas" },
  { id: "koran-majalah", label: "Koran atau majalah bekas", category: "plastik_kertas" },
  { id: "buku-bekas", label: "Buku tulis bekas", category: "plastik_kertas" },
  { id: "tutup-botol", label: "Tutup botol plastik", category: "plastik_kertas" },
  { id: "wadah-plastik", label: "Wadah plastik bersih", category: "plastik_kertas" },
  { id: "tas-kertas", label: "Tas atau amplop kertas", category: "plastik_kertas" },
  { id: "brosur", label: "Brosur atau flyer bekas", category: "plastik_kertas" },

  { id: "puntung-rokok", label: "Puntung rokok", category: "residu" },
  { id: "masker", label: "Masker sekali pakai", category: "residu" },
  { id: "tisu-bekas", label: "Tisu bekas pakai", category: "residu" },
  { id: "sachet", label: "Bungkus sachet multilayer", category: "residu" },
  { id: "bungkus-snack", label: "Bungkus snack atau mi instan", category: "residu" },
  { id: "styrofoam", label: "Styrofoam bekas makanan", category: "residu" },
  { id: "kertas-berminyak", label: "Kertas atau kardus berminyak", category: "residu" },
  { id: "permen-karet", label: "Permen karet", category: "residu" },
  { id: "sarung-tangan", label: "Sarung tangan sekali pakai", category: "residu" },
  { id: "tisu-basah", label: "Tisu basah", category: "residu" },
];

/**
 * The shorter list offered in the scan form (ten items, the same ones the form
 * always had). The declared item is checked against the bin that was scanned: a
 * mismatch triggers the sorting penalty. A longer list would make the form long.
 */
const SCAN_ITEM_IDS = [
  "sisa-makanan",
  "kulit-buah",
  "ampas-kopi",
  "botol-plastik",
  "gelas-plastik",
  "kardus-kertas",
  "puntung-rokok",
  "masker",
  "tisu-bekas",
  "sachet",
];

export const SCAN_ITEMS: WasteItem[] = WASTE_ITEMS.filter((item) => SCAN_ITEM_IDS.includes(item.id));

export function findWasteItem(id: string): WasteItem | undefined {
  return WASTE_ITEMS.find((item) => item.id === id);
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks the side and landing angle for an item rejected by the wrong bin. Given the previous side,
 * it switches sides three times out of four, so a coin flip cannot repeat one side for long.
 * Uses Math.random, so call it only from an event handler, never in render.
 */
export function pickRejection(previous?: Rejection["arah"]): Rejection {
  const flip = Math.random() < 0.75;
  const arah = previous === undefined ? (Math.random() < 0.5 ? -1 : 1) : flip ? (previous === 1 ? -1 : 1) : previous;
  return { arah, putar: 64 + Math.floor(Math.random() * 36) };
}

/**
 * Picks `size` random items for one round of the sorting practice, spread over the
 * three bins (the extra one goes to a random bin), then shuffles the order. Uses
 * Math.random, so call it only from an effect or an event handler, never in render.
 */
export function pickPracticeRound(size = 10): WasteItem[] {
  const bins: BinCategory[] = ["organik", "plastik_kertas", "residu"];
  const perBin = Math.floor(size / bins.length);
  const extra = size - perBin * bins.length;
  const extraBins = new Set(shuffle(bins).slice(0, extra));

  const picked = bins.flatMap((bin) =>
    shuffle(WASTE_ITEMS.filter((item) => item.category === bin)).slice(
      0,
      perBin + (extraBins.has(bin) ? 1 : 0),
    ),
  );
  return shuffle(picked);
}
