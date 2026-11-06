"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Bagian yang gerak masuknya diulang: kelas gerak masuk dan elemen yang diberi atribut data-replay
// (penanda tetap di JSX, nilainya tidak pernah diubah).
const TARGETS = ".reveal, .reveal-l, .reveal-r, .fade-up, .land, [data-replay]";

// Hanya animasi masuk milik kita yang dijeda dan diputar ulang. Animasi lain di dalam bagian
// itu (spinner, transisi, gerak framer-motion) tidak disentuh.
const ENTRANCES = new Set([
  "fade-up",
  "wipe",
  "drop",
  "bump",
  "land",
  "reveal-in",
  "reveal-in-left",
  "reveal-in-right",
  "fill-x",
  "grow-y",
]);

// Animasi mulai sedikit sebelum bagian terlihat (10% tinggi layar di bawah tepi bawah), supaya
// pada gulir pelan animasinya sudah berjalan saat bagian itu tampak, bukan baru mulai pudar.
const LOOKAHEAD = 0.1;

// Bagian baru dijeda lagi setelah sejauh ini (30% tinggi layar) di luar tepi layar. Jarak ini
// mencegah animasi diulang berkali-kali oleh geser kecil bolak-balik di dekat tepi layar.
const RESET_MARGIN = 0.3;

// Status tiap bagian disimpan di memori, bukan di atribut DOM: menulis atribut ke elemen yang
// belum selesai dihidrasi React menimbulkan galat hidrasi. Tanpa entri berarti "belum disentuh".
const state = new WeakMap<Element, "in" | "out">();

// Bagian yang masuk dari tepi atas (digulir naik) langsung ditampilkan penuh, tanpa diputar ulang:
// isinya sudah pernah dibaca, dan memutarnya dari kosong membuatnya berkedip di tepi layar.
function entranceAnimations(el: Element): Animation[] {
  return el
    .getAnimations({ subtree: true })
    .filter((a) => "animationName" in a && ENTRANCES.has((a as CSSAnimation).animationName));
}

/**
 * Membuat gerak masuk berulang, bukan hanya saat halaman dibuka. Bagian yang sudah keluar layar
 * sepenuhnya dikembalikan ke awal animasinya dan dijeda (di luar pandangan, jadi tidak terlihat).
 * Saat bagian itu masuk lagi dari bawah (digulir turun), animasinya diputar dari awal. Saat masuk
 * dari atas (digulir naik), langsung tampil penuh.
 *
 * Penjedaan baru terjadi setelah bagian benar-benar keluar layar, jadi tidak pernah ada
 * perubahan yang terlihat. Penjedaan hanya dipicu gulir, tidak oleh perubahan ukuran layar:
 * papan ketik di ponsel atau bilah alamat yang naik-turun mengecilkan tinggi layar sesaat, dan
 * itu tidak boleh menjeda bagian yang sebenarnya sedang dibaca. Bagian yang di bawah lipatan saat halaman dibuka juga dijeda sejak
 * awal, supaya gerak masuknya baru jalan saat digulir ke sana, bukan di belakang layar.
 * Tanpa JavaScript, animasi tetap jalan satu kali seperti biasa.
 */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;

    let allowPause = true;

    const update = () => {
      frame = 0;
      const canPause = allowPause;
      allowPause = true;
      const viewport = window.innerHeight;
      const changes: [Element, "in" | "out" | "show"][] = [];

      // Baca semua posisi dulu, baru ubah animasi, supaya tidak memaksa layout berulang.
      for (const el of document.querySelectorAll(TARGETS)) {
        const { top, bottom, width, height } = el.getBoundingClientRect();
        const hidden = width === 0 && height === 0;
        // Di luar zona aktif: belum terlihat sama sekali dan juga belum dekat.
        const outside = hidden || bottom <= 0 || top >= viewport * (1 + LOOKAHEAD);
        // Sudah jauh di luar layar, tempat bagian yang sudah tampil boleh dijeda ulang.
        const far = hidden || bottom < -viewport * RESET_MARGIN || top > viewport * (1 + RESET_MARGIN);
        const current = state.get(el);

        if (current === undefined) {
          // Pertama kali dilihat: yang di luar zona aktif langsung dijeda, supaya animasi
          // masuknya jalan saat digulir ke sana, bukan di belakang layar.
          if (!outside) state.set(el, "in");
          else if (canPause) changes.push([el, "out"]);
        } else if (current === "in") {
          if (far && canPause) changes.push([el, "out"]);
        } else if (!outside) {
          changes.push([el, top < 0 ? "show" : "in"]);
        }
      }

      for (const [el, next] of changes) {
        state.set(el, next === "out" ? "out" : "in");
        for (const animation of entranceAnimations(el)) {
          if (next === "out") {
            animation.pause();
            animation.currentTime = 0;
          } else if (next === "show") {
            animation.finish();
          } else {
            animation.currentTime = 0;
            animation.play();
          }
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const scheduleWithoutPause = () => {
      allowPause = false;
      schedule();
    };

    schedule();
    // Sekali lagi setelah tata letak dan font settle, supaya posisi awalnya akurat.
    const settle = window.setTimeout(schedule, 400);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleWithoutPause);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleWithoutPause);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
