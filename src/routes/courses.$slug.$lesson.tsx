import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLessonQuiz, submitQuiz, getLessonChallenge, submitChallenge } from "@/lib/quiz.functions";
import { getBuiltInQuiz } from "@/lib/lesson-quizzes";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TutorChat } from "@/components/TutorChat";
import { StudyTimer } from "@/components/StudyTimer";
import { NotesViewer } from "@/components/NotesViewer";
import { PdfReader } from "@/components/PdfReader";
import { exportQuizPDF } from "@/lib/quiz-pdf-export";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Play,
  HelpCircle,
  Zap,
  XCircle,
  FileDown,
  Video,
  BookOpen,
  ClipboardList,
  Sparkles,
  Terminal,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const SAMPLE_TIMESTAMP_QUIZZES = [
  {
    timestamp: 15,
    title: "Linux Command Check",
    question: "Which command prints your current working directory in Linux?",
    choices: ["ls", "pwd", "cd", "whoami"],
    correctIndex: 1,
    explanation: "`pwd` stands for Print Working Directory.",
  },
  {
    timestamp: 45,
    title: "Systemd Check",
    question: "What systemd action restarts a running service?",
    choices: [
      "systemctl restart <service>",
      "systemctl reload <service>",
      "service start <service>",
      "systemctl status <service>",
    ],
    correctIndex: 0,
    explanation: "`systemctl restart` stops and starts the target unit.",
  },
];

export const Route = createFileRoute("/courses/$slug/$lesson")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.lesson} — ${params.slug} | AfroKernel` },
      { name: "description", content: `Lesson ${params.lesson} in the AfroKernel ${params.slug} course.` },
      { property: "og:title", content: `AfroKernel — ${params.lesson}` },
      { property: "og:description", content: `Free hands-on Linux lesson: ${params.lesson}.` },
    ],
  }),
  component: LessonPage,
});

type Section = "video" | "notes" | "quiz" | "lab" | "tutor";

function LessonPage() {
  const { slug, lesson: lessonSlug } = Route.useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLElement>(null);
  const notesRef = useRef<HTMLElement>(null);
  const quizRef = useRef<HTMLElement>(null);
  const labRef = useRef<HTMLElement>(null);
  const tutorRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Section>("video");

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["public-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,slug")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ["public-lesson", course?.id, lessonSlug],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course!.id)
        .eq("slug", lessonSlug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: allLessons } = useQuery({
    queryKey: ["public-course-lessons-nav", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id,slug,title,sort_order,lesson_type")
        .eq("course_id", course!.id)
        .eq("published", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const lessonIds = (allLessons ?? []).map((l) => l.id).join(",");
  const { data: myProgress } = useQuery({
    queryKey: ["my-progress", course?.id, lessonIds],
    enabled: !!course?.id && (allLessons?.length ?? 0) > 0,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const ids = (allLessons ?? []).map((l) => l.id);
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id,completed")
        .in("lesson_id", ids)
        .eq("user_id", u.user.id);
      return data ?? [];
    },
  });

  const hasVideo =
    !!lesson?.video_url &&
    lesson.lesson_type !== "pdf" &&
    !/\.pdf($|\?)/i.test(lesson.video_url) &&
    !String(lesson.video_url).startsWith("data:application/pdf");
  const hasNotes = !!(lesson?.content && String(lesson.content).trim());
  const rawPdf =
    (lesson as { pdf_url?: string | null } | null)?.pdf_url ||
    (lesson?.lesson_type === "pdf" ? lesson?.video_url : null) ||
    (lesson?.starter_code &&
    (/\.pdf($|\?)/i.test(lesson.starter_code) ||
      lesson.starter_code.startsWith("data:application/pdf") ||
      lesson.starter_code.includes("/course-materials/"))
      ? lesson.starter_code
      : null);
  const pdfUrl = rawPdf || null;

  useEffect(() => {
    if (!lesson) return;
    if (lesson.video_url) setActive("video");
    else if (lesson.content && String(lesson.content).trim()) setActive("notes");
    else setActive("quiz");
  }, [lesson?.id]);

  const scrollTo = (section: Section) => {
    setActive(section);
    const map = { video: videoRef, notes: notesRef, quiz: quizRef, lab: labRef, tutor: tutorRef };
    map[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Wait for course (and then lesson) before treating missing data as a 404.
  // Lesson query is disabled until course.id exists, so its isLoading is false
  // while the course is still fetching — that used to flash a false 404.
  if (isCourseLoading || (course && isLessonLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Opening classroom…
      </div>
    );
  }
  if (!lesson || !course) throw notFound();

  const idx = (allLessons ?? []).findIndex((l) => l.slug === lessonSlug);
  const prev = idx > 0 ? (allLessons ?? [])[idx - 1] : undefined;
  const next = idx >= 0 ? (allLessons ?? [])[idx + 1] : undefined;
  const completedSet = new Set((myProgress ?? []).filter((p: { completed?: boolean }) => p.completed).map((p: { lesson_id: string }) => p.lesson_id));
  const doneCount = completedSet.size;
  const totalCount = allLessons?.length ?? 0;
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const sections: { id: Section; label: string; icon: typeof Video }[] = [
    { id: "video", label: "1. Video", icon: Video },
    { id: "notes", label: "2. Notes", icon: BookOpen },
    { id: "quiz", label: "3. Quiz", icon: ClipboardList },
    { id: "lab", label: "Lab", icon: Terminal },
    { id: "tutor", label: "AI Tutor", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/">
              <Logo size={32} />
            </Link>
            <div className="hidden min-w-0 sm:block">
              <Link to="/courses/$slug" params={{ slug: course.slug }} className="text-xs text-muted-foreground hover:text-primary">
                {course.title}
              </Link>
              <p className="truncate text-sm font-semibold">Classroom · {lesson.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {sections.map((s) => {
            const Icon = s.icon;
            const isOn = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isOn ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {s.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px] sm:px-6">
        <div className="min-w-0 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Course taking · Lesson {idx + 1} of {totalCount || 1}
              </p>
              <h1 className="font-display text-2xl font-bold md:text-3xl">{lesson.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Watch the video, read the notes, then take the quiz to check your understanding.
              </p>
            </div>
            <div className="flex gap-2">
              {prev && (
                <Link
                  to="/courses/$slug/$lesson"
                  params={{ slug: course.slug, lesson: prev.slug }}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </Link>
              )}
              {next && (
                <Link
                  to="/courses/$slug/$lesson"
                  params={{ slug: course.slug, lesson: next.slug }}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* 1. VIDEO */}
          <section ref={videoRef} id="video" className="scroll-mt-36 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <h2 className="font-display text-lg font-bold">Watch the video</h2>
            </div>
            {hasVideo ? (
              <VideoPlayer videoUrl={lesson.video_url!} title={lesson.title} timestampQuizzes={SAMPLE_TIMESTAMP_QUIZZES} />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Video className="mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">Notes-first lesson</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  No video for this page — scroll to the notes below, then take the quiz.
                </p>
                <button
                  type="button"
                  onClick={() => scrollTo("notes")}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Read notes →
                </button>
              </div>
            )}
            {pdfUrl && (
              <PdfReader title={`${lesson.title} — PDF`} url={pdfUrl} />
            )}
          </section>

          {/* 2. NOTES */}
          <section ref={notesRef} id="notes" className="scroll-mt-36 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <h2 className="font-display text-lg font-bold">Read the notes</h2>
            </div>
            {hasNotes ? (
              <NotesViewer title={lesson.title} content={lesson.content!} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No written notes for this lesson yet.
                {hasVideo && (
                  <button type="button" onClick={() => scrollTo("video")} className="mt-3 block w-full text-primary underline">
                    Watch the video instead
                  </button>
                )}
              </div>
            )}
          </section>

          {/* 3. QUIZ */}
          <section ref={quizRef} id="quiz" className="scroll-mt-36 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <h2 className="font-display text-lg font-bold">Take the quiz</h2>
            </div>
            <QuizBlock lessonId={lesson.id} lessonSlug={lessonSlug} courseTitle={course.title} lessonTitle={lesson.title} />
          </section>

          {/* Lab */}
          <section ref={labRef} id="lab" className="scroll-mt-36 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Lab practice</h2>
            </div>
            <ChallengeBlock lessonId={lesson.id} />
            <Link
              to="/lab"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary/50"
            >
              <div>
                <p className="font-semibold">Open Linux Lab</p>
                <p className="text-xs text-muted-foreground">Practice commands in a real browser terminal</p>
              </div>
              <Terminal className="h-5 w-5 text-primary" />
            </Link>
          </section>

          {/* Tutor */}
          <section ref={tutorRef} id="tutor" className="scroll-mt-36 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Ask the AI Tutor</h2>
            </div>
            <TutorChat
              lessonContext={{
                courseTitle: course.title,
                lessonTitle: lesson.title,
                lessonContent: lesson.content ?? undefined,
                lessonType: lesson.lesson_type,
              }}
            />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 pb-10">
            <MarkComplete
              lessonId={lesson.id}
              xp={lesson.xp_reward}
              onDone={() => {
                if (next) {
                  void navigate({
                    to: "/courses/$slug/$lesson",
                    params: { slug: course.slug, lesson: next.slug },
                  });
                } else {
                  void navigate({
                    to: "/courses/$slug/practice",
                    params: { slug: course.slug },
                  });
                }
              }}
            />
            {next ? (
              <Link
                to="/courses/$slug/$lesson"
                params={{ slug: course.slug, lesson: next.slug }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Next lesson: {next.title} →
              </Link>
            ) : (
              <Link
                to="/courses/$slug/practice"
                params={{ slug: course.slug }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Course complete — Practice quiz →
              </Link>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <StudyTimer storageKey={`study-${course.id}-${lesson.id}`} />

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">How to take this lesson</p>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1</span> Watch the video
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2</span> Read the notes
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3</span> Take the quiz
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4</span> Mark complete → next
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">Course progress</p>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>
                {doneCount}/{totalCount} done
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Lessons</p>
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {(allLessons ?? []).map((l, i) => {
                const done = completedSet.has(l.id);
                const current = l.slug === lessonSlug;
                return (
                  <li key={l.id}>
                    <Link
                      to="/courses/$slug/$lesson"
                      params={{ slug: course.slug, lesson: l.slug }}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition ${
                        current ? "bg-primary/15 font-semibold text-primary" : "hover:bg-accent"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-border text-[9px]">
                          {i + 1}
                        </span>
                      )}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <Link
            to="/courses/$slug/practice"
            params={{ slug: course.slug }}
            className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-semibold text-primary hover:bg-primary/15"
          >
            <ClipboardList className="h-4 w-4" /> Full practice quiz
          </Link>
        </aside>
      </div>
    </div>
  );
}

function ChallengeBlock({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const { data: challenge, isError, isLoading } = useQuery({
    queryKey: ["lesson-challenge", lessonId],
    queryFn: () => getLessonChallenge({ data: lessonId }),
    retry: false,
  });
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<null | { passed: boolean; awarded: number; expected?: string }>(null);
  const grade = useMutation({
    mutationFn: () => submitChallenge({ data: { lesson_id: lessonId, output } }),
    onSuccess: (res) => {
      setResult(res);
      if (res.passed) qc.invalidateQueries({ queryKey: ["my-progress"] });
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading practice…</div>;
  if (isError) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Sign in to attempt graded challenges. You can still open the Lab anytime.{" "}
        <Link to="/auth" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </section>
    );
  }
  if (!challenge) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        No graded challenge for this lesson yet. Open the Lab and practice the commands from the notes.
      </section>
    );
  }
  const c = challenge as {
    title: string;
    xp_reward: number;
    prompt: string;
    starter_command?: string;
  };
  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <Zap className="h-4 w-4" /> {c.title} · +{c.xp_reward} XP
      </h3>
      <p className="mb-3 text-sm">{c.prompt}</p>
      {c.starter_command && (
        <pre className="overflow-x-auto rounded-lg bg-[oklch(0.11_0.01_260)] p-3 font-mono text-sm text-[oklch(0.97_0.01_90)]">
          {c.starter_command}
        </pre>
      )}
      <p className="mb-1 mt-4 text-xs text-muted-foreground">Paste your terminal output here to grade</p>
      <textarea
        value={output}
        onChange={(e) => setOutput(e.target.value)}
        rows={5}
        placeholder="Run the command in the Lab, copy the output, paste here."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link to="/lab" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">
          <Play className="h-3.5 w-3.5" /> Open Lab
        </Link>
        <button
          onClick={() => grade.mutate()}
          disabled={!output.trim() || grade.isPending}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {grade.isPending ? "Grading…" : "Check my answer"}
        </button>
        {result?.passed && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> +{result.awarded} XP
          </span>
        )}
        {result && !result.passed && (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <XCircle className="h-4 w-4" /> Expected: <code className="rounded bg-destructive/10 px-1">{result.expected?.slice(0, 60)}</code>
          </span>
        )}
      </div>
    </section>
  );
}

function QuizBlock({
  lessonId,
  lessonSlug,
  courseTitle,
  lessonTitle,
}: {
  lessonId: string;
  lessonSlug: string;
  courseTitle: string;
  lessonTitle: string;
}) {
  const qc = useQueryClient();
  const builtIn = getBuiltInQuiz(lessonSlug);
  const { data, isLoading } = useQuery({
    queryKey: ["lesson-quiz", lessonId],
    queryFn: async () => {
      try {
        return await getLessonQuiz({ data: lessonId });
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const useServer = !!(data?.quiz && (data.questions?.length ?? 0) > 0);
  const questions = useServer
    ? (data!.questions as Array<{ id: string; prompt: string; choices: string[] }>)
    : builtIn.questions.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices }));
  const quizMeta = useServer
    ? {
        title: (data!.quiz as { title: string }).title,
        passing_score: (data!.quiz as { passing_score: number }).passing_score,
        xp_reward: (data!.quiz as { xp_reward: number }).xp_reward,
      }
    : {
        title: builtIn.title,
        passing_score: builtIn.passing_score,
        xp_reward: builtIn.xp_reward,
      };

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<null | {
    score: number;
    passed: boolean;
    correct: number;
    total: number;
    awarded: number;
    review: Array<{ id: string; correct: boolean; correctIndex: number; explanation: string | null }>;
  }>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (useServer) {
        return submitQuiz({ data: { lesson_id: lessonId, answers } });
      }
      const review = builtIn.questions.map((q) => {
        const picked = answers[q.id];
        const ok = picked === q.correct_index;
        return {
          id: q.id,
          correct: ok,
          correctIndex: q.correct_index,
          explanation: q.explanation ?? null,
        };
      });
      const correct = review.filter((r) => r.correct).length;
      const total = review.length || 1;
      const score = Math.round((correct / total) * 100);
      const passed = score >= builtIn.passing_score;
      let awarded = 0;
      if (passed) {
        awarded = builtIn.xp_reward;
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          const { data: s } = await supabase.from("user_stats").select("xp").eq("user_id", u.user.id).maybeSingle();
          const currentXp = (s as { xp?: number } | null)?.xp ?? 0;
          await supabase.from("user_stats").update({ xp: currentXp + awarded } as never).eq("user_id", u.user.id);
          await supabase.from("lesson_progress").upsert(
            {
              user_id: u.user.id,
              lesson_id: lessonId,
              completed: true,
              score,
              completed_at: new Date().toISOString(),
            } as never,
            { onConflict: "user_id,lesson_id" },
          );
        }
      }
      return { score, passed, correct, total, awarded, review };
    },
    onSuccess: (res) => {
      setResult(res);
      if (res.passed) qc.invalidateQueries({ queryKey: ["my-progress"] });
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading quiz…</div>;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <HelpCircle className="h-4 w-4" /> {quizMeta.title}
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Pass ≥ {quizMeta.passing_score}% · +{quizMeta.xp_reward} XP · Answer every question, then submit
      </p>
      <div className="space-y-5">
        {questions.map((q, i) => {
          const review = result?.review.find((r) => r.id === q.id);
          return (
            <div key={q.id}>
              <p className="text-sm font-medium">
                {i + 1}. {q.prompt}
              </p>
              <div className="mt-2 space-y-1.5">
                {q.choices.map((c, ci) => {
                  const isPicked = answers[q.id] === ci;
                  const isCorrect = review?.correctIndex === ci;
                  return (
                    <label
                      key={ci}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        review
                          ? isCorrect
                            ? "border-green-500/50 bg-green-500/10"
                            : isPicked
                              ? "border-destructive/50 bg-destructive/10"
                              : "border-border"
                          : isPicked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={isPicked}
                        onChange={() => setAnswers({ ...answers, [q.id]: ci })}
                        className="accent-primary"
                        disabled={!!review}
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
              {review?.explanation && <p className="mt-1.5 text-xs text-muted-foreground">💡 {review.explanation}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending || Object.keys(answers).length < questions.length}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submit.isPending ? "Grading…" : result ? "Submit again" : "Submit quiz"}
        </button>
        {result && (
          <>
            <span className={`text-sm font-medium ${result.passed ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              Score {result.score}% ({result.correct}/{result.total}) · {result.passed ? `+${result.awarded} XP` : "Try again"}
            </span>
            <button
              onClick={() =>
                exportQuizPDF({
                  userName: "AfroKernel Learner",
                  courseTitle,
                  lessonTitle,
                  quizTitle: quizMeta.title,
                  score: result.score,
                  correct: result.correct,
                  total: result.total,
                  passed: result.passed,
                  awardedXp: result.awarded,
                  date: new Date().toLocaleDateString(),
                  questions: questions.map((q) => ({
                    prompt: q.prompt,
                    choices: q.choices,
                    userAnswerIndex: answers[q.id] ?? 0,
                    correctIndex: result.review.find((r) => r.id === q.id)?.correctIndex ?? 0,
                    explanation: result.review.find((r) => r.id === q.id)?.explanation ?? undefined,
                  })),
                })
              }
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:bg-accent"
            >
              <FileDown className="h-3.5 w-3.5 text-primary" /> Export PDF
            </button>
          </>
        )}
        {result && !result.passed && (
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="text-xs text-primary underline"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}

function MarkComplete({ lessonId, xp, onDone }: { lessonId: string; xp: number; onDone?: () => void }) {
  const qc = useQueryClient();
  const [done, setDone] = useState(false);
  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sign in to save progress");
      await supabase.from("lesson_progress").upsert(
        {
          user_id: u.user.id,
          lesson_id: lessonId,
          completed: true,
          score: 100,
          completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "user_id,lesson_id" },
      );
      const { data: s } = await supabase.from("user_stats").select("xp").eq("user_id", u.user.id).maybeSingle();
      const currentXp = (s as { xp?: number } | null)?.xp ?? 0;
      await supabase.from("user_stats").update({ xp: currentXp + xp } as never).eq("user_id", u.user.id);
      setDone(true);
      qc.invalidateQueries({ queryKey: ["my-progress"] });
      onDone?.();
    },
  });
  return (
    <div className="space-y-2">
      <button
        onClick={() => mut.mutate()}
        disabled={done || mut.isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
      >
        <CheckCircle2 className="h-4 w-4" /> {done ? `Completed +${xp} XP` : "Mark complete & go next"}
      </button>
      {mut.isError && (
        <p className="text-xs text-destructive">
          {(mut.error as Error).message}.{" "}
          <Link to="/auth" className="underline">
            Sign in
          </Link>{" "}
          to save progress.
        </p>
      )}
    </div>
  );
}
