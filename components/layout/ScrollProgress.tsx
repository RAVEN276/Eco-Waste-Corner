/**
 * Bilah tipis di tepi atas navbar yang memanjang seiring halaman digulir. Beranda dan dashboard
 * panjang (beberapa sampai belasan layar), jadi bilah ini memberi tahu sudah sejauh mana
 * membaca. Hanya penanda posisi, tidak bisa diklik, dan tidak dibaca pembaca layar.
 *
 * Dijalankan CSS (linimasa gulir akar halaman, lihat scroll-progress di globals.css), jadi
 * mulus dan tidak tertinggal dari gulir. Halaman yang muat dalam satu layar tidak punya rentang
 * gulir, sehingga bilahnya tetap kosong. Tetap mengikuti gulir di mode kurangi gerak karena itu
 * penunjuk posisi, bukan gerak hiasan.
 */
export function ScrollProgress() {
  return (
    <span
      aria-hidden="true"
      className="scroll-progress pointer-events-none absolute inset-x-0 top-0 h-1 bg-cobalt"
    />
  );
}
