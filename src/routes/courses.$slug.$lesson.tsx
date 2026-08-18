import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { getCourseBySlug, CATALOG_COURSES } from "@/lib/courses-catalog-data";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TutorChat } from "@/components/TutorChat";
import { StudyTimer } from "@/components/StudyTimer";
import { NotesViewer } from "@/components/NotesViewer";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Play,
  HelpCircle,
  Zap,
  FileDown,
  Video,
  BookOpen,
  ClipboardList,
  Sparkles,
  Terminal as TermIcon,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Lock,
  Award,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug/$lesson")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.lesson} — ${params.slug.toUpperCase()} | AfroKernel` },
      {
        name: "description",
        content: `Interactive Linux lesson: ${params.lesson} in ${params.slug}.`,
      },
      { property: "og:title", content: `AfroKernel Lesson — ${params.lesson}` },
    ],
  }),
  component: LessonPage,
});

type Section = "video" | "notes" | "lab" | "quiz" | "tutor";

function LessonPage() {
  const { slug, lesson: lessonSlug } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isLessonCompleted, markLessonCompleted, stats } = useAuth();
  const [activeTab, setActiveTab] = useState<Section>("video");

  // Local quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [justCompletedToast, setJustCompletedToast] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({
        to: "/auth",
        search: { redirect: `/courses/${slug}/${lessonSlug}`, mode: "signup" },
        replace: true,
      });
    }
  }, [authLoading, user, navigate, slug, lessonSlug]);

  const courseMeta = getCourseBySlug(slug) || CATALOG_COURSES[0];

  // Query Database or Fallback
  const { data: lessonData } = useQuery({
    queryKey: ["public-lesson-view", slug, lessonSlug],
    queryFn: async () => {
      const catalogLesson =
        courseMeta.lessons.find((l) => l.slug === lessonSlug) || courseMeta.lessons[0];
      try {
        const { data: dbCourse } = await supabase
          .from("courses")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (dbCourse) {
          const { data: dbL } = await supabase
            .from("lessons")
            .select("*")
            .eq("course_id", dbCourse.id)
            .eq("slug", lessonSlug)
            .maybeSingle();

          if (dbL) {
            return {
              ...catalogLesson,
              id: dbL.id,
              title: dbL.title || catalogLesson.title,
              content: dbL.content || catalogLesson.content,
              video_url: dbL.video_url || catalogLesson.video_url,
              xp_reward: dbL.xp_reward || catalogLesson.xp_reward,
              lesson_type:
                (dbL.lesson_type as "video" | "notes" | "lab" | "quiz") ||
                catalogLesson.lesson_type,
            };
          }
        }
        return catalogLesson;
      } catch {
        return catalogLesson;
      }
    },
  });

  const currentLesson = lessonData || courseMeta.lessons[0];
  const allLessons = courseMeta.lessons;
  const currentIdx = allLessons.findIndex((l) => l.slug === currentLesson.slug);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const isCompleted = isLessonCompleted(currentLesson.id);

  // Automatically switch tab if current lesson is notes/lab
  useEffect(() => {
    if (currentLesson.lesson_type === "notes") setActiveTab("notes");
    else if (currentLesson.lesson_type === "lab") setActiveTab("lab");
    else setActiveTab("video");
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  }, [currentLesson.slug, currentLesson.lesson_type]);

  async function handleComplete() {
    await markLessonCompleted(courseMeta.id, currentLesson.id, currentLesson.xp_reward);
    setJustCompletedToast(true);
    setTimeout(() => setJustCompletedToast(false), 4000);
  }

  function handleNextLesson() {
    if (nextLesson) {
      navigate({
        to: "/courses/$slug/$lesson",
        params: { slug, lesson: nextLesson.slug },
      });
    } else {
      navigate({
        to: "/courses/$slug/practice",
        params: { slug },
      });
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="rounded-3xl border border-border bg-card p-8 max-w-md text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold font-display">Authentication Required</h2>
          <p className="text-xs text-muted-foreground">
            Please sign in or create a free account to access this lesson, interact with labs, and
            earn XP.
          </p>
          <button
            onClick={() =>
              navigate({
                to: "/auth",
                search: { redirect: `/courses/${slug}/${lessonSlug}`, mode: "signup" },
              })
            }
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-[var(--shadow-glow)]"
          >
            Sign In or Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ───────── TOP BAR ───────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/courses/$slug"
              params={{ slug }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Course Syllabus</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">{courseMeta.title}:</span>
              <span className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                {currentLesson.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StudyTimer />
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>{stats.xp} XP</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Completion Toast Notification */}
      {justCompletedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-500">Lesson Completed!</h4>
            <p className="text-[11px] text-muted-foreground">
              +{currentLesson.xp_reward} XP awarded to your profile!
            </p>
          </div>
        </div>
      )}

      {/* ───────── MAIN WORKSPACE ───────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Workspace Mode Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "video", label: "Video Lecture", icon: Video },
              { id: "notes", label: "Reading & Notes", icon: BookOpen },
              { id: "lab", label: "Terminal Lab", icon: TermIcon },
              { id: "quiz", label: "Knowledge Quiz", icon: HelpCircle },
              { id: "tutor", label: "AI Tutor", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Section)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Mark Complete Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleComplete}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-primary text-primary-foreground hover:brightness-110 shadow-sm"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCompleted ? "Completed (+XP)" : "Mark as Complete"}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Video */}
        {activeTab === "video" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl p-4 sm:p-6">
              {currentLesson.video_url ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={currentLesson.video_url.replace("watch?v=", "embed/")}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-secondary/40 border border-border flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <BookOpen className="h-10 w-10 text-primary" />
                  <h3 className="font-bold text-base">Reading & Hands-on Lab Lesson</h3>
                  <p className="text-xs text-muted-foreground max-w-md">
                    This lesson is structured around reading materials, commands documentation, and
                    interactive terminal exercises.
                  </p>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110"
                  >
                    Open Notes & Commands
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Notes & Cheatsheet */}
        {activeTab === "notes" && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-6">
            <div className="prose prose-invert max-w-none">
              <NotesViewer title={currentLesson.title} content={currentLesson.content} />
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Terminal Lab */}
        {activeTab === "lab" && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-foreground">
                  Interactive Linux Terminal Sandbox
                </span>
              </div>
              <Link
                to="/lab"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Open Fullscreen Lab <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-black p-4 font-mono text-xs text-emerald-400 space-y-3 min-h-[360px] flex flex-col justify-between">
              <div>
                <div className="text-muted-foreground mb-3">
                  Linux 6.6.0-afrokernel x86_64 · Connected as learner@afrokernel
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground"># Try typing commands for this lesson:</p>
                  <p className="text-foreground font-bold">learner@afrokernel:~$ uname -a</p>
                  <p className="text-muted-foreground">
                    Linux afrokernel-node1 6.6.0-afrokernel #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux
                  </p>
                  <p className="text-foreground font-bold">learner@afrokernel:~$ ls -la /etc</p>
                  <p className="text-muted-foreground">
                    drwxr-xr-x 85 root root 4096 Aug 14 09:30 .
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-zinc-400">
                <span>Type commands in the full sandbox for persistent sessions</span>
                <Link
                  to="/lab"
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110"
                >
                  Launch Full Terminal
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Knowledge Quiz */}
        {activeTab === "quiz" && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Knowledge Check Quiz
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {currentLesson.quiz?.question ||
                  "What is the primary role of this Linux component?"}
              </h2>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {(
                currentLesson.quiz?.choices || [
                  "Manage system hardware and process scheduling",
                  "Play graphical 3D video games",
                  "Create spreadsheet charts",
                  "Format USB disks without permissions",
                ]
              ).map((choice, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === (currentLesson.quiz?.correctIndex ?? 0);

                let cardStyle = "border-border bg-secondary/30 hover:border-primary/40";
                if (quizSubmitted) {
                  if (isCorrect)
                    cardStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold";
                  else if (isSelected && !isCorrect)
                    cardStyle = "border-rose-500 bg-rose-500/10 text-rose-500";
                } else if (isSelected) {
                  cardStyle = "border-primary bg-primary/10 shadow-sm";
                }

                return (
                  <button
                    key={idx}
                    disabled={quizSubmitted}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition flex items-center justify-between ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center font-mono font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{choice}</span>
                    </div>
                    {quizSubmitted && isCorrect && <Check className="h-4 w-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            {/* Submit Quiz button & explanation */}
            {!quizSubmitted ? (
              <button
                disabled={selectedAnswer === null}
                onClick={() => {
                  setQuizSubmitted(true);
                  if (selectedAnswer === (currentLesson.quiz?.correctIndex ?? 0)) {
                    handleComplete();
                  }
                }}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2 text-xs">
                <span className="font-bold text-primary block">Explanation:</span>
                <p className="text-muted-foreground">
                  {currentLesson.quiz?.explanation ||
                    "This component functions as the primary abstraction layer between user applications and the physical kernel."}
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswer(null);
                    }}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: AI Tutor */}
        {activeTab === "tutor" && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
            <TutorChat />
          </div>
        )}

        {/* ───────── BOTTOM NAVIGATION CONTROLS ───────── */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {prevLesson ? (
            <Link
              to="/courses/$slug/$lesson"
              params={{ slug, lesson: prevLesson.slug }}
              className="px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-secondary transition flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous: {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <button
              onClick={handleNextLesson}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
            >
              Next: {nextLesson.title} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/courses/$slug/practice"
              params={{ slug }}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
            >
              Take Course Practice Exam <Award className="h-4 w-4" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
