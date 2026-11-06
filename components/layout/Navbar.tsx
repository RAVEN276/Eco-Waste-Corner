"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
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

/**
 * True saat bagian Edukasi di beranda (elemen #edukasi) sedang dibaca, yaitu ketika garis baca
 * di sekitar sepertiga layar menyentuhnya. Di luar itu, dan di halaman lain, hasilnya false.
 * Elemennya dicari ulang di setiap gulir (murah, dan tidak bergantung kapan halaman selesai
 * dirender). Pembaruan state yang sama diabaikan React.
 */
function useEdukasiActive(enabled: boolean): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = document.getElementById("edukasi");
      if (!section) {
        setActive(false);
        return;
      }
      const { top, bottom } = section.getBoundingClientRect();
      const line = Math.max(140, window.innerHeight * 0.35);
      setActive(top <= line && bottom > line);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return enabled && active;
}

function PointsChip({ poin, className }: { poin: number; className?: string }) {
  return (
    <Link
      href="/dashboard"
      aria-label={`Poin kamu: ${poin}. Buka dashboard`}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-ctl bg-ink px-3 text-white hover:bg-[#252d47]",
        className,
      )}
    >
      <span aria-hidden="true" className="font-display text-2xl font-extrabold leading-none tabular-nums">
        {poin}
      </span>
      <span aria-hidden="true" className="text-xs font-bold">
        poin
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const signOut = useSignOut();
  const authStatus = useUserStore((s) => s.authStatus);
  const poin = useUserStore((s) => s.poin);
  const signedIn = authStatus === "authenticated";
  const inEdukasi = useEdukasiActive(pathname === "/");

  // Di beranda, "Beranda" dan "Edukasi" bergantian menurut bagian yang sedang dibaca.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !inEdukasi;
    if (href === "/#edukasi") return inEdukasi;
    return href === pathname;
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
      <ScrollProgress />
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
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  aria-current={active ? (link.href === "/#edukasi" ? "location" : "page") : undefined}
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
