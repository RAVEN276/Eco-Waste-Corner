<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Eco Waste Corner UPJ

Aplikasi web edukasi dan pemilahan sampah untuk kampus Universitas Pembangunan Jaya. Mahasiswa memindai slot tong (simulator), menjawab kuis, mengunggah foto bukti, lalu mendapat poin JSDP. Poin JSDP adalah syarat kelulusan, bukan alat tukar: jangan membuat fitur penukaran, katalog hadiah, atau keranjang. Teks antarmuka berbahasa Indonesia.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Framer Motion, Zustand 5, Firebase (Auth, Firestore), lucide-react.

## Perintah

- `npm run dev`: server pengembangan.
- `npm run build`: build produksi. Jalankan sebelum menyatakan pekerjaan selesai, karena prerender di proyek ini ketat (lihat bagian Cache Components).
- `npx tsc --noEmit` dan `npx eslint .`: cek tipe dan lint. Jika `tsc` mengeluh soal `.next/types`, jalankan `npm run build` sekali untuk membuat ulang tipe.
- `npm run seed`: mengisi koleksi `locations` dari `lib/data/seed.json` (butuh `GOOGLE_APPLICATION_CREDENTIALS`).

Tidak ada test runner. Verifikasi dilakukan lewat build, tsc, eslint, dan klik manual di browser.

## Struktur

- `app/`: route `/`, `/login`, `/dashboard`, `/scan`, `/map`, plus `error.tsx` dan `not-found.tsx`. `dashboard/page.tsx` adalah client component, jadi metadata-nya ada di `dashboard/layout.tsx`.
- `components/`: `landing`, `auth`, `dashboard`, `scan`, `map`, `layout`, `ui` (Button, Card, Dialog, States, AnimatedCounter), `providers`.
- `store/`: `useUserStore` (status auth, profil, `poinJSDP`, `cooldownUntil`, error).
- `hooks/`: `useCooldown`, `useRequireAuth`, `useRemoteList` (`useLocations`), `useScanHistory`.
- `lib/firebase/`: `config` (init lazy, `isFirebaseConfigured`), `auth`, `firestore` (semua baca/tulis data, termasuk transaksi scan), `errors` (kode error Firebase ke pesan Indonesia).
- `lib/scoring.ts`: satu-satunya tempat aturan poin, penalti, dan cooldown. `lib/data/`: bin, kuis, daftar jenis sampah, `seed.json`.
- `lib/photo.ts`: validasi, hash, dan kompresi foto bukti. `firebase.json` dan `.firebaserc` mengarah ke proyek `eco-waste-corner`.
- `firestore.rules`: aturan keamanan, harus selaras dengan angka di `lib/scoring.ts` (maks +7 poin per scan, cooldown, penalti turun sampai -3).

## Aturan penting saat mengubah kode

**Cache Components aktif** (`cacheComponents: true`). Memanggil `Math.random()`, `Date.now()`, atau `new Date()` saat render membuat build gagal. Panggil hanya di event handler atau `useEffect`. Contoh: `pickQuestions` hanya dipanggil dari klik tombol, dan `useCooldown` membaca jam di dalam effect. `useSearchParams` harus dibungkus `Suspense` (lihat `app/login/page.tsx`). Activity menjaga state halaman yang disembunyikan, jadi state sementara seperti dialog perlu direset saat unmount.

**Zustand v5**: selector yang mengembalikan objek atau array baru di setiap panggilan menyebabkan render tanpa henti. Ambil nilai primitif atau referensi stabil, lalu turunkan dengan `useMemo` (lihat `PointsCard`).

**Tailwind** dimuat lewat loader Turbopack di `next.config.ts`, bukan PostCSS. Jangan menambah `postcss.config`. Token warna ada di `app/globals.css` (`forest`, `leaf`, `leaf-deep`, `mint`, `sand`, `charcoal`, `muted`, `sun`, `brick`).

**Kontras warna**: `leaf` (#2E8B57) hanya untuk grafis dan teks besar (4.2:1 di atas putih). Teks kecil di latar terang pakai `leaf-deep` atau `forest`. Teks di latar `forest` pakai putih atau `mint`. `brick` hanya untuk status (penuh, penalti).

**Autentikasi**: login Google menerima domain apa pun. Login tautan email hanya `@student.upj.ac.id`, divalidasi lewat `isUpjStudentEmail` di `lib/validation/email.ts`. Jangan menambah pengecekan domain di `AuthProvider`, karena itu pernah memblokir login Google.

**Poin dihitung di klien** (`submitScan` di `lib/firebase/firestore.ts`, memakai transaksi). Jika mengubah angka di `lib/scoring.ts`, ubah juga batas di `firestore.rules`, tabel di `README.md`, dan `components/landing/PointRules.tsx` (yang membaca dari `scoring.ts`, jadi biasanya otomatis).

**Jangan memakai Firebase Storage** (berbayar, pemilik proyek tidak mengaktifkannya). Foto bukti disimpan sebagai data URL JPEG terkompresi di koleksi `scanPhotos`, ditulis dalam transaksi yang sama dengan `scans`. Dokumen Firestore maksimal 1 MiB, jadi jangan menaikkan `MAX_DATA_URL_LENGTH` di `lib/photo.ts` melewati batas 400.000 di `firestore.rules`, dan jangan menaruh data URL di dokumen `scans` karena riwayat memuat semuanya.

**Data kosong atau gagal**: setiap daftar harus punya tiga state (loading, kosong, error) lewat `components/ui/States.tsx`. Jika Firestore kosong, `locations` jatuh ke data contoh dengan peringatan.

## Gaya dan konten

- Jangan mengarang data: tidak ada statistik, testimoni, foto area, atau rute nyata yang dibuat sendiri. Pakai placeholder yang jelas berlabel.
- Jangan memakai tanda pisah em dash di teks UI. Pakai koma, titik, atau titik dua.
- Elemen interaktif harus `button` atau `a[href]` asli, punya nama aksesibel, tinggi sentuh minimal 44px, dan fokus yang terlihat. Gerak harus berhenti di `prefers-reduced-motion` (sudah diatur lewat `MotionConfig` dan CSS global).
- Glassmorphism hanya di dua tempat (panel hero dan label peta). Jangan menambahnya ke kartu lain.
- Tema hanya terang. Tidak ada mode gelap.

## Keamanan dan lingkungan

- `.env.local` berisi konfigurasi Firebase dan di-ignore git. Jangan di-commit. Template ada di `.env.example`.
- Jangan menyimpan service account key di repo.
- Saat menjalankan server uji di terminal, jangan mematikan proses lewat `taskkill /IM node.exe`, karena itu menghentikan semua proses Node milik pengguna.
