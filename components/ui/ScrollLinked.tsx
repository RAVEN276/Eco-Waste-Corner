import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Pair = [number, number];

/**
 * Menggeser dan mengecilkan isinya mengikuti posisi gulir (bukan waktu), jadi gerakannya ikut
 * berhenti, mundur, dan maju bersama jari atau roda. `y` (px) dan `scale` adalah nilai di awal
 * dan akhir rentang. `range` menentukan rentang gulirnya: "cover" dari saat elemen mulai terlihat
 * sampai hilang sepenuhnya, "exit" hanya selama elemen itu keluar lewat tepi atas layar.
 *
 * Geraknya dijalankan CSS (lihat scroll-shift di globals.css), jadi mulus saat digulir pelan
 * dan komponen ini tidak butuh JavaScript. Mode kurangi gerak ditangani CSS lewat atribut
 * data-scroll-linked. Di browser tanpa linimasa gulir, isinya diam di posisi aslinya.
 */
export function ScrollLinked({
  y,
  scale = [1, 1],
  range = "cover",
  className,
  originClassName,
  children,
}: {
  y: Pair;
  scale?: Pair;
  range?: "cover" | "exit";
  className?: string;
  originClassName?: string;
  children: ReactNode;
}) {
  const style = {
    "--y0": `${y[0]}px`,
    "--y1": `${y[1]}px`,
    "--s0": scale[0],
    "--s1": scale[1],
    "--range": range === "exit" ? "exit 0% exit 100%" : "cover 0% cover 100%",
  } as CSSProperties;

  return (
    <div className={cn("scroll-shift-box", className)}>
      <div data-scroll-linked="" className={cn("scroll-shift", originClassName)} style={style}>
        {children}
      </div>
    </div>
  );
}
