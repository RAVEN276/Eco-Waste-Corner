import { SectionLink } from "@/components/layout/SectionLink";

const LINKS = [
  { href: "/#edukasi", label: "Panduan memilah" },
  { href: "/#aturan-poin", label: "Aturan poin" },
  { href: "/map", label: "Peta lokasi" },
  { href: "/scan", label: "Scan QR tong" },
  { href: "/tentang-logo", label: "Tentang Logo" },
];

export function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="font-display text-3xl font-extrabold leading-none">Eco Waste Corner UPJ</p>
          <p className="mt-2.5 text-sm leading-relaxed text-mist sm:mt-3">
            Program edukasi dan pemilahan sampah di kampus Universitas Pembangunan Jaya.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm font-bold sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <SectionLink
                href={link.href}
                className="inline-flex min-h-11 w-full items-center underline-offset-4 hover:underline sm:w-auto"
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/25">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-mist sm:px-6 sm:text-sm">
          Dibuat oleh Kelompok 1 dari ADV-E.
        </p>
      </div>
    </footer>
  );
}
