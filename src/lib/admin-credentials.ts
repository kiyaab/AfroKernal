/**
 * Master admin credentials — single private source of truth.
 * These are intentionally NOT re-exported from any route file so they
 * don't appear as named exports in the route tree / source map.
 */
export const MASTER_ADMIN_EMAIL = "admin@ak.com";
export const MASTER_ADMIN_PASS = "admin1234";

export function isMasterAdmin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MASTER_ADMIN_EMAIL &&
    password === MASTER_ADMIN_PASS
  );
}

export function unlockLocalAdmin(email = MASTER_ADMIN_EMAIL) {
  sessionStorage.setItem("afrokernel-admin-unlocked", "true");
  sessionStorage.setItem("afrokernel-local-admin", "true");
  sessionStorage.setItem("afrokernel-local-admin-email", email);
}
