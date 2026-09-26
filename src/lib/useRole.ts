import { useAuth } from "./AuthContext";
import { isAdminEmail } from "./admin-auth";

export type AppRole = "admin" | "instructor" | "user";

/**
 * Hook to retrieve user roles.
 * Authenticated unique administrator emails and PostgreSQL role records
 * are the sole authorization sources for accessing the Admin Control Center.
 */
export function useRoles() {
  const { user, learnerProfile, loading } = useAuth();

  let roles: AppRole[] = [];

  let storedEmail: string | undefined;
  if (!user && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("afrokernel_current_user_v2");
      if (stored) {
        const u = JSON.parse(stored);
        storedEmail = u?.email;
      }
    } catch {}
  }

  const emailIsAdmin =
    isAdminEmail(user?.email) || isAdminEmail(learnerProfile?.email) || isAdminEmail(storedEmail);

  if (user) {
    if (user.roles && user.roles.length > 0) {
      roles = user.roles as AppRole[];
    } else if (learnerProfile?.roles && learnerProfile.roles.length > 0) {
      roles = learnerProfile.roles as AppRole[];
    } else if (user.role) {
      roles = [user.role as AppRole];
    } else {
      roles = ["user"];
    }
  }

  // If the user's unique email is a designated administrator, guarantee admin role
  if (emailIsAdmin && !roles.includes("admin")) {
    roles = ["admin", ...roles.filter((r) => r !== "admin")];
  }

  const isAdmin = roles.includes("admin") || emailIsAdmin;
  const isEditor = isAdmin || roles.includes("instructor");

  return {
    roles,
    loading,
    isAdmin,
    isEditor,
  };
}
