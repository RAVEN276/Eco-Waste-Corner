import type { ReactNode } from "react";
import type { BinCategory } from "@/lib/types";

/*
 * Gambar barang buatan sendiri, satu untuk tiap barang di kamus (`WASTE_ITEMS`), digambar di dalam
 * kotak 30 x 38 dengan garis tebal ink dan bidang rata seperti tong. Warna isinya hanya warna tong
 * tempat barang itu seharusnya masuk (hijau, kuning, abu), ditambah putih dan hitam, supaya kode warna
 * tong tetap bermakna. Semua dekoratif; nama barangnya selalu ada sebagai teks di dekatnya.
 * Garis detail di atas isian tetap (putih, kuning) memakai `stroke-night`, karena `ink` menjadi terang di
 * tema gelap dan hilang di atas putih. Di atas isian yang ikut tema (`-soft`) detail memakai `ink`.
 */

const LINE = { strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const THIN = { strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const ON_FIXED = "stroke-night";

const SOLID = {
  white: "fill-white stroke-ink",
  organik: "fill-organik stroke-ink",
  organikSoft: "fill-organik-soft stroke-ink",
  kertas: "fill-kertas stroke-ink",
  kertasSoft: "fill-kertas-soft stroke-ink",
  residu: "fill-residu stroke-ink",
  residuSoft: "fill-residu-soft stroke-ink",
  night: "fill-night stroke-ink",
} as const;

const ART: Record<string, () => ReactNode> = {
  // Organik
  "sisa-makanan": () => (
    <g>
      <path d="M5 21 C5 11 10 6 15 6 C20 6 25 11 25 21 Z" className={SOLID.white} {...LINE} />
      <path d="M10 14 L11 12 M15 11 L16 9 M19 15 L21 14 M13 18 L15 17" className={ON_FIXED} {...THIN} />
      <path d="M2 21 H28 C28 30 23 36 15 36 C7 36 2 30 2 21 Z" className={SOLID.organik} {...LINE} />
    </g>
  ),
  "kulit-buah": () => (
    <g>
      <path d="M4 28 C3 12 14 4 26 5 C27 9 23 12 21 19 C19 27 13 34 4 28 Z" className={SOLID.organikSoft} {...LINE} />
      <path d="M26 5 L28 1" className="stroke-ink" {...LINE} fill="none" />
      <path d="M8 24 C10 15 15 11 22 9" className="stroke-ink" {...THIN} />
      <circle cx="4.5" cy="28" r="2" className="fill-night stroke-ink" strokeWidth="1.5" />
    </g>
  ),
  "ampas-kopi": () => (
    <g>
      <path d="M12 12 C10 6 16 2 21 4" className="stroke-ink" {...THIN} />
      <rect x="20" y="1" width="9" height="9" rx="1.5" className={SOLID.white} strokeWidth="2" />
      <path d="M22.5 5.5 H26.5" className={ON_FIXED} {...THIN} />
      <path d="M5 12 H25 V33 C25 35 24 36 22 36 H8 C6 36 5 35 5 33 Z" className={SOLID.organikSoft} {...LINE} />
      <path d="M5 12 H25 V18 H5 Z" className={SOLID.organik} {...LINE} />
      <rect x="12.5" y="13.5" width="5" height="2.5" rx="1" className="fill-white" />
      <path d="M10 25 H20 M10 30 H16" className="stroke-ink" {...THIN} />
    </g>
  ),
  "daun-kering": () => (
    <g>
      <path d="M7 30 C3 14 12 4 27 4 C28 20 19 31 7 30 Z" className={SOLID.organikSoft} {...LINE} />
      <path d="M7 30 L21 11" className="stroke-ink" {...THIN} />
      <path d="M13 23 L17 25 M16 17 L20 19" className="stroke-ink" {...THIN} />
      <path d="M7 30 L2 36 M4.5 33 L9 35" className="stroke-ink" {...LINE} fill="none" />
    </g>
  ),
  "cangkang-telur": () => (
    <g>
      <path
        d="M4 22 L8 16 L12 22 L16 15 L20 22 L24 16 L26 22 C26 31 21 36 15 36 C9 36 4 31 4 22 Z"
        className={SOLID.white}
        {...LINE}
      />
      <path
        d="M9 12 C9 6 12 2 15 2 C18 2 21 6 21 10 L18 8 L15 11 L12 8 Z"
        className={SOLID.white}
        {...LINE}
        transform="rotate(-22 15 8)"
      />
    </g>
  ),
  "sisa-roti": () => (
    <g>
      <path
        d="M7 13 C2 13 2 4 10 4 H20 C28 4 28 13 23 13 V32 C23 34 22 35 20 35 H10 C8 35 7 34 7 32 Z"
        className={SOLID.organikSoft}
        {...LINE}
      />
      <path d="M11 14.5 C8.5 14.5 8 9.5 11.5 8.5 H18.5 C22 9.5 21.5 14.5 19 14.5 V31 H11 Z" className="stroke-ink" {...THIN} />
      <path d="M23 20 C20 21 20 25 23 26 C20 27 20 31 23 32" className="stroke-ink" {...THIN} />
      <circle cx="14.5" cy="20" r="0.9" className="fill-ink" />
      <circle cx="16.5" cy="25" r="0.9" className="fill-ink" />
      <circle cx="13.5" cy="28" r="0.9" className="fill-ink" />
    </g>
  ),
  "sayur-layu": () => (
    <g>
      <path d="M15 13 C14 7 8 5 4 11 M15 13 C16 6 22 4 27 10 M15 13 C15 9 15 6 15 3" className="stroke-ink" {...LINE} fill="none" />
      <circle cx="4" cy="11" r="2" className="fill-organik stroke-ink" strokeWidth="1.5" />
      <circle cx="27" cy="10" r="2" className="fill-organik stroke-ink" strokeWidth="1.5" />
      <path d="M8 14 C8 12 22 12 22 14 L16.5 36 C16 37 14 37 13.5 36 Z" className={SOLID.organikSoft} {...LINE} />
      <path d="M11 20 H14 M16 25 H19 M13.5 30 H16" className="stroke-ink" {...THIN} />
    </g>
  ),
  "buah-busuk": () => (
    <g>
      <path
        d="M15 11 C10 5 2 8 3 19 C4 29 10 35 15 33 C20 35 26 29 27 19 C28 8 20 5 15 11 Z"
        className={SOLID.organikSoft}
        {...LINE}
      />
      <path d="M15 11 C15 7 17 4 20 3" className="stroke-ink" {...LINE} fill="none" />
      <ellipse cx="19.5" cy="22" rx="4.5" ry="5.5" className={SOLID.night} strokeWidth="1.5" />
      <circle cx="9.5" cy="18" r="2" className="fill-night" />
    </g>
  ),
  "bonggol-buah": () => (
    <g>
      <path
        d="M8 5 C3 5 3 13 9 16 C12 18 12 20 9 22 C3 25 3 34 8 34 H22 C27 34 27 25 21 22 C18 20 18 18 21 16 C27 13 27 5 22 5 Z"
        className={SOLID.white}
        {...LINE}
      />
      <path d="M15 5 V1" className="stroke-ink" {...LINE} fill="none" />
      <ellipse cx="11.5" cy="10" rx="1.4" ry="2.4" className="fill-night" />
      <ellipse cx="18.5" cy="10" rx="1.4" ry="2.4" className="fill-night" />
      <ellipse cx="11.5" cy="29" rx="1.4" ry="2.4" className="fill-night" />
      <ellipse cx="18.5" cy="29" rx="1.4" ry="2.4" className="fill-night" />
    </g>
  ),
  "rumput-bunga": () => (
    <g>
      <path d="M3 36 C4 31 6 29 9 28 M21 36 C20 32 18 30 15 29" className="stroke-ink" {...LINE} fill="none" />
      <path d="M11 36 C11 28 12 19 20 14" className="stroke-ink" {...LINE} fill="none" />
      <circle cx="22" cy="7" r="3.6" className={SOLID.white} strokeWidth="2" />
      <circle cx="27" cy="12" r="3.6" className={SOLID.white} strokeWidth="2" />
      <circle cx="24" cy="18" r="3.6" className={SOLID.white} strokeWidth="2" />
      <circle cx="17.5" cy="17" r="3.6" className={SOLID.white} strokeWidth="2" />
      <circle cx="17" cy="10" r="3.6" className={SOLID.white} strokeWidth="2" />
      <circle cx="22" cy="12.5" r="3.2" className={SOLID.organik} strokeWidth="2" />
    </g>
  ),

  // Plastik / Kertas
  "botol-plastik": () => <Bottle />,
  "gelas-plastik": () => (
    <g>
      <path d="M4 9 H26 L23 35 C23 36 22 37 21 37 H9 C8 37 7 36 7 35 Z" className={SOLID.white} {...LINE} />
      <rect x="2" y="5" width="26" height="5" rx="2" className={SOLID.kertas} {...LINE} />
      <path d="M6 22 C10 19 14 25 18 22 C20 21 22 21 24 22" className={ON_FIXED} {...THIN} />
      <path d="M18 5 L22 0" className="stroke-ink" {...LINE} fill="none" />
    </g>
  ),
  "kardus-kertas": () => (
    <g>
      <path d="M3 12 H27 V35 H3 Z" className={SOLID.kertasSoft} {...LINE} />
      <path d="M3 12 L7 5 H23 L27 12 Z" className={SOLID.kertasSoft} {...LINE} />
      <rect x="12" y="5" width="6" height="14" className={SOLID.kertas} strokeWidth="2" />
      <rect x="9" y="25" width="12" height="4" rx="2" className={SOLID.white} strokeWidth="2" />
    </g>
  ),
  "kertas-hvs": () => (
    <g>
      <path d="M5 3 H20 L26 9 V35 H5 Z" className={SOLID.white} {...LINE} />
      <path d="M20 3 V9 H26" className={ON_FIXED} {...THIN} />
      <path d="M10 16 H21 M10 21 H21 M10 26 H16" className={ON_FIXED} {...THIN} />
    </g>
  ),
  "koran-majalah": () => (
    <g>
      <path d="M2 9 L15 6 V32 L2 35 Z" className={SOLID.white} {...LINE} />
      <path d="M15 6 L28 9 V35 L15 32 Z" className={SOLID.white} {...LINE} />
      <path d="M4.5 12.5 L12.5 10.8 V16.5 L4.5 18.2 Z" className={SOLID.kertas} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 22 L12.5 20.3 M4.5 26 L12.5 24.3 M4.5 30 L12.5 28.3" className={ON_FIXED} {...THIN} />
      <path d="M17.5 11 L25.5 12.7 M17.5 15 L25.5 16.7" className={ON_FIXED} {...THIN} />
      <path d="M17.5 20 L25.5 21.7 V27.5 L17.5 25.8 Z" className={SOLID.kertasSoft} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17.5 30 L25.5 31.7" className={ON_FIXED} {...THIN} />
    </g>
  ),
  "buku-bekas": () => (
    <g>
      <path d="M8 4 H26 V35 H8 Z" className={SOLID.kertas} {...LINE} />
      <rect x="13" y="10" width="10" height="8" className={SOLID.white} strokeWidth="2" />
      <path d="M3 8 H12 M3 15 H12 M3 22 H12 M3 29 H12" className="stroke-ink" {...LINE} fill="none" />
    </g>
  ),
  "tutup-botol": () => (
    <g>
      <path d="M3 14 H27 V27 C27 29 26 30 24 30 H6 C4 30 3 29 3 27 Z" className={SOLID.kertas} {...LINE} />
      <ellipse cx="15" cy="14" rx="12" ry="4.5" className={SOLID.kertas} {...LINE} />
      <path d="M3 24 H27" className={ON_FIXED} {...THIN} />
      <path d="M7 18.5 V22.5 M11 19.3 V22.8 M15 19.5 V22.8 M19 19.3 V22.8 M23 18.5 V22.5" className={ON_FIXED} {...THIN} />
    </g>
  ),
  "wadah-plastik": () => (
    <g>
      <path d="M5 17 H25 L22 34 C22 35 21 36 20 36 H10 C9 36 8 35 8 34 Z" className={SOLID.white} {...LINE} />
      <rect x="2" y="10" width="26" height="8" rx="2" className={SOLID.kertas} {...LINE} />
      <rect x="12" y="12.5" width="6" height="3" rx="1.5" className={SOLID.white} strokeWidth="1.5" />
      <path d="M11 24 L12 30 M18 24 L17 30" className={ON_FIXED} {...THIN} />
    </g>
  ),
  "tas-kertas": () => (
    <g>
      <path d="M5 13 H25 V35 H5 Z" className={SOLID.kertasSoft} {...LINE} />
      <path d="M5 13 L8 9 H22 L25 13 Z" className={SOLID.kertasSoft} {...LINE} />
      <path d="M11 9 C11 1 19 1 19 9" className="stroke-ink" {...LINE} fill="none" />
      <rect x="10" y="19" width="10" height="9" className={SOLID.white} strokeWidth="2" />
    </g>
  ),
  brosur: () => (
    <g>
      <path d="M2 8 L11 5 V33 L2 36 Z" className={SOLID.white} {...LINE} />
      <path d="M11 5 L19 8 V36 L11 33 Z" className={SOLID.kertasSoft} {...LINE} />
      <path d="M19 8 L28 5 V33 L19 36 Z" className={SOLID.white} {...LINE} />
      <path d="M13 15 L17 16.5 M13 20 L17 21.5 M13 25 L17 26.5" className="stroke-ink" {...THIN} />
    </g>
  ),

  // Residu
  "puntung-rokok": () => (
    <g>
      <path d="M14 7 C11 5 17 3 14 0" className="stroke-ink" {...THIN} />
      <rect x="10" y="14" width="10" height="22" rx="1.5" className={SOLID.white} {...LINE} />
      <path d="M10 26 H20 V34 C20 35.5 19 36 18 36 H12 C11 36 10 35.5 10 34 Z" className={SOLID.residuSoft} {...LINE} />
      <path d="M10 14 L12 10 L14 13 L16 9 L18 13 L20 11 L20 14 Z" className={SOLID.night} {...LINE} />
    </g>
  ),
  masker: () => <Mask />,
  "tisu-bekas": () => (
    <g>
      <path
        d="M8 12 C8 7 14 5 17 8 C20 4 27 8 25 13 C29 16 28 22 24 24 C26 29 21 34 16 32 C13 36 5 33 7 27 C2 24 3 17 8 15 C6 14 7 13 8 12 Z"
        className={SOLID.white}
        {...LINE}
      />
      <path d="M9 13 C14 15 15 21 13 26 M17 9 C18 15 22 17 26 18 M15 31 C18 28 21 29 23 31" className={ON_FIXED} {...THIN} />
    </g>
  ),
  sachet: () => (
    <g>
      <path
        d="M3 6 L6 3 L9 6 L12 3 L15 6 L18 3 L21 6 L24 3 L27 6 V32 L24 35 L21 32 L18 35 L15 32 L12 35 L9 32 L6 35 L3 32 Z"
        className={SOLID.residuSoft}
        {...LINE}
      />
      <path d="M3 14 H27 V24 H3 Z" className={SOLID.white} strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 9 L23 10" className="stroke-ink" {...THIN} />
    </g>
  ),
  "bungkus-snack": () => (
    <g>
      <path
        d="M4 6 L7 3 L10 6 L13 3 L16 6 L19 3 L22 6 L26 3 C29 13 29 24 26 33 L22 36 L19 33 L16 36 L13 33 L10 36 L7 33 L4 36 C1 24 1 13 4 6 Z"
        className={SOLID.residuSoft}
        {...LINE}
      />
      <circle cx="15" cy="19.5" r="7" className={SOLID.white} strokeWidth="2" />
      <path d="M10.5 21.5 L12.5 17.5 L15 22 L17.5 16.5 L19.5 21" className={ON_FIXED} {...THIN} />
    </g>
  ),
  styrofoam: () => (
    <g>
      <path d="M3 19 H27 V31 C27 33 26 34 24 34 H6 C4 34 3 33 3 31 Z" className={SOLID.white} {...LINE} />
      <path d="M3 19 L5 9 C5 8 6 7 7 7 H23 C24 7 25 8 25 9 L27 19 Z" className={SOLID.white} {...LINE} />
      <rect x="12.5" y="17.5" width="5" height="4.5" className={SOLID.residu} strokeWidth="1.5" />
      <circle cx="8.5" cy="26" r="1.2" className="fill-residu" />
      <circle cx="21.5" cy="27" r="1.2" className="fill-residu" />
      <circle cx="15" cy="29.5" r="1.2" className="fill-residu" />
    </g>
  ),
  "kertas-berminyak": () => (
    <g>
      <path d="M5 3 H20 L26 9 V35 H5 Z" className={SOLID.white} {...LINE} />
      <path d="M20 3 V9 H26" className={ON_FIXED} {...THIN} />
      <path
        d="M9 20 C8 14 16 12 19 16 C23 19 21 27 16 29 C11 31 9.5 26 9 20 Z"
        className={SOLID.residu}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  ),
  "permen-karet": () => (
    <g>
      <path
        d="M6 20 C4 12 10 6 17 8 C24 6 28 14 25 20 C27 27 21 31 15 30 C9 33 4 27 6 20 Z"
        className={SOLID.residuSoft}
        {...LINE}
      />
      <path d="M10 15 C11 12 13 11 15 11" className="stroke-ink" {...THIN} />
      <path d="M22 29 C26 31 27 35 23 37" className="stroke-ink" {...LINE} fill="none" />
    </g>
  ),
  "sarung-tangan": () => (
    <g>
      <rect x="6.5" y="11" width="4.5" height="14" rx="2.2" className={SOLID.white} strokeWidth="2" />
      <rect x="11" y="6" width="4.5" height="19" rx="2.2" className={SOLID.white} strokeWidth="2" />
      <rect x="15.5" y="3" width="4.5" height="22" rx="2.2" className={SOLID.white} strokeWidth="2" />
      <rect x="20" y="7" width="4.5" height="18" rx="2.2" className={SOLID.white} strokeWidth="2" />
      <rect x="24" y="17" width="4.5" height="11" rx="2.2" className={SOLID.white} strokeWidth="2" transform="rotate(-28 26 22)" />
      <path d="M6.5 22 H24.5 V29 H6.5 Z" className={SOLID.white} strokeWidth="2" strokeLinejoin="round" />
      <rect x="6" y="29" width="19" height="7" rx="1.5" className={SOLID.residuSoft} {...LINE} />
    </g>
  ),
  "tisu-basah": () => (
    <g>
      <path d="M9 9 C9 3 13 1 15 4 C17 1 21 3 21 9 Z" className={SOLID.white} {...LINE} strokeWidth="2" />
      <rect x="4" y="9" width="22" height="26" rx="3" className={SOLID.residuSoft} {...LINE} />
      <rect x="4" y="9" width="22" height="7" rx="2.5" className={SOLID.white} {...LINE} />
      <path
        d="M15 20 C15 20 11 25 11 27.5 C11 29.7 12.8 31 15 31 C17.2 31 19 29.7 19 27.5 C19 25 15 20 15 20 Z"
        className={SOLID.white}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  ),
};

function Bottle() {
  return (
    <g>
      <path
        d="M10 6 H18 V10 C23 13 24 16 24 21 V34 C24 36 22 38 20 38 H8 C6 38 4 36 4 34 V21 C4 16 5 13 10 10 Z"
        className="fill-white stroke-ink"
        {...LINE}
      />
      <rect x="9" y="0" width="10" height="6" rx="1.5" className="fill-kertas stroke-ink" {...LINE} />
      <rect x="4" y="24" width="20" height="8" className="fill-kertas stroke-ink" strokeWidth="2" />
    </g>
  );
}

function Mask() {
  return (
    <g>
      <rect x="3" y="8" width="26" height="18" rx="5" className="fill-white stroke-ink" {...LINE} />
      <path d="M8 14 H24 M8 18 H24 M8 22 H24" className={ON_FIXED} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12 C-4 12 -4 22 3 22 M29 12 C36 12 36 22 29 22" className="stroke-ink" fill="none" {...LINE} />
    </g>
  );
}

/** Pengganti bila sebuah barang belum punya gambar khusus: satu gambar per kategori. */
function CategoryArt({ id }: { id: BinCategory }) {
  if (id === "organik") {
    return (
      <g>
        <path
          d="M14 6 C6 6 3 11 6 16 C8 18 9 19 9 20 C9 21 8 22 6 24 C3 29 6 34 14 34 C22 34 25 29 22 24 C20 22 19 21 19 20 C19 19 20 18 22 16 C25 11 22 6 14 6 Z"
          className="fill-organik-soft stroke-ink"
          {...LINE}
        />
        <path d="M14 6 V1" className="stroke-ink" {...LINE} />
      </g>
    );
  }
  return id === "plastik_kertas" ? <Bottle /> : <Mask />;
}

/** Barang yang masuk ke tong, digambar di atas titik (0, 0). `item` memilih gambar khusus barang itu. */
export function ItemGraphic({ category, item }: { category: BinCategory; item?: string }) {
  const draw = item ? ART[item] : undefined;
  return draw ? <>{draw()}</> : <CategoryArt id={category} />;
}

/** Id barang yang punya gambar khusus. */
export const ITEM_ART_IDS = Object.keys(ART);
