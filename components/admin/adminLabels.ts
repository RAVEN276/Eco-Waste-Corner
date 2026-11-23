import { BINS } from "@/lib/data/bins";
import { findWasteItem } from "@/lib/data/items";
import { PENALTY_LABEL } from "@/lib/scoring";
import type { BinCategory, ScanRecord, ScanStatus, UserProfile } from "@/lib/types";

export const STATUS_LABEL: Record<ScanStatus, string> = {
  verified: "Lolos pemeriksaan otomatis",
  unverified: "Tanpa foto bukti",
  penalized: "Penalti",
};

export function penaltyText(scan: ScanRecord): string | null {
  return scan.penaltyReason ? PENALTY_LABEL[scan.penaltyReason] : null;
}

export function userName(scan: ScanRecord, users: Map<string, UserProfile>): string {
  const user = users.get(scan.userId);
  return user?.nama.trim() || user?.email || "Pengguna tanpa nama";
}

/** Hal-hal yang diturunkan dari data scan, supaya daftar dan detail membacanya dengan cara yang sama. */
export interface ScanFacts {
  itemLabel: string;
  /** Tong yang seharusnya menerima barang itu, atau null bila barangnya tidak dikenali. */
  expectedBin: BinCategory | null;
  /** Apakah tong yang dipakai sama dengan tong yang seharusnya. Null bila barangnya tidak dikenali. */
  binMatches: boolean | null;
  /** Ada foto yang tersimpan untuk scan ini. */
  hasStoredPhoto: boolean;
  /** Foto dikirim tetapi tidak disimpan lagi karena sama dengan foto scan sebelumnya. */
  duplicatePhoto: boolean;
  /** Scan awal yang menyimpan foto yang sama, bila masih ada di data yang dimuat. */
  originalScan: ScanRecord | null;
}

export function scanFacts(scan: ScanRecord, all: ScanRecord[]): ScanFacts {
  const item = findWasteItem(scan.itemType);
  const hasStoredPhoto = scan.photoUrl !== "";
  const duplicatePhoto = !hasStoredPhoto && scan.photoHash !== "";
  const originalScan = duplicatePhoto
    ? (all.find((s) => s.scanId !== scan.scanId && s.photoHash === scan.photoHash && s.photoUrl !== "") ?? null)
    : null;
  return {
    itemLabel: item?.label ?? "Barang tidak dikenali",
    expectedBin: item?.category ?? null,
    binMatches: item ? item.category === scan.categoryBin : null,
    hasStoredPhoto,
    duplicatePhoto,
    originalScan,
  };
}

export function binLabel(bin: BinCategory): string {
  return BINS[bin]?.label ?? bin;
}

export type ReviewFilter = "pending" | "approved" | "rejected" | "all";

export function reviewState(scan: ScanRecord): "pending" | "approved" | "rejected" {
  return scan.review ? scan.review.status : "pending";
}
