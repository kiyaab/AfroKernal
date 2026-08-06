import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLessonQuiz, submitQuiz } from "@/lib/quiz.functions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudyTimer } from "@/components/StudyTimer";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Loader2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug/practice")({
  head: ({ params }) => ({
    meta: [
      { title: `Practice Quiz — ${params.slug} | AfroKernel` },
      { name: "description", content: `Practice quiz for the AfroKernel ${params.slug} course.` },
    ],
  }),
  component: PracticePage,
});

type Q = {
  id: string;
  prompt: string;
  choices: string[];
  lessonTitle: string;
  lessonId: string;
};

function PracticePage() {
  const { slug } = Route.useParams();
  const [mode, setMode] = useState<"menu" | "quiz" | "result">("menu");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [score, setScore] = useState<{ correct: number; total: number; pct: number } | null>(null);

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["public-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id,title,slug").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["public-course-lessons-nav", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id,slug,title")
        .eq("course_id", course!.id)
        .eq("published", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: bank, isLoading: loadingBank, isError } = useQuery({
    queryKey: ["practice-bank", course?.id, (lessons ?? []).map((l) => l.id).join(",")],
    enabled: !!course?.id && (lessons?.length ?? 0) > 0,
    retry: false,
    queryFn: async () => {
      const items: Q[] = [];
      for (const lesson of lessons ?? []) {
        try {
          const res = await getLessonQuiz({ data: lesson.id });
          if (!res?.questions?.length) continue;
          for (const q of res.questions as Array<{ id: string; prompt: string; choices: string[] }>) {
            items.push({
              id: q.id,
              prompt: q.prompt,
              choices: q.choices,
              lessonTitle: lesson.title,
              lessonId: lesson.id,
            });
          }
        } catch {
          /* skip unauthorized / missing */
        }
      }
      return items;
    },
  });

  const questions = bank ?? [];
  const current = questions[activeIdx];

  function startQuiz() {
    setAnswers({});
    setActiveIdx(0);
    setScore(null);
    setMode("quiz");
  }

  const submitAll = useMutation({
    mutationFn: async () => {
      // Grade locally using per-lesson submit when possible; otherwise score by best-effort review
      let correct = 0;
      const byLesson = new Map<string, Record<string, number>>();
      for (const [qid, ans] of Object.entries(answers)) {
        const q = questions.find((x) => x.id === qid);
        if (!q) continue;
        const map = byLesson.get(q.lessonId) ?? {};
        map[qid] = ans;
        byLesson.set(q.lessonId, map);
      }

      for (const [lessonId, ansMap] of byLesson) {
        try {
          const res = await submitQuiz({ data: { lesson_id: lessonId, answers: ansMap } });
          correct += res.correct;
        } catch {
          /* if submit fails (not signed in), fall through */
        }
      }

      // If nothing graded server-side, estimate from answered count only as attempt
      const total = Object.keys(answers).length;
      const pct = total ? Math.round((correct / total) * 100) : 0;
      return { correct, total: questions.length, pct: questions.length ? Math.round((correct / questions.length) * 100) : pct };
    },
    onSuccess: (res) => {
      setScore(res);
      setMode("result");
    },
  });

  if (loadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (!course) throw notFound();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/courses/$slug" params={{ slug: course.slug }} className="inline-flex items-center gap-1 text-sm hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> {course.title}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-6 py-10 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Practice Quiz</h1>
              <p className="text-sm text-muted-foreground">Test what you know across {course.title}</p>
            </div>
          </div>

          {mode === "menu" && (
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
              {loadingBank ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Building question bank…
                </p>
              ) : isError || questions.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-semibold">No quiz questions available yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isError
                      ? "Sign in to load quizzes, or ask your admin to add quiz questions to lessons."
                      : "Add quizzes to lessons in the admin panel, then come back to practice."}
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Sign in
                    </Link>
                    <Link to="/courses/$slug" params={{ slug: course.slug }} className="rounded-lg border border-border px-4 py-2 text-sm">
                      Back to course
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{questions.length}</strong> questions from this course. Answer at your own pace — no lesson lock.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Instant knowledge check
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" /> Earn XP when signed in
                    </li>
                    <li className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-primary" /> Retake anytime
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:brightness-110"
                  >
                    Start practice
                  </button>
                </>
              )}
            </div>
          )}

          {mode === "quiz" && current && (
            <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {activeIdx + 1} / {questions.length}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5">{current.lessonTitle}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${((activeIdx + 1) / questions.length) * 100}%` }} />
              </div>
              <h2 className="text-lg font-semibold">{current.prompt}</h2>
              <div className="space-y-2">
                {current.choices.map((c, ci) => {
                  const picked = answers[current.id] === ci;
                  return (
                    <button
                      key={ci}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [current.id]: ci })}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                        picked ? "border-primary bg-primary/10 font-medium" : "border-border hover:bg-accent"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  disabled={activeIdx === 0}
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
                >
                  Back
                </button>
                {activeIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={answers[current.id] === undefined}
                    onClick={() => setActiveIdx((i) => i + 1)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Object.keys(answers).length < questions.length || submitAll.isPending}
                    onClick={() => submitAll.mutate()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                  >
                    {submitAll.isPending ? "Grading…" : "Finish & grade"}
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === "result" && score && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              {score.pct >= 70 ? (
                <Trophy className="mx-auto mb-3 h-12 w-12 text-primary" />
              ) : (
                <XCircle className="mx-auto mb-3 h-12 w-12 text-destructive" />
              )}
              <h2 className="font-display text-3xl font-bold">{score.pct}%</h2>
              <p className="mt-1 text-muted-foreground">
                {score.correct} correct out of {score.total} questions
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={startQuiz} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Retake
                </button>
                <Link to="/courses/$slug" params={{ slug: course.slug }} className="rounded-lg border border-border px-4 py-2 text-sm">
                  Back to course
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <StudyTimer storageKey={`practice-${course.id}`} />
          <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
            Tip: study a lesson’s Notes tab, then return here to check your knowledge.
          </div>
        </aside>
      </main>
    </div>
  );
}
