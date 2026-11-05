# Arah desain: Eco Waste Corner UPJ

Dokumen ini adalah sumber arah visual. `AGENTS.md` memuat aturan teknis dan konten yang tetap berlaku di atasnya (tema terang saja, glass maksimal dua tempat, tanpa em dash, tanpa fitur tukar poin).

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

Design Read: aplikasi edukasi dan gamifikasi pemilahan sampah untuk mahasiswa UPJ, bergaya papan penanda stasiun pilah: bidang warna penuh, ilustrasi tong buatan sendiri, angka besar, garis ink tebal.

Catatan arah: versi pertama terlalu minimalis (ENERGY 2, tanpa ilustrasi). Versi ini menaikkan energi lewat warna penuh, ilustrasi yang menunjukkan produk, dan satu bagian interaktif, bukan lewat hiasan.

## Identitas

Tiga tong adalah identitas produk. Warna dan bentuk berasal dari tong itu sendiri, bukan dari tema "hijau ramah lingkungan". Poin JSDP ditampilkan sebagai angka besar seperti papan skor, karena poin adalah syarat kelulusan dan harus langsung terbaca.

Motif yang diulang: **tong berkode warna**, digambar sendiri di `components/art/BinArt.tsx` (garis ink tebal, bidang rata, label putih dengan simbol sederhana). Tiga bentuk dipakai berulang:

- `StationScene`: tiga tong di atas lantai. Di hero dan login, satu barang jatuh ke slot tiap tong, sekali, lalu diam.
- `BinDrop`: satu tong dengan barangnya, dipakai di hasil scan yang sah.
- `BinArt`: satu tong statis, dipakai di panduan, kartu pilih slot, dan latihan memilah.

Gambar ini dekoratif (`aria-hidden`). Informasi yang sama selalu ada sebagai teks di dekatnya (nama tong dan poin dasar). Ilustrasinya langsung menunjukkan produknya, bukan ilustrasi stok.

Wordmark hanya teks "Eco Waste Corner UPJ". Tidak ada logo buatan. Tambahkan logo asli lewat pemilik proyek bila ada.

## Palet (tema terang saja)

Inti: `cobalt` (merek dan aksi utama) dan `ink` (teks dan permukaan gelap) di atas `paper`. Aksen tunggal: `cobalt` di momen kunci. Warna tong adalah sistem kode data, bukan dekorasi: dipakai hanya pada elemen yang mewakili kategori tong atau status.

| Token | Hex | Pemakaian | Kontras |
| --- | --- | --- | --- |
| `paper` | #F5F4EF | latar halaman | ink 16.0:1 |
| `ink` | #12182B | teks, permukaan gelap, garis tebal | putih 17.6:1 |
| `muted` | #474E63 | teks sekunder | 7.5:1 di paper, 8.3:1 di putih |
| `mist` | #C6CBDB | teks sekunder di atas ink | 10.9:1 di ink, 5.9:1 di cobalt |
| `edge` | #747B8F | batas kontrol (input, radio) | 3.8:1 di paper, 4.2:1 di putih |
| `rule` | #D6D4CB | garis pemisah dekoratif saja | tidak untuk batas kontrol |
| `cobalt` | #2438A6 | latar hero, tombol utama, tautan | putih 9.6:1, 8.7:1 di paper |
| `cobalt-deep` | #18277C | hover dan active | putih 13.0:1 |
| `cobalt-soft` | #E4E8F8 | latar bagian latihan, pilihan terpilih | ink 14.4:1 |
| `organik` | #1E7A4B | tong organik | putih 5.3:1 |
| `organik-soft` | #DDF1E5 | latar lembut organik | ink 14.9:1 |
| `kertas` | #F4B81E | tong plastik/kertas | ink 9.8:1 (selalu blok terisi, jangan jadi teks di latar terang) |
| `kertas-soft` | #FCEFC4 | latar lembut plastik/kertas | ink 15.4:1 |
| `residu` | #363C4A | tong residu | putih 11.0:1 |
| `residu-soft` | #E4E6EB | latar lembut residu | ink 14.1:1 |
| `brick` | #B42318 | status saja: penuh, penalti | putih 6.6:1 |
| `brick-soft` | #FBE9E7 | latar peringatan | brick-ink 9.1:1 |
| `brick-ink` | #7A1810 | teks di atas brick-soft | 9.1:1 |

Teks kecil di latar terang memakai `ink`, `muted`, `cobalt`, atau `organik`. `kertas` tidak pernah dipakai sebagai teks atau garis di latar putih (1.8:1).

## Tipografi

- Tampilan: **Big Shoulders**. Warisan papan penanda jalan, cocok untuk label tong dan angka poin, dan sempit sehingga nama panjang tidak menyesakkan layar ponsel. Huruf kecil dan kapital biasa, tanpa jarak huruf lebar.
- Isi: **Atkinson Hyperlegible Next**. Dirancang untuk keterbacaan, dipilih karena aplikasi ini dibaca mahasiswa di ponsel dengan cahaya kampus yang beragam.
- Next tidak punya metrik font cadangan untuk keduanya, jadi `adjustFontFallback` dimatikan dan fallback dipilih manual (Arial Narrow untuk judul, sistem untuk isi). Konsekuensinya ada sedikit pergeseran saat font selesai dimuat.

## Bentuk

- Radius bertingkat dengan maksud: kontrol 6px, blok dan kartu 10px, panggung dan dialog 14px. Tidak ada bentuk pil.
- Garis ink 2px di plat utama, `rule` 2px di kartu biasa, `edge` 2px di kontrol.
- Bayangan solid bergeser (8px) hanya di tiga plat utama: panggung hero, plat latihan, dan papan skor dashboard. Alasannya: plat itu fokus halamannya dan terangkat dari latar seperti papan penanda. Dialog memakai bayangan lembut karena ketinggiannya nyata. Tempat lain tanpa bayangan.
- Glass: hanya label denah peta. Hero tidak lagi memakai kaca.

## Komposisi per halaman

- Beranda (urutan dan ritme sengaja berganti): hero cobalt penuh dengan panggung tong, baris ink empat langkah scan, latihan memilah interaktif di atas cobalt-soft, panduan tiga kolom dengan tong mencuat dari kepala kolom, dua bidang SDG 12 (cobalt dan paper), bagian gelap aturan poin, penutup cobalt dengan titik A dan B.
- Login: dua bidang penuh, cobalt dengan panggung tong di kiri dan formulir di kanan.
- Scan: pita cobalt berisi judul dan tiga tong kecil, lalu satu kolom fokus, penanda langkah, kartu slot berilustrasi.
- Peta: pita cobalt-soft untuk judul, lalu denah dan daftar titik.
- Dashboard: papan skor cobalt dengan angka poin raksasa, lalu jalur badge, lalu riwayat.
- Mobile: bilah navigasi bawah (Beranda, Peta, Scan, Dashboard atau Masuk), ruang di bawah konten disisakan setinggi bilah itu.

## Gerak

Kosakata gerak sengaja pendek supaya terasa seperti satu sistem, bukan tumpukan efek. Tiga kata kerja utama, ditambah umpan balik kecil. Semuanya berjalan sekali (tidak ada putaran tanpa henti, kecuali spinner pemuatan) dan tiap gerak punya alasan.

| Gerak | Kelas atau komponen | Di mana | Alasan |
| --- | --- | --- | --- |
| Jatuh | `.drop`, `.bump` di `BinArt` | hero, login, hasil scan, latihan memilah | Menunjukkan aksi produk: barang masuk tong. Di latihan, barang jatuh ke tong yang dipilih sebagai jawaban. |
| Muncul saat digulir | `.reveal`, `.reveal-l`, `.reveal-r` | beranda | Mengatur laju baca per bagian. Mengikuti posisi gulir (bukan waktu), berurutan antar kolom lewat `--r0` dan `--r1`. |
| Hitung naik | `CountUp`, `AnimatedCounter` | angka poin dasar, skor latihan, poin hasil scan, saldo | Menarik mata ke angka inti produk. Nilai akhir selalu ada di HTML dan teks pembaca layar. |
| Sapu sorotan | `.wipe` | "poin JSDP." di judul hero | Menekankan konsep kunci tepat setelah judul tampil. |
| Berurutan | `.fade-up` dengan `--delay` | empat langkah di hero, baris riwayat, kartu login, panel umpan balik | Urutan gerak meniru urutan isi (langkah 1 sampai 4, baris dari atas). |
| Isi bilah | `.fill-x`, `.fill-scroll` | penanda langkah scan, progres badge | Menunjukkan kemajuan. Bilah badge terisi saat masuk layar. |
| Getar dan membal | `.shake`, `.pop` | kuis, latihan memilah | Umpan balik jawaban yang tidak bergantung pada warna: salah bergetar, ikon benar atau salah membal. |
| Cap | `.stamp` | plat hasil scan | Menegaskan bahwa scan tercatat. |
| Mendarat | `.land` | penanda denah peta | Menunjukkan letak dua titik begitu denah muncul. |
| Tekan | `active:scale-[0.98]` di tombol | semua tombol | Memberi tahu bahwa klik terdaftar. |

Aturan:
- Semua gerak berhenti pada `prefers-reduced-motion`: durasi dan jeda dipangkas jadi nol, gerak berbasis gulir dimatikan, dan `CountUp` langsung menampilkan nilai akhir.
- Tidak ada paralaks, tidak ada animasi yang berputar terus, dan tidak ada tumpukan banyak efek pada satu elemen.
- Menambah gerak baru berarti menambah baris di tabel ini beserta alasannya.

## Latihan memilah

`components/landing/SortGame.tsx` memakai barang yang sama dengan langkah scan (`lib/data/items.ts`). Urutannya tetap, tidak acak (aman untuk prerender). Tidak menyimpan apa pun, tidak menambah poin, dan tidak butuh login. Gunanya membiasakan pengguna sebelum scan sungguhan.

## Alasan keputusan utama

- Cobalt sebagai merek: hijau sudah dipakai kode tong organik, jadi merek berwarna lain supaya "hijau" tetap berarti organik.
- Hero berwarna penuh dengan ilustrasi tong: menunjukkan produk dalam satu pandangan, dan menjawab keluhan UI terlalu minimalis tanpa menambah hiasan tanpa fungsi.
- Latihan memilah: konten interaktif yang mengajarkan hal yang sama dengan produk, dari data yang sudah ada.
- Papan skor: poin adalah syarat kelulusan, jadi angkanya yang paling besar di dashboard.
- Bilah bawah di mobile: tiga tujuan utama harus terjangkau ibu jari.
- Ikon bawaan dibuat sendiri dan sedikit (`components/ui/Icons.tsx`): hanya untuk aksi yang butuh simbol.
