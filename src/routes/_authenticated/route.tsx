import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const LOCAL_STORAGE_SESSION_KEY = "afrokernel_current_user_v2";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Check authenticated user session in localStorage
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
