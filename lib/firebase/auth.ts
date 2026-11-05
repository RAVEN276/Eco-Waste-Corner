import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import {
  EMAIL_DOMAIN_ERROR,
  isUpjStudentEmail,
  normalizeEmail,
} from "@/lib/validation/email";

const EMAIL_STORAGE_KEY = "ewc:emailForSignIn";

export class DomainError extends Error {
  constructor(message = EMAIL_DOMAIN_ERROR) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Removes a freshly created account that failed the domain check, then signs
 * out. Deletion is best effort: a failure here must not hide the domain error.
 */
export async function rejectUser(user: User): Promise<void> {
  try {
    await user.delete();
  } catch {
    // ignore, fall through to sign out
  }
  await firebaseSignOut(getFirebaseAuth());
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  // Any Google account may sign in. Only the email-link flow is limited to the UPJ domain.
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

export async function sendLoginLink(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isUpjStudentEmail(normalized)) throw new DomainError();

  await sendSignInLinkToEmail(getFirebaseAuth(), normalized, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_STORAGE_KEY, normalized);
}

export function isLoginLink(url: string): boolean {
  return isSignInWithEmailLink(getFirebaseAuth(), url);
}

export function getStoredLoginEmail(): string | null {
  return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

export async function completeLoginLink(email: string, url: string): Promise<User> {
  const normalized = normalizeEmail(email);
  if (!isUpjStudentEmail(normalized)) throw new DomainError();

  const { user } = await signInWithEmailLink(getFirebaseAuth(), normalized, url);
  if (!isUpjStudentEmail(user.email)) {
    await rejectUser(user);
    throw new DomainError();
  }
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}
