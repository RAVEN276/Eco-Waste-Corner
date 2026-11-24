"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Layar pembuka singkat saat situs pertama kali dibuka atau dimuat ulang penuh.
 * Tidak tampil saat berpindah rute di dalam aplikasi, dan berhenti seketika pada `prefers-reduced-motion`.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setVisible(false), reduced ? 0 : 1050);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-paper px-5 py-6"
        >
          <span className="sr-only">Memuat Eco Waste Corner UPJ</span>
          <div className="w-full max-w-sm rounded-sheet border-2 border-line bg-surface p-6 text-center shadow-[8px_8px_0_var(--shadow-ink)] sm:max-w-md sm:p-8">
            <Image
              src="/logo.png"
              alt=""
              width={302}
              height={256}
              priority
              className="mx-auto h-20 w-auto sm:h-24"
            />
            <p className="mt-5 font-display text-4xl font-extrabold leading-none text-ink sm:text-5xl">
              Eco Waste Corner <span className="text-link">UPJ</span>
            </p>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Ruang edukasi dan pemilahan sampah kampus
            </p>

            <div
              aria-hidden="true"
              className="mt-6 h-3.5 w-full overflow-hidden rounded-ctl border-2 border-line bg-paper"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.85, ease: [0.2, 0.7, 0.2, 1] }}
                className="grid h-full w-full origin-left grid-cols-3"
              >
                <span className="bg-organik" />
                <span className="bg-kertas" />
                <span className="bg-residu" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
