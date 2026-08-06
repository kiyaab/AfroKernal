import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRoles } from "@/lib/useRole";
import {
  Shield,
  Plus,
  BookOpen,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Users,
  Package,
  Key,
  CheckCircle2,
  UserCheck,
  Zap,
  Terminal,
  Search,
  Lock,
  Flame,
  Award,
  SlidersHorizontal,
  TrendingUp,
  Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LINUX_FUNDAMENTALS_LESSONS } from "@/lib/linux-curriculum";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — AfroKernel Control Center" },
      { name: "description", content: "Deep admin control dashboard for AfroKernel: User management, course authoring, Linux administration package registry, and platform metrics." },
      { property: "og:title", content: "AfroKernel Deep Admin Control Center" },
      { property: "og:description", content: "Comprehensive control dashboard for users, courses, and Linux sysadmin packages." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isEditor, isAdmin, loading } = useRoles();
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("afrokernel-admin-unlocked") === "true";
  });

  useEffect(() => {
    if (sessionStorage.getItem("afrokernel-admin-unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  const hasAccess = isEditor || isAdmin || unlocked;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><Logo /></Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3.5 h-3.5" /> Deep Admin Control Center
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Learner Dashboard
            </Link>
            <Link to="/courses" className="text-sm hover:text-primary">View Site</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && !unlocked && !hasAccess ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Verifying Admin Credentials…</div>
        ) : !hasAccess ? (
          <NoAccess onUnlock={() => setUnlocked(true)} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

function NoAccess({ onUnlock }: { onUnlock: () => void }) {
  const [busy, setBusy] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@ak.com");
  const [adminPass, setAdminPass] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const MASTER_ADMIN_EMAIL = "admin@ak.com";
  const MASTER_ADMIN_PASS = "admin1234";

  function unlockAdminAccess() {
    setBusy(true);
    setMsg(null);
    sessionStorage.setItem("afrokernel-admin-unlocked", "true");
    sessionStorage.setItem("afrokernel-local-admin", "true");
    sessionStorage.setItem("afrokernel-local-admin-email", MASTER_ADMIN_EMAIL);
    onUnlock();
    setBusy(false);

    void (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user) {
          try {
            await supabase.rpc("claim_first_admin");
          } catch {
            /* ignore */
          }
          try {
            await supabase.from("user_roles").insert({ user_id: u.user.id, role: "admin" } as never);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const passInput = adminPass.trim();
    const emailInput = adminEmail.trim().toLowerCase();

    const emailOk =
      !emailInput ||
      emailInput === "admin" ||
      emailInput.includes("admin") ||
      emailInput === MASTER_ADMIN_EMAIL;

    if (passInput === MASTER_ADMIN_PASS && emailOk) {
      unlockAdminAccess();
    } else {
      setMsg("Wrong password. Use admin@ak.com / admin1234");
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 ring-4 ring-primary/20">
        <Shield className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold font-display tracking-tight">Master Admin Sign In</h1>
      <p className="text-muted-foreground text-sm mt-1.5">
        Email: <span className="font-mono text-foreground">admin@ak.com</span>
        {" · "}
        Password: <span className="font-mono text-foreground">admin1234</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-border p-6 bg-card text-left space-y-4 shadow-2xl">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Email
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="admin@ak.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="admin1234"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
          />
        </div>

        {msg && (
          <p className="text-xs p-3 rounded-xl border text-destructive bg-destructive/10 border-destructive/20 font-medium">
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 hover:brightness-110 transition disabled:opacity-50 text-sm shadow-md"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          Open Admin
        </button>
      </form>
    </div>
  );
}

/* ==================== DEEP ADMIN CONTROL CENTER ==================== */

export function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<"courses" | "users" | "packages" | "settings">("courses");

  return (
    <div className="space-y-6">
      {/* Top Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {[
          { id: "courses", label: "Courses & Lessons", icon: BookOpen },
          { id: "users", label: "User Control Center", icon: Users },
          { id: "packages", label: "Linux Administration Packages", icon: Package },
          { id: "settings", label: "Admin Security & Logs", icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/60 hover:bg-accent border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "courses" && <AdminCoursesList />}
      {activeTab === "users" && <AdminUserManagement />}
      {activeTab === "packages" && <LinuxPackageRegistry />}
      {activeTab === "settings" && <AdminSecuritySettings />}
    </div>
  );
}

/* ==================== TAB 1: COURSES ==================== */

export function AdminCoursesList() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fundamentals");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("courses").insert({
        title: title.trim(),
        slug: slug || `course-${Date.now()}`,
        category,
        difficulty: "beginner",
        published: true,
        created_by: u.user?.id,
      } as never).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setTitle(""); setCreating(false);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["public-courses"] });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("courses").update({ published } as never).eq("id", id);
      if (error) throw error;
      // When publishing a course, also publish all of its lessons so learners can open them
      if (published) {
        await supabase.from("lessons").update({ published: true } as never).eq("course_id", id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["public-courses"] });
      qc.invalidateQueries({ queryKey: ["public-course"] });
      qc.invalidateQueries({ queryKey: ["public-course-lessons"] });
      qc.invalidateQueries({ queryKey: ["public-lesson"] });
    },
  });

  const seedLinux = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase.from("courses").select("id").eq("slug", "linux").maybeSingle();
      let courseId = existing?.id as string | undefined;
      const { data: u } = await supabase.auth.getUser();

      if (!courseId) {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            title: "Linux Fundamentals",
            slug: "linux",
            description:
              "A complete beginner-to-intermediate path: terminal basics, files, users, packages, services, and networking.",
            category: "Fundamentals",
            difficulty: "beginner",
            published: true,
            sort_order: 1,
            created_by: u.user?.id,
          } as never)
          .select("id")
          .single();
        if (error) throw error;
        courseId = data.id;
      } else {
        await supabase
          .from("courses")
          .update({
            title: "Linux Fundamentals",
            description:
              "A complete beginner-to-intermediate path: terminal basics, files, users, packages, services, and networking.",
            published: true,
          } as never)
          .eq("id", courseId);
        await supabase.from("lessons").delete().eq("course_id", courseId);
      }

      const rows = LINUX_FUNDAMENTALS_LESSONS.map((l) => ({
        course_id: courseId,
        slug: l.slug,
        title: l.title,
        lesson_type: l.lesson_type,
        content: l.content,
        video_url: l.video_url,
        xp_reward: l.xp_reward,
        sort_order: l.sort_order,
        published: true,
      }));
      const { error: lErr } = await supabase.from("lessons").insert(rows as never);
      if (lErr) throw lErr;
      return courseId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["public-courses"] });
      qc.invalidateQueries({ queryKey: ["public-course"] });
      qc.invalidateQueries({ queryKey: ["public-course-lessons"] });
      alert("Full Linux Fundamentals course installed (8 lessons). Open /courses/linux");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">Course Preparation & Authoring</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Author video lessons, attached PDF documentation, notes, and W3Schools-style practice challenges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Install / reset the full 8-lesson Linux Fundamentals course for learners?")) {
                seedLinux.mutate();
              }
            }}
            disabled={seedLinux.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/15 disabled:opacity-50"
          >
            {seedLinux.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            Install full Linux course
          </button>
          <Link
            to="/admin/manage-courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/5 transition shadow-sm"
          >
            <Zap className="w-4 h-4" /> All-in-One Creator
          </Link>
          <button
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Prepare New Course
          </button>
        </div>
      </div>

      {creating && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) createMut.mutate(); }}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-lg"
        >
          <div className="grid sm:grid-cols-[1fr_200px] gap-3">
            <input
              autoFocus
              placeholder="Course title (e.g. Linux System & Network Administration)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          {createMut.error && <p className="text-xs text-destructive">{(createMut.error as Error).message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!title.trim() || createMut.isPending} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
              {createMut.isPending ? "Creating…" : "Save & Start Authoring"}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl border border-border text-xs">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading courses…</div>
      ) : (courses ?? []).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/30">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">No courses prepared yet. Click "Prepare New Course" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((c) => (
            <Link
              key={c.id}
              to="/admin/$courseId"
              params={{ courseId: c.id }}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/60 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {c.category ?? "Linux Admin"}
                  </span>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePublish.mutate({ id: c.id, published: !c.published }); }}
                    disabled={togglePublish.isPending}
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition shadow-sm ${c.published ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/30" : "bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/30"}`}
                  >
                    {c.published ? "Published" : "Draft"}
                  </button>
                </div>
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">/{c.slug}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-primary font-medium">
                <span>Manage Video, PDF & Quizzes →</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== TAB 2: USER CONTROL CENTER ==================== */

type AdminUserRow = {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  location: string;
  website: string;
  githubUrl: string;
  learningGoal: string;
  preferredDistro: string;
  headline: string;
  xp: number;
  level: number;
  streak: number;
  roles: string[];
  updatedAt: string;
  createdAt: string;
};

function AdminUserManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: users, isLoading, error: usersError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminUserRow[]> => {
      const mapRow = (p: Record<string, unknown>): AdminUserRow => ({
        id: String(p.id ?? ""),
        displayName: String(p.display_name || p.displayName || "Learner"),
        email: String(p.email || p.headline || ""),
        bio: String(p.bio || ""),
        avatarUrl: String(p.avatar_url || p.avatarUrl || ""),
        location: String(p.location || ""),
        website: String(p.website || ""),
        githubUrl: String(p.github_url || p.githubUrl || ""),
        learningGoal: String(p.learning_goal || p.learningGoal || ""),
        preferredDistro: String(p.preferred_distro || p.preferredDistro || ""),
        headline: String(p.headline || ""),
        xp: Number(p.xp ?? 0),
        level: Number(p.level ?? 1),
        streak: Number(p.streak_days ?? p.streak ?? 0),
        roles: Array.isArray(p.roles) && p.roles.length ? (p.roles as string[]) : ["user"],
        updatedAt: String(p.updated_at || p.updatedAt || ""),
        createdAt: String(p.created_at || p.createdAt || ""),
      });

      const rpc = await supabase.rpc("admin_list_learners" as never);
      if (!rpc.error && Array.isArray(rpc.data)) {
        return (rpc.data as Record<string, unknown>[]).map(mapRow);
      }

      const { data: profiles, error: pErr } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (pErr) throw pErr;
      const { data: stats } = await supabase.from("user_stats").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");

      return (profiles ?? []).map((p) => {
        const s = (stats ?? []).find((st) => st.user_id === p.id);
        const r = (roles ?? []).filter((ro) => ro.user_id === p.id).map((ro) => ro.role);
        const row = p as Record<string, unknown>;
        return mapRow({
          ...row,
          xp: s?.xp ?? 0,
          level: s?.level ?? 1,
          streak_days: s?.streak_days ?? 0,
          roles: r.length > 0 ? r : ["user"],
          email: row.headline || "",
        });
      });
    },
    refetchInterval: 15_000,
  });

  const grantRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const addXp = useMutation({
    mutationFn: async ({ userId, xp }: { userId: string; xp: number }) => {
      const { data: s } = await supabase.from("user_stats").select("xp").eq("user_id", userId).maybeSingle();
      const curr = s?.xp ?? 0;
      const { error } = await supabase.from("user_stats").upsert({
        user_id: userId,
        xp: curr + xp,
        level: Math.floor((curr + xp) / 500) + 1,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.learningGoal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">User & Learner Control Center</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            All registered accounts with full profile info (auto-refreshes). Click a row for details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent"
          >
            Refresh
          </button>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {usersError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load all users: {(usersError as Error).message}. Sign in as a real admin account or apply the Supabase migration.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Platform Growth & Activity</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: "Mon", users: Math.max(2, Math.floor((users?.length ?? 1) * 0.4)), active: Math.max(1, Math.floor((users?.length ?? 1) * 0.25)) },
                  { name: "Tue", users: Math.max(3, Math.floor((users?.length ?? 1) * 0.5)), active: Math.max(1, Math.floor((users?.length ?? 1) * 0.3)) },
                  { name: "Wed", users: Math.max(3, Math.floor((users?.length ?? 1) * 0.65)), active: Math.max(2, Math.floor((users?.length ?? 1) * 0.4)) },
                  { name: "Thu", users: Math.max(4, Math.floor((users?.length ?? 1) * 0.75)), active: Math.max(2, Math.floor((users?.length ?? 1) * 0.5)) },
                  { name: "Fri", users: Math.max(5, Math.floor((users?.length ?? 1) * 0.85)), active: Math.max(3, Math.floor((users?.length ?? 1) * 0.6)) },
                  { name: "Sat", users: Math.max(5, Math.floor((users?.length ?? 1) * 0.95)), active: Math.max(3, Math.floor((users?.length ?? 1) * 0.7)) },
                  { name: "Sun", users: users?.length ?? 1, active: Math.max(1, Math.floor((users?.length ?? 1) * 0.8)) },
                ]}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.6 0.2 260)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.6 0.2 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0 0 / 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.5 0 0)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.5 0 0)" }} dx={-10} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "oklch(0.2 0 0)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="users" stroke="oklch(0.6 0.2 260)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="active" stroke="oklch(0.7 0.1 260)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-primary/5 p-5 shadow-sm flex flex-col justify-center text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-3xl font-bold font-display">{users?.length ?? 0}</h3>
          <p className="text-sm text-muted-foreground mt-1">Total Registered Learners</p>
          <div className="mt-6 pt-6 border-t border-primary/10">
            <h3 className="text-xl font-bold font-display">
              {users?.reduce((acc, u) => acc + (u.xp || 0), 0).toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Total XP Awarded</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/30 text-muted-foreground text-sm space-y-2">
          <p>No learner accounts yet.</p>
          <p className="text-xs max-w-md mx-auto">When someone signs up on the auth page, their profile appears here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const open = expandedId === u.id;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : u.id)}
                  className="w-full text-left p-4 flex flex-wrap items-center gap-4 hover:bg-accent/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-[200px] flex-1">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || u.headline || "No email on file"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold text-primary inline-flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {u.xp} XP · L{u.level}
                    </span>
                    <span className="text-orange-400 font-semibold inline-flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {u.streak}d
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            r === "admin"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : r === "instructor"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-border bg-muted/20 p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <InfoCell label="User ID" value={u.id} mono />
                    <InfoCell label="Email / contact" value={u.email || "—"} />
                    <InfoCell label="Display name" value={u.displayName} />
                    <InfoCell label="Headline" value={u.headline || "—"} />
                    <InfoCell label="Bio" value={u.bio || "—"} />
                    <InfoCell label="Location" value={u.location || "—"} />
                    <InfoCell label="Website" value={u.website || "—"} />
                    <InfoCell label="GitHub" value={u.githubUrl || "—"} />
                    <InfoCell label="Learning goal" value={u.learningGoal || "—"} />
                    <InfoCell label="Preferred distro" value={u.preferredDistro || "—"} />
                    <InfoCell label="XP / Level" value={`${u.xp} XP · Level ${u.level}`} />
                    <InfoCell label="Streak" value={`${u.streak} days`} />
                    <InfoCell label="Updated" value={u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "—"} />
                    <InfoCell label="Created" value={u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"} />
                    <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => grantRole.mutate({ userId: u.id, role: "admin" })}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-[11px] font-medium"
                      >
                        + Grant Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => grantRole.mutate({ userId: u.id, role: "instructor" })}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-[11px] font-medium"
                      >
                        + Grant Instructor
                      </button>
                      <button
                        type="button"
                        onClick={() => addXp.mutate({ userId: u.id, xp: 500 })}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:brightness-110"
                      >
                        +500 XP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={`mt-0.5 break-all ${mono ? "font-mono text-[11px]" : "text-sm"}`}>{value}</p>
    </div>
  );
}

/* ==================== TAB 3: LINUX PACKAGES ==================== */

const LINUX_ADMIN_PACKAGES = [
  { name: "systemd", cat: "Core Sysadmin", desc: "System and service manager for Linux operating systems.", cmd: "systemctl status <service>", ver: "v255.4" },
  { name: "apt / dpkg", cat: "Package Management", desc: "Advanced Package Tool for Debian and Ubuntu Linux distros.", cmd: "apt update && apt install <pkg>", ver: "v2.7.12" },
  { name: "iproute2", cat: "Networking", desc: "Collection of utilities for controlling TCP/IP networking (ip, ss, route).", cmd: "ip addr show", ver: "v6.8.0" },
  { name: "nginx", cat: "Web Services", desc: "High-performance HTTP web server, reverse proxy, and mail proxy.", cmd: "systemctl restart nginx", ver: "v1.24.0" },
  { name: "openssh-server", cat: "Remote Admin", desc: "Secure Shell server for encrypted remote command execution.", cmd: "ssh user@hostname", ver: "v9.6p1" },
  { name: "docker.io", cat: "Containers & DevOps", desc: "Enterprise containerization engine for microservices & labs.", cmd: "docker run -d -p 80:80 nginx", ver: "v26.0.0" },
  { name: "lvm2", cat: "Storage & Disk", desc: "Logical Volume Manager for flexible Linux disk partitioning.", cmd: "pvcreate /dev/sdb && vgcreate vg0", ver: "v2.03.22" },
  { name: "ufw / iptables", cat: "Security & Firewall", desc: "Uncomplicated Firewall & Netfilter packet filtering administration.", cmd: "ufw allow 22/tcp && ufw enable", ver: "v0.36.2" },
  { name: "sysstat (sar, iostat)", cat: "Performance Monitoring", desc: "System performance monitoring tools for CPU, memory, and disk I/O.", cmd: "iostat -xz 1 10", ver: "v12.7.4" },
  { name: "fail2ban", cat: "Security & Auditing", desc: "Intrusion prevention framework that protects servers against brute-force attacks.", cmd: "fail2ban-client status", ver: "v1.0.2" },
  { name: "kubectl", cat: "Kubernetes & Cloud", desc: "Command-line tool for controlling Kubernetes production clusters.", cmd: "kubectl get pods -A", ver: "v1.30.0" },
  { name: "ansible", cat: "Automation & Infra", desc: "Agentless IT automation tool for configuration management and deployment.", cmd: "ansible-playbook site.yml", ver: "v9.5.0" },
];

function LinuxPackageRegistry() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Linux Administration Package Registry
        </h2>
        <p className="text-muted-foreground text-xs mt-0.5">
          All core Linux administration packages pre-configured for lesson authoring and terminal sandbox execution.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINUX_ADMIN_PACKAGES.map((pkg) => (
          <div key={pkg.name} className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-md hover:border-primary/50 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-primary">{pkg.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{pkg.cat}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{pkg.desc}</p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted-foreground">{pkg.ver}</span>
              <Link to="/lab" className="text-primary hover:underline flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Test in Lab
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== TAB 4: SECURITY SETTINGS ==================== */

function AdminSecuritySettings() {
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem("afrokernel_ai_key") || "");
  }, []);

  function saveApiKey() {
    localStorage.setItem("afrokernel_ai_key", apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 3000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-primary" /> Admin Security & System Status
        </h2>
        <p className="text-muted-foreground text-xs mt-0.5">System diagnostic parameters and administrative token status.</p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-lg text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-medium text-muted-foreground">Admin Session Authorization:</span>
          <span className="text-green-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated & Active
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-medium text-muted-foreground">Master Control Role:</span>
          <span className="font-mono text-primary font-bold">SUPERADMIN / INSTRUCTOR</span>
        </div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-medium text-muted-foreground">Terminal Engine Sandbox:</span>
          <span className="text-foreground font-mono">Isolated Docker / AfroKernel WASM Core v6.8</span>
        </div>

        <div className="border-b border-border pb-3 pt-3">
          <label className="block font-medium text-muted-foreground mb-2">AI Gateway API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
            />
            <button
              onClick={saveApiKey}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110"
            >
              {keySaved ? "Saved!" : "Save Key"}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            This API key is stored locally and used for AI Tutor responses.
          </p>
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem("afrokernel-admin-unlocked");
            window.location.reload();
          }}
          className="mt-4 px-4 py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive/10 text-xs font-semibold transition"
        >
          Lock Admin Session
        </button>
      </div>
    </div>
  );
}
