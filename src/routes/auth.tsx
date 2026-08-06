import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

/** Master admin account — always accepted in-app */
export const MASTER_ADMIN_EMAIL = "admin@ak.com";
export const MASTER_ADMIN_PASS = "admin1234";

function safeRedirect(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" || s.mode === "signin" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — AfroKernel" },
      { name: "description", content: "Sign in or create your free AfroKernel account to save progress, earn XP, and launch browser Linux labs." },
      { property: "og:title", content: "Sign in to AfroKernel" },
      { property: "og:description", content: "Save progress, streaks, XP, and launch Linux labs." },
    ],
  }),
  component: AuthPage,
});

function isMasterAdmin(email: string, password: string) {
  return email.trim().toLowerCase() === MASTER_ADMIN_EMAIL && password === MASTER_ADMIN_PASS;
}

function unlockLocalAdmin() {
  sessionStorage.setItem("afrokernel-admin-unlocked", "true");
  sessionStorage.setItem("afrokernel-local-admin", "true");
  sessionStorage.setItem("afrokernel-local-admin-email", MASTER_ADMIN_EMAIL);
}

async function ensureProfile(userId: string, displayName: string, email: string) {
  const base = {
    id: userId,
    display_name: displayName || email.split("@")[0],
    updated_at: new Date().toISOString(),
  };
  const withEmail = await supabase.from("profiles").upsert({ ...base, email } as never, { onConflict: "id" });
  if (withEmail.error) {
    await supabase.from("profiles").upsert({ ...base, headline: email } as never, { onConflict: "id" });
  }
  await supabase.from("user_stats").upsert(
    { user_id: userId, xp: 0, level: 1, streak_days: 0 } as never,
    { onConflict: "user_id" },
  );
}

async function trySupabaseAuth(email: string, password: string, displayName?: string) {
  const signedIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signedIn.error && signedIn.data.session?.user) {
    await ensureProfile(
      signedIn.data.session.user.id,
      displayName || (signedIn.data.session.user.user_metadata?.display_name as string) || email.split("@")[0],
      email,
    );
    return { ok: true as const, userId: signedIn.data.session.user.id };
  }

  const signedUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: { display_name: displayName || email.split("@")[0] },
    },
  });
  if (!signedUp.error && signedUp.data.session?.user) {
    await ensureProfile(signedUp.data.session.user.id, displayName || email.split("@")[0], email);
    return { ok: true as const, userId: signedUp.data.session.user.id };
  }

  const retry = await supabase.auth.signInWithPassword({ email, password });
  if (!retry.error && retry.data.session?.user) {
    await ensureProfile(retry.data.session.user.id, displayName || email.split("@")[0], email);
    return { ok: true as const, userId: retry.data.session.user.id };
  }

  return {
    ok: false as const,
    error: signedIn.error?.message || signedUp.error?.message || retry.error?.message || "Auth failed",
  };
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: modeFromUrl } = Route.useSearch();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(modeFromUrl === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const afterAuthPath = safeRedirect(redirect);

  useEffect(() => {
    if (user) {
      const goAdmin = sessionStorage.getItem("afrokernel-admin-unlocked") === "true";
      navigate({ to: goAdmin ? "/admin" : afterAuthPath, replace: true });
    }
  }, [user, navigate, afterAuthPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const displayName = name.trim() || cleanEmail.split("@")[0];

      if (isMasterAdmin(cleanEmail, cleanPass)) {
        unlockLocalAdmin();
        await trySupabaseAuth(cleanEmail, cleanPass, "Admin");
        navigate({ to: "/admin", replace: true });
        return;
      }

      if (mode === "signup") {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (signUpErr) throw signUpErr;

        let userId = data.session?.user?.id ?? data.user?.id;
        if (!data.session) {
          const { data: signedIn, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });
          if (signInErr) {
            setError("Account created. If email confirmation is on, confirm it, then sign in.");
            return;
          }
          userId = signedIn.session?.user?.id;
        }
        if (userId) await ensureProfile(userId, displayName, cleanEmail);
        navigate({ to: afterAuthPath, replace: true });
        return;
      }

      const result = await trySupabaseAuth(cleanEmail, cleanPass, displayName);
      if (!result.ok) {
        throw new Error("Invalid login credentials. Check your email and password, or create an account.");
      }
      navigate({ to: afterAuthPath, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <h1 className="text-2xl font-bold font-display">
            {mode === "signup" ? "Join AfroKernel" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {redirect?.startsWith("/courses")
              ? "Create an account or sign in to start your course."
              : mode === "signup"
                ? "Free forever. Learn Linux, hands-on."
                : "Sign in to keep your streak alive."}
          </p>

          <form onSubmit={onSubmit} className="space-y-3 mt-4">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (6+ chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup" ? "Create account & start learning" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "signup" ? "Already have an account?" : "New to AfroKernel?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
