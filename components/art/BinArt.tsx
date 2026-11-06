import type { CSSProperties, ReactNode } from "react";
import { ItemGraphic } from "@/components/art/ItemArt";
import type { BinCategory, Rejection } from "@/lib/types";
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
function BinGraphic({ id, bumpAt, spitAt }: { id: BinCategory; bumpAt?: number; spitAt?: number }) {
  const reaction = bumpAt !== undefined ? "bump" : spitAt !== undefined ? "spit" : undefined;
  const style =
    bumpAt !== undefined
      ? delay(bumpAt)
      : spitAt !== undefined
        ? { ...delay(spitAt), transformOrigin: "50% 100%" }
        : undefined;
  return (
    <g className={reaction} style={style}>
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

function Dropping({ id, item, at }: { id: BinCategory; item?: string; at: number }) {
  return (
    <g transform="translate(46 0)">
      <g className="drop" style={delay(at)}>
        <ItemGraphic category={id} item={item} />
      </g>
    </g>
  );
}

/** Digambar setelah tong supaya barang yang terlontar terlihat di atasnya. */
function Ejected({ id, item, at, rejection }: { id: BinCategory; item?: string; at: number; rejection: Rejection }) {
  const style = { ...delay(at), ["--dir" as string]: rejection.arah, ["--turn" as string]: `${rejection.putar}deg` };
  return (
    <g transform="translate(46 0)">
      <g className="eject" style={style}>
        <ItemGraphic category={id} item={item} />
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
 * Satu tong. Dengan `drop`, sebuah barang jatuh ke slot sekali lalu tong mengangguk, dipakai sebagai
 * umpan balik saat pengguna memilih tong. `drop` adalah kategori barangnya, dan `item` (id barang di
 * kamus) memilih gambar khusus barang itu, atau gambar kategori bila tidak diisi. Dengan `reject`
 * (pilihan salah), tong menolak dan barangnya terlontar lalu mendarat di samping tong, ke arah yang
 * ditentukan `reject`. `space` menyisakan ruang jatuh di atas tong yang diam, supaya ukurannya sama
 * dengan saudaranya yang sedang menerima barang.
 */
export function BinArt({
  id,
  className,
  drop,
  item,
  reject,
  space = false,
}: {
  id: BinCategory;
  className?: string;
  drop?: BinCategory;
  item?: string;
  reject?: Rejection;
  space?: boolean;
}) {
  const tall = space || drop !== undefined;
  const rejection = drop !== undefined ? reject : undefined;
  return (
    // Barang yang ditolak mendarat di luar kotak gambar, jadi tepinya tidak boleh memotong.
    <Svg viewBox={tall ? "0 -40 120 194" : "0 28 120 126"} className={cn(className, rejection && "overflow-visible")}>
      {drop ? <Dropping id={drop} item={item} at={0.05} /> : null}
      <BinGraphic id={id} bumpAt={drop && !rejection ? 0.8 : undefined} spitAt={rejection ? 0.95 : undefined} />
      {drop && rejection ? <Ejected id={drop} item={item} at={1} rejection={rejection} /> : null}
    </Svg>
  );
}

/** Satu tong dengan barangnya jatuh ke slot sekali, lalu diam. `item` memilih gambar khusus barangnya. */
export function BinDrop({ id, item, className }: { id: BinCategory; item?: string; className?: string }) {
  return (
    <Svg viewBox="0 -40 120 194" className={className}>
      <Dropping id={id} item={item} at={0.3} />
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
