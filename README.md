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

1. **Authentication**: aktifkan provider **Google** dan **Email/Password** (tidak perlu mengaktifkan _Email link_). Tambahkan `localhost` dan domain produksi di _Authorized domains_.
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
| `users/{uid}`            | `uid`, `email`, `nama`, `prodi`, `poin` (hasil scan, bisa ditukar), `poinJSDP` (hasil penukaran, syarat kelulusan), `totalScan`, `cooldownUntil`, `createdAt`                                                                                                 |
| `exchanges/{exchangeId}` | `exchangeId`, `userId`, `poinSpent`, `jsdpGained`, `timestamp`                                                                                                                                                                                                |
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
| `store/`                  | Zustand: `useUserStore` (auth, poin, poin JSDP, cooldown)                         |
| `hooks/`                  | `useCooldown`, `useRequireAuth`, `useRemoteList`, `useScanHistory`, `useExchangeHistory`, `useSignOut` |
| `scripts/`                | `seed-firestore.mjs` (isi lokasi), `reset-accounts.mjs` (reset semua akun ke 0), `clear-history.mjs` (hapus riwayat pembuangan semua user) |
| `DESIGN.md`               | Arah visual: identitas, palet dan kontras, tipografi, dial, komposisi halaman     |
| `lib/firebase/`           | Config, auth, firestore, pemetaan error                                           |
| `lib/validation/email.ts` | `isValidEmail`, panjang minimal kata sandi, pesan validasi                        |
| `lib/scoring.ts`          | Poin berjenjang, penalti, cooldown 15 menit, kurs penukaran                       |
| `lib/photo.ts`            | Validasi, hash, dan kompresi foto bukti                                           |

## Aturan poin

| Kuis          | Foto  | Poin           |
| ------------- | ----- | -------------- |
| Semua benar   | Ada   | Dasar + 2      |
| Semua benar   | Tidak | Setengah dasar |
| Separuh benar | Ada   | Setengah dasar |
| Lainnya       |       | 0              |

Poin dasar: Organik 3, Plastik/Kertas 5, Residu 2. Penalti: sampah tidak cocok dengan slot (-3), foto duplikat via hash SHA-256 (-3), scan saat cooldown (-2). Saldo tidak pernah di bawah 0.

## Penukaran ke poin JSDP

Poin hasil scan (`poin`) ditukar jadi poin JSDP (`poinJSDP`) di dashboard, per paket: 10 poin menjadi 5 poin JSDP. Jumlah yang ditukar selalu kelipatan 10, sisa poin tetap tersimpan, dan penukaran tidak bisa dibatalkan. Poin JSDP tidak bisa ditukar balik dan tidak ada target jumlah, jadi hanya dikumpulkan. Kurs ada di `EXCHANGE_POIN` dan `EXCHANGE_JSDP` di `lib/scoring.ts`. Angkanya juga tertulis di `firestore.rules` (fungsi `isExchangeUpdate` dan aturan `exchanges`), jadi ubah keduanya sekaligus lalu deploy ulang rules.

Mengembalikan semua akun ke 0: `npm run reset:accounts` (dry run), lalu `npm run reset:accounts -- --apply`. Tambahkan `--history` untuk ikut menghapus riwayat scan, foto bukti, dan penukaran. Skrip ini memakai service account key yang sama dengan `npm run seed` dan tidak bisa dibatalkan.

Menghapus riwayat pembuangan semua user saja, tanpa menyentuh akun: `npm run clear:history` (dry run), lalu `npm run clear:history -- --apply`. Skrip ini mengosongkan `scans` dan `scanPhotos`, lalu mengembalikan `totalScan` semua akun ke 0 supaya progress badge ikut hilang. Poin, poin JSDP, dan cooldown tidak berubah, dan deteksi foto duplikat mulai dari nol karena hash lama ikut terhapus. Tanpa `--apply`, skrip hanya menghitung dan tidak mengubah apa pun.

## Login dan email verifikasi

Login ada dua jalur, dan email apa pun boleh dipakai, termasuk Gmail:

- **Google**: tombol "Masuk dengan Google". Emailnya sudah diverifikasi Google.
- **Email dan kata sandi**: tab Daftar dan Masuk, plus Lupa kata sandi. Kata sandi minimal 8 karakter. Akun baru harus memverifikasi emailnya lewat tautan yang dikirim Firebase, karena `firestore.rules` mensyaratkan `email_verified`. Sebelum diverifikasi, aplikasi menganggap akun itu belum masuk (lihat `AuthProvider`), dan layar login menuntun verifikasinya: tombol "Saya sudah verifikasi" dan kirim ulang dengan jeda 60 detik.

Tidak ada lagi pembatasan domain `@student.upj.ac.id`, dan login tautan email dihapus.

### SMTP sendiri (opsional, memperbaiki pengiriman email)

Secara bawaan Firebase mengirim email verifikasi dan reset kata sandi dari `noreply@<authDomain>`. Pengirim itu kadang masuk Junk atau ditahan penyedia email penerima. Dengan SMTP sendiri, email keluar lewat server dan pengirim milikmu. Pengaturannya dilakukan di Firebase Console, bukan di kode.

1. Siapkan akun SMTP. Cara tercepat tanpa domain sendiri adalah akun Gmail khusus proyek ini (bukan akun pribadi): aktifkan verifikasi 2 langkah, lalu buat **App password** di Akun Google > Keamanan > Sandi aplikasi. Batasnya sekitar 500 penerima per hari.
2. Firebase Console > Authentication > Templates > **SMTP Settings** (lokasi ini dari tutorial pihak ketiga dan referensi REST Identity Platform, belum kuverifikasi langsung di konsol). Isi:
   - Sender address: alamat Gmail tadi
   - SMTP server host: `smtp.gmail.com`, port `587`, security mode `STARTTLS` (atau port `465` dengan `SSL`)
   - Username: alamat Gmail lengkap, password: App password 16 karakter (bukan kata sandi akun)
3. Masih di Templates, ubah bahasa template ke Indonesian dan nama pengirim ke "Eco Waste Corner UPJ" untuk template "Email address verification" dan "Password reset".
4. Isi `NEXT_PUBLIC_LOGIN_EMAIL_SENDER` di `.env.local` dengan alamat pengirim tadi (format `NEXT_PUBLIC_LOGIN_EMAIL_SENDER=alamat@gmail.com`), lalu restart `npm run dev`, supaya layar verifikasi menyebut pengirim yang benar.
5. Uji dengan mendaftar memakai emailmu sendiri, lalu cek Inbox dan Junk.

Jika menu SMTP Settings tidak ada atau terkunci di paket Spark, fitur itu butuh upgrade. Aplikasi tetap jalan dengan pengirim bawaan Firebase.

## Pemecahan masalah

| Gejala                                  | Penyebab dan solusi                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| "Metode login ini belum diaktifkan"     | Provider belum dinyalakan. Aktifkan Google dan Email/Password di Authentication > Sign-in method.                                           |
| "Domain situs ini belum didaftarkan"    | Tambahkan domain di Authentication > Settings > Authorized domains.                                                                        |
| "Login belum aktif" di halaman login    | `.env.local` belum terisi. Isi semua `NEXT_PUBLIC_FIREBASE_*`, lalu restart `npm run dev`.                                                 |
| "Akses ditolak oleh aturan keamanan"    | Rules belum di-deploy, atau emailmu belum terverifikasi.                                                                                   |
| Email verifikasi atau reset tidak sampai | Cek folder Junk atau Spam dan tunggu beberapa menit. Kirim ulang dari layar verifikasi (jeda 60 detik). Pengirim bawaan Firebase kadang ditahan penyedia email penerima: pasang SMTP sendiri (bagian "Login dan email verifikasi"). Email dari Gmail umumnya sampai. |
| Foto ditolak atau gagal diproses        | Format harus JPG, PNG, atau WebP, maksimal 10 MB. Foto yang terlalu kompleks untuk dikecilkan di bawah batas akan ditolak, coba foto lain. |

## Batasan yang perlu kamu tahu

- Perhitungan poin berjalan di klien. `firestore.rules` membatasi kenaikan poin (maks +7 per scan, hanya setelah cooldown selesai) dan menjaga kurs penukaran, tetapi untuk produksi sebaiknya perhitungan dan penukaran dipindah ke Cloud Function.
- Siapa pun dengan email apa pun bisa mendaftar, jadi aplikasi tidak bisa memastikan seseorang mahasiswa UPJ. Nama dan program studi diisi sendiri oleh pengguna di dashboard. Jika poin JSDP nanti harus dicocokkan dengan data mahasiswa resmi, perlu langkah tambahan di luar aplikasi ini.
- Status "Terverifikasi" berarti lolos pemeriksaan otomatis (kuis, kecocokan jenis sampah, foto unik). Belum ada review manual oleh admin.
- Denah di `/map` bersifat skematik. Foto area dan petunjuk rute diisi pengelola lewat Firestore.
