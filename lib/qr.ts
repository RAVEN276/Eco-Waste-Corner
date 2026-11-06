import { isBinCategory } from "@/lib/data/bins";
import type { BinCategory } from "@/lib/types";

/**
 * Satu QR menyatakan satu tong di satu lokasi (2 lokasi x 3 tong = 6 kode), isinya tautan
 * `https://<domain>/scan?lokasi=spot-a&tong=organik`. `scripts/generate-qr.mjs` menulis format yang sama.
 */
export interface ScanTarget {
  locationId: string;
  category: BinCategory;
}

export const SCAN_PATH = "/scan";
export const QR_PARAM_LOCATION = "lokasi";
export const QR_PARAM_BIN = "tong";

const LOCATION_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** Null jika lokasi atau tong hilang atau tidak sah. */
export function scanTargetFromParams(params: { get(name: string): string | null }): ScanTarget | null {
  const locationId = params.get(QR_PARAM_LOCATION);
  const category = params.get(QR_PARAM_BIN);
  if (!locationId || !LOCATION_ID.test(locationId) || !isBinCategory(category)) return null;
  return { locationId, category };
}

/** Hanya tautan http(s) ke halaman scan yang diterima, apa pun domainnya. */
export function parseQrText(text: string): ScanTarget | null {
  let url: URL;
  try {
    url = new URL(text.trim(), "https://tong.invalid");
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.pathname.replace(/\/+$/, "") !== SCAN_PATH) return null;
  return scanTargetFromParams(url.searchParams);
}

export function buildScanUrl(base: string, target: ScanTarget): string {
  const url = new URL(SCAN_PATH, base);
  url.searchParams.set(QR_PARAM_LOCATION, target.locationId);
  url.searchParams.set(QR_PARAM_BIN, target.category);
  return url.toString();
}
