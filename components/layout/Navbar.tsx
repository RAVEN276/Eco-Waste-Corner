"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { signOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#edukasi", label: "Edukasi" },
  { href: "/map", label: "Peta" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useUserStore((s) => s.authStatus);
  const poin = useUserStore((s) => s.poinJSDP);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  };

  const signedIn = authStatus === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sand">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-lg font-extrabold tracking-tight text-forest">Eco Waste Corner</span>
          <span className="rounded bg-forest px-1.5 py-0.5 text-xs font-bold text-mint">UPJ</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors",
                    active ? "bg-mint text-forest" : "text-charcoal hover:bg-mint-soft",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sun-soft px-3 text-sm font-bold text-charcoal"
                aria-label={`Poin JSDP kamu: ${poin}`}
              >
                <span aria-hidden="true">{poin}</span>
                <span aria-hidden="true" className="text-xs font-semibold">poin JSDP</span>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut aria-hidden="true" className="size-4" />
                Keluar
              </Button>
            </>
          ) : (
            <Link href="/login" className={buttonClasses("primary")}>
              Login Student UPJ
            </Link>
          )}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg text-forest hover:bg-mint-soft md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </nav>

      {open ? (
        <div id="menu-mobile" className="border-t border-line bg-sand px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.href === pathname ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold",
                    link.href === pathname ? "bg-mint text-forest" : "text-charcoal hover:bg-mint-soft",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
            {signedIn ? (
              <>
                <p className="px-3 text-sm text-muted">
                  Poin JSDP: <strong className="text-charcoal">{poin}</strong>
                </p>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut aria-hidden="true" className="size-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <Link href="/login" className={buttonClasses("primary")} onClick={() => setOpen(false)}>
                Login Student UPJ
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
