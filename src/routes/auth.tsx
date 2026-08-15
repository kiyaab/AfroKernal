import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth, upsertLearnerRecord, getAllLearnerRecords } from "@/lib/AuthContext";
import { isMasterAdmin, unlockLocalAdmin, MASTER_ADMIN_EMAIL } from "@/lib/admin-credentials";
import {
  Loader2,
  Eye,
  EyeOff,
  Terminal,
  BookOpen,
  Award,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";

function safeRedirect(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string; mode?: "signup" | "signin" } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" || s.mode === "signin" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in & Join — AfroKernel" },
      { name: "description", content: "Sign in or create your free AfroKernel account to unlock Linux courses, take practice exams, earn certificates, and launch browser terminals." },
      { property: "og:title", content: "Join AfroKernel Linux Learning" },
      { property: "og:description", content: "Save course progress, take timed certification exams, earn XP, and launch browser terminals." },
    ],
  }),
  component: AuthPage,
});

async function ensureProfile(userId: string, displayName: string, email: string) {
  const base = {
    id: userId,
    display_name: displayName || email.split("@")[0],
    updated_at: new Date().toISOString(),
  };

  upsertLearnerRecord({
    id: userId,
    displayName: displayName || email.split("@")[0],
    email,
    xp: 150,
    level: 1,
    streak: 1,
    roles: email.toLowerCase() === MASTER_ADMIN_EMAIL ? ["admin", "instructor", "user"] : ["user"],
    enrolledCourses: ["linux"],
    completedLessons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  });

  try {
    const withEmail = await supabase.from("profiles").upsert({ ...base, email } as never, { onConflict: "id" });
    if (withEmail.error) {
      await supabase.from("profiles").upsert({ ...base, headline: email } as never, { onConflict: "id" });
    }
    await supabase.from("user_stats").upsert(
      { user_id: userId, xp: 150, level: 1, streak_days: 1 } as never,
      { onConflict: "user_id" },
    );
  } catch {
    /* fallback gracefully */
  }
}

/* ---------- Feature bullets for the left panel ---------- */
const FEATURES = [
  { icon: BookOpen, text: "6 Structured curriculum tracks (Linux, Security, DevOps, Cloud)" },
  { icon: Terminal, text: "Live in-browser Linux terminals & hands-on labs" },
  { icon: Award, text: "Timed practice certification exams & instant grading" },
  { icon: Shield, text: "Verifiable digital certificates of completion" },
  { icon: Zap, text: "AI-powered Linux tutor assistant 24/7" },
];

/* ---------- Main Auth Page ---------- */
function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: modeFromUrl } = Route.useSearch();
  const { user, setLocalSessionUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(modeFromUrl === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const afterAuthPath = safeRedirect(redirect);

  useEffect(() => {
    if (user) {
      const goAdmin = sessionStorage.getItem("afrokernel-admin-unlocked") === "true";
      navigate({ to: goAdmin ? "/admin" : afterAuthPath, replace: true });
    }
  }, [user, navigate, afterAuthPath]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "signup" ? "signin" : "signup"));
    setError(null);
    setSuccess(null);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const displayName = name.trim() || cleanEmail.split("@")[0];

      if (!cleanEmail || !cleanPass) {
        throw new Error("Please enter both email and password.");
      }

      /* ── Master Admin Bypass ─────────────────────────────── */
      if (isMasterAdmin(cleanEmail, cleanPass)) {
        unlockLocalAdmin(cleanEmail);
        const adminUser = {
          id: "master-admin-001",
          email: cleanEmail,
          user_metadata: { display_name: "Master Administrator" },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User;

        setLocalSessionUser(adminUser);
        await ensureProfile("master-admin-001", "Master Administrator", cleanEmail);

        try {
          await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
        } catch {
          /* ignore network errors */
        }

        navigate({ to: "/admin", replace: true });
        return;
      }

      /* ── Sign Up ──────────────────────────────────────────── */
      if (mode === "signup") {
        if (cleanPass.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        let userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        try {
          const { data: sbData, error: sbErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              emailRedirectTo: window.location.origin,
              data: { display_name: displayName },
            },
          });

          if (!sbErr && (sbData.session?.user || sbData.user)) {
            userId = sbData.session?.user?.id ?? sbData.user?.id ?? userId;
          }
        } catch (sbErr) {
          console.warn("Supabase network sign-up unreachable, continuing with local registration:", sbErr);
        }

        const newUser = {
          id: userId,
          email: cleanEmail,
          user_metadata: { display_name: displayName },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User;

        setLocalSessionUser(newUser);
        await ensureProfile(userId, displayName, cleanEmail);
        navigate({ to: afterAuthPath, replace: true });
        return;
      }

      /* ── Sign In ──────────────────────────────────────────── */
      let userId = "";
      let isAuthed = false;
      let resolvedDisplayName = displayName;

      // 1️⃣ Try Supabase first
      try {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!signInErr && signInData.session?.user) {
          userId = signInData.session.user.id;
          resolvedDisplayName =
            signInData.session.user.user_metadata?.display_name ||
            signInData.session.user.email?.split("@")[0] ||
            displayName;
          isAuthed = true;
        }
      } catch (sbErr) {
        console.warn("Supabase network sign-in unreachable, checking local user registry:", sbErr);
      }

      // 2️⃣ Check local user registry (for offline / local accounts)
      const allLearners = getAllLearnerRecords();
      const existing = allLearners.find((l) => l.email.toLowerCase() === cleanEmail);

      if (isAuthed) {
        // Supabase auth succeeded
        const loggedUser = {
          id: userId,
          email: cleanEmail,
          user_metadata: { display_name: resolvedDisplayName },
          app_metadata: {},
          aud: "authenticated",
          created_at: existing?.createdAt || new Date().toISOString(),
        } as User;

        setLocalSessionUser(loggedUser);
        await ensureProfile(userId, resolvedDisplayName, cleanEmail);
        navigate({ to: afterAuthPath, replace: true });
        return;
      }

      if (existing) {
        // Local account found — allow sign-in (offline mode)
        const loggedUser = {
          id: existing.id,
          email: cleanEmail,
          user_metadata: { display_name: existing.displayName },
          app_metadata: {},
          aud: "authenticated",
          created_at: existing.createdAt,
        } as User;

        setLocalSessionUser(loggedUser);
        navigate({ to: afterAuthPath, replace: true });
        return;
      }

      // 3️⃣ No record found — tell the user clearly
      throw new Error("No account found with that email. Please check your credentials or create a new account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during authentication.");
    } finally {
      setLoading(false);
    }
  }

  const redirectContext = redirect?.startsWith("/courses")
    ? "Sign in or register to start your course and save your progress"
    : redirect?.startsWith("/exam")
      ? "Sign in or register to take the Practice Exam and save your test score"
      : redirect?.startsWith("/certification")
        ? "Sign in to take official certification exams and earn credentials"
        : redirect?.startsWith("/lab")
          ? "Sign in to launch your interactive cloud Linux terminal sandbox"
          : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* ───────── LEFT HERO PANEL ───────── */}
      <div className="relative hidden lg:flex lg:w-[50%] flex-col justify-between overflow-hidden p-10 xl:p-14 border-r border-border/60">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 20%, oklch(0.86 0.17 92 / 0.15), transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 80%, oklch(0.5 0.2 270 / 0.12), transparent 50%),
              linear-gradient(160deg, oklch(0.12 0.015 260), oklch(0.16 0.02 260))
            `,
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Top logo */}
        <div className="relative z-10">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              100% Free Linux & Cloud Education
            </div>
            <h1 className="mt-5 font-display text-4xl font-black tracking-tight xl:text-5xl">
              Master Linux,<br />
              <span className="text-gradient">the hands-on way.</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Join thousands of engineers learning Linux system administration, cybersecurity hardening, and DevOps with real browser terminals.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground/85">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur text-xs flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Enterprise-Grade Security</span>
              <span className="text-muted-foreground">Encrypted sessions with role-based access control and persistent progress.</span>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} AfroKernel Systems</span>
          <Link to="/terms" className="hover:text-foreground">Privacy & Terms</Link>
        </div>
      </div>

      {/* ───────── RIGHT FORM PANEL ───────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <ThemeToggle />
          </div>

          {/* Context Alert if user was redirected */}
          {redirectContext && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs space-y-1 animate-in fade-in">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Authentication Required
              </div>
              <p className="text-muted-foreground">{redirectContext}</p>
            </div>
          )}

          {/* Header */}
          <div>
            <h2 className="text-3xl font-display font-black tracking-tight text-foreground">
              {mode === "signup" ? "Create your free account" : "Welcome back, learner"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start taking courses, practice exams, and saving your progress."
                : "Enter your credentials to continue your Linux mastery."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 rounded-2xl bg-secondary/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
              className={`rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
              className={`rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Create Account
            </button>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-500 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name / Display Handle
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Kernel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  {mode === "signup" ? "Create Free Account & Start" : "Sign In to AfroKernel"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button onClick={toggleMode} className="font-bold text-primary hover:underline">
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{" "}
                <button onClick={toggleMode} className="font-bold text-primary hover:underline">
                  Sign up for free
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
