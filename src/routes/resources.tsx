import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExternalLink, FileText, BookOpen, Download, Loader2 } from "lucide-react";
import { linuxResources } from "@/lib/linux-resources";
import pdfAsset from "@/assets/mts-linux-command-reference.pdf.asset.json";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Linux Resources & Official Documentation — AfroKernel" },
      {
        name: "description",
        content:
          "Curated Linux PDFs, courses, and official documentation — RHEL, Ubuntu, Debian, Arch, Docker, Kubernetes and more.",
      },
      { property: "og:title", content: "AfroKernel — Linux Documentation Hub" },
      {
        property: "og:description",
        content: "Every official Linux, DevOps and sysadmin documentation source in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

type DbResource = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  resource_type: string;
  url: string;
};

function ResourcesPage() {
  const { data: dbResources, isLoading } = useQuery({
    queryKey: ["learning-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources" as any)
        .select("id,title,description,category,resource_type,url")
        .eq("published", true)
        .order("sort_order");
      if (error) return [] as DbResource[];
      return (data ?? []) as unknown as DbResource[];
    },
  });

  const pdfs = (dbResources ?? []).filter((r) => r.resource_type === "pdf");
  const otherDb = (dbResources ?? []).filter((r) => r.resource_type !== "pdf");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/courses" className="text-sm hover:text-primary">
              Courses
            </Link>
            <Link to="/docs" className="text-sm hover:text-primary">
              Docs
            </Link>
            <Link to="/lab" className="text-sm hover:text-primary">
              Lab
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Learning hub
          </span>
          <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">
            Courses, PDFs &amp; Documentation
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Download study PDFs, browse curated official docs, and jump into AfroKernel courses —
            all in one place.
          </p>
        </div>

        {/* Featured PDF always available */}
        <section className="mb-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-bold">Full Linux Command Reference (PDF)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete command reference for offline study — perfect alongside AfroKernel courses
                and the Lab.
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={pdfAsset.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary/60"
              >
                <BookOpen className="h-4 w-4" /> Read online
              </a>
              <a
                href={pdfAsset.url}
                download
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            </div>
          </div>
        </section>

        {/* DB-backed PDFs / resources */}
        {isLoading ? (
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading library…
          </div>
        ) : (
          (pdfs.length > 0 || otherDb.length > 0) && (
            <section className="mb-12">
              <h2 className="font-display text-2xl font-bold">AfroKernel library</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                PDFs and links managed in the platform database.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...pdfs, ...otherDb].map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {r.resource_type === "pdf" ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {r.category}
                      </span>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary">{r.title}</h3>
                    {r.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <BookOpen className="h-4 w-4" /> Browse courses
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            Command docs
          </Link>
        </div>

        <div className="space-y-12">
          {linuxResources.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                {group.title}
              </h2>
              <p className="mb-4 mt-1 max-w-3xl text-sm text-muted-foreground">{group.blurb}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold group-hover:text-primary">{l.name}</p>
                      {"blurb" in l && (l as { blurb?: string }).blurb && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(l as { blurb?: string }).blurb}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
