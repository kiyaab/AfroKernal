/**
 * Admin Authentication & Identification by Unique Email
 * Identifies authorized administrators across both server-side Prisma auth and client-side route guards.
 */

export const DEFAULT_ADMIN_EMAILS = [
  "admin@ak.com",
  "admin@afrokernel.com",
  "admin@admin.com",
] as const;

/**
 * Checks whether an email or username corresponds to an authorized administrator.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();

  // 1. Direct match with designated admin unique emails
  if ((DEFAULT_ADMIN_EMAILS as readonly string[]).includes(clean)) {
    return true;
  }

  // 2. Direct match with standard admin username handles
  if (clean === "admin" || clean === "administrator" || clean === "root") {
    return true;
  }

  // 3. Dynamic match via environment variable ADMIN_EMAILS (comma-separated list)
  try {
    const envEmails =
      (typeof process !== "undefined" && process.env?.ADMIN_EMAILS) ||
      (typeof import.meta !== "undefined" &&
        (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_ADMIN_EMAILS) ||
      "";
    if (envEmails) {
      const list = envEmails.split(",").map((s: string) => s.trim().toLowerCase());
      if (list.includes(clean)) {
        return true;
      }
    }
  } catch {
    /* ignore environment lookup errors */
  }

  return false;
}
