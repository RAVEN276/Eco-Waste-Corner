"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SplashPhase = "show" | "leaving" | "done";

/**
 * Layar pembuka singkat saat situs pertama kali dibuka atau dimuat ulang penuh.
 * Memakai transisi CSS murni agar tidak membebani bundle awal dan berhenti seketika
 * pada `prefers-reduced-motion`.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<SplashPhase>("show");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const doneTimer = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(doneTimer);
    }
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 550);
    const doneTimer = window.setTimeout(() => setPhase("done"), 740);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-paper px-5 py-6 transition-[opacity,transform] duration-200 ease-out",
        phase === "leaving" ? "pointer-events-none -translate-y-3 opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      <span className="sr-only">Memuat Eco Waste Corner UPJ</span>
      <div className="w-full max-w-sm rounded-sheet border-2 border-line bg-surface p-6 text-center shadow-[8px_8px_0_var(--shadow-ink)] sm:max-w-md sm:p-8">
        <Image
          src="/brand-logo.png"
          alt=""
          width={304}
          height={256}
          sizes="(max-width: 640px) 133px, 152px"
          priority
          className="mx-auto h-28 w-auto sm:h-32"
        />
        <p className="mt-4 font-display text-4xl font-extrabold leading-none text-ink sm:text-5xl">
          Eco Waste Corner <span className="text-link">UPJ</span>
        </p>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Ruang edukasi dan pemilahan sampah kampus
        </p>

        <div
          aria-hidden="true"
          className="mt-6 h-3.5 w-full overflow-clip rounded-ctl border-2 border-line bg-paper bg-clip-padding"
        >
          <div className="splash-fill grid h-full w-full origin-left grid-cols-3">
            <span className="bg-organik" />
            <span className="bg-kertas" />
            <span className="bg-residu" />
          </div>
        </div>
      </div>
    </div>
  );
}
