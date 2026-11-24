"use client";

import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SectionLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page" | "location";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Tautan ke beranda (`/`) atau bagian beranda (`/#edukasi`). Di beranda, `Link` Next menganggap
 * pindah ke URL yang sama sebagai navigasi kosong, jadi tidak menggulir. Untuk `#bagian` dipakai
 * anchor asli, sedangkan untuk `/` saat sudah di beranda digulir kembali ke atas halaman.
 */
export function SectionLink({ href, children, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();
  if (href.startsWith("/#") && pathname === "/") {
    return (
      <a href={href.slice(1)} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || href !== "/" || pathname !== "/" || !isPlainLeftClick(event)) {
      return;
    }
    event.preventDefault();
    if (window.location.hash) {
      window.history.replaceState(null, "", "/");
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
