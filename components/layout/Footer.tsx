import { SectionLink } from "@/components/layout/SectionLink";

const LINKS = [
  { href: "/#edukasi", label: "Panduan memilah" },
  { href: "/#aturan-poin", label: "Aturan poin" },
  { href: "/map", label: "Peta lokasi" },
  { href: "/scan", label: "Scan QR tong" },
];

export function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="font-display text-3xl font-extrabold leading-none">Eco Waste Corner UPJ</p>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Program edukasi dan pemilahan sampah di kampus Universitas Pembangunan Jaya.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold">
          {LINKS.map((link) => (
            <li key={link.href}>
              <SectionLink
                href={link.href}
                className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
