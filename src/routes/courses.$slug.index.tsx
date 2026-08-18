import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import { getCourseBySlug, CATALOG_COURSES, CourseData } from "@/lib/courses-catalog-data";
import {
  ArrowLeft,
  Video,
  FileText,
  Terminal as TermIcon,
  Loader2,
  Play,
  ChevronRight,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Lock,
  Shield,
  Users,
  Star,
  Check,
  HelpCircle,
  Share2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/courses/$slug/")({
  validateSearch: (s: Record<string, unknown>): { start?: boolean } => ({
    start: s.start === true || s.start === "1" || s.start === "true" ? true : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.toUpperCase()} — AfroKernel Course Syllabus` },
      {
        name: "description",
        content: `Complete syllabus, interactive lessons, video lectures, and practice quizzes for the AfroKernel ${params.slug} course.`,
      },
      { property: "og:title", content: `AfroKernel Course — ${params.slug}` },
    ],
  }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, isEnrolled, completedLessons, enrollCourse } = useAuth();
  const [copied, setCopied] = useState(false);

  // Load database or fallback catalog course
  const { data: course, isLoading } = useQuery({
    queryKey: ["public-course-detail", slug],
    queryFn: async () => {
      const fallback = getCourseBySlug(slug) || CATALOG_COURSES[0];
      try {
        const { data: dbCourse } = await supabase
          .from("courses")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (!dbCourse) return fallback;

        const { data: dbLessons } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", dbCourse.id)
          .eq("published", true)
          .order("sort_order", { ascending: true });

        if (dbLessons && dbLessons.length > 0) {
          return {
            ...fallback,
            title: dbCourse.title || fallback.title,
            description: dbCourse.description || fallback.description,
            lessons: dbLessons.map((l: any) => ({
              id: l.id,
              slug: l.slug,
              title: l.title,
              lesson_type: l.lesson_type || "notes",
              video_url: l.video_url,
              duration_minutes: 20,
              xp_reward: l.xp_reward || 25,
              sort_order: l.sort_order || 1,
              content: l.content || "",
            })),
          };
        }
        return fallback;
      } catch {
        return fallback;
      }
    },
  });

  const c: CourseData = course || getCourseBySlug(slug) || CATALOG_COURSES[0];
  const enrolled = user && isEnrolled(c.slug);

  const completedCount = c.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const progressPct =
    c.lessons.length > 0 ? Math.round((completedCount / c.lessons.length) * 100) : 0;
  const firstUnfinishedLesson =
    c.lessons.find((l) => !completedLessons.includes(l.id)) || c.lessons[0];

  function handleAction(targetLessonSlug?: string) {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: `/courses/${c.slug}`, mode: "signup" },
      });
      return;
    }

    enrollCourse(c.slug);
    const destination = targetLessonSlug || firstUnfinishedLesson.slug;
    navigate({
      to: "/courses/$slug/$lesson",
      params: { slug: c.slug, lesson: destination },
    });
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (isLoading && !course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading course syllabus...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-1">
        {/* ───────── COURSE HERO ───────── */}
        <section className="border-b border-border/80 bg-gradient-to-b from-card/80 to-background py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to All Courses
            </Link>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
              {/* Left Column: Course Info */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    {c.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold capitalize">
                    {c.difficulty} Level
                  </span>
                  {c.certificate_available && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-xs font-semibold">
                      <Award className="h-3.5 w-3.5" /> Certificate Included
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  {c.title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {c.subtitle || c.description}
                </p>

                {/* Rating & Enrollment numbers */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{c.rating}</span>
                    <span className="text-muted-foreground font-normal">
                      ({c.review_count} ratings)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{c.learner_count.toLocaleString()} learners enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Approx. {c.duration_hours} hours to complete</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-muted-foreground block mb-2">
                    Skills you will gain:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl bg-card border border-border text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Enrollment Box */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 lg:sticky lg:top-24">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Enrollment Status
                  </div>
                  <div className="text-2xl font-display font-black text-primary">
                    100% Free Forever
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Includes video lectures, browser terminal labs, quizzes, and verifiable
                    credential.
                  </p>
                </div>

                {/* If user is enrolled, show progress */}
                {enrolled && (
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="text-primary">{progressPct}% Complete</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-muted-foreground text-center">
                      {completedCount} of {c.lessons.length} lessons finished
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleAction()}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {enrolled ? "Continue Learning" : "Enroll for Free & Start"}
                </button>

                <div className="space-y-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Unlimited access to interactive terminal labs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Practice quizzes with instant explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Shareable completion certificate</span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full py-2.5 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-secondary transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? "Link Copied to Clipboard!" : "Share Course"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── LEARNING OUTCOMES & PREREQUISITES ───────── */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* What you'll learn */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> What you will learn
              </h2>
              <div className="space-y-3">
                {c.learning_outcomes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Prerequisites & Requirements
              </h2>
              <div className="space-y-3">
                {c.prerequisites.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                    <div className="h-5 w-5 rounded-full bg-secondary text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────── DETAILED COURSE SYLLABUS ───────── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  Course Syllabus & Curriculum
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {c.lessons.length} structured lessons · Estimated {c.duration_hours} hours total
                </p>
              </div>

              <Link
                to="/courses/$slug/practice"
                params={{ slug: c.slug }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition"
              >
                <HelpCircle className="h-4 w-4" /> Practice Quiz for this Course
              </Link>
            </div>

            {/* Lessons List */}
            <div className="space-y-3">
              {c.lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition group ${
                      isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Icon / Status */}
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isCompleted
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : lesson.lesson_type === "video" ? (
                          <Video className="h-5 w-5" />
                        ) : lesson.lesson_type === "lab" ? (
                          <TermIcon className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Lesson {idx + 1} · {lesson.lesson_type.toUpperCase()}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-secondary text-primary">
                            +{lesson.xp_reward} XP
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition">
                          {lesson.title}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                          <span>⏱ {lesson.duration_minutes} mins</span>
                          {lesson.quiz && <span>• Includes Knowledge Check</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAction(lesson.slug)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 ${
                        isCompleted
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          : "bg-primary text-primary-foreground hover:brightness-110 shadow-sm"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          Review Lesson <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Start Lesson <Play className="h-3 w-3 fill-current" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* End of Course Practice Exam Callout */}
            <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                  <Award className="h-4 w-4" /> End of Course Assessment
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Ready to test your knowledge on {c.title}?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Take the course practice quiz with instant grading and explanations.
                </p>
              </div>

              <Link
                to="/courses/$slug/practice"
                params={{ slug: c.slug }}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2 shrink-0"
              >
                Launch Course Practice Quiz <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterNav />
    </div>
  );
}
