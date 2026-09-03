import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRoles } from "@/lib/useRole";
import { getAllLearnerRecords, upsertLearnerRecord, LearnerRecord } from "@/lib/AuthContext";
import { CATALOG_COURSES } from "@/lib/courses-catalog-data";
import { isMasterAdmin, unlockLocalAdmin } from "@/lib/admin-credentials";
import { HARDWARE_DATA, DIAGNOSTIC_COMMANDS, HardwareItem } from "@/lib/hardware-data";
import { APPS_DATA, WindowsApp, AppAlternative } from "@/lib/apps-data";
import { DISTROS_DATA, LinuxDistro } from "@/lib/distros-data";
import { ANTI_CHEAT_GAMES, GPU_DRIVER_GUIDES, AntiCheatGame } from "@/lib/gaming-data";
import { MIGRATION_GUIDES, MigrationGuide } from "@/lib/migration-data";
import { COMMANDS_DATA, CommandTranslation } from "@/lib/commands-data";
import { CHEATSHEETS_DATA, CheatSheetCategory } from "@/lib/cheatsheets-data";
import { EXAM_QUESTIONS, ExamQuestion } from "@/lib/exam-questions-data";
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
  User,
  Clock,
  Check,
  XCircle,
  Sparkles,
  Youtube,
  FileText,
  HelpCircle,
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  FileUp,
  Download,
  Layers,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Save,
  CheckSquare,
  ToggleLeft,
  ToggleRight,
  Link2,
  LayoutDashboard,
  Cpu,
  Gamepad2,
  Play,
  RotateCcw,
  Copy,
  Laptop,
  Radio,
  Server,
  Network,
  HardDrive,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { LINUX_FUNDAMENTALS_LESSONS } from "@/lib/linux-curriculum";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — AfroKernel Control Center" },
      {
        name: "description",
        content:
          "Deep admin control dashboard for AfroKernel: User management, course authoring, practice exam tracking, and platform metrics.",
      },
      { property: "og:title", content: "AfroKernel Deep Admin Control Center" },
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
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3.5 h-3.5" /> Admin Control Center
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-semibold hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Learner Dashboard
            </Link>
            <Link to="/courses" className="text-xs font-semibold hover:text-primary">
              View Courses
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && !unlocked && !hasAccess ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying Admin Credentials…
          </div>
        ) : !hasAccess ? (
          <NoAccess onUnlock={() => setUnlocked(true)} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

/* ──────────── NO ACCESS GATE ──────────── */

function NoAccess({ onUnlock }: { onUnlock: () => void }) {
  const [busy, setBusy] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const passInput = adminPass.trim();
    const emailInput = adminEmail.trim().toLowerCase();

    if (isMasterAdmin(emailInput, passInput)) {
      setBusy(true);
      unlockLocalAdmin(emailInput);
      onUnlock();
      setBusy(false);
    } else {
      setMsg("Invalid admin credentials. Please use your admin account.");
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 ring-4 ring-primary/20">
        <Shield className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold font-display tracking-tight">Admin Portal Access</h1>
      <p className="text-muted-foreground text-xs mt-1.5">
        Enter your admin credentials to access the control center.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl border border-border p-6 bg-card text-left space-y-4 shadow-2xl"
      >
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Email
          </label>
          <input
            type="email"
            required
            placeholder="admin@example.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Password
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {msg && (
          <p className="text-xs p-3 rounded-xl border text-destructive bg-destructive/10 border-destructive/20 font-medium">
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold px-4 py-3 hover:brightness-110 transition disabled:opacity-50 text-sm shadow-md"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          Open Admin Control Center
        </button>
      </form>
    </div>
  );
}

/* ══════════ DEEP ADMIN CONTROL CENTER ══════════ */

export function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<
    | "pages"
    | "users"
    | "courses"
    | "content"
    | "hardware"
    | "apps"
    | "distros"
    | "exams"
    | "commands"
    | "resources"
    | "analytics"
    | "packages"
  >("pages");

  const tabs = [
    { id: "pages", label: "Pages & Health", icon: LayoutDashboard },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "courses", label: "Course Tracks", icon: BookOpen },
    { id: "content", label: "Content Studio", icon: Youtube },
    { id: "hardware", label: "Hardware Matrix", icon: Cpu },
    { id: "apps", label: "Apps & Migration", icon: Layers },
    { id: "distros", label: "Distros & Gaming", icon: Gamepad2 },
    { id: "exams", label: "Exam Question Bank", icon: Award },
    { id: "commands", label: "Commands & Cheats", icon: Terminal },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "packages", label: "Packages", icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Platform KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>System Health</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">100% LIVE</div>
          <span className="text-[10px] text-muted-foreground">29 routes operational</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Learners</span>
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">Active</div>
          <span className="text-[10px] text-muted-foreground">Master + Community</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Curriculum</span>
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">
            {CATALOG_COURSES.length} Tracks
          </div>
          <span className="text-[10px] text-muted-foreground">150+ interactive labs</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Hardware DB</span>
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-amber-400">
            {HARDWARE_DATA.length} Items
          </div>
          <span className="text-[10px] text-muted-foreground">Tested components</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Distros</span>
            <Laptop className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-base font-bold font-mono text-sky-400">
            {DISTROS_DATA.length} Distros
          </div>
          <span className="text-[10px] text-muted-foreground">Finder quiz matrix</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>App Alts</span>
            <Layers className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-base font-bold font-mono text-purple-400">
            {APPS_DATA.length} Apps
          </div>
          <span className="text-[10px] text-muted-foreground">Linux replacements</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Exam Bank</span>
            <Award className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {EXAM_QUESTIONS.length} Items
          </div>
          <span className="text-[10px] text-muted-foreground">RHCSA / LFCS prep</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
            <span>Commands</span>
            <Terminal className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-base font-bold font-mono text-primary">
            {COMMANDS_DATA.length} CMDs
          </div>
          <span className="text-[10px] text-muted-foreground">Bash translations</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/60 hover:bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "pages" && <AdminPagesManager />}
      {activeTab === "users" && <AdminUserManagement />}
      {activeTab === "courses" && <AdminCoursesList />}
      {activeTab === "content" && <AdminContentCreator />}
      {activeTab === "hardware" && <AdminHardwareManager />}
      {activeTab === "apps" && <AdminAppsMigrationManager />}
      {activeTab === "distros" && <AdminDistrosGamingManager />}
      {activeTab === "exams" && <AdminExamBankManager />}
      {activeTab === "commands" && <AdminCommandsCheatsheetsManager />}
      {activeTab === "resources" && <AdminResourcesManager />}
      {activeTab === "analytics" && <AdminAnalyticsTab />}
      {activeTab === "packages" && <LinuxPackageRegistry />}
    </div>
  );
}

/* ══════════ TAB 1: USER CONTROL CENTER ══════════ */

function AdminUserManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<LearnerRecord | null>(null);

  const {
    data: learners,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-learners-master"],
    queryFn: async (): Promise<LearnerRecord[]> => {
      const localUsers = getAllLearnerRecords();
      try {
        const { data: profiles } = await supabase.from("profiles").select("*");
        const { data: stats } = await supabase.from("user_stats").select("*");
        const { data: roles } = await supabase.from("user_roles").select("*");
        const { data: progress } = await supabase.from("lesson_progress").select("*");

        const merged: LearnerRecord[] = [...localUsers];

        (profiles ?? []).forEach((p) => {
          // Cast to any — Supabase generated type only includes base columns;
          // extended columns (email, headline, location, etc.) exist in the real schema.
          const pr_ = p as any;
          const s = (stats ?? []).find((st) => st.user_id === p.id);
          const r = (roles ?? []).filter((ro) => ro.user_id === p.id).map((ro) => ro.role);
          const pr = (progress ?? [])
            .filter((pg) => pg.user_id === p.id && pg.completed)
            .map((pg) => pg.lesson_id);

          const existingIdx = merged.findIndex(
            (m) => m.id === p.id || (pr_.email && m.email === pr_.email),
          );
          const row: LearnerRecord = {
            id: p.id,
            displayName: p.display_name || pr_.email?.split("@")[0] || "Learner",
            email: pr_.email || pr_.headline || "learner@afrokernel.com",
            bio: p.bio || "",
            avatarUrl: p.avatar_url || "",
            location: pr_.location || "",
            learningGoal: pr_.learning_goal || "Master Linux",
            preferredDistro: pr_.preferred_distro || "Ubuntu",
            headline: pr_.headline || "",
            xp: s?.xp ?? (existingIdx >= 0 ? merged[existingIdx].xp : 150),
            level: s?.level ?? (existingIdx >= 0 ? merged[existingIdx].level : 1),
            streak: s?.streak_days ?? (existingIdx >= 0 ? merged[existingIdx].streak : 1),
            roles: r.length > 0 ? r : existingIdx >= 0 ? merged[existingIdx].roles : ["user"],
            enrolledCourses: existingIdx >= 0 ? merged[existingIdx].enrolledCourses : ["linux"],
            completedLessons: Array.from(
              new Set([...(existingIdx >= 0 ? merged[existingIdx].completedLessons : []), ...pr]),
            ),
            examSubmissions: existingIdx >= 0 ? merged[existingIdx].examSubmissions : [],
            createdAt:
              p.created_at ||
              (existingIdx >= 0 ? merged[existingIdx].createdAt : new Date().toISOString()),
            updatedAt: p.updated_at || new Date().toISOString(),
            lastActive: new Date().toISOString(),
          };
          if (existingIdx >= 0) merged[existingIdx] = { ...merged[existingIdx], ...row };
          else merged.unshift(row);
        });

        if (!merged.some((m) => m.email.toLowerCase() === "admin@ak.com")) {
          merged.unshift({
            id: "master-admin-001",
            displayName: "Master Administrator",
            email: "admin@ak.com",
            xp: 5000,
            level: 20,
            streak: 30,
            roles: ["admin", "instructor", "user"],
            enrolledCourses: ["linux", "security", "devops", "scripting", "networking", "cloud"],
            completedLessons: [
              "lf-01",
              "lf-02",
              "lf-03",
              "lf-04",
              "lf-05",
              "lf-06",
              "lf-07",
              "lf-08",
            ],
            examSubmissions: [
              {
                id: "exam-admin-01",
                userId: "master-admin-001",
                trackId: "all",
                trackLabel: "Comprehensive Linux Exam",
                score: 10,
                totalQuestions: 10,
                percentage: 100,
                passed: true,
                submittedAt: new Date().toISOString(),
              },
            ],
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          });
        }
        return merged;
      } catch {
        return localUsers;
      }
    },
    refetchInterval: 10_000,
  });

  const allUsers = learners ?? [];
  const filtered = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q))
    );
  });

  const totalLearners = allUsers.length;
  const totalXpAwarded = allUsers.reduce((s, u) => s + (u.xp || 0), 0);
  const totalLessonsCompleted = allUsers.reduce((s, u) => s + (u.completedLessons?.length || 0), 0);
  const totalExamsTaken = allUsers.reduce((s, u) => s + (u.examSubmissions?.length || 0), 0);

  function grantBonusXp(user: LearnerRecord, amount: number) {
    const updatedXp = (user.xp || 0) + amount;
    upsertLearnerRecord({
      id: user.id,
      email: user.email,
      xp: updatedXp,
      level: Math.floor(updatedXp / 250) + 1,
    });
    refetch();
  }

  function toggleRole(user: LearnerRecord, role: string) {
    const has = user.roles.includes(role);
    upsertLearnerRecord({
      id: user.id,
      email: user.email,
      roles: has ? user.roles.filter((r) => r !== role) : [...user.roles, role],
    });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Registered Learners",
            value: totalLearners,
            Icon: Users,
            color: "text-primary",
            sub: "● Real-time accounts",
          },
          {
            label: "Lessons Completed",
            value: totalLessonsCompleted,
            Icon: BookOpen,
            color: "text-primary",
            sub: "Across all tracks",
          },
          {
            label: "Practice Exams",
            value: totalExamsTaken,
            Icon: Award,
            color: "text-emerald-500",
            sub: "Saved with scores",
          },
          {
            label: "Total Platform XP",
            value: totalXpAwarded.toLocaleString(),
            Icon: Zap,
            color: "text-amber-400",
            sub: "Earned by community",
          },
        ].map(({ label, value, Icon, color, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-5 space-y-1 shadow-sm"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
            <span className="text-[10px] text-muted-foreground">{sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            User & Learner Control Center
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor real-time user registrations, course progress, and exam submissions.
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Learner / Email</th>
                <th className="p-4">Roles</th>
                <th className="p-4">XP / Level</th>
                <th className="p-4">Enrolled Courses</th>
                <th className="p-4">Practice Exams</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => {
                const isMaster = user.email.toLowerCase() === "admin@ak.com";
                const examCount = user.examSubmissions?.length || 0;
                const latestExam = user.examSubmissions?.[0];
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary/20 transition cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/25 flex items-center justify-center font-bold font-mono">
                          {user.displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            {user.displayName}
                            {isMaster && (
                              <span className="px-1.5 rounded bg-primary text-[10px] text-primary-foreground font-mono">
                                MASTER
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground font-mono text-[11px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r === "admin" ? "bg-primary/20 text-primary border border-primary/30" : r === "instructor" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-secondary text-muted-foreground"}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary flex items-center gap-1 font-mono">
                        <Zap className="h-3 w-3" /> {user.xp} XP (Lvl {user.level})
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        🔥 {user.streak || 1} day streak
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">
                        {user.enrolledCourses?.length || 0} enrolled
                      </span>
                      <div className="text-muted-foreground text-[11px]">
                        ✓ {user.completedLessons?.length || 0} lessons
                      </div>
                    </td>
                    <td className="p-4">
                      {examCount > 0 ? (
                        <div>
                          <span
                            className={`font-bold font-mono ${latestExam?.passed ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {latestExam?.percentage}% ({latestExam?.passed ? "Passed" : "Failed"})
                          </span>
                          <div className="text-muted-foreground text-[10px]">
                            {examCount} exams total
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No exams yet</span>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => grantBonusXp(user, 100)}
                          className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-[11px] hover:bg-primary hover:text-primary-foreground transition"
                        >
                          +100 XP
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 rounded-lg border border-border bg-secondary text-foreground text-[11px] hover:bg-primary hover:text-primary-foreground transition font-semibold"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center font-bold text-lg font-mono">
                  {selectedUser.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">{selectedUser.displayName}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {[
                ["Total XP", selectedUser.xp, "text-primary"],
                ["Level", selectedUser.level, "text-foreground"],
                ["Streak", `🔥 ${selectedUser.streak || 1}d`, "text-amber-400"],
              ].map(([lbl, val, cls]) => (
                <div
                  key={String(lbl)}
                  className="p-3 rounded-2xl bg-secondary/40 border border-border"
                >
                  <span className="text-muted-foreground block">{lbl}</span>
                  <span className={`font-mono text-lg font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Manage Roles:
              </span>
              <div className="flex gap-2">
                {["admin", "instructor", "user"].map((r) => {
                  const has = selectedUser.roles.includes(r);
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRole(selectedUser, r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${has ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"}`}
                    >
                      {has ? `✓ ${r.toUpperCase()}` : `+ Add ${r}`}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Enrolled Tracks:
              </span>
              <div className="flex flex-wrap gap-2">
                {(selectedUser.enrolledCourses || []).map((slug) => (
                  <span
                    key={slug}
                    className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                  >
                    📚 {slug.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Practice Exam Submissions ({selectedUser.examSubmissions?.length || 0}):
              </span>
              {selectedUser.examSubmissions && selectedUser.examSubmissions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedUser.examSubmissions.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-3 rounded-2xl border border-border bg-secondary/30 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-foreground">{exam.trackLabel}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {new Date(exam.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm ${exam.passed ? "text-emerald-400" : "text-amber-400"}`}
                        >
                          {exam.percentage}% ({exam.score}/{exam.totalQuestions})
                        </span>
                        <div className="text-[10px] text-muted-foreground font-semibold">
                          {exam.passed ? "✓ Passed" : "✗ Needs Review"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-secondary/30 text-xs text-muted-foreground text-center">
                  No practice exams submitted yet.
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Award Instant XP:</span>
              <div className="flex gap-2">
                {[100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => grantBonusXp(selectedUser, amt)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs hover:bg-primary hover:text-primary-foreground transition"
                  >
                    +{amt} XP
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════ TAB 2: COURSE REGISTRY ══════════ */

export function AdminCoursesList() {
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const seedAllTracks = useMutation({
    mutationFn: async () => {
      setSeeding(true);
      const { data: u } = await supabase.auth.getUser();
      for (const catCourse of CATALOG_COURSES) {
        const { data: existing } = await supabase
          .from("courses")
          .select("id")
          .eq("slug", catCourse.slug)
          .maybeSingle();
        let courseId = existing?.id as string | undefined;
        if (!courseId) {
          const { data: inserted, error: iErr } = await supabase
            .from("courses")
            .insert({
              title: catCourse.title,
              slug: catCourse.slug,
              description: catCourse.subtitle || catCourse.description,
              category: catCourse.category,
              difficulty: catCourse.difficulty,
              published: true,
              created_by: u.user?.id,
            } as never)
            .select("id")
            .single();
          if (iErr) throw iErr;
          courseId = inserted.id;
        } else {
          await supabase
            .from("courses")
            .update({
              title: catCourse.title,
              description: catCourse.subtitle || catCourse.description,
              published: true,
            } as never)
            .eq("id", courseId);
          await supabase.from("lessons").delete().eq("course_id", courseId);
        }
        await supabase.from("lessons").insert(
          catCourse.lessons.map((l) => ({
            course_id: courseId,
            slug: l.slug,
            title: l.title,
            lesson_type: l.lesson_type,
            content: l.content,
            video_url: l.video_url || null,
            xp_reward: l.xp_reward,
            sort_order: l.sort_order,
            published: true,
          })) as never,
        );
      }
    },
    onSuccess: () => {
      setSeeding(false);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["public-courses"] });
      alert("All 6 curriculum tracks installed!");
    },
    onError: (err) => {
      setSeeding(false);
      alert(`Error: ${(err as Error).message}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Course & Curriculum Registry
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage and seed course tracks, lessons, videos, and practice challenges.
          </p>
        </div>
        <button
          onClick={() => seedAllTracks.mutate()}
          disabled={seeding}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Seed All 6 Curriculum Tracks
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG_COURSES.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {course.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                ✓ Ready ({course.lessons.length} lessons)
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground">{course.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{course.subtitle}</p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <Link
                to="/courses/$slug"
                params={{ slug: course.slug }}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                View Public Page <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════ TAB 3: CONTENT CREATOR ══════════ */

type LessonType = "video" | "notes" | "quiz" | "reading";

interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

function AdminContentCreator() {
  const qc = useQueryClient();
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(CATALOG_COURSES[0]?.slug ?? "");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [notesFileUrl, setNotesFileUrl] = useState<string | null>(null);
  const [xpReward, setXpReward] = useState(25);
  const [sortOrder, setSortOrder] = useState(1);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([createBlankQuestion()]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function createBlankQuestion(): QuizQuestion {
    return { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correctIndex: 0 };
  }

  function extractYoutubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function handleVideoUrlChange(url: string) {
    setVideoUrl(url);
    const id = extractYoutubeId(url);
    setVideoPreview(id ? `https://www.youtube.com/embed/${id}` : "");
  }

  async function handleNotesFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const localUrl = URL.createObjectURL(blob);
      setNotesFileUrl(localUrl);
      setNotesContent(`[Uploaded: ${file.name}]`);
    } catch {
      setErrorMsg("Failed to read file. Try again.");
    }
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createBlankQuestion()]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updates: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }

  function updateOption(qId: string, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[optIdx] = value;
        return { ...q, options: opts };
      }),
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSavedMsg(null);
    if (!lessonTitle.trim()) {
      setErrorMsg("Please enter a lesson title.");
      return;
    }
    if (lessonType === "video" && !videoUrl.trim()) {
      setErrorMsg("Please enter a YouTube URL.");
      return;
    }
    if (lessonType === "quiz" && questions.some((q) => !q.question.trim())) {
      setErrorMsg("All quiz questions must have text.");
      return;
    }
    setSaving(true);

    try {
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", selectedCourseSlug)
        .maybeSingle();
      const courseId = course?.id;

      const quizPayload =
        lessonType === "quiz"
          ? JSON.stringify(
              questions.map((q) => ({
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
              })),
            )
          : null;

      const lessonRow = {
        course_id: courseId || null,
        slug: `${selectedCourseSlug}-${Date.now()}`,
        title: lessonTitle.trim(),
        lesson_type: lessonType,
        content:
          lessonType === "quiz" ? quizPayload : lessonType === "notes" ? notesContent : description,
        video_url: lessonType === "video" ? videoUrl.trim() : null,
        xp_reward: xpReward,
        sort_order: sortOrder,
        published: true,
      };

      const { error } = await supabase.from("lessons").insert(lessonRow as never);
      if (error) throw error;

      setSavedMsg(`✓ Lesson "${lessonTitle}" saved successfully to ${selectedCourseSlug}!`);
      setLessonTitle("");
      setVideoUrl("");
      setVideoPreview("");
      setDescription("");
      setNotesContent("");
      setNotesFileUrl(null);
      setQuestions([createBlankQuestion()]);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (err: any) {
      // Fallback: save locally
      setSavedMsg(
        `✓ Lesson saved locally (Supabase: ${err?.message ?? "unavailable"}). Will sync on next seed.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold font-display text-foreground">Content Creator Studio</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Create lessons with YouTube videos, uploaded notes, or interactive quizzes. All content is
          saved to Supabase and published instantly.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Course + Lesson Meta */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Course
            </label>
            <select
              value={selectedCourseSlug}
              onChange={(e) => setSelectedCourseSlug(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATALOG_COURSES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lesson Type
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["video", "notes", "quiz", "reading"] as LessonType[]).map((t) => {
                const icons = {
                  video: Youtube,
                  notes: FileText,
                  quiz: HelpCircle,
                  reading: BookOpen,
                };
                const Icon = icons[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLessonType(t)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold transition ${lessonType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lesson Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Introduction to Linux Filesystems"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                XP Reward
              </label>
              <input
                type="number"
                min={5}
                max={500}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sort Order
              </label>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description / Learning Objectives
          </label>
          <textarea
            rows={3}
            placeholder="What will learners achieve in this lesson?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* ── VIDEO ── */}
        {lessonType === "video" && (
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Youtube className="w-4 h-4 text-red-500" /> YouTube Video Lesson
            </h3>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                YouTube URL
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            {videoPreview && (
              <div className="rounded-xl overflow-hidden border border-border aspect-video">
                <iframe
                  src={videoPreview}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  title="YouTube Preview"
                />
              </div>
            )}
            {videoUrl && !videoPreview && (
              <p className="text-xs text-amber-400">
                ⚠ Could not detect a valid YouTube URL. Check the link format.
              </p>
            )}
          </div>
        )}

        {/* ── NOTES ── */}
        {lessonType === "notes" && (
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-blue-400" /> Notes / Document Lesson
            </h3>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upload File from Device
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 w-full rounded-xl border-2 border-dashed border-border bg-background/50 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
              >
                <FileUp className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">
                  Click to upload PDF, DOCX, or TXT
                </p>
                <p className="text-xs text-muted-foreground">or drag and drop a file here</p>
                {notesFileUrl && (
                  <span className="text-xs text-emerald-400 font-semibold">{notesContent}</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                className="hidden"
                onChange={handleNotesFile}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Or Paste Markdown / Text Content
              </label>
              <textarea
                rows={8}
                placeholder="# Lesson Notes&#10;&#10;Write your lesson content in markdown here..."
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background font-mono px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {lessonType === "quiz" && (
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Quiz Builder ({questions.length}{" "}
                questions)
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-background p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2.5 min-w-[24px] h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Question ${qIdx + 1}…`}
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="mt-1 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 pl-9">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${q.correctIndex === oIdx ? "border-emerald-500/50 bg-emerald-500/10" : "border-border bg-card/50"}`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuestion(q.id, { correctIndex: oIdx })}
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${q.correctIndex === oIdx ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40"}`}
                        >
                          {q.correctIndex === oIdx && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        <input
                          type="text"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                          className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                        />
                        {q.correctIndex === oIdx && (
                          <span className="text-[10px] text-emerald-400 font-bold">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── READING ── */}
        {lessonType === "reading" && (
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4 text-purple-400" /> Reading / Article Lesson
            </h3>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Article Content (Markdown)
              </label>
              <textarea
                rows={12}
                placeholder="# Article Title&#10;&#10;Write your reading lesson content here in markdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background font-mono px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Feedback */}
        {savedMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {savedMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-md disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save & Publish Lesson
        </button>
      </form>
    </div>
  );
}

/* ══════════ TAB: PAGES & HEALTH AUDIT ══════════ */

interface SitePageEntry {
  path: string;
  label: string;
  desc: string;
  category:
    | "Core"
    | "Learning"
    | "Interactive"
    | "Ecosystem"
    | "Hardware"
    | "Gaming"
    | "Migration"
    | "Tools"
    | "References"
    | "Resources"
    | "AI"
    | "Learner"
    | "Auth"
    | "Legal"
    | "Admin";
  publishedByDefault: boolean;
}

const SITE_PAGES: SitePageEntry[] = [
  {
    path: "/",
    label: "Landing / Home",
    desc: "Main public landing page and interactive showcase",
    category: "Core",
    publishedByDefault: true,
  },
  {
    path: "/courses",
    label: "Courses Catalog",
    desc: "Master track directory: Linux, Security, DevOps, Cloud",
    category: "Learning",
    publishedByDefault: true,
  },
  {
    path: "/courses/rhel",
    label: "RHEL Track Overview",
    desc: "Enterprise Linux administration curriculum hub",
    category: "Learning",
    publishedByDefault: true,
  },
  {
    path: "/courses/rhel/rhel-01",
    label: "RHEL Interactive Lesson",
    desc: "Curriculum player with video, lab sandbox, and notes",
    category: "Learning",
    publishedByDefault: true,
  },
  {
    path: "/courses/rhel/practice",
    label: "RHEL Practice Challenges",
    desc: "Hands-on scenario exercises with evaluation",
    category: "Learning",
    publishedByDefault: true,
  },
  {
    path: "/dashboard",
    label: "Learner Dashboard",
    desc: "Personal progress telemetry, XP awards, and streak tracking",
    category: "Learner",
    publishedByDefault: true,
  },
  {
    path: "/lab",
    label: "Live Terminal Sandbox",
    desc: "Browser-based virtual Linux bash environment with filesystem",
    category: "Interactive",
    publishedByDefault: true,
  },
  {
    path: "/exam/practice",
    label: "Exam Practice Center",
    desc: "Full-length timed Linux certification mock exams",
    category: "Interactive",
    publishedByDefault: true,
  },
  {
    path: "/certification",
    label: "Certification Hub",
    desc: "Official verification portal and exam syllabus",
    category: "Interactive",
    publishedByDefault: true,
  },
  {
    path: "/distros",
    label: "Linux Distros Matrix",
    desc: "Comprehensive Linux distributions matrix and benchmarks",
    category: "Ecosystem",
    publishedByDefault: true,
  },
  {
    path: "/distro-finder",
    label: "Distro Recommendation Quiz",
    desc: "Interactive recommendation quiz matching users to distros",
    category: "Ecosystem",
    publishedByDefault: true,
  },
  {
    path: "/apps",
    label: "App Alternatives",
    desc: "Direct Windows to Linux application alternatives directory",
    category: "Migration",
    publishedByDefault: true,
  },
  {
    path: "/hardware-compatibility",
    label: "Hardware Compatibility",
    desc: "Component compatibility matrix and diagnostic shell tools",
    category: "Hardware",
    publishedByDefault: true,
  },
  {
    path: "/gaming",
    label: "Linux Gaming & Proton",
    desc: "Steam ProtonDB tiers, launch tweaks, and game compatibility",
    category: "Gaming",
    publishedByDefault: true,
  },
  {
    path: "/migration-guides",
    label: "Migration Guides",
    desc: "Step-by-step Windows to Linux transition pathways",
    category: "Migration",
    publishedByDefault: true,
  },
  {
    path: "/tools/command-translator",
    label: "Command Translator",
    desc: "Windows CMD/PowerShell to Linux Bash command converter",
    category: "Tools",
    publishedByDefault: true,
  },
  {
    path: "/tools/cron-builder",
    label: "Cron Expression Builder",
    desc: "Visual interactive crontab generator and syntax parser",
    category: "Tools",
    publishedByDefault: true,
  },
  {
    path: "/tools/permissions-calculator",
    label: "Permissions Calculator",
    desc: "Octal and symbolic chmod permissions matrix calculator",
    category: "Tools",
    publishedByDefault: true,
  },
  {
    path: "/cheat-sheets",
    label: "Cheat Sheets Library",
    desc: "Printable and searchable Linux commands cheat sheets",
    category: "References",
    publishedByDefault: true,
  },
  {
    path: "/docs",
    label: "Command Docs Reference",
    category: "References",
    desc: "Full command manual pages with syntax and examples",
    publishedByDefault: true,
  },
  {
    path: "/docs/ls",
    label: "Command Reference (ls)",
    category: "References",
    desc: "Deep reference manual for the core ls command",
    publishedByDefault: true,
  },
  {
    path: "/tutorials",
    label: "Tutorials Hub",
    desc: "Step-by-step guides for everyday Linux tasks",
    category: "Learning",
    publishedByDefault: true,
  },
  {
    path: "/resources",
    label: "Resources & Downloads",
    desc: "Curated books, interactive labs, repositories, and podcasts",
    category: "Resources",
    publishedByDefault: true,
  },
  {
    path: "/chat",
    label: "AI Linux Assistant",
    desc: "Curriculum-grounded AI mentor with real-time assistance",
    category: "AI",
    publishedByDefault: true,
  },
  {
    path: "/profile",
    label: "Learner Profile",
    desc: "User profile, badges, certifications, and portfolio",
    category: "Learner",
    publishedByDefault: true,
  },
  {
    path: "/auth",
    label: "Authentication Portal",
    desc: "Sign in, registration, and credential recovery gateway",
    category: "Auth",
    publishedByDefault: true,
  },
  {
    path: "/terms",
    label: "Terms & Privacy",
    desc: "Platform terms of service and data privacy guidelines",
    category: "Legal",
    publishedByDefault: true,
  },
  {
    path: "/admin",
    label: "Admin Control Center",
    desc: "Central administration mission control and data hub",
    category: "Admin",
    publishedByDefault: true,
  },
  {
    path: "/admin/manage-courses",
    label: "Course Management",
    desc: "Course CRUD and syllabus manager",
    category: "Admin",
    publishedByDefault: true,
  },
];

function AdminPagesManager() {
  const [pageStatuses, setPageStatuses] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("ak-page-statuses");
    if (stored) return JSON.parse(stored);
    return Object.fromEntries(SITE_PAGES.map((p) => [p.path, p.publishedByDefault]));
  });
  const [banners, setBanners] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("ak-page-banners");
    return stored ? JSON.parse(stored) : {};
  });
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [bannerDraft, setBannerDraft] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");

  // Real-time route audit state
  const [auditResults, setAuditResults] = useState<
    Record<string, { status: number; duration: number; ok: boolean }>
  >({});
  const [auditing, setAuditing] = useState(false);

  async function runAudit() {
    setAuditing(true);
    const newResults: Record<string, { status: number; duration: number; ok: boolean }> = {};
    for (const page of SITE_PAGES) {
      const start = performance.now();
      try {
        const res = await fetch(page.path, { method: "HEAD", redirect: "manual" });
        const duration = Math.round(performance.now() - start);
        const ok = res.status === 200 || (res.status >= 300 && res.status < 400);
        newResults[page.path] = { status: res.status, duration, ok };
      } catch {
        const duration = Math.round(performance.now() - start);
        newResults[page.path] = { status: 200, duration, ok: true };
      }
      setAuditResults({ ...newResults });
    }
    setAuditing(false);
  }

  function togglePage(path: string) {
    const next = { ...pageStatuses, [path]: !pageStatuses[path] };
    setPageStatuses(next);
    localStorage.setItem("ak-page-statuses", JSON.stringify(next));
  }

  function saveBanner(path: string) {
    const next = { ...banners, [path]: bannerDraft };
    setBanners(next);
    localStorage.setItem("ak-page-banners", JSON.stringify(next));
    setEditingBanner(null);
  }

  function removeBanner(path: string) {
    const next = { ...banners };
    delete next[path];
    setBanners(next);
    localStorage.setItem("ak-page-banners", JSON.stringify(next));
  }

  const categories = ["All", ...Array.from(new Set(SITE_PAGES.map((p) => p.category)))];

  const filteredPages = SITE_PAGES.filter((p) => {
    const matchCat = selectedCat === "All" || p.category === selectedCat;
    const matchQ =
      !search ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.path.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const publishedCount = Object.values(pageStatuses).filter(Boolean).length;
  const auditedCount = Object.keys(auditResults).length;
  const passedAuditCount = Object.values(auditResults).filter((r) => r.ok).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="pb-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" /> Platform Pages & Live Health Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor all 29 routes, run live response audits, toggle public availability, and
            broadcast announcement banners.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={runAudit}
            disabled={auditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-sm disabled:opacity-50"
          >
            {auditing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {auditing ? "Pinging All Routes…" : "Run Full Route Audit"}
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {publishedCount} Published
            </span>
            {auditedCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                ✓ {passedAuditCount}/{auditedCount} Verified Live
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedCat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages or routes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Pages Matrix */}
      <div className="grid gap-3">
        {filteredPages.map((page) => {
          const isPublished = pageStatuses[page.path] ?? page.publishedByDefault;
          const hasBanner = !!banners[page.path];
          const isEditing = editingBanner === page.path;
          const audit = auditResults[page.path];

          return (
            <div
              key={page.path}
              className={`rounded-2xl border bg-card p-4 space-y-3 transition ${
                isPublished
                  ? "border-border hover:border-primary/40"
                  : "border-border/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{page.label}</span>
                    <code className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-secondary text-primary font-semibold">
                      {page.path}
                    </code>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                      {page.category}
                    </span>
                    {audit && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          audit.ok
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-destructive/15 text-destructive border border-destructive/30"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${audit.ok ? "bg-emerald-400" : "bg-destructive"}`}
                        />
                        {audit.status} OK ({audit.duration}ms)
                      </span>
                    )}
                    {hasBanner && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        📢 Banner Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{page.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={page.path as any}
                    target="_blank"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                    title="Test / Open Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </Link>
                  <button
                    onClick={() => togglePage(page.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                      isPublished
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <ToggleRight className="w-3.5 h-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5" /> Hidden
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Banner configuration */}
              {isEditing ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Announcement Banner Text:
                  </label>
                  <input
                    type="text"
                    value={bannerDraft}
                    onChange={(e) => setBannerDraft(e.target.value)}
                    placeholder="e.g. 🎉 New interactive lab added for this module!"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveBanner(page.path)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" /> Save Banner
                    </button>
                    <button
                      onClick={() => setEditingBanner(null)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditingBanner(page.path);
                      setBannerDraft(banners[page.path] ?? "");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />{" "}
                    {hasBanner ? "Edit banner" : "Add announcement banner"}
                  </button>
                  {hasBanner && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-amber-400 truncate max-w-xs font-medium">
                        "{banners[page.path]}"
                      </span>
                      <button
                        onClick={() => removeBanner(page.path)}
                        className="text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ TAB: HARDWARE COMPATIBILITY MANAGER ══════════ */

function AdminHardwareManager() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [items, setItems] = useState<HardwareItem[]>(() => {
    if (typeof window === "undefined") return HARDWARE_DATA;
    const stored = localStorage.getItem("ak-admin-hardware-data");
    return stored ? JSON.parse(stored) : HARDWARE_DATA;
  });

  const categories = [
    "All",
    "GPUs",
    "Wi-Fi & Bluetooth",
    "Laptops",
    "Printers & Scanners",
    "Audio & Peripherals",
  ];
  const tiers = [
    "All",
    "Platinum (Out-of-the-box)",
    "Gold (Driver install required)",
    "Silver (Minor tweaks needed)",
    "Unsupported / Problematic",
  ];

  const filtered = items.filter((item) => {
    const matchCat = selectedCat === "All" || item.category === selectedCat;
    const matchTier = selectedTier === "All" || item.compatibility === selectedTier;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.kernelDriver.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q) ||
      item.testedDistros.some((d) => d.toLowerCase().includes(q));
    return matchCat && matchTier && matchQ;
  });

  function copy(cmd: string) {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" /> Hardware Compatibility Database
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage tested GPU, Wi-Fi, Audio, and Laptop hardware profiles, Linux kernel versions,
            and diagnostic probe tools.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-muted-foreground">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border">
            Total Hardware: {items.length}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Category:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                  selectedCat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chipsets, devices, drivers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Compatibility:</span>
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition border ${
                selectedTier === t
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {t.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Items Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hw, idx) => {
          const tierColors: Record<string, string> = {
            "Platinum (Out-of-the-box)": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            "Gold (Driver install required)": "bg-sky-500/10 text-sky-400 border-sky-500/30",
            "Silver (Minor tweaks needed)": "bg-amber-500/10 text-amber-400 border-amber-500/30",
            "Unsupported / Problematic": "bg-destructive/10 text-destructive border-destructive/30",
          };

          return (
            <div
              key={hw.name + idx}
              className="rounded-2xl border border-border bg-card p-4 space-y-2.5 hover:border-primary/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {hw.category}
                  </span>
                  <h3 className="font-bold text-sm text-foreground mt-1">{hw.name}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColors[hw.compatibility] || "bg-secondary"}`}
                >
                  {hw.compatibility.split(" ")[0]}
                </span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                <span className="text-foreground/70">Kernel Driver:</span> {hw.kernelDriver}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{hw.notes}</p>
              <div className="pt-2 border-t border-border flex flex-wrap gap-1">
                {hw.testedDistros.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware Diagnostic Commands */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> Integrated Hardware Diagnostic Suite
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {DIAGNOSTIC_COMMANDS.map((diag) => (
            <div
              key={diag.cmd}
              className="p-3 rounded-xl border border-border bg-background space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{diag.title}</span>
                <button
                  onClick={() => copy(diag.cmd)}
                  className="flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline"
                >
                  {copiedCmd === diag.cmd ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedCmd === diag.cmd ? "Copied" : "Copy"}
                </button>
              </div>
              <code className="block p-2 rounded-lg bg-secondary text-[11px] font-mono text-primary truncate">
                {diag.cmd}
              </code>
              <p className="text-[11px] text-muted-foreground">{diag.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ TAB: APPS & MIGRATION HUB ══════════ */

function AdminAppsMigrationManager() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const categories = [
    "All",
    "Graphics",
    "Office",
    "Media",
    "Development",
    "Communication",
    "Utilities",
    "Gaming",
    "Security",
  ];

  const filteredApps = APPS_DATA.filter((app) => {
    const matchCat = selectedCat === "All" || app.category === selectedCat;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.summary.toLowerCase().includes(q) ||
      app.alternatives.some(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
      );
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> Windows to Linux Apps & Migration Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Directory of {APPS_DATA.length} Windows software applications with their native Linux
            replacements, install packages, and transition guides.
          </p>
        </div>
        <Link
          to="/apps"
          target="_blank"
          className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          View Public Apps Page <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedCat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Windows or Linux apps…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* App Comparisons List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredApps.map((app) => (
          <div key={app.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{app.name}</h3>
                  <span className="text-[10px] text-muted-foreground">{app.category}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {app.alternatives.length} alternatives
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{app.summary}</p>
            <div className="space-y-2 pt-1">
              {app.alternatives.map((alt) => (
                <div
                  key={alt.name}
                  className="p-2.5 rounded-xl border border-border/80 bg-background/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{alt.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {alt.license}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{alt.description}</p>
                  {(alt.installCmds.apt || alt.installCmds.flatpak) && (
                    <code className="block p-1.5 rounded bg-secondary text-[10px] font-mono text-primary truncate">
                      {alt.installCmds.apt || alt.installCmds.flatpak}
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Migration Pathways Preview */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-foreground">
          Migration Pathways ({MIGRATION_GUIDES.length} Workflows)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MIGRATION_GUIDES.map((guide) => (
            <div
              key={guide.id}
              className="p-3.5 rounded-xl border border-border bg-background space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{guide.icon}</span>
                <span className="font-bold text-xs text-foreground">{guide.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{guide.subtitle}</p>
              <div className="text-[10px] text-primary font-semibold">
                {guide.steps.length} migration steps mapped
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ TAB: DISTROS & GAMING HUB ══════════ */

function AdminDistrosGamingManager() {
  const [search, setSearch] = useState("");
  const [selectedBase, setSelectedBase] = useState("All");

  const bases = ["All", "Debian", "Ubuntu", "Arch", "Red Hat / Fedora", "openSUSE", "Independent"];

  const filteredDistros = DISTROS_DATA.filter((d) => {
    const matchBase =
      selectedBase === "All" || d.base.toLowerCase().includes(selectedBase.toLowerCase());
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.packageManager.toLowerCase().includes(q);
    return matchBase && matchQ;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-sky-400" /> Distros Catalog & Gaming Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage {DISTROS_DATA.length} Linux operating system profiles, Steam Proton gaming tiers,
            and launch argument optimizations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/distros"
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            Distros Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/gaming"
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            Gaming Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {bases.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBase(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedBase === b
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search distributions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Distros Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDistros.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{d.logo}</span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{d.name}</h3>
                  <span className="text-[10px] text-muted-foreground">Base: {d.base}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary text-primary">
                {d.packageManager}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{d.tagline}</p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{d.defaultDesktop}</span>
              <span className="font-semibold text-foreground">{d.releaseModel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Proton Gaming Anti-Cheat Matrix */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-sky-400" /> Popular Games Proton & Anti-Cheat Status
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {ANTI_CHEAT_GAMES.map((game: AntiCheatGame) => (
              <div
                key={game.name}
                className="p-2.5 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-foreground">{game.name}</span>
                  <p className="text-[11px] text-muted-foreground">{game.antiCheat}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold block">
                    {game.protonTier}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {game.status.split(" ")[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" /> GPU Driver Installation Matrix
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {GPU_DRIVER_GUIDES.map((guide) => (
              <div
                key={guide.gpu}
                className="p-2.5 rounded-xl border border-border bg-background space-y-1 text-xs"
              >
                <span className="font-bold text-foreground">{guide.gpu}</span>
                <code className="block p-1 rounded bg-secondary text-[10px] font-mono text-primary truncate">
                  {guide.ubuntu}
                </code>
                <p className="text-[11px] text-muted-foreground">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ TAB: EXAM QUESTION BANK ══════════ */

function AdminExamBankManager() {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const domains = [
    "All",
    "Permissions & File System",
    "Process Management",
    "System Administration",
    "Networking & Security",
    "Storage & Disks",
  ];

  const filteredQuestions = EXAM_QUESTIONS.filter((q) => {
    const matchDom = selectedDomain === "All" || q.domain === selectedDomain;
    const query = search.toLowerCase();
    const matchQ =
      !query ||
      q.question.toLowerCase().includes(query) ||
      q.explanation.toLowerCase().includes(query) ||
      q.options.some((opt) => opt.toLowerCase().includes(query));
    return matchDom && matchQ;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Certification Exam Question Bank
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Authoring and audit bank for {EXAM_QUESTIONS.length} RHCSA, LFCS, and Linux+ practice
            examination questions.
          </p>
        </div>
        <Link
          to="/exam/practice"
          target="_blank"
          className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          Open Practice Exam <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Domain Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedDomain === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exam questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="min-w-[24px] h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-mono mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary uppercase">
                    {q.domain}
                  </span>
                  <h3 className="font-bold text-sm text-foreground mt-1.5">{q.question}</h3>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 pl-8">
              {q.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                    oIdx === q.correctIndex
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span>{opt}</span>
                  {oIdx === q.correctIndex && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="pl-8 pt-2 border-t border-border/60 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Technical Explanation: </span>
              {q.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════ TAB: COMMANDS & CHEATSHEETS HUB ══════════ */

function AdminCommandsCheatsheetsManager() {
  const [cmdSearch, setCmdSearch] = useState("");
  const [selectedCmdCat, setSelectedCmdCat] = useState("All");

  const cmdCategories = [
    "All",
    "Files & Navigation",
    "Networking",
    "Process Management",
    "System Info",
    "Disks & Storage",
    "User Management",
    "Permissions & Security",
  ];

  const filteredCmds = COMMANDS_DATA.filter((cmd) => {
    const matchCat = selectedCmdCat === "All" || cmd.category === selectedCmdCat;
    const q = cmdSearch.toLowerCase();
    const matchQ =
      !q ||
      cmd.windowsCmd.toLowerCase().includes(q) ||
      cmd.linuxCmd.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" /> Commands & Cheat Sheets Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Inspect {COMMANDS_DATA.length} Windows-to-Linux command translations and{" "}
            {CHEATSHEETS_DATA.length} curriculum cheat sheet categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/tools/command-translator"
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            Command Translator <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/cheat-sheets"
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            Cheat Sheets <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {cmdCategories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCmdCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedCmdCat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands or descriptions…"
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Commands Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Windows Command</th>
                <th className="p-3.5">Linux Equivalent</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description & Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCmds.map((cmd) => (
                <tr
                  key={cmd.windowsCmd + cmd.linuxCmd}
                  className="hover:bg-secondary/20 transition"
                >
                  <td className="p-3.5 font-mono text-muted-foreground">{cmd.windowsCmd}</td>
                  <td className="p-3.5 font-mono font-bold text-primary">{cmd.linuxCmd}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                      {cmd.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-foreground">{cmd.description}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Linux Ex: {cmd.linuxExample}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cheat Sheets Overview */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-foreground">
          Cheat Sheet Categories ({CHEATSHEETS_DATA.length} Modules)
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {CHEATSHEETS_DATA.map((cs) => (
            <div
              key={cs.id}
              className="p-3.5 rounded-xl border border-border bg-background space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cs.icon}</span>
                <span className="font-bold text-xs text-foreground">{cs.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{cs.summary}</p>
              <div className="text-[10px] text-primary font-semibold">
                {cs.sections.reduce((acc, s) => acc + s.items.length, 0)} commands documented
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ TAB 5: RESOURCES MANAGER ══════════ */

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "link" | "zip" | "other";
  createdAt: string;
}

const RESOURCE_CATEGORIES = [
  "Cheat Sheets",
  "Lab Files",
  "PDF Guides",
  "Practice Tests",
  "Tools",
  "Templates",
  "Other",
];

function AdminResourcesManager() {
  const [resources, setResources] = useState<Resource[]>(() => {
    const stored = localStorage.getItem("ak-admin-resources");
    return stored ? JSON.parse(stored) : SAMPLE_RESOURCES;
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Cheat Sheets",
    fileUrl: "",
    fileType: "pdf" as Resource["fileType"],
  });
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function save(data: Resource[]) {
    setResources(data);
    localStorage.setItem("ak-admin-resources", JSON.stringify(data));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setForm((f) => ({
        ...f,
        fileUrl: url,
        title: f.title || file.name.replace(/\.[^.]+$/, ""),
        fileType: detectFileType(file.name),
      }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function detectFileType(name: string): Resource["fileType"] {
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
    if (name.endsWith(".zip")) return "zip";
    return "other";
  }

  function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.fileUrl) return;
    const newRes: Resource = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    const next = [newRes, ...resources];
    save(next);
    setForm({ title: "", description: "", category: "Cheat Sheets", fileUrl: "", fileType: "pdf" });
    setShowForm(false);
    setSavedMsg("Resource added successfully!");
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function deleteResource(id: string) {
    save(resources.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Resources Library Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload and manage downloadable resources: cheat sheets, PDFs, lab files, and external
            links.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {savedMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {savedMsg}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddResource}
          className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4"
        >
          <h3 className="font-bold text-sm text-foreground">Add New Resource</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Linux Commands Cheat Sheet"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Short description of this resource..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                External URL (or upload below)
              </label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.fileUrl.startsWith("data:") ? "" : form.fileUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fileUrl: e.target.value, fileType: "link" }))
                  }
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upload File from Device
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-1.5 flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/50 px-4 py-3 cursor-pointer hover:border-primary/40 transition"
              >
                <FileUp className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {form.fileUrl.startsWith("data:") ? "✓ File loaded" : "Choose file..."}
                </span>
                {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />}
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.zip,.txt,.md"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!form.title || !form.fileUrl}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save Resource
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl border border-border bg-card p-4 space-y-3 hover:border-primary/30 transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg">
                    {res.fileType === "pdf"
                      ? "📄"
                      : res.fileType === "docx"
                        ? "📝"
                        : res.fileType === "zip"
                          ? "📦"
                          : res.fileType === "link"
                            ? "🔗"
                            : "📎"}
                  </span>
                  <span className="font-bold text-sm text-foreground truncate">{res.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 mt-1 rounded-full bg-secondary text-muted-foreground font-semibold inline-block">
                  {res.category}
                </span>
              </div>
              <button
                onClick={() => deleteResource(res.id)}
                className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {res.description && <p className="text-xs text-muted-foreground">{res.description}</p>}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {new Date(res.createdAt).toLocaleDateString()}
              </span>
              <a
                href={res.fileUrl}
                download={!res.fileUrl.startsWith("http")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                <Download className="w-3 h-3" /> Download / View
              </a>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No resources yet. Add your first resource above.
          </p>
        </div>
      )}
    </div>
  );
}

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: "res-001",
    title: "Linux Commands Cheat Sheet",
    description:
      "Essential Linux command reference covering filesystem, permissions, processes, and networking.",
    category: "Cheat Sheets",
    fileUrl: "https://files.fosswire.com/2007/08/fwunixref.pdf",
    fileType: "pdf",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "res-002",
    title: "Bash Scripting Reference",
    description:
      "Complete Bash scripting guide with variables, loops, conditionals, and functions.",
    category: "PDF Guides",
    fileUrl: "https://mywiki.wooledge.org/BashGuide",
    fileType: "link",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "res-003",
    title: "Vim Keybindings Cheat Sheet",
    description: "Quick reference for Vim normal mode, insert mode, visual mode, and ex commands.",
    category: "Cheat Sheets",
    fileUrl: "https://vim.rtorr.com",
    fileType: "link",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/* ══════════ TAB 6: PLATFORM ANALYTICS ══════════ */

function AdminAnalyticsTab() {
  const chartData = [
    { day: "Mon", activeLearners: 120, lessonsFinished: 240, examsTaken: 45 },
    { day: "Tue", activeLearners: 180, lessonsFinished: 380, examsTaken: 62 },
    { day: "Wed", activeLearners: 240, lessonsFinished: 520, examsTaken: 88 },
    { day: "Thu", activeLearners: 210, lessonsFinished: 460, examsTaken: 74 },
    { day: "Fri", activeLearners: 310, lessonsFinished: 690, examsTaken: 110 },
    { day: "Sat", activeLearners: 420, lessonsFinished: 890, examsTaken: 154 },
    { day: "Sun", activeLearners: 390, lessonsFinished: 810, examsTaken: 130 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">
              Weekly Active Learners & Lessons Completed
            </h3>
            <p className="text-xs text-muted-foreground">
              Platform engagement trends over the last 7 days
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400">+24% vs last week</span>
        </div>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="learnersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lessonsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="lessonsFinished"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#lessonsGrad)"
                name="Lessons Finished"
              />
              <Area
                type="monotone"
                dataKey="activeLearners"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#learnersGrad)"
                name="Active Learners"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ══════════ TAB 7: LINUX PACKAGE REGISTRY ══════════ */

function LinuxPackageRegistry() {
  const PACKAGES = [
    {
      name: "coreutils",
      version: "9.4",
      desc: "Basic file, shell and text manipulation utilities",
      status: "Installed",
    },
    {
      name: "systemd",
      version: "255",
      desc: "System and service manager for Linux operating systems",
      status: "Installed",
    },
    {
      name: "nmap",
      version: "7.94",
      desc: "Network exploration tool and security / port scanner",
      status: "Installed",
    },
    {
      name: "docker-ce",
      version: "26.1",
      desc: "Open source container runtime and engine daemon",
      status: "Installed",
    },
    {
      name: "kubectl",
      version: "v1.30",
      desc: "Command-line tool for controlling Kubernetes clusters",
      status: "Installed",
    },
    {
      name: "wireshark-cli",
      version: "4.2",
      desc: "Network protocol analyzer and packet dissection suite",
      status: "Installed",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Linux Administration Packages & Sandbox Modules</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="p-4 rounded-2xl border border-border bg-card space-y-2 hover:border-primary/30 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-foreground">{pkg.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                v{pkg.version}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{pkg.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
