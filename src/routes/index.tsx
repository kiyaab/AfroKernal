import { createFileRoute, Link } from "@tanstack/react-router";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import {
  BookOpen,
  Zap,
  ArrowRight,
  Search,
  CheckCircle2,
  Terminal,
  Shield,
  Laptop,
  Flame,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";

export const Route = createFileRoute("/")({
  component: Landing,
});

// Interactive terminal showcase commands
const TERMINAL_DEMOS = [
  {
    cmd: "uname -a",
    output: "Linux afrokernel-node 6.8.0-generic #1 SMP PREEMPT x86_64 GNU/Linux",
    comment: "# View Linux kernel version and architecture",
  },
  {
    cmd: "whoami && uptime -p",
    output: "learner\nup 18 days, 4 hours, 12 minutes",
    comment: "# Check current user identity and system uptime",
  },
  {
    cmd: "chmod 755 script.sh && ls -l",
    output: "-rwxr-xr-x 1 learner staff 1024 Sep 22 13:00 script.sh",
    comment: "# Set executable permissions on a shell script",
  },
];

// Simple 3-step guide
const EASY_STEPS = [
  {
    step: "01",
    icon: "🌐",
    title: "100% In-Browser",
    desc: "Practice safely directly inside your web browser. Zero setup, zero downloads, and no risk to your computer.",
  },
  {
    step: "02",
    icon: "💡",
    title: "5-Minute Bite-Sized Lessons",
    desc: "Plain-English explanations paired with hands-on exercises and instant quiz feedback to cement concepts.",
  },
  {
    step: "03",
    icon: "🤖",
    title: "Friendly 24/7 AI Helper",
    desc: "Stuck on a concept or command? Ask any question in plain English and get immediate, helpful guidance.",
  },
];

// 4 Core Learning Tracks (No DevOps, No Cloud, No Containers)
const CORE_COURSES = [
  {
    slug: "linux",
    icon: "🐧",
    title: "Linux Fundamentals",
    category: "Fundamentals",
    lessons: "38 Lessons",
    duration: "4.5 Hours",
    level: "Beginner Friendly",
    desc: "Master the command line, filesystem hierarchy, file permissions, processes, and systemd services.",
    skills: ["Bash CLI", "File Permissions", "Systemd", "SSH Remote Access"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  },
  {
    slug: "rhel",
    icon: "🎩",
    title: "Red Hat Enterprise Linux (RHEL 9)",
    category: "Enterprise",
    lessons: "8 Lessons",
    duration: "6.0 Hours",
    level: "Enterprise Standard",
    desc: "Master enterprise sysadmin, DNF/RPM packages, SELinux enforcement, LVM storage slicing, and Firewalld.",
    skills: ["RHEL 9", "SELinux", "DNF / RPM", "LVM Storage", "Firewalld"],
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/25",
    featured: true,
  },
  {
    slug: "scripting",
    icon: "⚡",
    title: "Bash Scripting & Automation",
    category: "Automation",
    lessons: "11 Lessons",
    duration: "4.0 Hours",
    level: "Automation Pro",
    desc: "Write production-ready automation scripts with Bash strict mode, regex parsing with awk/sed, and crons.",
    skills: ["Bash Strict Mode", "Awk & Sed", "Cron Timers", "Error Traps"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  },
];

// Simplified Distro Selector Goals
type SimpleGoal = "windows-like" | "old-laptop" | "gaming" | "career";

interface DistroChoice {
  id: SimpleGoal;
  title: string;
  subtitle: string;
  emoji: string;
  distroName: string;
  distroLogo: string;
  whyBest: string;
  ramReq: string;
}

const DISTRO_CHOICES: DistroChoice[] = [
  {
    id: "windows-like",
    title: "Feels like Windows",
    subtitle: "Familiar taskbar, start menu, and 1-click app store.",
    emoji: "🪟",
    distroName: "Linux Mint",
    distroLogo: "🌿",
    whyBest: "The friendliest distribution for beginners with zero learning curve.",
    ramReq: "2 GB RAM",
  },
  {
    id: "old-laptop",
    title: "Speed up an old laptop",
    subtitle: "Super lightweight, runs smoothly on 10-year-old hardware.",
    emoji: "⚡",
    distroName: "Lubuntu / Zorin Lite",
    distroLogo: "💨",
    whyBest: "Extremely fast on older machines, using 70% less memory than Windows.",
    ramReq: "1 GB RAM",
  },
  {
    id: "gaming",
    title: "Play Steam & PC games",
    subtitle: "Pre-configured graphics drivers for NVIDIA & AMD.",
    emoji: "🎮",
    distroName: "Pop!_OS / Bazzite",
    distroLogo: "🚀",
    whyBest: "Built-in GPU drivers and Steam Proton compatibility out of the box.",
    ramReq: "4 GB RAM",
  },
  {
    id: "career",
    title: "Learn for tech careers",
    subtitle: "The worldwide standard used by top tech companies.",
    emoji: "💼",
    distroName: "Ubuntu / Fedora",
    distroLogo: "🟠",
    whyBest: "The global industry standard for server administration and software development.",
    ramReq: "4 GB RAM",
  },
];

// Free App Replacements
const APP_REPLACEMENTS = [
  {
    category: "Office & Documents",
    windowsApp: "Microsoft Word & Excel",
    linuxApp: "LibreOffice & OnlyOffice",
    icon: "📄",
    tag: "Free Word & Excel",
  },
  {
    category: "Photo & Graphics",
    windowsApp: "Adobe Photoshop",
    linuxApp: "GIMP & Krita",
    icon: "🎨",
    tag: "Free Photo Editor",
  },
  {
    category: "Video Editing",
    windowsApp: "Adobe Premiere",
    linuxApp: "Kdenlive & DaVinci",
    icon: "🎬",
    tag: "Free Video Editor",
  },
  {
    category: "Gaming",
    windowsApp: "Windows Gaming",
    linuxApp: "Steam Proton & Heroic",
    icon: "🎮",
    tag: "Play Your Games",
  },
];

// FAQs
const FAQS = [
  {
    q: "Will learning here affect or change my computer?",
    a: "Not at all. Everything runs 100% inside your web browser. You can click, type commands, and practice freely without altering any files or settings on your computer.",
  },
  {
    q: "Do I need any programming experience?",
    a: "Zero experience needed. If you know how to browse websites and type on a keyboard, our step-by-step guides will teach you everything from scratch.",
  },
  {
    q: "Is AfroKernel really 100% free?",
    a: "Yes! All courses, tutorials, practice tools, and sandbox labs are 100% free with no paywalls or subscriptions.",
  },
  {
    q: "Can I use AfroKernel on a phone, tablet, or Mac?",
    a: "Yes, AfroKernel is completely web-based and responsive across phones, tablets, Chromebooks, Windows, Mac, and Linux.",
  },
];

function Landing() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<SimpleGoal>("windows-like");

  const currentDistro = useMemo(
    () => DISTRO_CHOICES.find((d) => d.id === selectedGoal) || DISTRO_CHOICES[0],
    [selectedGoal],
  );

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation */}
      <HeaderNav />

      {/* ───────── HERO SECTION ───────── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/60">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Left Column: Hero Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-[0_0_20px_-5px_var(--primary)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>✨ The Friendly Linux Academy · 100% Free & Open</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight leading-[1.08]">
              Learn Linux. <br />
              <span className="text-gradient">Clean, interactive & simple.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Master the terminal, essential commands, and real system administration with bite-sized
              lessons and hands-on practice. Zero setup needed.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={user ? "/courses" : "/auth"}
                search={user ? undefined : { redirect: "/courses", mode: "signup" }}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-current" /> Start Learning Free
              </Link>
              <Link
                to="/lab"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition hover:border-primary/40 shadow-sm"
              >
                <Terminal className="h-4 w-4 text-primary" /> Open Linux Lab
              </Link>
            </div>

            {/* Quick Search Shortcut */}
            <div className="pt-1 flex justify-center lg:justify-start">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full max-w-md flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-card/60 text-xs text-muted-foreground hover:border-primary/50 hover:bg-card/90 transition shadow-sm group"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Search commands, tutorials & tools...</span>
                </span>
                <kbd className="rounded-md border border-border bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-foreground font-semibold">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Zero Setup Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>In-Browser Terminal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Terminal Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-primary/30 bg-card/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">afrokernel-sandbox ~</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Terminal className="h-3 w-3" /> Live Terminal
                </div>
              </div>

              {/* Command Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {TERMINAL_DEMOS.map((demo, idx) => (
                  <button
                    key={demo.cmd}
                    onClick={() => setActiveDemoIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs transition border ${
                      activeDemoIndex === idx
                        ? "bg-primary/15 text-primary border-primary/40 font-bold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    $ {demo.cmd.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Terminal Screen */}
              <div className="rounded-2xl bg-black/90 p-4 font-mono text-xs space-y-2 border border-border/60 min-h-[140px]">
                <div className="text-muted-foreground/60 text-[11px]">
                  {TERMINAL_DEMOS[activeDemoIndex].comment}
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="text-primary font-bold">learner@afrokernel:~$</span>
                  <span>{TERMINAL_DEMOS[activeDemoIndex].cmd}</span>
                </div>
                <pre className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[11px] pt-1">
                  {TERMINAL_DEMOS[activeDemoIndex].output}
                </pre>
              </div>

              {/* Bottom Quick Action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Try it in the full interactive lab</span>
                <Link
                  to="/lab"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Launch Full Lab <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 3 SIMPLE STEPS ───────── */}
      <section className="py-16 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple & Stress-Free
            </span>
            <h2 className="text-3xl font-bold font-display">How AfroKernel Works</h2>
            <p className="text-sm text-muted-foreground">
              Learning Linux is as simple as 1, 2, 3. No setup headaches, no technical hurdles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {EASY_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-3.5 hover:border-primary/40 transition relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-2xl bg-secondary">{s.icon}</span>
                  <span className="font-mono text-xl font-extrabold text-primary/40 group-hover:text-primary transition">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CORE COURSES ───────── */}
      <section className="py-16 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Curriculum
              </span>
              <h2 className="text-3xl font-bold font-display mt-1">Core Learning Tracks</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Structured courses with in-browser terminal practice and quizzes.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition self-start md:self-auto"
            >
              Browse Full Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Core Tracks Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {CORE_COURSES.map((course) => (
              <div
                key={course.slug}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition group relative overflow-hidden ${
                  course.featured
                    ? "border-red-500/40 bg-gradient-to-b from-card via-card to-red-500/5 hover:border-red-500/70 shadow-lg shadow-red-500/5"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-xl"
                }`}
              >
                {course.featured && (
                  <div className="absolute top-0 right-0 bg-red-500/10 border-b border-l border-red-500/20 text-red-500 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    ⭐ Featured
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary">{course.icon}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${course.badgeColor}`}>
                      {course.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                      {course.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground border border-border/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold text-[11px]">
                    {course.lessons}
                  </span>
                  <Link
                    to={user ? "/courses/$slug" : "/auth"}
                    params={user ? { slug: course.slug } : undefined}
                    search={user ? undefined : { redirect: `/courses/${course.slug}`, mode: "signup" }}
                    className={`font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
                      course.featured
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    Start <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 1-CLICK DISTRO MATCHER ───────── */}
      <section className="py-16 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Choose Your Distro
              </span>
              <h2 className="text-3xl font-bold font-display mt-1">Find Your Ideal Linux Match</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select what matters most to see the best recommended distribution.
              </p>
            </div>
            <Link
              to="/distro-finder"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start md:self-auto"
            >
              Take 5-Question Quiz <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Goal Selectors */}
            <div className="space-y-2.5">
              {DISTRO_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedGoal(choice.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center gap-3.5 ${
                    selectedGoal === choice.id
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-secondary shrink-0">
                    {choice.emoji}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-foreground">{choice.title}</div>
                    <div className="text-xs text-muted-foreground">{choice.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Matched Result Card */}
            <div className="rounded-3xl border border-primary/40 bg-card p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-secondary">
                    {currentDistro.distroLogo}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold font-display text-foreground">
                      {currentDistro.distroName}
                    </h3>
                    <span className="text-xs text-primary font-semibold">Recommended Match</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                  {currentDistro.ramReq}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentDistro.whyBest}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  to="/distros"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center gap-1.5"
                >
                  Explore {currentDistro.distroName} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/distro-finder"
                  className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition"
                >
                  Full Quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FREE APP REPLACEMENTS ───────── */}
      <section className="py-16 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Free App Replacements
              </span>
              <h2 className="text-3xl font-bold font-display mt-1">
                Replace Expensive Software for Free
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Linux has free, high-quality alternatives to everyday Windows programs.
              </p>
            </div>
            <Link
              to="/apps"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              See All 60+ App Alternatives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {APP_REPLACEMENTS.map((app) => (
              <div
                key={app.windowsApp}
                className="rounded-3xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/40 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary">{app.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {app.tag}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] text-muted-foreground line-through">
                      {app.windowsApp}
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition mt-0.5">
                      → {app.linuxApp}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQS ───────── */}
      <section className="py-16 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-3xl px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Got Questions?
            </span>
            <h2 className="text-3xl font-bold font-display">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-border bg-card p-4 transition open:border-primary/40"
              >
                <summary className="font-semibold text-sm text-foreground cursor-pointer flex items-center justify-between list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-2">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CLOSING CTA ───────── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-12 shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/20 text-primary mx-auto text-2xl shadow-[0_0_25px_var(--primary)]">
              🐧
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                Your Linux Journey Starts Today
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Join thousands of learners mastering Linux with bite-sized lessons. 100% free forever.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to={user ? "/courses" : "/auth"}
                search={user ? undefined : { redirect: "/courses", mode: "signup" }}
                className="px-7 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
              >
                <Zap className="h-4 w-4 fill-current" /> Start Learning Free
              </Link>
              <Link
                to="/tutorials"
                className="px-6 py-3 rounded-2xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition"
              >
                Browse All Lessons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Footer */}
      <FooterNav />
    </div>
  );
}
