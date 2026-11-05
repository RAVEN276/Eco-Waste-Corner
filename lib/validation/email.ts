export const UPJ_STUDENT_DOMAIN = "@student.upj.ac.id";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Strict check: the address must end with `@student.upj.ac.id` and have a
 * non-empty local part. Subdomain tricks such as `a@evil.com#@student.upj.ac.id`
 * or `a@x.student.upj.ac.id` are rejected by the single-`@` requirement.
 */
export function isUpjStudentEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (!normalized.endsWith(UPJ_STUDENT_DOMAIN)) return false;
  const local = normalized.slice(0, -UPJ_STUDENT_DOMAIN.length);
  return local.length > 0 && !local.includes("@") && !/\s/.test(local);
}

export const EMAIL_DOMAIN_ERROR =
  "Gunakan email Student UPJ berakhiran @student.upj.ac.id.";
