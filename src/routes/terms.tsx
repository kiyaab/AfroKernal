import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShieldCheck, FileText, Lock, Cookie, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service & Privacy Policy — AfroKernel" },
      {
        name: "description",
        content:
          "Terms of service, privacy policy, and cookie agreement for AfroKernel free Linux administration learning platform.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 text-primary mb-2">
          <ShieldCheck className="w-8 h-8" />
          <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            Legal & Trust
          </span>
        </div>
        <h1 className="text-4xl font-bold font-display tracking-tight">
          Terms of Service & Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: July 27, 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1: Terms */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 1. Terms of Service
            </h2>
            <p>
              By accessing and using <strong className="text-foreground">AfroKernel</strong>, you
              agree to comply with and be bound by these Terms of Service. AfroKernel provides free
              hands-on Linux administration learning materials, browser-based terminals, quizzes,
              and AI tutoring.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              <li>
                <strong>Free Platform:</strong> All fundamental courses, Linux terminal sandboxes,
                and documentation are provided free of charge.
              </li>
              <li>
                <strong>User Accounts:</strong> You are responsible for maintaining the
                confidentiality of your account credentials. Your progress, XP, streaks, and lab
                session history are stored safely under your profile.
              </li>
              <li>
                <strong>Acceptable Use:</strong> Terminal environments are isolated sandboxes for
                educational purposes. Any attempt to abuse, reverse-engineer, or execute malicious
                activities will result in immediate suspension.
              </li>
            </ul>
          </section>

          {/* Section 2: Privacy */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 2. Privacy Policy
            </h2>
            <p>
              Your privacy is fundamental to AfroKernel. We only collect the minimal information
              necessary to deliver and save your learning experience.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-background border border-border">
                <h3 className="font-semibold text-foreground mb-1">Data We Collect</h3>
                <p className="text-xs">
                  Email address, display name, quiz performance data, terminal session counts, and
                  XP progression.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <h3 className="font-semibold text-foreground mb-1">How We Use Data</h3>
                <p className="text-xs">
                  To persist your course progress, render leaderboards, calculate level progression,
                  and customize AI mentor context.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Cookies */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" /> 3. Cookie Policy & Preferences
            </h2>
            <p>
              AfroKernel uses essential session cookies and local storage items to preserve active
              sign-in sessions, theme preferences (light/dark mode), and browser terminal state.
            </p>
            <p>
              No advertising or invasive tracking cookies are used. You may manage or revoke your
              consent at any time via browser storage settings.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
