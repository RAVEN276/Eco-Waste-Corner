import {
  GoogleAuthProvider,
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  verifyPasswordResetCode,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { clearSessionActivity } from "@/lib/firebase/session";
import { normalizeEmail } from "@/lib/validation/email";

/** Tautan reset kata sandi mengembalikan pengguna ke halaman /login setelah selesai di halaman default Firebase. */
function continueSettings(): ActionCodeSettings {
  return {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  };
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

/** Membuat akun email/kata sandi yang langsung aktif dipakai masuk tanpa verifikasi email. */
export async function registerWithEmail(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    normalizeEmail(email),
    password,
  );
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    normalizeEmail(email),
    password,
  );
  return user;
}

/** Mengirim tautan atur ulang kata sandi dengan `continueUrl` kembali ke `/login`. */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), normalizeEmail(email), continueSettings());
}

export async function verifyResetCode(oobCode: string): Promise<string> {
  return verifyPasswordResetCode(getFirebaseAuth(), oobCode);
}

export async function confirmResetPassword(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(getFirebaseAuth(), oobCode, newPassword);
}

export async function applyEmailVerificationCode(oobCode: string): Promise<void> {
  await applyActionCode(getFirebaseAuth(), oobCode);
}

export async function signOut(): Promise<void> {
  clearSessionActivity();
  await firebaseSignOut(getFirebaseAuth());
}
