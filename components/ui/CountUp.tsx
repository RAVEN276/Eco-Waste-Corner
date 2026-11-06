"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Angka naik dari 0 setiap kali elemennya masuk layar, bukan hanya yang pertama. Setelah
 * elemennya keluar layar sepenuhnya angkanya kembali ke 0 (di luar pandangan, jadi tidak
 * terlihat), sehingga hitungan berikutnya mulai dari awal. Angka yang masuk dari tepi atas
 * (digulir naik) langsung tampil penuh, karena memutarnya dari 0 membuatnya berkedip di tepi
 * layar. Kalau nilainya berubah saat sudah
 * terlihat (misalnya poin berkurang setelah penukaran), angkanya bergerak dari angka yang
 * sedang tampil ke nilai baru, bukan mulai dari 0 lagi.
 * Nilai akhir selalu ada di HTML awal dan di teks pembaca layar; hanya tampilan yang menghitung.
 */
export function CountUp({
  value,
  className,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Mulai menghitung sedikit sebelum elemennya terlihat (antisipasi 10% layar), supaya pada gulir
  // pelan hitungannya sudah jalan saat angkanya tampak. Reset hanya setelah jauh di luar layar
  // (30%), jadi geser kecil di dekat tepi tidak mengulang hitungan.
  const entered = useInView(ref, { margin: "0px 0px 10% 0px" });
  const visible = useInView(ref, { margin: "30% 0px 30% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  // Angka yang sedang tampil, dan apakah sudah menghitung sejak masuk layar terakhir.
  const shown = useRef(value);
  const counted = useRef(false);

  useEffect(() => {
    if (!entered || reduce) return;
    // Masuk dari atas layar: sudah pernah dibaca, tampilkan nilai akhir tanpa menghitung.
    if (!counted.current && (ref.current?.getBoundingClientRect().top ?? 1) < 0) {
      counted.current = true;
      shown.current = value;
      queueMicrotask(() => setDisplay(value));
      return;
    }
    const from = counted.current ? shown.current : 0;
    counted.current = true;
    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        shown.current = Math.round(latest);
        setDisplay(shown.current);
      },
    });
    return () => controls.stop();
  }, [entered, reduce, value, duration]);

  useEffect(() => {
    if (visible || reduce) return;
    counted.current = false;
    shown.current = 0;
    queueMicrotask(() => setDisplay(0));
  }, [visible, reduce]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
