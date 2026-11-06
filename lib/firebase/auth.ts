import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { normalizeEmail } from "@/lib/validation/email";

/**
 * Alamat pengirim email verifikasi dan reset kata sandi, ditampilkan di layar login supaya
 * pengguna tahu apa yang dicari di Junk. Bawaan Firebase adalah noreply@<authDomain>. Setelah SMTP
 * sendiri diatur di Firebase Console, isi NEXT_PUBLIC_LOGIN_EMAIL_SENDER dengan alamat pengirim
 * yang dipakai SMTP itu.
 */
export const LOGIN_EMAIL_SENDER =
  process.env.NEXT_PUBLIC_LOGIN_EMAIL_SENDER ||
  (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    ? `noreply@${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`
    : null);

/** Tautan di email membawa pengguna kembali ke halaman login setelah selesai. */
function continueSettings() {
  return { url: `${window.location.origin}/login` };
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  // Akun Google apa pun boleh masuk. Emailnya sudah diverifikasi Google.
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

export interface RegisterResult {
  user: User;
  /** Terisi bila akun terbuat tetapi email verifikasi gagal dikirim. Pengguna masih bisa kirim ulang. */
  verificationError: string | null;
}

/**
 * Membuat akun lalu mengirim email verifikasi. Akunnya tetap masuk di Firebase tetapi baru bisa
 * dipakai aplikasi setelah emailnya terverifikasi (lihat AuthProvider dan firestore.rules).
 */
export async function registerWithEmail(email: string, password: string): Promise<RegisterResult> {
  const { user } = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    normalizeEmail(email),
    password,
  );
  try {
    await sendEmailVerification(user, continueSettings());
    return { user, verificationError: null };
  } catch (error) {
    return { user, verificationError: describeFirebaseError(error) };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    normalizeEmail(email),
    password,
  );
  return user;
}

const SESSION_EXPIRED =
  "Sesi habis. Masuk lagi dengan email dan kata sandimu untuk melanjutkan verifikasi.";

export async function resendVerification(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error(SESSION_EXPIRED);
  await sendEmailVerification(user, continueSettings());
}

/**
 * Memuat ulang status akun dari Firebase. Mengembalikan true bila emailnya sudah terverifikasi.
 * AuthProvider mendengar perubahannya dan membuka akses aplikasi.
 */
export async function checkVerified(): Promise<boolean> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error(SESSION_EXPIRED);
  await user.reload();
  return user.emailVerified;
}

/**
 * Mengirim tautan reset kata sandi. Bila emailnya tidak terdaftar, hasilnya sama seperti berhasil,
 * supaya layar ini tidak bisa dipakai untuk menebak siapa yang punya akun.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), normalizeEmail(email), continueSettings());
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";
    if (code !== "auth/user-not-found") throw error;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}
