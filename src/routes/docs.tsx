import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listCommands } from "@/lib/rag.functions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Terminal } from "lucide-react";
import { useState, useMemo, Suspense } from "react";

const commandsQuery = queryOptions({
  queryKey: ["commands-list"],
  queryFn: () => listCommands(),
});

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Linux Command Reference — AfroKernel Docs" },
      { name: "description", content: "Free interactive documentation for every core Linux command — syntax, examples, common mistakes, and AI-powered explanations." },
      { property: "og:title", content: "AfroKernel Linux Command Reference" },
      { property: "og:description", content: "Every core Linux command explained: syntax, examples, mistakes." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(commandsQuery),
  component: DocsIndex,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Failed to load: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function DocsIndex() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display">Linux Command Reference</h1>
          <p className="text-muted-foreground mt-2">
            Every command with syntax, examples, common mistakes — grounded in the AfroKernel curriculum.
          </p>
        </div>
        <Suspense fallback={<div className="text-muted-foreground">Loading commands…</div>}>
          <CommandGrid />
        </Suspense>
      </main>
    </div>
  );
}

function CommandGrid() {
  const { data } = useSuspenseQuery(commandsQuery);
  const [q, setQ] = useState("");
  const grouped = useMemo(() => {
    const filtered = data.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.short_desc.toLowerCase().includes(q.toLowerCase()) ||
        c.category.toLowerCase().includes(q.toLowerCase()),
    );
    const map = new Map<string, typeof filtered>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries());
  }, [data, q]);

  return (
    <>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search commands, categories, descriptions…"
          className="w-full pl-10 pr-3 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {grouped.map(([cat, cmds]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cmds.map((c) => (
              <Link
                key={c.slug}
                to="/docs/$command"
                params={{ command: c.slug }}
                className="group rounded-xl border border-border bg-card p-4 hover:border-primary/60 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <code className="font-mono font-semibold group-hover:text-primary transition-colors">{c.name}</code>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{c.short_desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-background/80">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <Link to="/lab" className="text-sm hover:text-primary">Lab</Link>
          <Link to="/chat" className="text-sm hover:text-primary ml-4">AI Tutor</Link>
          <div className="ml-4"><ThemeToggle /></div>
        </div>
      </div>
    </header>
  );
}
