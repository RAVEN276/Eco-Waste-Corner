import { BIN_LIST } from "@/lib/data/bins";
import { WASTE_ITEMS } from "@/lib/data/items";
import { PROMPT_BY_ID, type QuickCheckPrompt } from "@/lib/data/quick-check";
import type { BinCategory, WasteCatalogItem } from "@/lib/types";

export interface StoredWasteItemDoc {
  id: string;
  label: string;
  category: BinCategory;
  question: string;
  choices: [string, string];
  correctIndex: 0 | 1;
  reason: string;
  deleted: boolean;
}

const DEFAULT_ID_SET = new Set(WASTE_ITEMS.map((item) => item.id));

/** Gabungan kamus bawaan (30 barang) dengan soal cek cepat masing-masing. */
export const DEFAULT_WASTE_CATALOG: WasteCatalogItem[] = WASTE_ITEMS.map((item) => {
  const prompt = PROMPT_BY_ID[item.id];
  return {
    ...item,
    question: prompt.question,
    choices: prompt.choices,
    correctIndex: prompt.correctIndex,
    reason: prompt.reason,
    builtIn: true,
    overridden: false,
  };
});

export function isBuiltInWasteItem(id: string): boolean {
  return DEFAULT_ID_SET.has(id);
}

/** Membentuk ID aman untuk dokumen Firestore dari nama barang kamus. */
export function slugifyWasteId(label: string): string {
  const base = label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "barang-sampah";
}

export function isValidCategory(value: unknown): value is BinCategory {
  return BIN_LIST.some((bin) => bin.id === value);
}

/**
 * Menggabungkan kamus bawaan dengan dokumen Firestore `wasteItems`. Dokumen dengan `deleted: true`
 * menyembunyikan barang bawaan dari daftar aktif sambil tetap menjaga riwayat scan lama.
 */
export function mergeWasteCatalog(remote: StoredWasteItemDoc[]): {
  active: WasteCatalogItem[];
  hiddenBuiltIns: WasteCatalogItem[];
} {
  const byId = new Map<string, StoredWasteItemDoc>();
  for (const item of remote) {
    if (item.id) byId.set(item.id, item);
  }

  const active: WasteCatalogItem[] = [];
  const hiddenBuiltIns: WasteCatalogItem[] = [];

  for (const base of DEFAULT_WASTE_CATALOG) {
    const override = byId.get(base.id);
    if (!override) {
      active.push(base);
      continue;
    }
    const merged: WasteCatalogItem = {
      id: base.id,
      label: override.label,
      category: override.category,
      question: override.question,
      choices: override.choices,
      correctIndex: override.correctIndex,
      reason: override.reason,
      builtIn: true,
      overridden: true,
    };
    if (override.deleted) hiddenBuiltIns.push(merged);
    else active.push(merged);
  }

  const customItems = remote
    .filter((doc) => !DEFAULT_ID_SET.has(doc.id) && !doc.deleted)
    .sort((a, b) => a.label.localeCompare(b.label, "id"))
    .map<WasteCatalogItem>((doc) => ({
      id: doc.id,
      label: doc.label,
      category: doc.category,
      question: doc.question,
      choices: doc.choices,
      correctIndex: doc.correctIndex,
      reason: doc.reason,
      builtIn: false,
      overridden: false,
    }));

  return {
    active: [...customItems, ...active],
    hiddenBuiltIns,
  };
}

export function toQuickCheckPrompts(items: WasteCatalogItem[]): QuickCheckPrompt[] {
  return items.map((item) => ({
    itemId: item.id,
    label: item.label,
    category: item.category,
    question: item.question,
    choices: item.choices,
    correctIndex: item.correctIndex,
    reason: item.reason,
  }));
}
