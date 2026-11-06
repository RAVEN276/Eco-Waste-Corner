# Eco Waste Corner UPJ

Aplikasi web edukasi dan pemilahan sampah untuk mahasiswa Universitas Pembangunan Jaya.
Next.js (App Router), TypeScript, Tailwind CSS 4, Framer Motion, Zustand, Firebase.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi kunci Firebase
npm run dev
```

Perintah lain: `npm run build`, `npm run lint`, `npm run seed`, `npm run qr` (membuat kode QR tong, lihat bagian Kode QR tong).

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

## Kode QR tong

Ada dua lokasi (Spot A dekat Pantry Kantin, Spot B dekat Parkiran Motor) dan tiga tong di tiap lokasi (Organik, Plastik/Kertas, Residu), jadi ada enam kode QR. Satu kode menyatakan satu tong di satu lokasi. Mahasiswa tidak memilih apa pun: begitu QR dipindai, lokasi dan jenis tong terbaca dari kodenya.

Isi QR adalah tautan ke halaman scan, misalnya `https://eco-waste-corner.vercel.app/scan?lokasi=spot-a&tong=organik`. `lokasi` adalah `locationId` di `lib/data/seed.json`, dan `tong` adalah `organik`, `plastik_kertas`, atau `residu`. Ada dua cara membacanya, dan keduanya memakai pembaca yang sama di `lib/qr.ts`:

- Aplikasi kamera bawaan ponsel: tautannya langsung membuka halaman Scan dengan lokasi dan tong terisi. Kalau belum login, pengguna diarahkan ke halaman login dan kembali ke tautan yang sama setelah masuk.
- Halaman Scan: kamera pemindai langsung menyala saat halaman dibuka (jsQR, diunduh hanya saat pemindai dibuka), tanpa tombol buka atau tutup. Kamera mati sendiri saat QR terbaca, saat pengguna pindah halaman, dan saat tab ada di latar belakang.

Membuat dan mencetak:

1. Deploy aplikasi dulu, karena alamatnya tertanam di QR.
2. Jalankan `npm run qr -- --base https://eco-waste-corner.vercel.app` (harus https, kecuali `localhost` untuk uji coba).
3. Hasilnya ada di folder `qr-print/` (tidak ikut git): `index.html` berisi lembar cetak A4 satu halaman per lokasi (buka di browser, cetak dengan skala 100% dan "background graphics" aktif), ditambah file `.svg` (vektor, disarankan untuk percetakan) dan `.png` per kode.
4. Tempel tiap kode di tong yang sesuai dengan lokasinya, lalu pindai satu per satu dengan ponsel untuk memastikan halaman Scan menampilkan lokasi dan tong yang benar.

Kalau alamat aplikasi berubah, semua kode harus dicetak ulang. Untuk lokasi baru, tambahkan di `lib/data/seed.json` (id huruf kecil dan tanda hubung), jalankan `npm run seed`, lalu `npm run qr`.

Batasan: kode QR bisa difoto lalu dipindai dari jauh, atau tautannya diketik manual. Penghalang yang ada: foto bukti hanya dari kamera, jeda 15 menit, dan penalti untuk jenis sampah yang tidak cocok dengan tong. Memastikan orangnya benar-benar berada di lokasi butuh pemeriksaan di server (misalnya kode yang berganti berkala), yang memerlukan Cloud Functions.

## Foto bukti

Foto bukti diambil lewat kamera ponsel: tombolnya memicu `<input type="file" accept="image/*" capture="environment">`, jadi di ponsel kamera langsung terbuka. `capture` hanyalah petunjuk untuk browser. Di komputer yang muncul pemilih berkas, dan sebagian browser ponsel masih menawarkan galeri, jadi aplikasi tidak bisa melarang foto lama sepenuhnya.

Foto disimpan di Firestore, bukan Storage. Satu dokumen maksimal 1 MiB, jadi `lib/photo.ts` mengecilkan foto di browser (sisi terpanjang maksimal 1024 px, JPEG, di bawah 300.000 karakter data URL) sebelum disimpan di `scanPhotos/{scanId}`. Dokumen `scans` hanya menyimpan `photoHash` dan, di field `photoUrl`, path dokumen fotonya (`scanPhotos/{scanId}`), supaya riwayat tidak ikut memuat gambar. Foto duplikat tidak disimpan lagi. Kualitas foto cukup untuk bukti, bukan untuk arsip. Di dashboard, tombol "Lihat foto" pada riwayat mengambil foto dari `scanPhotos` hanya saat diklik.

## Struktur

| Folder                    | Isi                                                                               |
| ------------------------- | --------------------------------------------------------------------------------- |
| `app/`                    | Route: `/`, `/login`, `/dashboard`, `/scan`, `/map`                               |
| `components/`             | `landing`, `auth`, `dashboard`, `scan`, `map`, `layout`, `ui`, `providers`        |
| `store/`                  | Zustand: `useUserStore` (auth, poin, poin JSDP, cooldown)                         |
| `hooks/`                  | `useCooldown`, `useRequireAuth`, `useRemoteList`, `useScanHistory`, `useExchangeHistory`, `useSignOut`, `useCameraStream` |
| `scripts/`                | `seed-firestore.mjs` (isi lokasi), `generate-qr.mjs` (enam QR tong), `reset-accounts.mjs` (reset semua akun ke 0), `clear-history.mjs` (hapus riwayat pembuangan semua user) |
| `DESIGN.md`               | Arah visual: identitas, palet dan kontras, tipografi, dial, komposisi halaman     |
| `lib/firebase/`           | Config, auth, firestore, pemetaan error                                           |
| `lib/validation/email.ts` | `isValidEmail`, panjang minimal kata sandi, pesan validasi                        |
| `lib/scoring.ts`          | Poin berjenjang, penalti, cooldown 15 menit, kurs penukaran                       |
| `lib/photo.ts`            | Validasi, hash, dan kompresi foto bukti                                           |
| `lib/qr.ts`               | Format dan pembaca isi QR tong (lokasi dan jenis tong)                            |

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
| Kamera pemindai QR tidak terbuka        | Izinkan kamera untuk situs ini di pengaturan browser. Kamera di dalam browser hanya jalan di https atau `localhost`, dan tidak jalan jika aplikasi lain sedang memakainya. Pemindaian QR tetap bisa lewat aplikasi kamera bawaan ponsel. |
| Foto bukti gagal diproses atau tidak terbaca | Format harus JPG, PNG, atau WebP, maksimal 10 MB. Foto yang terlalu kompleks untuk dikecilkan di bawah batas akan ditolak, ambil ulang dengan latar yang lebih sederhana. Foto bukti juga bisa dilewati dengan poin lebih sedikit. |
| QR terbaca "bukan kode tong" atau lokasinya tidak dikenal | QR bukan dari `npm run qr`, atau `locationId`-nya tidak ada di koleksi `locations`. Cetak ulang QR, dan pastikan `npm run seed` sudah dijalankan. |

## Batasan yang perlu kamu tahu

- Perhitungan poin berjalan di klien. `firestore.rules` membatasi kenaikan poin (maks +7 per scan, hanya setelah cooldown selesai) dan menjaga kurs penukaran, tetapi untuk produksi sebaiknya perhitungan dan penukaran dipindah ke Cloud Function.
- Siapa pun dengan email apa pun bisa mendaftar, jadi aplikasi tidak bisa memastikan seseorang mahasiswa UPJ. Nama dan program studi diisi sendiri oleh pengguna di dashboard. Jika poin JSDP nanti harus dicocokkan dengan data mahasiswa resmi, perlu langkah tambahan di luar aplikasi ini.
- Status "Terverifikasi" berarti lolos pemeriksaan otomatis (kuis, kecocokan jenis sampah, foto unik). Belum ada review manual oleh admin.
- Denah di `/map` bersifat skematik. Foto area dan petunjuk rute diisi pengelola lewat Firestore.
