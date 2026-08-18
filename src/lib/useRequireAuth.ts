import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";

/**
 * Hook that gates a route behind authentication.
 * If the user is not logged in (and loading is complete), it navigates
 * to /auth with a `redirect` search param pointing back to the current page.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth();
 *   if (loading) return <AuthLoadingScreen />;
 *   if (!user) return null;
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      navigate({
        to: "/auth",
        search: { redirect: currentPath },
        replace: true,
      });
    }
  }, [loading, user, navigate]);

  return { user, loading, isAuthenticated: !!user };
}
