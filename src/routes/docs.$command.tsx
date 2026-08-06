import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCommand } from "@/lib/rag.functions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Sparkles, AlertTriangle, Terminal as TermIcon } from "lucide-react";
import { Suspense } from "react";

const cmdQuery = (slug: string) =>
  queryOptions({
    queryKey: ["command", slug],
    queryFn: () => getCommand({ data: slug }),
  });

export const Route = createFileRoute("/docs/$command")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.command} — Linux Command | AfroKernel` },
      { name: "description", content: `Learn the Linux \`${params.command}\` command with syntax, examples, common mistakes, and AI explanations on AfroKernel.` },
      { property: "og:title", content: `${params.command} — AfroKernel Docs` },
      { property: "og:description", content: `Interactive reference for the Linux ${params.command} command.` },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(cmdQuery(params.command)),
  component: CommandPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Failed: {error.message}</div>,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p className="text-lg font-semibold">Command not found</p>
      <Link to="/docs" className="text-primary hover:underline mt-2 inline-block">← Back to reference</Link>
    </div>
  ),
});

function CommandPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link to="/docs" className="text-sm hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> All commands
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
        <Body />
      </Suspense>
    </div>
  );
}

function Body() {
  const { command } = Route.useParams();
  const { data: cmd } = useSuspenseQuery(cmdQuery(command));
  if (!cmd) throw notFound();

  const examples = (cmd.examples ?? []) as Array<{ cmd: string; out?: string }>;
  const mistakes = (cmd.common_mistakes ?? []) as string[];
  const related = (cmd.related ?? []) as string[];

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        {cmd.category}
      </div>
      <h1 className="mt-3 text-5xl font-bold font-display flex items-center gap-3">
        <TermIcon className="w-8 h-8 text-primary" />
        <code className="font-mono">{cmd.name}</code>
      </h1>
      <p className="mt-3 text-xl text-muted-foreground">{cmd.short_desc}</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Syntax</h2>
        <pre className="rounded-lg bg-[oklch(0.11_0.01_260)] text-[oklch(0.97_0.01_90)] p-4 font-mono text-sm overflow-x-auto border border-border">
          <code>{cmd.syntax}</code>
        </pre>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Description</h2>
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{cmd.description}</p>
      </section>

      {examples.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Examples</h2>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="rounded-lg bg-[oklch(0.11_0.01_260)] border border-border overflow-hidden">
                <div className="px-4 py-2 font-mono text-sm text-[oklch(0.86_0.17_92)] border-b border-white/10">
                  <span className="text-[oklch(0.7_0.2_150)] mr-2">$</span>
                  {ex.cmd}
                </div>
                {ex.out && (
                  <pre className="px-4 py-2 font-mono text-xs text-[oklch(0.85_0.02_260)] whitespace-pre-wrap">{ex.out}</pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {mistakes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Common mistakes
          </h2>
          <ul className="space-y-2">
            {mistakes.map((m, i) => (
              <li key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Related</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r}
                to="/docs/$command"
                params={{ command: r }}
                className="px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/60 hover:text-primary font-mono text-sm transition-colors"
              >
                {r}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold">Ask AfroKernel Tutor</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Not sure how to use <code className="font-mono text-primary">{cmd.name}</code>? Get a personalized explanation.
            </p>
            <Link
              to="/chat"
              search={{ q: `Explain the Linux ${cmd.name} command with a real-world example.` }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90"
            >
              Ask the AI Tutor
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
