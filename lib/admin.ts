import type { User } from "firebase/auth";

/**
 * Satu-satunya akun admin. Samakan dengan `isAdmin()` di firestore.rules: penjaga di aplikasi ini hanya
 * mengatur tampilan, sedangkan yang benar-benar melindungi data adalah aturan Firestore.
 */
export const ADMIN_EMAIL = "lintararyadwi@gmail.com";

/** Akun admin harus masuk lewat Google dan emailnya terverifikasi, persis seperti syarat di aturan Firestore. */
export function isAdminUser(user: Pick<User, "email" | "emailVerified" | "providerData"> | null): boolean {
  if (!user || !user.emailVerified) return false;
  if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL) return false;
  return user.providerData.some((provider) => provider.providerId === "google.com");
}
