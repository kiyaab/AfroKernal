import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Terminal,
  BookOpen,
  Sparkles,
  Cpu,
  ShieldCheck,
  Trophy,
  Container,
  Network,
  GitBranch,
  Server,
  Code2,
  Zap,
  ArrowRight,
  Check,
  Layers,
  Users,
} from "lucide-react";

const LOGO_URL = "/afrokernel-logo.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

const paths = [
  { icon: Terminal, title: "Linux Fundamentals", lessons: 42, level: "Beginner" },
  { icon: Code2, title: "Bash Scripting", lessons: 36, level: "Intermediate" },
  { icon: Network, title: "Networking & SSH", lessons: 28, level: "Intermediate" },
  { icon: Server, title: "System Administration", lessons: 54, level: "Advanced" },
  { icon: Container, title: "Docker & Kubernetes", lessons: 48, level: "Advanced" },
  { icon: ShieldCheck, title: "Linux Security", lessons: 33, level: "Advanced" },
  { icon: GitBranch, title: "Git & DevOps", lessons: 40, level: "Intermediate" },
  { icon: Layers, title: "Cloud & Automation", lessons: 45, level: "Expert" },
];

const features = [
  { icon: Terminal, title: "Real Browser Terminals", desc: "Isolated Docker-powered Ubuntu, Fedora, Arch, Rocky & Debian containers. Run real commands, no install." },
  { icon: Sparkles, title: "AI Linux Mentor", desc: "Personal tutor that explains every command, reviews scripts, diagnoses errors, and builds your study plan." },
  { icon: BookOpen, title: "W3Schools-Style Docs", desc: "Every command with syntax, examples, output, and Try-It-Yourself — a full Linux reference library." },
  { icon: Trophy, title: "Gamified Progress", desc: "XP, streaks, badges, challenges & leaderboards. Everything is free — no paywalls, ever." },
  { icon: Cpu, title: "Hands-On Labs", desc: "VS Code Web, multi-tab terminals, persistent workspaces, and real-world sysadmin projects." },
  { icon: Users, title: "Community & Certificates", desc: "Discussions, workshops, mock interviews, and free certificates for every completed path." },
];

import { useAuth } from "@/lib/AuthContext";
import { User, LogOut } from "lucide-react";

function Landing() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/40 bg-primary/10 shadow-[0_0_30px_-10px_var(--primary)]">
              <img src={LOGO_URL} alt="AfroKernel" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-lg font-bold">
              Afro<span className="text-primary">Kernel</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/courses" className="text-sm text-muted-foreground transition hover:text-foreground">Courses</Link>
            <Link to="/docs" className="text-sm text-muted-foreground transition hover:text-foreground">Docs</Link>
            <Link to="/lab" className="text-sm text-muted-foreground transition hover:text-foreground">Linux Lab</Link>
            <Link to="/resources" className="text-sm text-muted-foreground transition hover:text-foreground">Resources</Link>
            <Link to="/chat" className="text-sm text-muted-foreground transition hover:text-foreground">AI Tutor</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                  <User className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:block">Sign in</Link>
                <Link to="/auth" search={{ redirect: "/courses", mode: "signup" }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              100% Free · AI-Powered · Open Education
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Master Linux with your <span className="text-gradient">AI mentor</span> in a real terminal.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              AfroKernel is the world's best free Linux Administration platform. Structured lessons, browser-based labs, an AI tutor that explains every command — from <span className="font-mono text-primary">pwd</span> to production Kubernetes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 glow-yellow"
                >
                  <Zap className="h-4 w-4" /> Start learning free
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ redirect: "/courses", mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 glow-yellow"
                >
                  <Zap className="h-4 w-4" /> Start learning free
                </Link>
              )}
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-5 py-3 text-sm font-semibold transition hover:bg-card"
              >
                Browse all courses
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {["No credit card", "No ads", "No paywalls", "Forever free"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: logo + terminal */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 -z-10 blur-3xl">
              <div className="mx-auto h-64 w-64 rounded-full bg-primary/25" />
            </div>
            <img
              src={LOGO_URL}
              alt="AfroKernel penguin mascot"
              className="float-anim h-56 w-56 object-contain drop-shadow-[0_20px_50px_oklch(0.86_0.17_92/0.35)]"
            />
            <div className="mt-8 w-full max-w-md rounded-xl border border-border bg-card/80 shadow-[var(--shadow-card)] backdrop-blur">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">learner@afrokernel:~$</span>
              </div>
              <div className="px-4 py-4 font-mono text-xs leading-relaxed">
                <div><span className="text-primary">$</span> sudo systemctl status nginx</div>
                <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">{`● nginx.service - A high performance web server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running) since Wed 2026-07-22 15:22:04 UTC`}</pre>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-2 text-[11px] text-primary/90">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>AI: nginx is running fine. Want me to explain <span className="font-semibold">systemctl</span> unit files?</span>
                </div>
                <div className="mt-3"><span className="text-primary">$</span> <span className="cursor-blink">▊</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISTROS STRIP */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Practice on every major distribution
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-mono text-sm text-muted-foreground">
            {["Ubuntu", "Debian", "Fedora", "Rocky Linux", "AlmaLinux", "Arch", "CentOS Stream"].map((d) => (
              <span key={d} className="transition hover:text-primary">{d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">Everything you need. <span className="text-gradient">Nothing you pay for.</span></h2>
          <p className="mt-4 text-muted-foreground">A complete AI-powered ecosystem for learning Linux — from your first command to enterprise sysadmin.</p>
        </div>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
              <div className="relative">
                <div className="inline-flex rounded-lg bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PATHS */}
      <section id="paths" className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold sm:text-5xl">Structured learning paths</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">From <span className="font-mono text-primary">ls</span> to Kubernetes. Every path includes lessons, labs, quizzes, projects, and a free certificate.</p>
            </div>
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:brightness-110">
              Browse all 30+ paths <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map(({ icon: Icon, title, lessons, level }) => (
              <div key={title} className="group relative rounded-2xl border border-border bg-background/60 p-5 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{lessons} lessons</span>
                  <span className="rounded-full border border-border px-2 py-0.5">{level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAB */}
      <section id="lab" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Terminal className="h-3.5 w-3.5" /> Browser Linux Lab
            </div>
            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">A real Linux terminal, one click away.</h2>
            <p className="mt-4 text-muted-foreground">
              Every learner gets isolated Docker containers. Multi-tab terminals, integrated file manager, VS Code Web, uploads, persistent workspaces, and reset in a click.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Multi-distro: Ubuntu, Fedora, Arch, Rocky, Debian",
                "xterm.js + WebSocket for zero-latency I/O",
                "AI watches your commands & explains outputs",
                "Snapshots, resets & persistent home directory",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-card)]">
            <div className="rounded-xl bg-background/80 p-5 font-mono text-xs">
              <div className="flex gap-2 border-b border-border pb-2 text-muted-foreground">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">ubuntu@lab-01</span>
                <span className="rounded-md px-2 py-0.5">fedora@lab-02</span>
                <span className="rounded-md px-2 py-0.5">+ new tab</span>
              </div>
              <div className="mt-3 space-y-1.5 leading-relaxed">
                <div><span className="text-primary">$</span> whoami</div>
                <div className="text-muted-foreground">learner</div>
                <div><span className="text-primary">$</span> uname -a</div>
                <div className="text-muted-foreground">Linux lab-01 6.8.0 #1 SMP x86_64 GNU/Linux</div>
                <div><span className="text-primary">$</span> ps aux | grep nginx</div>
                <div className="text-muted-foreground">root  1284  nginx: master process</div>
                <div><span className="text-primary">$</span> docker run -d -p 80:80 nginx</div>
                <div className="text-muted-foreground">3f2a...b91c</div>
                <div><span className="text-primary">$</span> <span className="cursor-blink">▊</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="border-t border-border bg-gradient-to-b from-transparent to-card/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div className="order-2 rounded-2xl border border-primary/20 bg-card p-6 lg:order-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">AI Tutor</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg bg-secondary p-3">
                <span className="text-xs text-muted-foreground">You</span>
                <p className="mt-1">What does <span className="font-mono text-primary">chmod 755 script.sh</span> actually do?</p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <span className="text-xs text-primary">AfroKernel AI</span>
                <p className="mt-1 text-foreground/90">It sets permissions so the <span className="font-semibold">owner</span> can read, write, execute (7), and <span className="font-semibold">group</span> + <span className="font-semibold">others</span> can read & execute (5). Want me to open a lab and try it together?</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold sm:text-5xl">Your personal Linux mentor, <span className="text-gradient">24/7</span>.</h2>
            <p className="mt-4 text-muted-foreground">Ask questions, review scripts, diagnose errors, generate flashcards, or run a mock certification interview. The AI teaches through guided discovery — never shortcuts.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Command explanations", "Bash script reviews", "Error diagnosis", "Personalized study plans", "Interview prep", "Cert readiness scores"].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOCS */}
      <section id="docs" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">The complete <span className="text-gradient">Linux reference</span></h2>
          <p className="mt-4 text-muted-foreground">Every command, every flag, every use case — with Try-It-Yourself and AI explanations.</p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["ls", "grep", "awk", "sed", "chmod", "systemctl", "journalctl", "iptables", "rsync", "tar", "docker", "kubectl"].map((cmd) => (
            <a key={cmd} href="#" className="group rounded-xl border border-border bg-card p-4 text-center font-mono text-sm transition hover:border-primary/50 hover:bg-primary/5">
              <span className="text-muted-foreground group-hover:text-primary">$</span> {cmd}
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-10 text-center sm:p-16">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <img src={LOGO_URL} alt="" className="mx-auto h-20 w-20 object-contain float-anim" />
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Learn. Administer. <span className="text-gradient">Master.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Join thousands learning Linux the modern, free, AI-powered way. Your first terminal is one click away.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 glow-yellow">
                Create free account <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#paths" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-6 py-3 text-sm font-semibold transition hover:bg-background/70">
                Explore lessons
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="AfroKernel" className="h-7 w-7 object-contain" />
            <span className="font-display text-sm font-semibold">
              Afro<span className="text-primary">Kernel</span>
            </span>
            <span className="ml-3 text-xs text-muted-foreground">Linux. Simplified.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition">Terms & Policies</Link>
            <p>© 2026 AfroKernel · Free & open Linux education for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
