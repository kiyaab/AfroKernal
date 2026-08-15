import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import { CATALOG_COURSES, getAllCourses, CourseData } from "@/lib/courses-catalog-data";
import {
  BookOpen,
  Loader2,
  Play,
  Layers,
  ArrowRight,
  Search,
  Sparkles,
  Clock,
  Award,
  GraduationCap,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Star,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Course Catalog — AfroKernel" },
      { name: "description", content: "Explore hands-on Linux, Cybersecurity, DevOps, and Cloud courses with in-browser terminal labs and practice exams." },
      { property: "og:title", content: "AfroKernel Course Catalog" },
      { property: "og:description", content: "Master Linux and DevOps hands-on with browser labs, practice quizzes, and certificates." },
    ],
  }),
  component: CoursesIndex,
});

const CATEGORIES = ["All", "Fundamentals", "Cybersecurity", "DevOps", "Scripting", "Networking", "Cloud"];
const DIFFICULTIES = ["All", "beginner", "intermediate", "advanced"];

const DIFFICULTY_BADGES: Record<string, { label: string; className: string }> = {
  beginner: { label: "Beginner", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" },
  intermediate: { label: "Intermediate", className: "bg-amber-500/10 text-amber-500 border-amber-500/25" },
  advanced: { label: "Advanced", className: "bg-purple-500/10 text-purple-500 border-purple-500/25" },
};

function CoursesIndex() {
  const { user, isEnrolled, completedLessons, enrollCourse } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Query database courses with fallback to rich catalog data
  const { data: dbCourses, isLoading } = useQuery({
    queryKey: ["public-courses-catalog"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("published", true)
          .order("sort_order")
          .order("created_at");
        if (error || !data || data.length === 0) {
          return getAllCourses();
        }
        // Merge with catalog metadata
        return getAllCourses();
      } catch {
        return getAllCourses();
      }
    },
  });

  const coursesList: CourseData[] = dbCourses ?? CATALOG_COURSES;

  const filtered = useMemo(() => {
    return coursesList.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.skills?.some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [coursesList, search, selectedCategory, selectedDifficulty]);

  const featuredCourse = coursesList.find((c) => c.slug === "linux") || coursesList[0];

  function handleStartOrEnroll(course: CourseData) {
    if (!user) {
      // Must be authenticated first
      navigate({
        to: "/auth",
        search: { redirect: `/courses/${course.slug}`, mode: "signup" },
      });
      return;
    }

    enrollCourse(course.slug);
    navigate({
      to: "/courses/$slug",
      params: { slug: course.slug },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-1">
        {/* ───────── HERO SECTION ───────── */}
        <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/80 to-background py-14 lg:py-20">
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Hands-on Linux & Cloud Academy
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                Structured courses for <br />
                <span className="text-gradient">modern Linux engineers.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Step-by-step video courses, interactive command line sandboxes, end-of-module knowledge checks, and verifiable certifications. 100% free.
              </p>
            </div>

            {/* Quick platform stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl pt-6 border-t border-border/60">
              <div className="p-4 rounded-2xl border border-border/80 bg-card/50">
                <div className="font-mono text-2xl font-bold text-foreground">6 Tracks</div>
                <div className="text-xs text-muted-foreground">Comprehensive Curriculum</div>
              </div>
              <div className="p-4 rounded-2xl border border-border/80 bg-card/50">
                <div className="font-mono text-2xl font-bold text-primary">35+ Labs</div>
                <div className="text-xs text-muted-foreground">In-Browser Terminal Practice</div>
              </div>
              <div className="p-4 rounded-2xl border border-border/80 bg-card/50">
                <div className="font-mono text-2xl font-bold text-emerald-400">100% Free</div>
                <div className="text-xs text-muted-foreground">Zero Paywalls or Subscriptions</div>
              </div>
              <div className="p-4 rounded-2xl border border-border/80 bg-card/50">
                <div className="font-mono text-2xl font-bold text-purple-400">Verifiable</div>
                <div className="text-xs text-muted-foreground">Digital Completion Badges</div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── FEATURED COURSE SPOTLIGHT ───────── */}
        {featuredCourse && (
          <section className="mx-auto max-w-7xl px-6 -mt-6">
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-card to-secondary/30 p-6 sm:p-10 shadow-xl backdrop-blur relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider">
                      Featured Path
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      ★ {featuredCourse.rating} ({featuredCourse.review_count} reviews)
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" /> {featuredCourse.learner_count.toLocaleString()} learners
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground">
                    {featuredCourse.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {featuredCourse.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {featuredCourse.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-background border border-border text-foreground/80">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={() => handleStartOrEnroll(featuredCourse)}
                    className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {user && isEnrolled(featuredCourse.slug) ? "Continue Course" : "Enroll Free & Start"}
                  </button>
                  <Link
                    to="/courses/$slug"
                    params={{ slug: featuredCourse.slug }}
                    className="px-6 py-3.5 rounded-2xl border border-border bg-card/60 text-foreground font-semibold text-xs hover:bg-secondary transition flex items-center justify-center gap-1.5"
                  >
                    View Syllabus ({featuredCourse.lessons.length} lessons) <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ───────── CATALOG CONTROLS & FILTER BAR ───────── */}
        <section className="mx-auto max-w-7xl px-6 pt-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-border/70">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, tools (bash, docker, nmap, terraform)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary filter & count row */}
          <div className="flex items-center justify-between py-4 text-xs text-muted-foreground">
            <div>
              Showing <strong className="text-foreground">{filtered.length}</strong> available curriculum courses
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary capitalize"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ───────── COURSES GRID ───────── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          {isLoading ? (
            <div className="py-20 text-center flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading courses...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-card/30 p-8">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold">No matching courses found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or selecting a different category filter.</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedDifficulty("All"); }}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => {
                const diff = DIFFICULTY_BADGES[course.difficulty] || DIFFICULTY_BADGES.beginner;
                const enrolled = user && isEnrolled(course.slug);
                const completedInCourse = course.lessons.filter((l) => completedLessons.includes(l.id)).length;
                const progressPct = course.lessons.length > 0 ? Math.round((completedInCourse / course.lessons.length) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    className="group rounded-3xl border border-border bg-card flex flex-col justify-between overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Card Top Banner */}
                      <div className="p-6 pb-4 border-b border-border/60 bg-secondary/20">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {course.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.className}`}>
                            {diff.label}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {course.subtitle || course.description}
                        </p>
                      </div>

                      {/* Course Metadata & Stats */}
                      <div className="p-6 pt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground text-center py-2 rounded-2xl bg-secondary/40 border border-border/40">
                          <div>
                            <span className="font-bold text-foreground block">{course.duration_hours} hrs</span>
                            <span>Duration</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{course.lessons.length} lessons</span>
                            <span>Syllabus</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">★ {course.rating}</span>
                            <span>Rating</span>
                          </div>
                        </div>

                        {/* Progress Bar (If Enrolled) */}
                        {enrolled && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                              <span>Your Progress</span>
                              <span className="text-primary">{completedInCourse}/{course.lessons.length} done ({progressPct}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Skills chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {course.skills.slice(0, 4).map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-6 pt-0 border-t border-border/50 mt-4 flex items-center justify-between gap-3">
                      <Link
                        to="/courses/$slug"
                        params={{ slug: course.slug }}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                      >
                        Details & Syllabus
                      </Link>

                      <button
                        onClick={() => handleStartOrEnroll(course)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                          enrolled
                            ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground"
                            : "bg-primary text-primary-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
                        }`}
                      >
                        {enrolled ? (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" /> Continue
                          </>
                        ) : (
                          <>
                            Enroll Free <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ───────── PRACTICE EXAM CALLOUT ───────── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-3xl border border-border bg-gradient-to-r from-card via-secondary/40 to-card p-8 sm:p-12 text-center flex flex-col items-center space-y-4 shadow-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Ready to test your Linux mastery?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Take our interactive Linux practice exams with real-world multiple choice questions, timer, instant scoring, and complete answer explanations.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center">
              <Link
                to="/exam/practice"
                className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
              >
                Launch Practice Exam <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/certification"
                className="px-6 py-3 rounded-2xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-secondary transition"
              >
                Official Certification Info
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterNav />
    </div>
  );
}
