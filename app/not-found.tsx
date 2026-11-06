import Link from "next/link";
import { StationScene } from "@/components/art/BinArt";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
      <div>
        <p className="font-display text-[10rem] font-extrabold leading-[0.8] text-link">404</p>
        <h1 className="mt-6 text-5xl">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-lg text-muted">Alamat yang kamu buka tidak ada di Eco Waste Corner.</p>
        <Link href="/" className={buttonClasses("primary", "lg", "mt-6")}>
          Kembali ke beranda
        </Link>
      </div>
      <div className="overflow-hidden rounded-sheet border-2 border-line bg-paper p-3">
        <StationScene className="block w-full" />
      </div>
    </div>
  );
}
