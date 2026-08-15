import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_STORAGE_SESSION_KEY = "afrokernel_current_user_v2";

const LOCAL_ADMIN_USER = {
  id: "master-admin-001",
  email: "admin@ak.com",
  app_metadata: {},
  user_metadata: { display_name: "Master Administrator" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. Check Supabase authenticated user session
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user };
      }
    } catch {
      // Supabase network unreachable or in local mode
    }

    // 2. Check local authenticated user session in localStorage / sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (stored) {
          const localUser = JSON.parse(stored);
          if (localUser && (localUser.id || localUser.email)) {
            return { user: localUser };
          }
        }
      } catch {
        /* ignore parsing errors */
      }

      // 3. Check master admin local unlock
      const unlocked =
        sessionStorage.getItem("afrokernel-admin-unlocked") === "true" ||
        sessionStorage.getItem("afrokernel-local-admin") === "true";
      if (unlocked) {
        return { user: LOCAL_ADMIN_USER as never };
      }
    }

    // Not authenticated -> redirect to auth with return path
    throw redirect({
      to: "/auth",
      search: {
        redirect: location.pathname || "/dashboard",
      },
    });
  },
  component: () => <Outlet />,
});
