/** Turns Firebase error codes into short Indonesian messages for the UI. */
export function describeFirebaseError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Jendela login ditutup sebelum selesai. Coba lagi.";
    case "auth/popup-blocked":
      return "Popup login diblokir browser. Izinkan popup lalu coba lagi.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Koneksi bermasalah. Periksa internet kamu lalu coba lagi.";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "Tautan sudah kedaluwarsa atau pernah dipakai. Minta tautan baru.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
    case "auth/operation-not-allowed":
      return "Metode login ini belum diaktifkan di Firebase Console (Authentication > Sign-in method).";
    case "auth/unauthorized-domain":
      return "Domain situs ini belum didaftarkan di Firebase Authentication.";
    case "auth/unauthorized-continue-uri":
    case "auth/invalid-continue-uri":
      return "Alamat situs ini belum diizinkan untuk tautan di email. Tambahkan domainnya di Authentication > Settings > Authorized domains.";
    case "auth/quota-exceeded":
      return "Batas pengiriman email hari ini sudah tercapai. Coba lagi besok, atau masuk dengan Google.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau kata sandi salah.";
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Coba masuk, atau pakai Lupa kata sandi.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah. Pakai minimal 8 karakter.";
    case "auth/user-disabled":
      return "Akun ini dinonaktifkan.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Kunci API Firebase tidak valid. Periksa nilai NEXT_PUBLIC_FIREBASE_* di .env.local.";
    case "timeout":
      return "Server terlalu lama merespons. Periksa koneksi lalu coba lagi.";
    case "permission-denied":
      return "Akses ditolak oleh aturan keamanan. Pastikan kamu sudah login dan emailmu terverifikasi.";

    case "failed-precondition":
      return "Data belum siap dipakai. Coba lagi sebentar.";
    default:
      // Errors raised by our own code carry a readable message and no Firebase code.
      if (!code && error instanceof Error && error.message) return error.message;
      return code
        ? `Terjadi kesalahan (${code}). Coba lagi.`
        : "Terjadi kesalahan tak terduga. Coba lagi.";
  }
}
