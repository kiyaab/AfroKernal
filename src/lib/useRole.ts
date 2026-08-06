import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "instructor" | "user";

export function useRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const timeout = window.setTimeout(() => {
      if (alive) setLoading(false);
    }, 4000);

    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) {
          if (alive) {
            setRoles([]);
            setLoading(false);
          }
          return;
        }
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
        if (alive) {
          setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
        }
      } catch {
        if (alive) setRoles([]);
      } finally {
        if (alive) setLoading(false);
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, []);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isEditor: roles.includes("admin") || roles.includes("instructor"),
  };
}
