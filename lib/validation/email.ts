export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Pemeriksaan bentuk saja (ada nama, satu @, ada domain bertitik). Email apa pun boleh dipakai,
 * termasuk Gmail. Firebase yang memeriksa sisanya, dan verifikasi email membuktikan alamatnya
 * memang milik pendaftar.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export const EMAIL_INVALID_ERROR = "Masukkan alamat email yang valid, misalnya nama@gmail.com.";
export const PASSWORD_SHORT_ERROR = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
export const PASSWORD_REQUIRED_ERROR = "Masukkan kata sandimu.";
