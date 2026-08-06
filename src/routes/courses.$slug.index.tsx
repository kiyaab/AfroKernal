import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Video,
  FileText,
  Terminal as TermIcon,
  Loader2,
  Play,
  FileDown,
  ChevronRight,
  Layers,
  Award,
  Clock,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug/")({
  validateSearch: (s: Record<string, unknown>) => ({
    start: s.start === true || s.start === "1" || s.start === "true" ? true : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — AfroKernel Course` },
      { name: "description", content: `Free hands-on Linux course on AfroKernel: ${params.slug}.` },
      { property: "og:title", content: `AfroKernel Course — ${params.slug}` },
    ],
  }),
  component: CoursePage,
});

type Lesson = {
  id: string;
  slug: string;
  title: string;
  lesson_type: string;
  xp_reward: number;
  sort_order: number;
};

function CoursePage() {
  const { slug } = Route.useParams();
  const { start } = Route.useSearch();
  const navigate = useNavigate();

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["public-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: lessons, isLoading: isLessonsLoading, error: lessonsError } = useQuery({
    queryKey: ["public-course-lessons", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id,slug,title,lesson_type,xp_reward,sort_order")
        .eq("course_id", course!.id)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });

  const { data: myProgress } = useQuery({
    queryKey: ["my-progress", course?.id, (lessons ?? []).map((l) => l.id).join(",")],
    enabled: !!course?.id && (lessons?.length ?? 0) > 0,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const ids = (lessons ?? []).map((l) => l.id);
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id,completed")
        .in("lesson_id", ids)
        .eq("user_id", u.user.id);
      return data ?? [];
    },
  });

  const list = lessons ?? [];
  const completed = new Set((myProgress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const doneCount = completed.size;
  const totalXp = list.reduce((acc, curr) => acc + (curr.xp_reward || 0), 0);
  const progressPct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
  const nextLesson = list.find((l) => !completed.has(l.id)) ?? list[0];
  const allDone = list.length > 0 && doneCount >= list.length;
  const firstLesson = list[0];

  useEffect(() => {
    if (!start || !course || !nextLesson) return;
    void navigate({
      to: "/courses/$slug/$lesson",
      params: { slug: course.slug, lesson: nextLesson.slug },
      replace: true,
    });
  }, [start, course?.slug, nextLesson?.slug, navigate]);

  if (isCourseLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-mono text-sm tracking-widest uppercase">Loading course…</p>
      </div>
    );
  }

  if (!course) throw notFound();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/courses" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Logo />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {course.category ?? "Linux"} · Full classroom
          </div>
          <h1 className="font-display mt-4 text-4xl font-black tracking-tight md:text-5xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {course.description ||
              "A full learning path with lessons, notes, video, quizzes, and the Linux Lab. Free for every learner."}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" /> {isLessonsLoading ? "…" : list.length} lessons
            </span>
            <span className="inline-flex items-center gap-1.5 capitalize">
              <BookOpen className="h-4 w-4 text-primary" /> {course.difficulty || "beginner"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> {totalXp} XP total
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> ~{Math.max(30, list.length * 12)} min
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Your progress</span>
              <span>
                {doneCount}/{list.length} · {progressPct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {lessonsError && (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Could not load lessons: {(lessonsError as Error).message}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {isLessonsLoading ? (
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-primary/70 px-8 py-3.5 text-base font-bold text-primary-foreground"
              >
                <Loader2 className="h-5 w-5 animate-spin" /> Preparing lessons…
              </button>
            ) : nextLesson ? (
              <>
                <Link
                  to="/courses/$slug/$lesson"
                  params={{ slug: course.slug, lesson: nextLesson.slug }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg hover:brightness-110"
                >
                  {allDone ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                  {allDone ? "Review course" : doneCount > 0 ? `Continue learning` : "Start learning"}
                </Link>
                <Link
                  to="/courses/$slug/practice"
                  params={{ slug: course.slug }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3.5 text-base font-bold text-primary hover:bg-primary/15"
                >
                  <ClipboardList className="h-5 w-5" /> Practice quiz
                </Link>
                {firstLesson && firstLesson.id !== nextLesson.id && (
                  <Link
                    to="/courses/$slug/$lesson"
                    params={{ slug: course.slug, lesson: firstLesson.slug }}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold hover:bg-accent"
                  >
                    Start from lesson 1
                  </Link>
                )}
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                No published lessons yet. Check back soon.
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Full course syllabus</h2>
              <p className="text-sm text-muted-foreground">Each lesson includes video, notes, and a quiz.</p>
            </div>
          </div>

          {isLessonsLoading ? (
            <div className="flex items-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading syllabus…
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No lessons published yet.
            </div>
          ) : (
            <ol className="space-y-3">
              {list.map((l, i) => {
                const Icon =
                  l.lesson_type === "video"
                    ? Video
                    : l.lesson_type === "practice"
                      ? TermIcon
                      : l.lesson_type === "pdf"
                        ? FileDown
                        : FileText;
                const done = completed.has(l.id);
                const isNext = nextLesson?.id === l.id && !allDone;

                return (
                  <li key={l.id}>
                    <Link
                      to="/courses/$slug/$lesson"
                      params={{ slug: course.slug, lesson: l.slug }}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md ${
                        isNext
                          ? "border-primary/40 bg-primary/5"
                          : done
                            ? "border-border bg-card/60"
                            : "border-border bg-card"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : isNext
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Icon className="h-3 w-3" /> {l.lesson_type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">+{l.xp_reward} XP</span>
                          {isNext && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                              Up next
                            </span>
                          )}
                        </div>
                        <h3 className="truncate font-semibold">{l.title}</h3>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                        {done ? "Review" : "Open"} <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>

      {nextLesson && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <Link
            to="/courses/$slug/$lesson"
            params={{ slug: course.slug, lesson: nextLesson.slug }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            <Play className="h-4 w-4 fill-current" />
            {doneCount > 0 ? "Continue learning" : "Start learning"}
          </Link>
        </div>
      )}
    </div>
  );
}
