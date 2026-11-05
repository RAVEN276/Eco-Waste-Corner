import { buttonClasses } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-leaf-deep">404</p>
      <h1 className="mt-4 text-2xl font-bold text-forest">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-muted">Alamat yang kamu buka tidak ada di Eco Waste Corner.</p>
      <Link href="/" className={buttonClasses("primary", "lg", "mt-6")}>
        Kembali ke beranda
      </Link>
    </div>
  );
}
