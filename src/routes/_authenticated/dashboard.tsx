import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboard } from "@/lib/dashboard.functions";
import { getWeekly, setWeeklyTarget, buyStreakFreeze, markNotificationsRead } from "@/lib/quiz.functions";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRoles } from "@/lib/useRole";
import { Flame, Trophy, Terminal, BookOpen, LogOut, Sparkles, Zap, Shield, Bell, Snowflake, Target, User } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AfroKernel" },
      { name: "description", content: "Your AfroKernel learner dashboard — XP, streak, weekly goals, freeze tokens, quizzes, and terminal sessions." },
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
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const { data: weekly } = useQuery({ queryKey: ["weekly"], queryFn: () => getWeekly() });

  const buyFreeze = useMutation({
    mutationFn: () => buyStreakFreeze(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["weekly"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const setTarget = useMutation({
    mutationFn: (target_xp: number) => setWeeklyTarget({ data: { target_xp } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly"] }),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const stats = data?.stats;
  const profile = data?.profile;
  const goal = weekly?.goal as any;
  const goalPct = goal ? Math.min(100, Math.round(((goal.earned_xp ?? 0) / Math.max(1, goal.target_xp)) * 100)) : 0;
  const unread = weekly?.notifications ?? [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link to="/courses" className="text-sm hover:text-primary">Courses</Link>
            <Link to="/docs" className="text-sm hover:text-primary">Docs</Link>
            <Link to="/lab" className="text-sm hover:text-primary">Lab</Link>
            <Link to="/chat" className="text-sm hover:text-primary">Tutor</Link>
            <Link to="/profile" className="text-sm hover:text-primary inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Profile
            </Link>
            {isEditor && (
              <Link to="/admin" className="text-sm text-primary hover:opacity-80 inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
            <NotificationBell count={unread.length} items={unread} onOpen={() => markNotificationsRead().then(() => qc.invalidateQueries({ queryKey: ["weekly"] }))} />
            <ThemeToggle />
            <button onClick={signOut} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-accent flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold font-display">
          Welcome back, <span className="text-primary">{profile?.display_name ?? "learner"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Keep the streak alive. Every command counts.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/courses/$slug/$lesson"
            params={{ slug: "linux", lesson: "01-welcome-to-linux" }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            <BookOpen className="h-4 w-4" /> Start learning — Linux Fundamentals
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-accent"
          >
            All courses
          </Link>
          <Link
            to="/lab"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-accent"
          >
            <Terminal className="h-4 w-4" /> Open Lab
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 text-muted-foreground">Loading your stats…</div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard icon={Zap} label="XP" value={stats?.xp ?? 0} accent />
              <StatCard icon={Trophy} label="Level" value={stats?.level ?? 1} />
              <StatCard icon={Flame} label="Streak" value={`${stats?.streak_days ?? 0}d`} />
              <StatCard icon={Snowflake} label="Freezes" value={weekly?.freezeTokens ?? 0} />
              <StatCard icon={Terminal} label="Sessions" value={data?.sessions.length ?? 0} />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Panel title="This week's goal" icon={Target}>
                <div className="flex items-center justify-between text-sm">
                  <span>{goal?.earned_xp ?? 0} / {goal?.target_xp ?? 200} XP</span>
                  <span className="text-primary font-semibold">{goalPct}%</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${goalPct}%` }} />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Target:</span>
                  {[100, 200, 500, 1000].map((t) => (
                    <button key={t} onClick={() => setTarget.mutate(t)}
                      className={`px-2 py-1 rounded-md border text-xs ${goal?.target_xp === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <Snowflake className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">Streak freezes protect your streak on missed days.</span>
                  <button onClick={() => buyFreeze.mutate()} disabled={buyFreeze.isPending}
                    className="ml-auto px-2 py-1 rounded-md border border-border text-xs hover:bg-accent disabled:opacity-50">
                    {buyFreeze.isPending ? "…" : "Buy freeze (100 XP)"}
                  </button>
                </div>
                {buyFreeze.error && <p className="text-xs text-destructive mt-2">{(buyFreeze.error as Error).message}</p>}
              </Panel>

              <Panel title="Learning paths" icon={BookOpen}>
                {data && data.progress.length > 0 ? (
                  <ul className="space-y-3">
                    {data.progress.map((p: any) => {
                      const lesson = p.lessons;
                      const course = lesson?.courses;
                      const courseSlug = course?.slug;
                      const label = lesson?.title ?? "Lesson";
                      const courseTitle = course?.title ?? "Course";
                      return (
                        <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                          {courseSlug ? (
                            <Link
                              to="/courses/$slug/$lesson"
                              params={{ slug: courseSlug, lesson: lesson?.slug ?? "" }}
                              className="font-medium hover:text-primary hover:underline transition-colors truncate"
                            >
                              {courseTitle}: {label}
                            </Link>
                          ) : (
                            <span className="font-medium truncate">{label}</span>
                          )}
                          <span className="shrink-0 text-xs text-primary font-semibold">Done</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyLine msg="Start a course to see your paths here." href="/courses" cta="Browse courses" />
                )}
              </Panel>

              <Panel title="Recent quizzes" icon={Trophy}>
                {data && data.quizzes.length > 0 ? (
                  <ul className="space-y-2">
                    {data.quizzes.map((q: any) => (
                      <li key={q.id} className="flex justify-between text-sm">
                        <span className="truncate">{q.quiz_slug}</span>
                        <span className={q.score >= 70 ? "text-primary font-semibold" : "text-muted-foreground"}>{q.score}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLine msg="Take your first quiz to earn XP." href="/courses" cta="Explore" />
                )}
              </Panel>

              <Panel title="Recent terminal sessions" icon={Terminal}>
                {data && data.sessions.length > 0 ? (
                  <ul className="space-y-2">
                    {data.sessions.map((s: any) => (
                      <li key={s.id} className="flex justify-between text-sm">
                        <span className="font-mono text-xs">{s.distro} · {s.command_count} cmds</span>
                        <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLine msg="Launch a browser terminal and practice." href="/lab" cta="Open lab" />
                )}
              </Panel>

              <Panel title="Ask AfroKernel Tutor" icon={Sparkles}>
                <p className="text-sm text-muted-foreground">Stuck? Your 24/7 AI mentor is grounded in the AfroKernel curriculum.</p>
                <Link to="/chat" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">
                  Start chatting
                </Link>
              </Panel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function NotificationBell({ count, items, onOpen }: { count: number; items: any[]; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => { setOpen((v) => !v); if (!open) onOpen(); }}
        className="relative p-1.5 rounded-lg border border-border hover:bg-accent">
        <Bell className="w-4 h-4" />
        {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 p-2">
          {items.length === 0 && <p className="text-xs text-muted-foreground p-3">No notifications</p>}
          {items.map((n) => (
            <div key={n.id} className="p-2 rounded-lg hover:bg-accent">
              <p className="text-sm font-medium">{n.title}</p>
              {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-primary" : ""}`} /> {label}
      </div>
      <div className="mt-2 text-3xl font-bold font-display">{value}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyLine({ msg, href, cta }: { msg: string; href: string; cta: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {msg}{" "}
      <Link to={href} className="text-primary hover:underline">{cta} →</Link>
    </div>
  );
}
