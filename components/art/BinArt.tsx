import type { CSSProperties, ReactNode } from "react";
import type { BinCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/*
 * Ilustrasi tong buatan sendiri, bukan ilustrasi stok. Gambar ini langsung menunjukkan
 * produknya: tiga tong dengan kode warna yang sama seperti di seluruh aplikasi, masing-masing
 * menerima satu jenis barang. Garis tebal ink dan bidang warna rata mengikuti nada papan penanda.
 * Semua dekoratif (aria-hidden); informasinya selalu ada juga sebagai teks di dekatnya.
 */

const BODY_FILL: Record<BinCategory, string> = {
  organik: "fill-organik",
  plastik_kertas: "fill-kertas",
  residu: "fill-residu",
};

function delay(seconds: number): CSSProperties {
  return {
    ["--delay" as string]: `${seconds}s`,
    transformBox: "fill-box",
    transformOrigin: "center",
  };
}

function Glyph({ id }: { id: BinCategory }) {
  if (id === "organik") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M50 113 C50 95 62 87 75 87 C75 101 67 113 50 113 Z"
          className="fill-organik stroke-ink"
          strokeWidth="2.5"
        />
        <path d="M52 111 L67 95" className="stroke-ink" strokeWidth="2" />
      </g>
    );
  }
  if (id === "plastik_kertas") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M48 88 H64 L72 96 V114 H48 Z"
          className="fill-kertas-soft stroke-ink"
          strokeWidth="2.5"
        />
        <path d="M64 88 V96 H72" className="stroke-ink" strokeWidth="2" fill="none" />
        <path d="M53 104 H67 M53 109 H67" className="stroke-ink" strokeWidth="2" />
      </g>
    );
  }
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M48 92 L51 89 L54 92 L57 89 L60 92 L63 89 L66 92 L69 89 L72 92 V110 L69 113 L66 110 L63 113 L60 110 L57 113 L54 110 L51 113 L48 110 Z"
        className="fill-residu-soft stroke-ink"
        strokeWidth="2.5"
      />
      <path d="M54 101 H66" className="stroke-ink" strokeWidth="2" />
    </g>
  );
}

/** Tong dalam kotak 120 lebar, dari y=34 (tutup) sampai y=151 (roda). */
function BinGraphic({ id, bumpAt }: { id: BinCategory; bumpAt?: number }) {
  return (
    <g className={bumpAt !== undefined ? "bump" : undefined} style={bumpAt !== undefined ? delay(bumpAt) : undefined}>
      <path
        d="M16 52 H104 L99 138 Q98.5 144 92 144 H28 Q21.5 144 21 138 Z"
        className={cn(BODY_FILL[id], "stroke-ink")}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M31 62 L35 128"
        className="stroke-white"
        strokeOpacity="0.32"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="38" y="76" width="44" height="46" rx="4" className="fill-white stroke-ink" strokeWidth="2.5" />
      <Glyph id={id} />
      <rect x="10" y="34" width="100" height="20" rx="6" className={cn(BODY_FILL[id], "stroke-ink")} strokeWidth="3" />
      <rect x="42" y="41" width="36" height="6" rx="3" className="fill-night" />
      <circle cx="34" cy="146" r="5" className="fill-ink" />
      <circle cx="86" cy="146" r="5" className="fill-ink" />
    </g>
  );
}

/** Barang yang masuk ke tong masing-masing, digambar di atas titik (0, 0). */
function ItemGraphic({ id }: { id: BinCategory }) {
  const line = { strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (id === "organik") {
    return (
      <g>
        <path
          d="M14 6 C6 6 3 11 6 16 C8 18 9 19 9 20 C9 21 8 22 6 24 C3 29 6 34 14 34 C22 34 25 29 22 24 C20 22 19 21 19 20 C19 19 20 18 22 16 C25 11 22 6 14 6 Z"
          className="fill-organik-soft stroke-ink"
          {...line}
        />
        <path d="M14 6 V1" className="stroke-ink" {...line} />
      </g>
    );
  }
  if (id === "plastik_kertas") {
    return (
      <g>
        <path
          d="M10 6 H18 V10 C23 13 24 16 24 21 V34 C24 36 22 38 20 38 H8 C6 38 4 36 4 34 V21 C4 16 5 13 10 10 Z"
          className="fill-white stroke-ink"
          {...line}
        />
        <rect x="9" y="0" width="10" height="6" rx="1.5" className="fill-kertas stroke-ink" {...line} />
        <rect x="4" y="24" width="20" height="8" className="fill-kertas stroke-ink" strokeWidth="2" />
      </g>
    );
  }
  return (
    <g>
      <rect x="3" y="8" width="26" height="18" rx="5" className="fill-white stroke-ink" {...line} />
      <path d="M8 14 H24 M8 18 H24 M8 22 H24" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12 C-4 12 -4 22 3 22 M29 12 C36 12 36 22 29 22" className="stroke-ink" fill="none" {...line} />
    </g>
  );
}

function Dropping({ id, at }: { id: BinCategory; at: number }) {
  return (
    <g transform="translate(46 0)">
      <g className="drop" style={delay(at)}>
        <ItemGraphic id={id} />
      </g>
    </g>
  );
}

function Svg({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/**
 * Satu tong. Dengan `drop`, barang dari kategori itu jatuh ke slot sekali lalu tong bergetar,
 * dipakai sebagai umpan balik saat pengguna memilih tong. `space` menyisakan ruang jatuh di atas
 * tong yang diam, supaya ukuran tong sama dengan saudaranya yang sedang menerima barang.
 */
export function BinArt({
  id,
  className,
  drop,
  space = false,
}: {
  id: BinCategory;
  className?: string;
  drop?: BinCategory;
  space?: boolean;
}) {
  const tall = space || drop !== undefined;
  return (
    <Svg viewBox={tall ? "0 -40 120 194" : "0 28 120 126"} className={className}>
      {drop ? <Dropping id={drop} at={0.05} /> : null}
      <BinGraphic id={id} bumpAt={drop ? 0.8 : undefined} />
    </Svg>
  );
}

/** Satu tong dengan barangnya jatuh ke slot sekali, lalu diam. */
export function BinDrop({ id, className }: { id: BinCategory; className?: string }) {
  return (
    <Svg viewBox="0 -40 120 194" className={className}>
      <Dropping id={id} at={0.3} />
      <BinGraphic id={id} bumpAt={1.1} />
    </Svg>
  );
}

const SCENE: { id: BinCategory; x: number }[] = [
  { id: "organik", x: 0 },
  { id: "plastik_kertas", x: 130 },
  { id: "residu", x: 260 },
];

/** Stasiun pilah: tiga tong berjajar di atas lantai. Barang jatuh satu per satu bila `drops` aktif. */
export function StationScene({ drops = true, className }: { drops?: boolean; className?: string }) {
  return (
    <Svg viewBox={drops ? "0 -40 380 200" : "0 28 380 132"} className={className}>
      {SCENE.map((bin, index) => (
        <g key={bin.id} transform={`translate(${bin.x} 0)`}>
          {drops ? <Dropping id={bin.id} at={0.5 + index * 0.9} /> : null}
          <BinGraphic id={bin.id} bumpAt={drops ? 1.3 + index * 0.9 : undefined} />
        </g>
      ))}
      <rect x="0" y="151" width="380" height="6" className="fill-ink" />
    </Svg>
  );
}
