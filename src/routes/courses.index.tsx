import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, Loader2, Play, Layers, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — AfroKernel" },
      { name: "description", content: "Browse free AfroKernel courses: Linux fundamentals, bash, networking, DevOps and more." },
      { property: "og:title", content: "AfroKernel Courses" },
    ],
  }),
  component: CoursesIndex,
});

function CoursesIndex() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-courses-with-first-lesson"],
    queryFn: async () => {
      const { data: courses, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("sort_order")
        .order("created_at");
      if (cErr) throw cErr;

      const enriched = await Promise.all(
        (courses ?? []).map(async (c) => {
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id,slug,title,published")
            .eq("course_id", c.id)
            .eq("published", true)
            .order("sort_order", { ascending: true });
          return {
            ...c,
            lessons: lessons ?? [],
            firstLesson: lessons?.[0] ?? null,
          };
        }),
      );
      return enriched;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/docs" className="text-sm hover:text-primary">
              Docs
            </Link>
            <Link to="/chat" className="text-sm hover:text-primary">
              Tutor
            </Link>
            <Link to="/lab" className="text-sm hover:text-primary">
              Lab
            </Link>
            <Link to="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-4xl font-bold">Courses</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Click <strong>Start learning</strong> to open the classroom — video, notes, and quiz in one place.
        </p>

        {error && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load courses: {(error as Error).message}
          </p>
        )}

        {isLoading ? (
          <div className="mt-10 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No published courses yet — check back soon.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((c) => {
              const lessonCount = c.lessons?.length ?? 0;
              const first = c.firstLesson;
              return (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <Link to="/courses/$slug" params={{ slug: c.slug }} className="block">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                        <BookOpen className="h-10 w-10 text-primary/50" />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center gap-2">
                      {c.category && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{c.category}</span>
                      )}
                      <span className="text-xs capitalize text-muted-foreground">{c.difficulty}</span>
                    </div>
                    <Link to="/courses/$slug" params={{ slug: c.slug }}>
                      <h3 className="text-lg font-semibold hover:text-primary">{c.title}</h3>
                    </Link>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" /> {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                      </span>
                      {first ? (
                        <Link
                          to="/courses/$slug/$lesson"
                          params={{ slug: c.slug, lesson: first.slug }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110"
                        >
                          <Play className="h-3 w-3 fill-current" /> Start learning
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <Link
                          to="/courses/$slug"
                          params={{ slug: c.slug }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                        >
                          View course
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
