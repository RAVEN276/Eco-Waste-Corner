import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Permukaan biasa: putih, garis 2px, tanpa bayangan. Bayangan dicadangkan untuk dialog. */
export function Card({
  className,
  strong = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-plate border-2 bg-surface p-5 sm:p-6",
        strong ? "border-line" : "border-rule",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Permukaan kaca. Hanya bermakna di atas latar berwarna, jadi dipakai di dua
 * tempat: panel langkah di hero (di atas blok tong) dan label denah peta.
 * Teks gelap di atas kaca terang supaya kontras tetap di atas 7:1 pada semua blok.
 */
export function GlassCard({
  className,
  tone = "light",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-plate border-2 p-4 backdrop-blur-md sm:p-5",
        tone === "light"
          ? "border-white/70 bg-white/75 text-night"
          : "border-white/30 bg-night/80 text-white",
        className,
      )}
      {...props}
    />
  );
}
