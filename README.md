# Eco Waste Corner UPJ

Aplikasi web edukasi dan pemilahan sampah untuk mahasiswa Universitas Pembangunan Jaya.
Next.js (App Router), TypeScript, Tailwind CSS 4, Framer Motion, Zustand, Firebase.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi kunci Firebase
npm run dev
```

Perintah lain: `npm run build`, `npm run lint`, `npm run seed`.

## Setup Firebase (sekali saja)

1. **Authentication**: aktifkan provider **Google** dan **Email link (passwordless)**. Tambahkan `localhost` dan domain produksi di _Authorized domains_.
2. **Firestore**: buat database, lalu deploy `firestore.rules`.

   Deploy dengan Firebase CLI: `npx firebase-tools login`, lalu `npx firebase-tools deploy --only firestore:rules` (proyek sudah diatur di `.firebaserc`). Kamu juga bisa menempel isi file itu di tab _Rules_ pada Console.

3. **Firebase Storage tidak dipakai** (berbayar). Foto bukti disimpan di Firestore, lihat bagian Foto bukti.
4. **Data awal** (`locations`):
   - Firebase Console > Project settings > Service accounts > _Generate new private key_, simpan di luar repo.
   - PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\key.json"; npm run seed`
   - Data awal ada di `lib/data/seed.json`. Ganti status kapasitas, `imageUrl`, dan `routeSteps` lewat Firestore Console.

Sebelum `locations` terisi, peta menampilkan data contoh dengan label peringatan.

## Skema Firestore

| Koleksi                  | Field                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{uid}`            | `uid`, `email`, `nama`, `prodi`, `poinJSDP`, `totalScan`, `cooldownUntil`, `createdAt`                                                                                                                                                                        |
| `scans/{scanId}`         | `scanId`, `userId`, `categoryBin`, `location`, `locationName`, `photoUrl`, `photoHash`, `itemType`, `quizAnswered`, `quizCorrect`, `quizTotal`, `pointsEarned` (bisa negatif), `status` (`verified`, `unverified`, `penalized`), `penaltyReason`, `timestamp` |
| `locations/{locationId}` | `locationId`, `name`, `coordinates` (`x`, `y` dalam persen pada denah), `statusCapacity` (`Kosong`, `Terisi`, `Penuh`), `imageUrl`, `routeSteps`                                                                                                              |
| `scanPhotos/{scanId}`    | `scanId`, `userId`, `mime`, `dataUrl`, `timestamp`                                                                                                                                                                                                            |

## Foto bukti

Foto disimpan di Firestore, bukan Storage. Satu dokumen maksimal 1 MiB, jadi `lib/photo.ts` mengecilkan foto di browser (sisi terpanjang maksimal 1024 px, JPEG, di bawah 300.000 karakter data URL) sebelum disimpan di `scanPhotos/{scanId}`. Dokumen `scans` hanya menyimpan `photoHash` dan, di field `photoUrl`, path dokumen fotonya (`scanPhotos/{scanId}`), supaya riwayat tidak ikut memuat gambar. Foto duplikat tidak disimpan lagi. Kualitas foto cukup untuk bukti, bukan untuk arsip. Di dashboard, tombol "Lihat foto" pada riwayat mengambil foto dari `scanPhotos` hanya saat diklik.

## Struktur

| Folder                    | Isi                                                                               |
| ------------------------- | --------------------------------------------------------------------------------- |
| `app/`                    | Route: `/`, `/login`, `/dashboard`, `/scan`, `/map`                               |
| `components/`             | `landing`, `auth`, `dashboard`, `scan`, `map`, `layout`, `ui`, `providers`        |
| `store/`                  | Zustand: `useUserStore` (auth, poin JSDP, cooldown)                    |
| `hooks/`                  | `useCooldown`, `useRequireAuth`, `useRemoteList`, `useScanHistory`                |
| `lib/firebase/`           | Config, auth, firestore, pemetaan error                                           |
| `lib/validation/email.ts` | `isUpjStudentEmail` (domain `@student.upj.ac.id`)                                 |
| `lib/scoring.ts`          | Poin berjenjang, penalti, cooldown 15 menit                                       |
| `lib/photo.ts`            | Validasi, hash, dan kompresi foto bukti                                           |

## Aturan poin

| Kuis          | Foto  | Poin           |
| ------------- | ----- | -------------- |
| Semua benar   | Ada   | Dasar + 2      |
| Semua benar   | Tidak | Setengah dasar |
| Separuh benar | Ada   | Setengah dasar |
| Lainnya       |       | 0              |

Poin dasar: Organik 3, Plastik/Kertas 5, Residu 2. Penalti: sampah tidak cocok dengan slot (-3), foto duplikat via hash SHA-256 (-3), scan saat cooldown (-2). Saldo tidak pernah di bawah 0.

## Pemecahan masalah

| Gejala                                  | Penyebab dan solusi                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| "Metode login ini belum diaktifkan"     | Provider belum dinyalakan. Aktifkan Google dan Email link di Authentication > Sign-in method.                                              |
| "Domain situs ini belum didaftarkan"    | Tambahkan domain di Authentication > Settings > Authorized domains.                                                                        |
| "Login belum aktif" di halaman login    | `.env.local` belum terisi. Isi semua `NEXT_PUBLIC_FIREBASE_*`, lalu restart `npm run dev`.                                                 |
| "Akses ditolak oleh aturan keamanan"    | Rules belum di-deploy, atau emailmu belum terverifikasi.                                                                                   |
| Foto ditolak atau gagal diproses        | Format harus JPG, PNG, atau WebP, maksimal 10 MB. Foto yang terlalu kompleks untuk dikecilkan di bawah batas akan ditolak, coba foto lain. |

## Batasan yang perlu kamu tahu

- Perhitungan poin berjalan di klien. `firestore.rules` membatasi kenaikan poin (maks +7 per scan, hanya setelah cooldown selesai), tetapi untuk produksi sebaiknya perhitungan dipindah ke Cloud Function.
- Login Google menerima email domain apa pun. Login lewat tautan email hanya menerima `@student.upj.ac.id`, dan pembatasan itu hanya di klien (rules hanya meminta email terverifikasi). Untuk memaksa domain di sisi server, tambahkan Auth blocking function.
- Status "Terverifikasi" berarti lolos pemeriksaan otomatis (kuis, kecocokan jenis sampah, foto unik). Belum ada review manual oleh admin.
- Denah di `/map` bersifat skematik. Foto area dan petunjuk rute diisi pengelola lewat Firestore.
