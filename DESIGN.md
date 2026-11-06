# Arah desain: Eco Waste Corner UPJ

Dokumen ini adalah sumber arah visual. `AGENTS.md` memuat aturan teknis dan konten yang tetap berlaku di atasnya (dua tema, terang dan gelap, glass maksimal dua tempat, tanpa em dash, penukaran hanya poin ke poin JSDP, tanpa hadiah).

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

Design Read: aplikasi edukasi dan gamifikasi pemilahan sampah untuk mahasiswa UPJ, bergaya papan penanda stasiun pilah: bidang warna penuh, ilustrasi tong buatan sendiri, angka besar, garis ink tebal.

Catatan arah: versi pertama terlalu minimalis (ENERGY 2, tanpa ilustrasi). Versi ini menaikkan energi lewat warna penuh, ilustrasi yang menunjukkan produk, dan satu bagian interaktif, bukan lewat hiasan.

## Identitas

Tiga tong adalah identitas produk. Warna dan bentuk berasal dari tong itu sendiri, bukan dari tema "hijau ramah lingkungan". Poin ditampilkan sebagai angka besar seperti papan skor, karena itu yang dikumpulkan lewat scan dan harus langsung terbaca. Poin JSDP (syarat kelulusan) tidak ikut di papan skor supaya papan itu tetap satu fokus, saldonya ada di panel tukar poin.

Motif yang diulang: **tong berkode warna**, digambar sendiri di `components/art/BinArt.tsx` (garis ink tebal, bidang rata, label putih dengan simbol sederhana). Tiga bentuk dipakai berulang:

- `StationScene`: tiga tong di atas lantai. Di hero dan login, satu barang jatuh ke slot tiap tong, sekali, lalu diam.
- `BinDrop`: satu tong dengan barangnya, dipakai di hasil scan yang sah.
- `BinArt`: satu tong statis, dipakai di panduan, kartu hasil bacaan QR di langkah scan, dan latihan memilah.

Gambar ini dekoratif (`aria-hidden`). Informasi yang sama selalu ada sebagai teks di dekatnya (nama tong dan poin dasar). Ilustrasinya langsung menunjukkan produknya, bukan ilustrasi stok.

Wordmark hanya teks "Eco Waste Corner UPJ". Tidak ada logo buatan. Tambahkan logo asli lewat pemilik proyek bila ada.

## Palet (tema terang)

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

## Tema gelap

Arahnya: stasiun pilah di malam hari. Dial sama dengan tema terang (ENERGY 3 / RHYTHM 3 / MOTION 3). Pengguna memilih lewat tombol di navbar; selama belum memilih, tema mengikuti pengaturan sistem (`lib/theme.ts`, `components/layout/ThemeToggle.tsx`). Nilainya ada di blok `:root[data-theme="dark"]` di `app/globals.css`, dan komponen memakainya lewat token yang sama, tanpa varian `dark:` untuk warna. Alasan tema ini ada: tidak ada alasan produk untuk mengunci satu tema, dan mahasiswa membuka aplikasi di ponsel pada jam kampus yang berbeda-beda, jadi pilihannya diserahkan ke pengguna.

Versi pertama serba navy dengan aksen periwinkle. Itu dibuang karena cobalt merek hilang di tengah rona yang sama, semua kartu berbingkai lavender yang sama sehingga tampak seperti kerangka kawat, dan paletnya terbaca sebagai biru-ungu bawaan. Keputusan sekarang, satu alasan per baris:

| Token | Hex | Alasan | Kontras |
| --- | --- | --- | --- |
| `paper` | #0F1217 | Latar arang netral, bukan navy, supaya cobalt jadi satu-satunya rona dingin dan warna tong tetap kode data | ink 16.2:1 |
| `surface` | #171B22 | Kartu, input, dialog: satu tingkat di atas paper, ketinggian dibaca dari permukaan yang lebih terang | ink 14.9:1 |
| `night` | #07080B | Blok permanen paling dalam (footer, aturan poin) dan teks gelap di atas kertas atau putih | ink 17.3:1 |
| `ink` | #F0EEE7 | Putih hangat dari kertas tema terang, bukan putih biru | |
| `muted` | #AEB2BD | Teks sekunder | 8.9:1 di paper, 8.1:1 di surface |
| `line` | #6A7080 | Garis struktur sedang, bukan lavender terang. Kartu tidak tampak kerangka kawat, tetap lolos 3:1 untuk batas komponen | 3.8:1 di paper, 3.5:1 di surface |
| `edge` | #868B99 | Batas kontrol (input, radio), lebih terang dari `line` | 5.5:1 di paper |
| `rule` | #272B34 | Pemisah dekoratif saja | tidak untuk batas kontrol |
| `link` | #86A2FF | Cobalt tidak bisa jadi teks di latar gelap (2.0:1), jadi versi muda untuk wordmark, angka besar, tautan, menu aktif. Rona digeser sedikit ke biru langit supaya tidak jadi lavender | 7.7:1 di paper, 7.1:1 di surface |
| `cobalt-soft` | #151A33 | Pita bergaris cobalt (latihan memilah, judul peta): bagian tetap berganti latar seperti di tema terang | ink 14.7:1 |
| `organik-soft` `kertas-soft` `residu-soft` | #11291B, #35290A, #21242C | Latar lembut kategori | ink 12.3:1 sampai 13.4:1 |
| `residu` | #4D5361 | Dinaikkan dari tema terang supaya tong residu terbaca di atas arang | putih 7.7:1 |
| `brick-soft` `brick-text` `brick-ink` | #3A1917, #FF9A90, #FFC9C3 | Galat dan penalti | 7.7:1 dan 10.8:1 |
| `pick` `on-pick` | #F0EEE7, #0F1217 | Status terpilih (tab, saringan, badge, menu aktif, poin di navbar) adalah kebalikan permukaan sekitarnya: gelap di terang, terang di gelap. `bg-night` hampir hitam di atas hampir hitam tidak terbaca sebagai terpilih | 16.2:1 |
| `plate` | #2438A6 | Plat hasil scan yang sah: cobalt di gelap supaya momen poin masuk tetap jadi titik fokus (di terang tetap night) | putih 9.6:1 |
| `--shadow-ink` | #04050A | Bayangan solid hitam. Jelas di atas cobalt (2.1:1, hero dan plat latihan), samar di atas cobalt-soft (1.2:1), nyaris tak terlihat di atas arang (1.1:1), dan itu disengaja: di tema gelap ketinggian dibaca dari permukaan yang lebih terang, bukan bayangan | |

Tidak berubah di kedua tema: `cobalt` (blok terisi dengan teks putih), `organik`, `kertas` (blok terisi dengan teks `night`), `brick` (blok terisi), `mist` (teks di atas `night` dan cobalt), dan `tint` (hover tombol putih permanen). Ilustrasi tong memakai `stroke-ink`, jadi garisnya otomatis putih hangat di tema gelap.

Aturan saat menambah komponen: jangan menulis hex atau `bg-night text-white` untuk status terpilih, pakai `bg-pick text-on-pick`. Periksa kontras di kedua tema dan di semua keadaan (terpilih, hover, galat, dialog), bukan hanya keadaan awal.

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

- Beranda (urutan dan ritme sengaja berganti): hero cobalt penuh dengan panggung tong, baris ink empat langkah scan, lalu bagian Edukasi (satu pembungkus `#edukasi`, lima bagian berganti latar supaya tidak monoton: panduan tiga kolom di paper dengan tong mencuat dari kepala kolom, tiga pertanyaan penentu di pita putih, tabel kesalahan umum di paper, kamus sampah yang bisa dicari di pita putih, latihan memilah interaktif di cobalt-soft), dua bidang SDG 12 (cobalt dan paper), bagian gelap aturan poin, penutup cobalt dengan titik A dan B. Belajar dulu, baru berlatih: latihan sengaja di ujung Edukasi.
- Login: dua bidang penuh, cobalt dengan panggung tong di kiri dan formulir di kanan.
- Scan: pita cobalt berisi judul dan tiga tong kecil, lalu satu kolom fokus dan penanda langkah. Langkah pertama bukan memilih, tapi memindai QR di tong: bingkai kamera dengan bingkai bidik yang langsung menyala saat langkah terbuka, lalu kartu hasil bacaan berwarna tong (tong, lokasi, poin dasar) dengan tombol mulai kuis dan pindai ulang. Foto bukti memakai bingkai kamera yang sama. Bingkai kamera selalu gelap di kedua tema (isinya gambar kamera), dengan penjelasan dan langkah berikutnya saat kamera ditolak, tidak ada, atau bukan https.
- Peta: pita cobalt-soft untuk judul, lalu denah dan daftar titik.
- Dashboard: papan skor cobalt dengan angka poin raksasa dan satu tombol (scan), lalu panel tukar poin (kolom ink berisi kurs, kolom putih berisi jumlah paket, pratinjau saldo, dan dialog konfirmasi karena tidak bisa dibatalkan), lalu jalur badge, lalu riwayat. Panel tukar di dashboard karena di sanalah saldo dan riwayat berada. Dari hasil scan ada pintasan ke panel itu saat poin sudah cukup. Dashboard punya satu tombol scan saja (di papan skor), jangan menambah tombol scan lain di panel tukar atau riwayat.
- Mobile: bilah navigasi bawah (Beranda, Peta, Scan, Dashboard atau Masuk), ruang di bawah konten disisakan setinggi bilah itu.

## Gerak

Kosakata gerak sengaja pendek supaya terasa seperti satu sistem, bukan tumpukan efek. Tiga kata kerja utama, ditambah umpan balik kecil. Gerak masuk tidak hanya jalan saat halaman dibuka: tiap kali sebuah bagian kembali ke layar setelah keluar sepenuhnya, geraknya mulai dari awal lagi (lihat "Mengulang"). Tidak ada putaran tanpa henti (kecuali spinner pemuatan), dan tiap gerak punya alasan.

| Gerak | Kelas atau komponen | Di mana | Alasan |
| --- | --- | --- | --- |
| Jatuh | `.drop`, `.bump` di `BinArt` | hero, login, hasil scan, latihan memilah | Menunjukkan aksi produk: barang masuk tong. Di latihan, barang jatuh ke tong yang dipilih sebagai jawaban. |
| Muncul saat digulir | `.reveal`, `.reveal-l`, `.reveal-r` | beranda, dashboard (papan skor, panel tukar dari dua sisi, lencana), peta (denah dan daftar titik), scan (form foto) | Mengatur laju baca per bagian: isi baru muncul saat dibaca, bukan semuanya sejak awal. Berbasis waktu (0,7 detik) dan berurutan antar anak lewat `--delay`, jadi sama di semua browser. |
| Mengulang | `ScrollMotion` (`components/layout/ScrollMotion.tsx`), penanda `data-replay` | semua halaman | Supaya halaman tetap terasa hidup selama dibaca, bukan hanya saat dibuka. Bagian yang sudah jauh di luar layar (30% tinggi layar) dijeda di awal animasinya (tidak terlihat), lalu diputar dari awal saat masuk lagi dari bawah (dimulai 10% tinggi layar sebelum terlihat, supaya pada gulir pelan animasinya sudah jalan saat tampak). Bagian yang masuk dari atas (digulir naik) langsung tampil penuh: isinya sudah dibaca, dan memutarnya dari kosong membuatnya berkedip di tepi layar. Berlaku untuk `.reveal*`, `.fade-up`, `.land`, dan elemen `data-replay`, termasuk gerak di dalamnya. |
| Bilah progres | `ScrollProgress` di `Navbar` | semua halaman | Halaman panjang (beranda belasan layar, dashboard beberapa layar), jadi bilah di tepi atas navbar memberi tahu sudah sejauh mana membaca. Dijalankan CSS (linimasa gulir akar halaman), jadi mulus dan tidak tertinggal dari gulir. Kosong di halaman yang muat dalam satu layar, dan tidak tampil di browser tanpa linimasa gulir. |
| Plat utama mundur | `ScrollLinked` | panggung hero, papan skor dashboard, judul peta, pita scan | Saat plat utama sebuah halaman digulir lewat, ia mengecil sedikit (0,94 sampai 0,97) dan turun pelan. Perhatian berpindah dari plat itu ke isi di bawahnya (Edukasi, panel tukar, denah, form), dan ada kesan kedalaman. Satu perilaku yang sama di tiap halaman supaya terasa sebagai satu sistem. Dijalankan CSS (`animation-timeline`), bukan JavaScript: nilai yang dihitung JavaScript tertinggal satu bingkai dari gulir dan elemennya bergetar saat digulir pelan. |
| Tumbuh | `.grow-y` di `CapacityBadge` | daftar titik peta, dialog lokasi | Batang meter kapasitas tumbuh dari bawah satu per satu, jadi tinggi-rendahnya terbaca sebagai "terisi". |
| Menempel | `sticky` di pembungkus `Stepper` | scan | Form foto bukti cukup panjang, jadi penanda langkah tetap terlihat tepat di bawah navbar saat digulir. |
| Tong naik | `ScrollLinked` | kepala tiga kolom panduan | Tong naik dari bawah kepala kolom seiring digulir (digeser 44 ke -28 px, dipotong tepi kepala kolom), jadi kode warna tiap kolom "muncul" tepat saat kolomnya dibaca. |
| Hitung naik | `CountUp`, `AnimatedCounter` | angka poin dasar, skor latihan, poin hasil scan, saldo | Menarik mata ke angka inti produk. `CountUp` menghitung ulang dari 0 tiap kali angkanya kembali ke layar. Nilai akhir selalu ada di HTML dan teks pembaca layar. |
| Sapu sorotan | `.wipe` | "poin." di judul hero | Menekankan konsep kunci tepat setelah judul tampil. |
| Berurutan | `.fade-up` dengan `--delay` | empat langkah di hero, baris riwayat, kartu login, panel umpan balik | Urutan gerak meniru urutan isi (langkah 1 sampai 4, baris dari atas). |
| Isi bilah | `.fill-x` | penanda langkah scan, progres badge | Menunjukkan kemajuan. Bilah badge terisi tiap kali panelnya masuk layar. |
| Getar dan membal | `.shake`, `.pop` | kuis, latihan memilah | Umpan balik jawaban yang tidak bergantung pada warna: salah bergetar, ikon benar atau salah membal. |
| Cap | `.stamp` | plat hasil scan | Menegaskan bahwa scan tercatat. |
| Mendarat | `.land` | penanda denah peta | Menunjukkan letak dua titik begitu denah muncul. |
| Tekan | `active:scale-[0.98]` di tombol | semua tombol | Memberi tahu bahwa klik terdaftar. |

Aturan:
- Semua gerak berhenti pada `prefers-reduced-motion`: durasi dan jeda dipangkas jadi nol, `.reveal*` dimatikan, `ScrollLinked` diam lewat CSS (`[data-scroll-linked]`), dan `CountUp` langsung menampilkan nilai akhir. Bilah progres tetap mengikuti gulir karena itu penunjuk posisi, bukan gerak hiasan.
- Gerak terikat gulir hanya dua jenis (`ScrollLinked` dan bilah progres), kecil (maksimal sekitar 70 px), dan tidak menutupi teks. Denah peta sengaja tidak diberi paralaks: posisi titik terhadap bangunan adalah isi petanya, dan tidak boleh bergeser. Tidak ada animasi yang berputar terus dan tidak ada tumpukan banyak efek pada satu elemen.
- `ScrollMotion` tidak menulis atribut ke elemen React: itu menimbulkan galat hidrasi. Ia hanya menjeda dan memutar ulang animasi lewat Web Animations API, dengan status di memori. Penjedaan hanya dipicu gulir, tidak oleh perubahan ukuran layar (papan ketik ponsel mengecilkan tinggi layar sesaat).
- Elemen yang menjadi leluhur gerak terikat gulir tidak boleh `overflow-hidden`: itu menjadikannya scroll container, sehingga linimasa gulir di dalamnya mengira elemen itu yang digulir dan gerakannya berhenti. Pakai `overflow-clip` (memotong sama, termasuk sudut membulat).
- Menambah gerak baru berarti menambah baris di tabel ini beserta alasannya.

## Latihan memilah

`components/landing/SortGame.tsx` menampilkan 10 barang per putaran, diacak dari seluruh kamus (`WASTE_ITEMS` di `lib/data/items.ts`, 30 barang) lewat `pickPracticeRound`: sebaran 3-3-4 antar tong supaya tiap putaran seimbang, urutannya diacak. Math.random tidak boleh jalan saat prerender, jadi pengacakan baru dipanggil di browser (setelah tampil, dan saat "Main lagi"). Sebelum itu yang tampil penanda memuat dengan tinggi tetap supaya halaman tidak melompat. Tidak menyimpan apa pun, tidak menambah poin, dan tidak butuh login. Gunanya membiasakan pengguna sebelum scan sungguhan.

## Edukasi dan penanda menu

- Kamus sampah (`WasteDictionary`) memakai daftar barang yang sama dengan latihan. Daftar lengkap tampil dulu (terbaca tanpa JS), pencarian dan saringan hanya menyempitkan. Warna tong hanya penanda tambahan, nama tong selalu tertulis.
- Form scan memakai daftar lebih pendek (`SCAN_ITEMS`, sepuluh barang) supaya formnya tidak panjang. Id barang tersimpan di riwayat scan, jangan diubah atau dihapus.
- Navbar menyorot bagian yang sedang dibaca di beranda: "Beranda" di hero dan bagian lain, "Edukasi" selama `#edukasi` melewati garis baca (sekitar sepertiga tinggi layar). Di halaman lain sorotan mengikuti rute. Dipasang lewat `useEdukasiActive` di `Navbar.tsx`.

## Alasan keputusan utama

- Cobalt sebagai merek: hijau sudah dipakai kode tong organik, jadi merek berwarna lain supaya "hijau" tetap berarti organik.
- Hero berwarna penuh dengan ilustrasi tong: menunjukkan produk dalam satu pandangan, dan menjawab keluhan UI terlalu minimalis tanpa menambah hiasan tanpa fungsi.
- Latihan memilah: konten interaktif yang mengajarkan hal yang sama dengan produk, dari data yang sudah ada.
- Papan skor: poin adalah yang dikumpulkan lewat scan, jadi angkanya yang paling besar di dashboard. Poin JSDP ada di panel tukar poin karena hanya bertambah lewat penukaran.
- Bilah bawah di mobile: tiga tujuan utama harus terjangkau ibu jari.
- Ikon bawaan dibuat sendiri dan sedikit (`components/ui/Icons.tsx`): hanya untuk aksi yang butuh simbol.
