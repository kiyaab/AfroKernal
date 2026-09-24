import { useAuth } from "./AuthContext";
import { isMasterAdmin, MASTER_ADMIN_EMAIL } from "./admin-credentials";

export type AppRole = "admin" | "instructor" | "user";

export function useRoles() {
  const { user, learnerProfile, loading } = useAuth();

  let roles: AppRole[] = [];

  if (user) {
    const cleanEmail = (user.email || "").toLowerCase();
    if (
      cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() ||
      cleanEmail === "admin@afrokernel.com" ||
      cleanEmail === "bogemamo124@gmail.com"
    ) {
      roles = ["admin", "instructor", "user"];
    } else if (user.roles && user.roles.length > 0) {
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
