"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SectionLink } from "@/components/layout/SectionLink";
import { useSignOut } from "@/hooks/useSignOut";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#edukasi", label: "Edukasi" },
  { href: "/map", label: "Peta" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
];

function PointsChip({ poin, className }: { poin: number; className?: string }) {
  return (
    <Link
      href="/dashboard"
      aria-label={`Poin JSDP kamu: ${poin}. Buka dashboard`}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-ctl bg-ink px-3 text-white hover:bg-[#252d47]",
        className,
      )}
    >
      <span aria-hidden="true" className="font-display text-2xl font-extrabold leading-none tabular-nums">
        {poin}
      </span>
      <span aria-hidden="true" className="text-xs font-bold">
        poin JSDP
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const signOut = useSignOut();
  const authStatus = useUserStore((s) => s.authStatus);
  const poin = useUserStore((s) => s.poinJSDP);
  const signedIn = authStatus === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link href="/" className="flex min-h-11 items-center">
          <span className="whitespace-nowrap font-display text-xl font-extrabold leading-none md:text-2xl lg:text-3xl">
            Eco Waste Corner <span className="text-cobalt">UPJ</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === pathname;
            return (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center border-b-[3px] px-3 text-sm font-bold transition-colors duration-150",
                    active ? "border-cobalt text-cobalt" : "border-transparent hover:border-ink",
                  )}
                >
                  {link.label}
                </SectionLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <PointsChip poin={poin} />
              <Button variant="outline" onClick={signOut} className="max-lg:hidden">
                Keluar
              </Button>
            </>
          ) : (
            <Link href="/login" className={buttonClasses("primary", "md", "max-md:hidden")}>
              Masuk
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
