<div align="center">

<img src="./public/brand-logo.png" alt="Logo Eco Waste Corner UPJ" width="112" />

# Eco Waste Corner UPJ

**Ruang edukasi dan pemilahan sampah untuk mahasiswa Universitas Pembangunan Jaya.**

Pilah sampah di stasiun pilah kampus, pindai kode QR pada tong, jawab kuis singkat, unggah foto bukti dari kamera, kumpulkan poin, lalu tukarkan menjadi poin JSDP.

<p>
  <a href="#apa-itu-eco-waste-corner-upj">Tentang</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#aturan-poin-dan-penukaran-jsdp">Aturan Poin</a> •
  <a href="#menjalankan-secara-lokal">Instalasi</a> •
  <a href="#setup-firebase">Setup Firebase</a> •
  <a href="#saran-pengembangan">Saran</a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16.4.5-12182B?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16.4.5" />
  <img src="https://img.shields.io/badge/React-19.3.0-2438A6?style=flat-square&logo=react&logoColor=white" alt="React 19.3.0" />
  <img src="https://img.shields.io/badge/TypeScript-5-2438A6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-1E7A4B?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Firebase-13.2.0-F4B81E?style=flat-square&logo=firebase&logoColor=12182B" alt="Firebase 13.2.0" />
</p>

</div>

---

## Apa itu Eco Waste Corner UPJ?

**Eco Waste Corner UPJ** adalah aplikasi web edukasi sekaligus sistem pencatatan aktivitas pemilahan sampah di lingkungan kampus Universitas Pembangunan Jaya (UPJ). Aplikasi ini menghubungkan kebiasaan memilah sampah secara fisik di kampus dengan pencatatan **poin JSDP**, salah satu syarat kelulusan mahasiswa UPJ.

Di dalam aplikasi, terdapat dua jenis poin yang fungsinya dipisahkan secara tegas:

| Jenis Poin | Sumber | Fungsi |
| :--- | :--- | :--- |
| **Poin** | Aktivitas pindai QR, kuis, dan foto bukti yang disetujui admin | Saldo sementara hasil memilah sampah (dapat berkurang jika terkena penalti) |
| **Poin JSDP** | Penukaran satu arah dari saldo `poin` (`10 poin = 5 poin JSDP`) | Poin syarat kelulusan yang dikumpulkan di akun mahasiswa |

> [!NOTE]
> Penukaran hanya berlaku satu arah dari **poin** ke **poin JSDP**. Tidak ada katalog hadiah, keranjang belanja, maupun penukaran balik ke saldo awal.

### Alur Penggunaan di Kampus

Di kampus tersedia dua titik stasiun pilah (**Spot A: Dekat Pantry Kantin** dan **Spot B: Dekat Parkiran Motor**). Masing-masing lokasi memiliki tiga tong (**Organik**, **Plastik/Kertas**, dan **Residu**), sehingga total terdapat enam kode QR unik.

```text
[1] Datang ke Stasiun Pilah (Spot A / Spot B)
       │
       ▼
[2] Pindai QR di Tong (lokasi & kategori tong terbaca otomatis, tanpa pilihan manual)
       │
       ▼
[3] Jawab Kuis Singkat & Pilih Jenis Sampah
       │
       ▼
[4] Ambil Foto Bukti Langsung via Kamera Ponsel
       │
       ▼
[5] Verifikasi Admin (/admin) ──► Poin Masuk ke Saldo ──► Tukar ke Poin JSDP (/dashboard)
```

1. **Pindai QR tong**: Mahasiswa memindai QR memakai kamera bawaan ponsel atau pemindai langsung di halaman `/scan`. Lokasi dan jenis tong langsung terkunci dari URL QR (`/scan?lokasi=...&tong=...`).
2. **Jawab kuis**: Sistem memilih soal acak sesuai kategori tong yang dipindai.
3. **Pilih barang dan ambil foto bukti**: Foto diambil langsung melalui kamera ponsel (tanpa unggah file bebas dari galeri desktop) sebagai bukti pembuangan sesuai kategori tong.
4. **Tinjauan admin**: Hasil pemindaian bersaldo positif dicatat sebagai tertunda hingga admin menyetujuinya di `/admin`. Pelanggaran otomatis (sampah tidak sesuai tong, foto duplikat via hash SHA-256, atau scan saat jeda aktif) langsung mengurangi saldo.
5. **Tukar ke poin JSDP**: Setelah poin terkumpul, mahasiswa menukarnya per paket kelipatan `10 poin` menjadi `5 poin JSDP` di `/dashboard`.

### Halaman dan Fitur Aplikasi

| Route | Peran | Ringkasan Fitur |
| :--- | :--- | :--- |
| `/` | Beranda | Penjelasan aturan poin, kamus jenis sampah, dan latihan memilah interaktif |
| `/login` | Autentikasi | Masuk dengan Google atau Email/Password, daftar langsung aktif, dan lupa kata sandi |
| `/scan` | Alur Pemilahan | Pemindai QR kamera otomatis (`jsQR`), kuis per kategori, pemilihan barang, dan kamera bukti |
| `/map` | Peta Kampus | Denah skematik lokasi stasiun pilah lengkap dengan koordinat dan panduan rute jalan kaki |
| `/dashboard` | Dasbor Pengguna | Profil mahasiswa (nama & prodi), saldo `poin` & `poin JSDP`, panel penukaran, riwayat scan, dan riwayat penukaran |
| `/admin` | Konsol Admin | Tinjauan foto bukti, deteksi foto ganda, jawaban kuis per soal, dan persetujuan/penolakan poin (khusus akun Google admin, tanpa tautan di menu publik) |

---

## Tech Stack

Seluruh bagian aplikasi dibangun di atas arsitektur React Server/Client Components modern dengan Firebase sebagai backend autentikasi dan basis data.

### Inti Framework dan Antarmuka

| Teknologi | Versi | Peran di Proyek |
| :--- | :--- | :--- |
| **Next.js (App Router + Turbopack)** | `16.4.5` | Kerangka aplikasi web dengan `cacheComponents: true` dan optimasi `next/font` |
| **React & React DOM** | `19.3.0` | Pustaka antarmuka komponen interaktif |
| **TypeScript** | `5` | Pengetikan statis strict di seluruh halaman, hooks, store, dan lapisan Firebase |
| **Tailwind CSS** | `4` (`@tailwindcss/turbopack`) | Utilitas styling berbasis design token pada `app/globals.css` (tanpa `postcss.config`) |
| **Tipografi & Aset Visual** | Kustom (`next/font` & SVG) | **Big Shoulders** untuk judul/angka, **Atkinson Hyperlegible Next** untuk teks isi, serta ikon (`Icons.tsx`) dan ilustrasi (`BinArt.tsx`, `ItemArt.tsx`) buatan sendiri |

### State, Animasi, dan Utilitas Browser

| Teknologi | Versi | Peran di Proyek |
| :--- | :--- | :--- |
| **Zustand** | `5.0.16` | State management global (`useUserStore`) untuk sesi auth, profil, `poin`, `poinJSDP`, dan `cooldownUntil` |
| **Framer Motion** | `14.9.1` | Transisi alur langkah dan animasi UI dengan `MotionConfig` yang menghormati `prefers-reduced-motion` |
| **jsQR** | `1.4.0` | Pembacaan kode QR langsung di browser via `getUserMedia` (dimuat dinamis hanya saat langkah pindai dibuka) |
| **Web Crypto & Canvas API** | Bawaan Browser | Kompresi foto bukti JPEG (maksimal sisi `1024 px`) dan hashing SHA-256 di `lib/photo.ts` untuk deteksi foto duplikat |

### Backend, Basis Data, dan Perkakas CLI

| Teknologi | Versi | Peran di Proyek |
| :--- | :--- | :--- |
| **Firebase Auth** | `13.2.0` | Login Google dan Email/Password, manajemen masa sesi kustom (`session.ts`), serta reset kata sandi dengan `continueUrl` |
| **Cloud Firestore** | `13.2.0` | Penyimpanan dokumen pengguna, riwayat scan, foto bukti terkompresi (`scanPhotos`), penukaran, lokasi, dan bank soal kuis dengan aturan keamanan `firestore.rules` |
| **Firebase Admin SDK** | `14.5.0` | Utilitas CLI untuk pengisian data awal (`seed`), reset akun, dan pembersihan riwayat |
| **qrcode** | `1.5.4` | Generator kode QR siap cetak A4 (`.html`, `.svg`, dan `.png`) pada skrip `scripts/generate-qr.mjs` |

---

## Aturan Poin dan Penukaran JSDP

Perhitungan poin didefinisikan terpusat di [lib/scoring.ts](file:///D:/test/Personal/eco-waste-corner/lib/scoring.ts) dan dikawal batasannya di [firestore.rules](file:///D:/test/Personal/eco-waste-corner/firestore.rules).

### Perolehan Poin per Scan

| Hasil Kuis | Foto Bukti | Perhitungan Poin |
| :--- | :--- | :--- |
| Semua benar | Ada | Poin dasar + `2` |
| Semua benar | Tidak ada | Setengah poin dasar (dibulatkan ke atas) |
| Separuh benar | Ada | Setengah poin dasar (dibulatkan ke atas) |
| Lainnya | Apa pun | `0` |

- **Poin dasar kategori tong**: Organik `3`, Plastik/Kertas `5`, Residu `2`.
- **Penalti otomatis**: sampah tidak cocok dengan kategori tong (`-3`), foto duplikat terdeteksi via SHA-256 (`-3`), atau mengirim scan saat masa jeda masih berjalan (`-2`). Saldo tidak pernah turun di bawah `0`.
- **Jeda antar scan (cooldown)**: `5 menit` untuk scan normal, dan `15 menit` apabila terjadi pelanggaran.

### Kurs Penukaran Poin JSDP

- `10 poin` ditukar menjadi `5 poin JSDP` (berlaku kelipatan `10`).
- Sisa poin di bawah `10` tetap tersimpan di akun pengguna.
- Penukaran bersifat final dan diproses melalui transaksi Firestore (`submitExchange`).

> [!IMPORTANT]
> Jika mengubah nilai `EXCHANGE_POIN` atau `EXCHANGE_JSDP` di `lib/scoring.ts`, pastikan angka pada fungsi `isExchangeUpdate` dan aturan koleksi `exchanges` di `firestore.rules` ikut diperbarui, lalu deploy ulang aturan Firestore.

---

## Menjalankan Secara Lokal

### Prasyarat

- Node.js dan npm
- Proyek Firebase (Authentication dan Cloud Firestore aktif)

### Langkah Instalasi

```bash
npm install
cp .env.example .env.local   # isi seluruh variabel NEXT_PUBLIC_FIREBASE_*
npm run dev
```

Setelah server berjalan, buka `http://localhost:3000`.

### Daftar Perintah npm

| Perintah | Kegunaan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js |
| `npm run build` | Membuat build produksi (memvalidasi TypeScript dan prerender Cache Components) |
| `npm run lint` | Menjalankan ESLint di seluruh proyek |
| `npm run qr -- --base <URL>` | Membuat enam kode QR siap cetak di folder `qr-print/` |
| `npm run seed` | Mengisi koleksi `locations` dan `quizQuestions` ke Firestore |
| `npm run reset:accounts` | Mengembalikan saldo akun ke 0 (mode dry-run; tambahkan `-- --apply` untuk eksekusi dan `--history` untuk hapus riwayat) |
| `npm run clear:history` | Menghapus seluruh dokumen `scans` dan `scanPhotos` serta mereset `totalScan` ke 0 tanpa mengubah poin (tambahkan `-- --apply` untuk eksekusi) |

---

## Setup Firebase

1. **Authentication**:
   Aktifkan provider **Google** dan **Email/Password** (login tautan email tidak digunakan). Daftarkan `localhost` serta domain produksi (misalnya `eco-waste-corner.vercel.app`) pada **Authentication > Settings > Authorized domains**.
2. **Firestore Security Rules**:
   Buat database Firestore, lalu deploy aturan keamanan menggunakan Firebase CLI (proyek sudah ditautkan lewat `.firebaserc`):
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules
   ```
3. **Firebase Storage tidak digunakan**:
   Foto bukti disimpan langsung sebagai data URL JPEG terkompresi di koleksi `scanPhotos` agar proyek tetap berjalan pada paket gratis tanpa Storage.
4. **Isi Data Awal (`locations` dan `quizQuestions`)**:
   - Buat Service Account key di **Firebase Console > Project settings > Service accounts > Generate new private key**, lalu simpan di luar repositori.
   - Jalankan di PowerShell:
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\key.json"; npm run seed
     ```
   - `npm run seed` menimpa dokumen lokasi dengan `lib/data/seed.json`, sementara soal kuis dari `lib/data/quiz-bank.json` hanya ditambahkan jika dokumen belum ada (tambahkan `-- --overwrite-quiz` untuk menimpa soal).
   - Tanpa service account key, data dapat diisi melalui Firebase CLI MCP (`npx firebase-tools mcp --only firestore`). Sebelum `locations` terisi, peta menampilkan data contoh dengan label peringatan.

---

<details>
<summary><strong>Detail Teknis: Bank Soal Kuis, Skema Firestore, dan Halaman Admin</strong></summary>

### Bank Soal Kuis (`quizQuestions`)

Soal dibaca dari koleksi `quizQuestions` (di-cache 15 menit per tab). Rules mengizinkan akses baca publik dan menolak penulisan dari aplikasi klien, sehingga pengelolaan soal dilakukan lewat Firestore Console atau Admin SDK.

Setiap dokumen soal memiliki struktur:
- `category`: `organik`, `plastik_kertas`, atau `residu`
- `question`: teks pertanyaan
- `options`: array berisi minimal 2 pilihan jawaban
- `answerIndex`: indeks jawaban benar (dimulai dari `0`)
- `explanation`: penjelasan yang tampil setelah pengguna menjawab

Apabila data koleksi kosong, kurang dari 2 soal valid per kategori, atau gagal dimuat, aplikasi otomatis menggunakan data bawaan dari `lib/data/quiz-bank.json` disertai pemberitahuan.

### Skema Koleksi Firestore

| Koleksi | Field |
| :--- | :--- |
| `users/{uid}` | `uid`, `email`, `nama`, `prodi`, `poin`, `poinJSDP`, `totalScan`, `cooldownUntil`, `createdAt` |
| `exchanges/{exchangeId}` | `exchangeId`, `userId`, `poinSpent`, `jsdpGained`, `timestamp` |
| `scans/{scanId}` | `scanId`, `userId`, `categoryBin`, `location`, `locationName`, `photoUrl`, `photoHash`, `itemType`, `quizAnswered`, `quizCorrect`, `quizTotal`, `pointsEarned`, `status` (`verified`, `unverified`, `penalized`), `penaltyReason`, `timestamp`, `quizAnswers`, `review` |
| `locations/{locationId}` | `locationId`, `name`, `coordinates` (`x`, `y` dalam persen pada denah), `imageUrl`, `routeSteps` |
| `quizQuestions/{questionId}` | `category`, `question`, `options`, `answerIndex`, `explanation` |
| `scanPhotos/{scanId}` | `scanId`, `userId`, `mime`, `dataUrl`, `timestamp` |

### Halaman Admin (`/admin`)

Admin mengakses `/admin` langsung melalui URL (tanpa tautan di navigasi umum). Halaman ini menampilkan foto bukti, profil pengguna, kesesuaian barang dengan tong, jawaban kuis per soal, penanda foto ganda, serta filter status (`menunggu`, `disetujui`, `ditolak`).

Keputusan disimpan di field `review` (`status`: `approved` atau `rejected`, `note` wajib saat menolak maksimal 500 karakter, `reviewedBy`, `reviewedAt`).

- **Keamanan berbasis Firestore Rules**: `isAdmin()` di `firestore.rules` mewajibkan login Google terverifikasi dengan alamat email admin (`lintararyadwi@gmail.com`). Penjaga di sisi React hanya mengatur tampilan.
- **Mengganti akun admin**: Ubah alamat email pada `ADMIN_EMAIL` di `lib/admin.ts` dan fungsi `isAdmin()` di `firestore.rules`, lalu jalankan `firebase deploy --only firestore:rules`.

</details>

<details>
<summary><strong>Detail Operasional: Cetak Kode QR Tong dan Penyimpanan Foto Bukti</strong></summary>

### Kode QR Tong

Setiap kode QR berisi tautan langsung ke halaman scan, misalnya `https://eco-waste-corner.vercel.app/scan?lokasi=spot-a&tong=organik`. Pembacaan menggunakan logika tunggal di `lib/qr.ts`:
- **Kamera bawaan ponsel**: Membuka tautan scan dengan lokasi dan tong terisi (jika belum login, query string dibawa ke `?next=` agar tidak hilang setelah login).
- **Pemindai di halaman `/scan`**: Menyalakan kamera secara otomatis lewat `useCameraStream` saat langkah pindai terbuka dan tab aktif, lalu berhenti otomatis setelah QR terbaca atau pengguna berpindah halaman.

Langkah mencetak QR:
1. Deploy aplikasi terlebih dahulu agar URL produksi aktif.
2. Jalankan `npm run qr -- --base https://eco-waste-corner.vercel.app`.
3. Buka `qr-print/index.html` untuk lembar cetak A4 (gunakan skala 100% dan aktifkan *background graphics*), atau gunakan berkas `.svg` dan `.png` per tong yang ikut dihasilkan di folder `qr-print/`.
4. Tempel di masing-masing tong lalu uji pindai satu per satu.

### Foto Bukti (`scanPhotos`)

Pengambilan foto menggunakan `<input type="file" accept="image/*" capture="environment">` agar kamera ponsel langsung terbuka. Karena batas dokumen Firestore adalah 1 MiB, `lib/photo.ts` mengecilkan foto di browser (sisi terpanjang maksimal `1024 px`, format JPEG, maksimal data URL di bawah `300.000` karakter agar tetap aman di bawah batas `400.000` pada `firestore.rules`).

Dokumen `scans` hanya menyimpan `photoHash` dan referensi path `scanPhotos/{scanId}`. Gambar penuh baru dimuat saat pengguna menekan tombol **Lihat foto** di riwayat dashboard atau saat admin meninjau scan.

</details>

<details>
<summary><strong>Autentikasi, Masa Sesi, SMTP Reset Kata Sandi, dan Pemecahan Masalah</strong></summary>

### Login, Masa Sesi, dan Reset Kata Sandi

- **Metode masuk**: Akun Google atau Email dan kata sandi (minimal `8` karakter). Pendaftar baru dengan email langsung masuk ke aplikasi tanpa verifikasi email terlebih dahulu. Email apa pun diperbolehkan tanpa pembatasan domain kampus.
- **Masa berlaku sesi** (`lib/firebase/session.ts`): Sesi berakhir setelah **1 jam** pengguna aktif di dalam situs, atau setelah **10 menit** apabila pengguna meninggalkan situs (pindah tab atau menutup browser).
- **Lupa kata sandi**: Pemanggilan `sendPasswordResetEmail` menyertakan `actionCodeSettings` dengan `url: ${window.location.origin}/login` dan `handleCodeInApp: false` sehingga pengguna menyelesaikan reset di halaman default Firebase lalu diarahkan kembali ke `/login`.

### SMTP Sendiri (Opsional)

Secara default email reset kata sandi dikirim dari `noreply@<authDomain>` yang terkadang masuk ke folder Spam/Junk. Jika ingin memakai pengirim sendiri:
1. Siapkan akun Gmail khusus proyek, aktifkan verifikasi 2 langkah, dan buat **App password** 16 karakter.
2. Buka **Firebase Console > Authentication > Templates > SMTP Settings** dan atur host `smtp.gmail.com` (port `587` `STARTTLS` atau `465` `SSL`).
3. Sesuaikan bahasa template ke Indonesian dan nama pengirim ke **Eco Waste Corner UPJ**.

### Pemecahan Masalah Umum

| Gejala | Penyebab dan Solusi |
| :--- | :--- |
| "Metode login ini belum diaktifkan" | Aktifkan provider **Google** dan **Email/Password** di **Authentication > Sign-in method**. |
| "Domain situs ini belum didaftarkan" | Tambahkan `localhost` dan domain produksi di **Authentication > Settings > Authorized domains**. |
| "Login belum aktif" di `/login` | Variabel `NEXT_PUBLIC_FIREBASE_*` di `.env.local` belum lengkap. Isi lalu restart `npm run dev`. |
| "Akses ditolak oleh aturan keamanan" | Rules belum di-deploy (`firebase deploy --only firestore:rules`) atau sesi login sudah kedaluwarsa. |
| Email reset kata sandi tidak masuk | Periksa folder Spam/Junk. Bila masih tertahan penyedia email, konfigurasikan SMTP kustom di Firebase Console. |
| Kamera pemindai QR tidak menyala | Pastikan izin kamera browser aktif dan situs diakses melalui `https://` atau `localhost`. |
| Foto bukti gagal diproses | Format harus JPG, PNG, atau WebP maksimal `10 MB`. Jika foto terlalu kompleks untuk dikecilkan di bawah batas ukuran, ambil ulang dengan latar lebih sederhana. |
| QR terbaca bukan kode tong / lokasi tak dikenal | Pastikan `npm run seed` sudah dijalankan dan kode QR dicetak dari `npm run qr` dengan `locationId` yang cocok. |

</details>

---

## Struktur Proyek

| Direktori / Berkas | Deskripsi |
| :--- | :--- |
| `app/` | Halaman App Router: `/`, `/login`, `/dashboard`, `/scan`, `/map`, `/admin`, `error.tsx`, `not-found.tsx`, dan konfigurasi styling global `globals.css` |
| `components/` | Komponen terstruktur per domain: `landing`, `auth`, `dashboard`, `scan`, `map`, `admin`, `layout`, `art`, `ui`, dan `providers` |
| `store/` | Zustand store `useUserStore` untuk state autentikasi, profil, saldo poin, poin JSDP, dan cooldown |
| `hooks/` | Custom hooks: `useCooldown`, `useRequireAuth`, `useRemoteList`, `useScanHistory`, `useExchangeHistory`, `useSignOut`, `useCameraStream`, `useAdminScans` |
| `lib/` | Aturan poin (`scoring.ts`), validasi & kompresi foto (`photo.ts`), parser QR (`qr.ts`), data statis (`seed.json`, `quiz-bank.json`, `items.ts`), konfigurasi admin (`admin.ts`), serta modul `firebase/` |
| `scripts/` | Skrip CLI pemeliharaan: `seed-firestore.mjs`, `generate-qr.mjs`, `reset-accounts.mjs`, dan `clear-history.mjs` |
| `public/` | Aset publik termasuk logo utama (`brand-logo.png`) |
| `DESIGN.md` | Arah visual, aturan kontras warna, tipografi, dan dial desain proyek |
| `firestore.rules` | Aturan keamanan Firestore untuk kontrol akses pengguna, admin, transaksi poin, dan penukaran |

---

## Batasan dan Saran Pengembangan

### Batasan Versi Saat Ini

- **Perhitungan poin awal berjalan di klien**: Saldo baru bertambah setelah admin menyetujui scan di `/admin` (`firestore.rules` membatasi penyesuaian admin maks `+-7` per scan dan mengunci kurs penukaran).
- **Verifikasi identitas mahasiswa belum otomatis**: Siapa pun dengan email apa pun dapat mendaftar, sementara nama dan prodi diisi mandiri di dashboard.
- **Potensi pemindaian QR jarak jauh**: Tautan QR bersifat statis sehingga dapat difoto atau diketik manual; penahan saat ini mengandalkan foto kamera bukti, jeda 5/15 menit, penalti otomatis, dan tinjauan admin.
- **Denah peta bersifat skematik**: Foto area stasiun pilah dan langkah rute diisi pengelola lewat Firestore.

### Saran Pengembangan Selanjutnya

Berdasarkan arsitektur yang sudah berjalan saat ini, berikut beberapa peningkatan yang relevan untuk tahap berikutnya:

1. **Validasi Poin dan Penukaran via Cloud Functions**
   Memindahkan logika `submitScan` dan `submitExchange` dari transaksi klien ke Cloud Functions (bila proyek beralih ke paket Blaze) untuk menghilangkan ketergantungan pada perhitungan sisi klien.
2. **Verifikasi Identitas Mahasiswa (NIM / SSO UPJ)**
   Menambahkan validasi NIM atau integrasi email kampus saat pendaftaran maupun pengajuan penukaran JSDP agar pencatatan poin JSDP dapat langsung dicocokkan dengan data akademik kemahasiswaan.
3. **Pengamanan QR Lokasi (Geofencing atau Token Berkala)**
   Menambahkan pengecekan koordinat lokasi browser opsional atau rotasi parameter token QR berkala agar pemindaian benar-benar dilakukan di depan tong fisik.
4. **Penyimpanan Foto Bukti Jangka Panjang**
   Jika kapasitas bukti foto terus bertambah, memindahkan media dari koleksi `scanPhotos` Firestore ke object storage (seperti Firebase Storage atau Cloudflare R2) agar kueri basis data tetap ringan dan foto tersimpan dengan resolusi lebih baik.
5. **Ekspor Laporan JSDP untuk Admin**
   Menambahkan fitur unduh rekap CSV/XLSX di `/admin` berisi daftar mahasiswa, jumlah scan disetujui, dan total `poinJSDP` yang telah ditukar untuk mempermudah pelaporan berkala.
6. **Pengujian Otomatis**
   Menambahkan unit test (misalnya Vitest) untuk `lib/scoring.ts`, `lib/qr.ts`, dan `lib/validation/email.ts`, serta uji integrasi alur scan hingga penukaran JSDP.
