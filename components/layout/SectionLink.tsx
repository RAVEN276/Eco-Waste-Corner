"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SectionLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page" | "location";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Tautan ke bagian beranda (`/#edukasi`). Di beranda, `Link` Next menganggap pindah ke URL yang
 * sama sebagai navigasi kosong, jadi klik kedua tidak menggulir lagi. Di sana dipakai anchor asli,
 * yang menggulir setiap kali diklik. Dari halaman lain tetap `Link` supaya pindah ke beranda.
 */
export function SectionLink({ href, children, ...props }: SectionLinkProps) {
  const pathname = usePathname();
  if (href.startsWith("/#") && pathname === "/") {
    return (
      <a href={href.slice(1)} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
