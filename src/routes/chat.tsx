import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TutorChat } from "@/components/TutorChat";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Linux Tutor — AfroKernel" },
      {
        name: "description",
        content:
          "Chat with the AfroKernel AI tutor. Grounded, cited answers with docs excerpts highlighted from our Linux reference.",
      },
      { property: "og:title", content: "AfroKernel AI Linux Tutor" },
      {
        property: "og:description",
        content: "Your free 24/7 Linux mentor with cited docs excerpts.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q } = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/docs" className="flex items-center gap-1 text-sm hover:text-primary">
              <BookOpen className="h-3 w-3" /> Docs
            </Link>
            <Link to="/courses" className="text-sm hover:text-primary">
              Courses
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold">AfroKernel AI Tutor</h1>
          <p className="mt-2 text-muted-foreground">
            Your learning mind — ask anything about Linux. Answers cite the docs.
          </p>
        </div>
        {ready && <TutorChat initialQuestion={q} className="min-h-[520px]" />}
      </main>
    </div>
  );
}
