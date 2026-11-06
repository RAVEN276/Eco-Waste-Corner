<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Eco Waste Corner UPJ

Aplikasi web edukasi dan pemilahan sampah untuk kampus Universitas Pembangunan Jaya. Mahasiswa memindai slot tong (simulator), menjawab kuis, mengunggah foto bukti, lalu mendapat poin. Poin itu bisa ditukar jadi poin JSDP lewat panel di dashboard (kurs di `lib/scoring.ts`, sekarang 10 poin = 5 poin JSDP). Poin JSDP adalah syarat kelulusan dan hanya bertambah lewat penukaran itu, tidak ada target jumlah. Penukaran hanya satu arah, poin ke poin JSDP: jangan membuat penukaran ke hadiah, katalog hadiah, atau keranjang. Di teks UI, "poin" berarti poin hasil scan dan "poin JSDP" berarti hasil penukaran, jangan dicampur. Teks antarmuka berbahasa Indonesia.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Framer Motion, Zustand 5, Firebase (Auth, Firestore). Tanpa pustaka ikon: ikon dibuat sendiri di `components/ui/Icons.tsx`. Arah visual (identitas, palet, tipografi, dial) ada di `DESIGN.md`, baca sebelum mengubah UI.

## Perintah

- `npm run dev`: server pengembangan.
- `npm run build`: build produksi. Jalankan sebelum menyatakan pekerjaan selesai, karena prerender di proyek ini ketat (lihat bagian Cache Components).
- `npx tsc --noEmit` dan `npx eslint .`: cek tipe dan lint. Jika `tsc` mengeluh soal `.next/types`, jalankan `npm run build` sekali untuk membuat ulang tipe.
- `npm run seed`: mengisi koleksi `locations` dari `lib/data/seed.json` (butuh `GOOGLE_APPLICATION_CREDENTIALS`).

Tidak ada test runner. Verifikasi dilakukan lewat build, tsc, eslint, dan klik manual di browser.

## Struktur

- `app/`: route `/`, `/login`, `/dashboard`, `/scan`, `/map`, plus `error.tsx` dan `not-found.tsx`. `dashboard/page.tsx` adalah client component, jadi metadata-nya ada di `dashboard/layout.tsx`.
- `components/`: `landing`, `auth`, `dashboard`, `scan`, `map`, `layout` (Navbar, BottomNav, Footer), `art` (BinArt: tong dan stasiun pilah), `ui` (Button, Card, Dialog, States, Icons, AnimatedCounter), `providers`.
- `store/`: `useUserStore` (status auth, profil, `poin`, `poinJSDP`, `cooldownUntil`, error).
- `hooks/`: `useCooldown`, `useRequireAuth`, `useRemoteList` (`useLocations`), `useScanHistory`, `useExchangeHistory`, `useSignOut`.
- `lib/firebase/`: `config` (init lazy, `isFirebaseConfigured`), `auth`, `firestore` (semua baca/tulis data, termasuk transaksi scan), `errors` (kode error Firebase ke pesan Indonesia).
- `lib/scoring.ts`: satu-satunya tempat aturan poin, penalti, cooldown, dan kurs penukaran. `lib/data/`: bin, kuis, daftar barang (`items.ts`: `WASTE_ITEMS` untuk kamus dan latihan, `SCAN_ITEMS` untuk form scan, id barang jangan diubah karena tersimpan di riwayat), `seed.json`.
- `lib/photo.ts`: validasi, hash, dan kompresi foto bukti. `firebase.json` dan `.firebaserc` mengarah ke proyek `eco-waste-corner`.
- `firestore.rules`: aturan keamanan, harus selaras dengan angka di `lib/scoring.ts` (maks +7 poin per scan, cooldown, penalti turun sampai -3, kurs penukaran 10:5).
- `scripts/`: `seed-firestore.mjs`, `reset-accounts.mjs` (mengembalikan semua akun ke 0), dan `clear-history.mjs` (menghapus `scans` dan `scanPhotos` semua user dan mengembalikan `totalScan` ke 0, poin tidak berubah). Dua skrip terakhir dry-run kecuali diberi `--apply`, dan tidak bisa dibatalkan.

## Aturan penting saat mengubah kode

**Cache Components aktif** (`cacheComponents: true`). Memanggil `Math.random()`, `Date.now()`, atau `new Date()` saat render membuat build gagal. Panggil hanya di event handler atau `useEffect`. Contoh: `pickQuestions` hanya dipanggil dari klik tombol, `pickPracticeRound` (latihan memilah di beranda) dari effect dan tombol ulang, dan `useCooldown` membaca jam di dalam effect. `useSearchParams` harus dibungkus `Suspense` (lihat `app/login/page.tsx`). Activity menjaga state halaman yang disembunyikan, jadi state sementara seperti dialog perlu direset saat unmount.

**Zustand v5**: selector yang mengembalikan objek atau array baru di setiap panggilan menyebabkan render tanpa henti. Ambil nilai primitif atau referensi stabil, lalu turunkan dengan `useMemo` (lihat `PointsCard`).

**Tailwind** dimuat lewat loader Turbopack di `next.config.ts`, bukan PostCSS. Jangan menambah `postcss.config`. Token warna dan radius ada di `app/globals.css` (`paper`, `ink`, `muted`, `mist`, `edge`, `rule`, `cobalt`, `organik`, `kertas`, `residu`, `brick`, beserta varian `-soft`). Font lewat `next/font` di `app/layout.tsx` (Big Shoulders untuk judul dan angka, Atkinson Hyperlegible Next untuk isi). Padding bawah `body` menyisakan ruang untuk `BottomNav` di ponsel, jadi jangan menghapusnya.

**Kontras warna**: `organik`, `kertas`, dan `residu` adalah kode warna tong, hanya untuk elemen yang mewakili kategori tong atau status kapasitas. `kertas` (#F4B81E) selalu blok terisi dengan teks `ink`, tidak pernah teks atau garis di latar putih (1.8:1). Batas kontrol (input, radio) pakai `edge`, bukan `rule` (`rule` hanya garis dekoratif). Teks kecil di latar `ink` pakai putih atau `mist`. `brick` hanya untuk status (penuh, penalti). Tabel rasio lengkap ada di `DESIGN.md`.

**Autentikasi**: dua jalur, Google dan email dengan kata sandi (daftar, masuk, lupa kata sandi), dan email apa pun boleh, tanpa pembatasan domain. Akun email harus memverifikasi emailnya lebih dulu karena `firestore.rules` mensyaratkan `email_verified`: `AuthProvider` menganggap akun yang belum terverifikasi sebagai belum masuk, dan `LoginPanel` menuntun verifikasinya. `AuthProvider` memakai `onIdTokenChanged` dan menyegarkan token sebelum menyentuh Firestore, karena klaim `email_verified` baru berubah setelah token diperbarui. Jangan menambah pengecekan domain di `AuthProvider`. Login tautan email sudah dihapus (paket gratis Firebase hanya mengizinkan 5 email per hari).

**Poin dihitung di klien** (`submitScan` dan `submitExchange` di `lib/firebase/firestore.ts`, memakai transaksi). Scan hanya mengubah `poin`. `poinJSDP` hanya naik lewat `submitExchange`, yang mengurangi `poin` dan menulis dokumen `exchanges` dalam transaksi yang sama. Jika mengubah angka di `lib/scoring.ts` (termasuk `EXCHANGE_POIN` dan `EXCHANGE_JSDP`), ubah juga batas di `firestore.rules` (`isExchangeUpdate` dan aturan `exchanges`, angkanya tertulis langsung), tabel di `README.md`, dan `components/landing/PointRules.tsx` (yang membaca dari `scoring.ts`, jadi biasanya otomatis). Setelah mengubah `firestore.rules`, deploy ulang: `firebase deploy --only firestore:rules`.

**Jangan memakai Firebase Storage** (berbayar, pemilik proyek tidak mengaktifkannya). Foto bukti disimpan sebagai data URL JPEG terkompresi di koleksi `scanPhotos`, ditulis dalam transaksi yang sama dengan `scans`. Dokumen Firestore maksimal 1 MiB, jadi jangan menaikkan `MAX_DATA_URL_LENGTH` di `lib/photo.ts` melewati batas 400.000 di `firestore.rules`, dan jangan menaruh data URL di dokumen `scans` karena riwayat memuat semuanya.

**Data kosong atau gagal**: setiap daftar harus punya tiga state (loading, kosong, error) lewat `components/ui/States.tsx`. Jika Firestore kosong, `locations` jatuh ke data contoh dengan peringatan.

## Gaya dan konten

- Jangan mengarang data: tidak ada statistik, testimoni, foto area, atau rute nyata yang dibuat sendiri. Pakai placeholder yang jelas berlabel.
- Jangan memakai tanda pisah em dash di teks UI. Pakai koma, titik, atau titik dua.
- Elemen interaktif harus `button` atau `a[href]` asli, punya nama aksesibel, tinggi sentuh minimal 44px, dan fokus yang terlihat. Gerak harus berhenti di `prefers-reduced-motion` (sudah diatur lewat `MotionConfig` dan CSS global).
- Glassmorphism maksimal dua tempat, lewat `GlassCard`. Sekarang hanya label denah peta. Jangan menambahnya ke kartu lain.
- Judul dan angka memakai `font-display` (Big Shoulders), tanpa jarak huruf lebar. Jangan menambah bentuk pil atau animasi yang berulang tanpa henti. Gerak mengikuti tabel di `DESIGN.md` (kelas ada di `app/globals.css`); gerak baru harus punya alasan dan mati pada `prefers-reduced-motion`, termasuk `animation-delay`. Gerak masuk diulang tiap bagian kembali ke layar oleh `components/layout/ScrollMotion.tsx` (untuk `.reveal*` dan elemen `data-replay`): jangan menulis atribut DOM ke elemen React dari luar (galat hidrasi), dan jangan menjeda animasi dari event `resize`. Efek terikat gulir (`components/ui/ScrollLinked.tsx`, bilah progres) dijalankan CSS `animation-timeline`, bukan JavaScript (JavaScript tertinggal satu bingkai dari gulir dan bergetar). Leluhurnya tidak boleh `overflow-hidden` (pakai `overflow-clip`), karena scroll container membuat linimasanya berhenti. Mode kurangi geraknya ditangani CSS (`[data-scroll-linked]`), bukan `useReducedMotion`, karena server tidak tahu preferensi pengguna. Bayangan solid bergeser hanya untuk plat utama (panggung hero, plat latihan, papan skor), dialog memakai bayangan lembut, tempat lain tanpa bayangan.
- Ilustrasi tong ada di `components/art/BinArt.tsx` (dibuat sendiri, dekoratif, `aria-hidden`). Jangan mengganti dengan ilustrasi stok, dan jangan menjadikan gambar satu-satunya pembawa informasi.
- Kelas Tailwind yang saling bertabrakan (misalnya `border-ink` dan `border-brick` sekaligus) tidak punya urutan pasti. Pilih salah satu lewat kondisi, jangan menumpuk keduanya.
- Tema hanya terang. Tidak ada mode gelap.

## Keamanan dan lingkungan

- `.env.local` berisi konfigurasi Firebase dan di-ignore git. `NEXT_PUBLIC_LOGIN_EMAIL_SENDER` (opsional) mengatur alamat pengirim email verifikasi yang ditampilkan di layar verifikasi, isi dengan pengirim SMTP sendiri di Firebase Console. Jangan di-commit. Template ada di `.env.example`.
- Jangan menyimpan service account key di repo.
- Saat menjalankan server uji di terminal, jangan mematikan proses lewat `taskkill /IM node.exe`, karena itu menghentikan semua proses Node milik pengguna.
