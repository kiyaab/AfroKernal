import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_ADMIN_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "admin@ak.com",
  app_metadata: {},
  user_metadata: { display_name: "Admin" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      return { user: data.user };
    }

    // Allow master admin local unlock (admin@ak.com / admin1234) without Supabase session
    if (typeof window !== "undefined") {
      const unlocked =
        sessionStorage.getItem("afrokernel-admin-unlocked") === "true" ||
        sessionStorage.getItem("afrokernel-local-admin") === "true";
      const path = location.pathname || "";
      if (unlocked && (path.startsWith("/admin") || path === "/dashboard" || path.startsWith("/profile"))) {
        return { user: LOCAL_ADMIN_USER as never };
      }
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
