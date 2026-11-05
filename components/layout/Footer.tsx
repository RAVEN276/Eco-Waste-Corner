import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="font-display text-xl font-extrabold text-mint">Eco Waste Corner</p>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Program edukasi dan pemilahan sampah di kampus Universitas Pembangunan Jaya.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {[
            { href: "/#edukasi", label: "Panduan pilah" },
            { href: "/#aturan-poin", label: "Aturan poin" },
            { href: "/map", label: "Peta lokasi" },
            { href: "/scan", label: "Scan QR" },
          ].map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
