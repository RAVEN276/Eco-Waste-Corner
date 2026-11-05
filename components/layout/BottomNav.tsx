"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

/**
 * Tiga tujuan utama harus terjangkau ibu jari, jadi di ponsel navigasinya turun
 * ke bawah. Tinggi bilah (3.75rem) disisakan sebagai padding di body.
 */
export function BottomNav() {
  const pathname = usePathname();
  const signedIn = useUserStore((s) => s.authStatus === "authenticated");

  const items = [
    { href: "/", label: "Beranda", primary: false },
    { href: "/map", label: "Peta", primary: false },
    { href: "/scan", label: "Scan", primary: true },
    signedIn
      ? { href: "/dashboard", label: "Dashboard", primary: false }
      : { href: "/login", label: "Masuk", primary: false },
  ];

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.href === pathname;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 items-center justify-center font-display text-xl font-extrabold",
                  item.primary
                    ? "bg-cobalt text-white active:bg-cobalt-deep"
                    : active
                      ? "bg-ink text-white"
                      : "active:bg-cobalt-soft",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
