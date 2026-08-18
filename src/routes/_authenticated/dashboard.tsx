import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboard } from "@/lib/dashboard.functions";
import {
  getWeekly,
  setWeeklyTarget,
  buyStreakFreeze,
  markNotificationsRead,
} from "@/lib/quiz.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRoles } from "@/lib/useRole";
import { CATALOG_COURSES } from "@/lib/courses-catalog-data";
import {
  Flame,
  Trophy,
  Terminal,
  BookOpen,
  LogOut,
  Sparkles,
  Zap,
  Shield,
  Bell,
  Snowflake,
  Target,
  User,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AfroKernel" },
      {
        name: "description",
        content:
          "Your AfroKernel learner dashboard — XP, streak, weekly goals, freeze tokens, quizzes, and terminal sessions.",
      },
      { property: "og:title", content: "AfroKernel Dashboard" },
      { property: "og:description", content: "Your Linux mastery, at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isEditor } = useRoles();
  const {
    user,
    stats,
    enrolledCourses,
    completedLessons,
    examSubmissions,
    signOut: authSignOut,
  } = useAuth();

  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const { data: weekly } = useQuery({ queryKey: ["weekly"], queryFn: () => getWeekly() });

  const buyFreeze = useMutation({
    mutationFn: () => buyStreakFreeze(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const setTarget = useMutation({
    mutationFn: (target_xp: number) => setWeeklyTarget({ data: { target_xp } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly"] }),
  });

  async function handleSignOut() {
    await authSignOut();
    navigate({ to: "/", replace: true });
  }

  const profile = data?.profile;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Learner";
  const goal = weekly?.goal as any;
  const currentXp = Math.max(stats.xp, data?.stats?.xp ?? 0);
  const currentLevel = Math.max(stats.level, data?.stats?.level ?? 1);
  const currentStreak = Math.max(stats.streak_days, data?.stats?.streak_days ?? 1);

  const goalPct = goal
    ? Math.min(100, Math.round(((goal.earned_xp ?? 0) / Math.max(1, goal.target_xp)) * 100))
    : 0;
  const unread = weekly?.notifications ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/courses" className="text-xs font-semibold hover:text-primary">
              Courses
            </Link>
            <Link to="/exam/practice" className="text-xs font-semibold hover:text-primary">
              Practice Exam
            </Link>
            <Link to="/lab" className="text-xs font-semibold hover:text-primary">
              Lab
            </Link>
            <Link to="/chat" className="text-xs font-semibold hover:text-primary">
              Tutor
            </Link>
            <Link
              to="/profile"
              className="text-xs font-semibold hover:text-primary inline-flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" /> Profile
            </Link>
            {isEditor && (
              <Link
                to="/admin"
                className="text-xs font-bold text-primary hover:opacity-80 inline-flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
            <NotificationBell
              count={unread.length}
              items={unread}
              onOpen={() =>
                markNotificationsRead().then(() => qc.invalidateQueries({ queryKey: ["weekly"] }))
              }
            />
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Welcome back, <span className="text-primary">{displayName}</span>
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Keep the streak alive. Master Linux command by command.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/courses/$slug/$lesson"
              params={{ slug: "linux", lesson: "01-welcome-to-linux" }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Resume Linux Track
            </Link>
            <Link
              to="/exam/practice"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Award className="h-3.5 w-3.5" /> Practice Exam
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Zap} label="Total XP" value={currentXp} accent />
          <StatCard icon={Trophy} label="Learner Level" value={`Level ${currentLevel}`} />
          <StatCard icon={Flame} label="Active Streak" value={`${currentStreak}d`} />
          <StatCard icon={Award} label="Exams Taken" value={examSubmissions.length} />
        </div>

        {/* Active Enrolled Courses */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Your Enrolled Courses</h2>
            </div>
            <Link to="/courses" className="text-xs font-semibold text-primary hover:underline">
              Browse All Catalog →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {CATALOG_COURSES.filter(
              (c) => enrolledCourses.includes(c.slug) || c.slug === "linux",
            ).map((course) => {
              const doneCount = course.lessons.filter((l) =>
                completedLessons.includes(l.id),
              ).length;
              const pct =
                course.lessons.length > 0
                  ? Math.round((doneCount / course.lessons.length) * 100)
                  : 0;
              const nextUnfinished =
                course.lessons.find((l) => !completedLessons.includes(l.id)) || course.lessons[0];

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                      {course.category}
                    </span>
                    <h3 className="font-bold text-sm text-foreground mt-2">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>
                        {doneCount} / {course.lessons.length} lessons
                      </span>
                      <span className="text-primary font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <Link
                      to="/courses/$slug/$lesson"
                      params={{ slug: course.slug, lesson: nextUnfinished.slug }}
                      className="w-full py-2 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Play className="h-3 w-3 fill-current" /> Continue Lesson
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Exam Results History */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Recent Practice Exam Submissions
              </h2>
            </div>
            <Link
              to="/exam/practice"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Take Another Exam →
            </Link>
          </div>

          {examSubmissions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {examSubmissions.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate">
                      {exam.trackLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${exam.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                    >
                      {exam.passed ? "Passed" : "Retake"}
                    </span>
                  </div>
                  <div className="font-mono text-2xl font-black text-primary">
                    {exam.percentage}%
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>
                      {exam.score}/{exam.totalQuestions} correct
                    </span>
                    <span>{new Date(exam.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground space-y-3">
              <p>You haven't taken any practice exams yet.</p>
              <Link
                to="/exam/practice"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
              >
                Launch Practice Exam <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 2-Column Panels */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Weekly Learning Goal" icon={Target}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>
                {goal?.earned_xp ?? currentXp} / {goal?.target_xp ?? 200} XP
              </span>
              <span className="text-primary">{goalPct}%</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${goalPct}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Target:</span>
              {[100, 200, 500, 1000].map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget.mutate(t)}
                  className={`px-2.5 py-1 rounded-md border text-xs ${goal?.target_xp === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
                >
                  {t} XP
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Ask AfroKernel 24/7 Tutor" icon={Sparkles}>
            <p className="text-xs text-muted-foreground">
              Stuck on a command, permission syntax, or network route? Your AI mentor is grounded in
              the curriculum.
            </p>
            <Link
              to="/chat"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 shadow-sm"
            >
              Launch AI Tutor Assistant
            </Link>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function NotificationBell({
  count,
  items,
  onOpen,
}: {
  count: number;
  items: any[];
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) onOpen();
        }}
        className="relative p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-popover shadow-xl z-50 p-2">
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">No new notifications</p>
          )}
          {items.map((n) => (
            <div key={n.id} className="p-2 rounded-lg hover:bg-secondary text-xs">
              <p className="font-semibold text-foreground">{n.title}</p>
              {n.body && <p className="text-muted-foreground mt-0.5">{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : ""}`} /> {label}
      </div>
      <div className="mt-2 text-2xl font-bold font-display text-foreground">{value}</div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {title}
      </h2>
      {children}
    </div>
  );
}
