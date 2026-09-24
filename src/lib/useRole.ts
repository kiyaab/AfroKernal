import { useAuth } from "./AuthContext";

export type AppRole = "admin" | "instructor" | "user";

/**
 * Hook to retrieve user roles.
 * PostgreSQL role data is the sole authorization source.
 */
export function useRoles() {
  const { user, learnerProfile, loading } = useAuth();

  let roles: AppRole[] = [];

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

  const isAdmin = roles.includes("admin");
  const isEditor = isAdmin || roles.includes("instructor");

  return {
    roles,
    loading,
    isAdmin,
    isEditor,
  };
}
