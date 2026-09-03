import { createFileRoute, Link } from "@tanstack/react-router";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import {
  BookOpen,
  Sparkles,
  Award,
  Zap,
  ArrowRight,
  Check,
  Search,
  Laptop,
  CheckCircle2,
  Bot,
  Star,
  Monitor,
  Shield,
  Smile,
  Compass,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Layers,
  FileText,
  Lock,
  Download,
  Flame,
  GraduationCap,
  Heart,
  TrendingUp,
  Cpu,
  Globe,
  FolderOpen,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { DISTROS_DATA, LinuxDistro } from "@/lib/distros-data";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";

export const Route = createFileRoute("/")({
  component: Landing,
});

// Simple 3-step guide for non-tech users
const EASY_STEPS = [
  {
    step: "1",
    icon: "🌐",
    title: "100% Browser-Based",
    desc: "Start learning immediately inside your web browser. No setup, no downloads, and zero risk to your computer.",
  },
  {
    step: "2",
    icon: "💡",
    title: "Bite-Sized 5-Minute Lessons",
    desc: "Plain-English tutorials with interactive exercises, visual explanations, and instant friendly AI guidance.",
  },
  {
    step: "3",
    icon: "🏆",
    title: "Verifiable Certificates",
    desc: "Earn official digital certificates and badges to prove your skills and share on LinkedIn or with employers.",
  },
];

// Why Linux for everyday users
const WHY_LINUX_BENEFITS = [
  {
    icon: "⚡",
    title: "Makes Old PCs Feel Brand New",
    desc: "Linux uses 70% less memory than Windows. Breathe fresh, high-speed life into older laptops and computers.",
    badge: "Blazing Fast",
  },
  {
    icon: "🛡️",
    title: "Virtually Immune to Viruses",
    desc: "Say goodbye to intrusive antivirus popups, forced restarts, and tracking ads. Clean, private, and secure.",
    badge: "Private & Safe",
  },
  {
    icon: "💰",
    title: "100% Free Software Forever",
    desc: "Never pay for operating system upgrades or expensive office suites. Everything you need is open-source and free.",
    badge: "Save Money",
  },
  {
    icon: "🚀",
    title: "Powers 96% of the Modern Web",
    desc: "From Google and Netflix to smart TVs and cloud servers, Linux runs the world. Learn in-demand career skills.",
    badge: "Career Booster",
  },
];

// Popular Learning Pathways & Courses
const FEATURED_COURSES = [
  {
    slug: "linux",
    icon: "🐧",
    title: "Linux Fundamentals & SysAdmin",
    category: "Fundamentals",
    lessons: 8,
    duration: "4.5 Hours",
    level: "Beginner Friendly",
    desc: "Start from zero. Master command line navigation, file permissions, users, process management, and systemd services.",
    skills: ["Bash CLI", "Permissions", "Systemd", "SSH Access"],
    hasCert: true,
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  },
  {
    slug: "rhel",
    icon: "🎩",
    title: "Red Hat Enterprise Linux (RHEL 9) & RHCSA",
    category: "Enterprise Linux",
    lessons: 8,
    duration: "6.0 Hours",
    level: "Enterprise Standard",
    desc: "Master RHEL 9 administration, DNF/RPM package architecture, SELinux policies, LVM storage slicing, Firewalld, and Cockpit.",
    skills: ["RHEL 9", "SELinux", "DNF / RPM", "LVM Storage", "Firewalld"],
    hasCert: true,
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/30",
    featured: true,
  },
  {
    slug: "security",
    icon: "🔒",
    title: "Cybersecurity & Linux Hardening",
    category: "Cybersecurity",
    lessons: 6,
    duration: "5.0 Hours",
    level: "Security Essential",
    desc: "Reconnaissance with Nmap, packet analysis with Wireshark/tcpdump, UFW/iptables firewalls, and server hardening.",
    skills: ["Nmap", "tcpdump", "UFW Firewalls", "Fail2Ban", "Auditing"],
    hasCert: true,
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  },
  {
    slug: "devops",
    icon: "⚙️",
    title: "DevOps, Docker & Kubernetes",
    category: "DevOps",
    lessons: 6,
    duration: "5.5 Hours",
    level: "Career Booster",
    desc: "Build lightweight multi-stage Dockerfiles, compose multi-service stacks, orchestrate Pods on Kubernetes, and CI/CD.",
    skills: ["Docker", "Kubernetes", "Compose", "CI/CD", "Helm"],
    hasCert: true,
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  },
  {
    slug: "cloud",
    icon: "☁️",
    title: "Cloud Infrastructure with Terraform",
    category: "Cloud",
    lessons: 5,
    duration: "4.5 Hours",
    level: "Cloud Engineering",
    desc: "Provision Linux VMs with cloud-init YAML user-data, write Terraform IaC, configure VPC networks, and S3 backups.",
    skills: ["Terraform", "Cloud-Init", "AWS/GCP Linux", "VPC Security"],
    hasCert: true,
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
  {
    slug: "scripting",
    icon: "⚡",
    title: "Advanced Bash Scripting & Automation",
    category: "Scripting",
    lessons: 5,
    duration: "4.0 Hours",
    level: "Automation Pro",
    desc: "Transform into a scripting wizard. Learn Bash strict mode, regex parsing with awk/sed, signal traps, and cron schedules.",
    skills: ["Bash Strict Mode", "Awk & Sed", "Cron Timers", "Regex"],
    hasCert: true,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
];

// Free App Replacements
const APP_REPLACEMENTS = [
  {
    category: "Documents & Office",
    windowsApp: "Microsoft Word & Excel",
    linuxApp: "LibreOffice & OnlyOffice",
    desc: "Complete document, spreadsheet, and slide presentation suite that opens all .docx and .xlsx files for free.",
    icon: "📄",
    tag: "Free Word & Excel",
  },
  {
    category: "Photo & Design",
    windowsApp: "Adobe Photoshop",
    linuxApp: "GIMP & Krita",
    desc: "High-quality photo editing, layers, digital painting, and graphic design without any monthly fees.",
    icon: "🎨",
    tag: "Free Photo Editor",
  },
  {
    category: "Video Editing",
    windowsApp: "Adobe Premiere",
    linuxApp: "Kdenlive & DaVinci Resolve",
    desc: "Multi-track video editor with visual effects, transitions, and 4K export for YouTube and social content.",
    icon: "🎬",
    tag: "Free Video Editor",
  },
  {
    category: "Gaming & Fun",
    windowsApp: "Windows Gaming / Steam",
    linuxApp: "Steam Proton & Heroic",
    desc: "Play thousands of your favorite Steam and PC games smoothly on Linux with 1-click compatibility.",
    icon: "🎮",
    tag: "Play Your Games",
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
  difficulty: string;
  ramReq: string;
}

const DISTRO_CHOICES: DistroChoice[] = [
  {
    id: "windows-like",
    title: "I want something that feels like Windows",
    subtitle: "Familiar start menu, taskbar, and 1-click app installers.",
    emoji: "🪟",
    distroName: "Linux Mint",
    distroLogo: "🌿",
    whyBest:
      "The friendliest distribution for beginners. Looks and works like Windows 10/11 with zero learning curve.",
    difficulty: "Easiest for Beginners",
    ramReq: "2 GB RAM",
  },
  {
    id: "old-laptop",
    title: "I want to speed up an old slow laptop",
    subtitle: "Super lightweight system that runs smoothly on 10-year-old hardware.",
    emoji: "⚡",
    distroName: "Lubuntu / Zorin Lite",
    distroLogo: "💨",
    whyBest:
      "Blazing fast on older laptops with as little as 1GB of RAM. Extends battery life significantly.",
    difficulty: "Beginner Friendly",
    ramReq: "1 GB RAM",
  },
  {
    id: "gaming",
    title: "I want to play PC & Steam games",
    subtitle: "Pre-configured graphics drivers for NVIDIA & AMD with Steam ready.",
    emoji: "🎮",
    distroName: "Pop!_OS / Bazzite",
    distroLogo: "🚀",
    whyBest:
      "Designed out of the box for gamers. Automatically configures graphic card drivers and game launchers.",
    difficulty: "Easy & Ready to Play",
    ramReq: "4 GB RAM",
  },
  {
    id: "career",
    title: "I want to learn for a high-paying tech career",
    subtitle: "The worldwide standard used by Google, Amazon, and tech companies.",
    emoji: "💼",
    distroName: "Ubuntu / Fedora",
    distroLogo: "🟠",
    whyBest:
      "The global industry standard for cloud engineering, server management, and software development.",
    difficulty: "Great Starting Point",
    ramReq: "4 GB RAM",
  },
];

// Non-Tech FAQs
const BEGINNER_FAQS = [
  {
    q: "Will learning here affect or harm my current computer?",
    a: "Not at all! Everything on AfroKernal runs 100% inside your web browser. You can click, explore, and practice freely without altering any files or settings on your computer.",
  },
  {
    q: "Do I need any programming experience or advanced math?",
    a: "Zero coding or math required. If you know how to browse websites and type on a keyboard, you have everything needed to succeed.",
  },
  {
    q: "Is AfroKernal really 100% free?",
    a: "Yes, completely free forever. All courses, practice tests, and certificates are available to everyone without paywalls, hidden fees, or subscriptions.",
  },
  {
    q: "How long does it take to learn the basics?",
    a: "Most learners master the basics in just 2 to 3 days by spending 10–15 minutes a day with our bite-sized lessons and quizzes.",
  },
  {
    q: "Can I use AfroKernal on my phone, iPad, or Chromebook?",
    a: "Yes! AfroKernal is fully responsive and works smoothly on smartphones, tablets, Chromebooks, Windows, Mac, and Linux computers.",
  },
];

function Landing() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCourseCat, setSelectedCourseCat] = useState("All");

  // Distro selector state
  const [selectedGoal, setSelectedGoal] = useState<SimpleGoal>("windows-like");
  const currentDistro = useMemo(
    () => DISTRO_CHOICES.find((d) => d.id === selectedGoal) || DISTRO_CHOICES[0],
    [selectedGoal],
  );

  const courseCategories = useMemo(() => {
    return ["All", "Enterprise Linux", "Fundamentals", "Cybersecurity", "DevOps", "Cloud", "Scripting"];
  }, []);

  const visibleCourses = useMemo(() => {
    if (selectedCourseCat === "All") return FEATURED_COURSES;
    return FEATURED_COURSES.filter((c) => c.category === selectedCourseCat);
  }, [selectedCourseCat]);

  // AI assistant preview state
  const [aiQuestion, setAiQuestion] = useState(0);
  const aiAnswers = [
    {
      q: "What is Linux in plain English?",
      a: "Think of Linux like Windows or macOS — it's the engine (operating system) that runs your computer. The big difference? Linux is 100% free, created by a global community, doesn't track you with ads, and powers 96% of the world's internet servers, smart TVs, and supercomputers!",
    },
    {
      q: "Is Linux hard for a normal person to use?",
      a: "Not anymore! Modern Linux has a beautiful desktop with clickable app icons, start menus, web browsers, Spotify, Zoom, and full office programs. It looks and feels as friendly as Windows or Mac.",
    },
    {
      q: "Why should I learn Linux if I already have Windows?",
      a: "Linux gives your computer new life, protects your privacy from tracking, saves you hundreds of dollars on software, and opens doors to top-paying tech and IT careers!",
    },
  ];

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation */}
      <HeaderNav />

      {/* Hero Section - Clean, Simple, Modern, No Terminal */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/60">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Left Column: Hero Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-[0_0_20px_-5px_var(--primary)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>✨ The Friendly Linux Academy · 100% Free & Open</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight leading-[1.08]">
              Learn Linux <br />
              <span className="text-gradient">without the complexity.</span> <br />
              Simple. Fun. Free.
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Master modern computing, free software alternatives, and cloud skills with bite-sized
              lessons, friendly AI guidance, and real certificates. Zero technical experience
              needed.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={user ? "/courses" : "/auth"}
                search={user ? undefined : { redirect: "/courses", mode: "signup" }}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-current" /> Start Learning Free
              </Link>
              <Link
                to="/tutorials"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-4 text-sm font-semibold text-foreground hover:bg-muted transition hover:border-primary/40 shadow-sm"
              >
                <BookOpen className="h-4 w-4 text-primary" /> Browse All Lessons
              </Link>
            </div>

            {/* Quick Search Shortcut */}
            <div className="pt-1 flex justify-center lg:justify-start">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full max-w-md flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 text-xs text-muted-foreground hover:border-primary/50 hover:bg-card/90 transition shadow-sm group"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Looking for a topic? Search tutorials & tools...</span>
                </span>
                <kbd className="rounded-md border border-border bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-foreground font-semibold">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Trust Checklist */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 pt-2 text-xs font-medium text-muted-foreground">
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
                <span>24/7 AI Helper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Earn Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Modern Platform Preview Showcase (No Terminal) */}
          <div className="relative">
            <div className="rounded-3xl border border-primary/30 bg-card/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative space-y-5">
              {/* Card Header with User Status */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shadow-inner">
                    🐧
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">AfroKernel Academy</h3>
                    <p className="text-xs text-muted-foreground">Interactive Learning Platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>3-Day Streak</span>
                </div>
              </div>

              {/* Course Card Preview */}
              <div className="rounded-2xl bg-background border border-border/80 p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Recommended For You
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">38 Lessons</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Linux for Absolute Beginners</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Master essential computer skills, files, safety, and free software alternatives.
                  </p>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Course Progress</span>
                    <span className="text-primary font-bold">100% Free Access</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-2/5 rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              {/* 3 Core Highlights in Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-background border border-border/70 space-y-1">
                  <div className="text-xl">🤖</div>
                  <div className="font-bold text-xs text-foreground">AI Helper</div>
                  <div className="text-[10px] text-muted-foreground">Instant Q&A</div>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/70 space-y-1">
                  <div className="text-xl">💡</div>
                  <div className="font-bold text-xs text-foreground">Bite-Sized</div>
                  <div className="text-[10px] text-muted-foreground">5-Min Guides</div>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/70 space-y-1">
                  <div className="text-xl">🏆</div>
                  <div className="font-bold text-xs text-foreground">Certificates</div>
                  <div className="text-[10px] text-muted-foreground">Share Online</div>
                </div>
              </div>

              {/* Direct Action Link */}
              <div className="pt-2">
                <Link
                  to="/courses/$slug"
                  params={{ slug: "linux" }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Start Beginner Lesson 1</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps: How It Works */}
      <section className="py-16 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple & Stress-Free
            </span>
            <h2 className="text-3xl font-bold font-display">How AfroKernal Works</h2>
            <p className="text-sm text-muted-foreground">
              Learning Linux is as simple as 1, 2, 3. No setup headaches, no technical hurdles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {EASY_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 hover:border-primary/40 transition relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl p-2 rounded-2xl bg-secondary">{s.icon}</span>
                  <span className="font-mono text-2xl font-extrabold text-primary/40 group-hover:text-primary transition">
                    0{s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Structured Tracks & Courses */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Explore The Curriculum
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">
                Popular Learning Tracks & Courses
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Hands-on courses with in-browser terminal exercises, practice quizzes, and verifiable certifications.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition self-start md:self-auto"
            >
              Browse Full Course Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {courseCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCourseCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCourseCat === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat === "Enterprise Linux" ? "🎩 Enterprise Linux (RHEL)" : cat}
              </button>
            ))}
          </div>

          {/* Course Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => (
              <div
                key={course.slug}
                className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition group relative overflow-hidden ${
                  course.slug === "rhel"
                    ? "border-red-500/40 bg-gradient-to-b from-card via-card to-red-500/5 hover:border-red-500/70 shadow-lg shadow-red-500/5"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-xl"
                }`}
              >
                {course.slug === "rhel" && (
                  <div className="absolute top-0 right-0 bg-red-500/10 border-b border-l border-red-500/20 text-red-500 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    ⭐ Featured Track
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary">{course.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${course.badgeColor}`}
                    >
                      {course.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                      {course.desc}
                    </p>
                  </div>

                  {/* Skills tags */}
                  {course.skills && course.skills.length > 0 && (
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
                  )}
                </div>

                <div className="pt-5 mt-6 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    {course.lessons} Lessons · {course.duration}
                  </span>
                  <Link
                    to={user ? "/courses/$slug" : "/auth"}
                    params={user ? { slug: course.slug } : undefined}
                    search={
                      user ? undefined : { redirect: `/courses/${course.slug}`, mode: "signup" }
                    }
                    className={`font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                      course.slug === "rhel"
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    Start Course <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learn Linux? Plain-English Benefits */}
      <section className="py-20 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Why Learn Linux?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Real Benefits for Everyday People
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover how Linux gives you total control, blazing speed, and valuable career skills.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_LINUX_BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary">{b.icon}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {b.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1-Click Distro Matcher for Beginners */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Which Linux is Right For You?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">
                Find Your Ideal Linux Match
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select your primary goal to see the top recommended distribution.
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
            <div className="space-y-3">
              {DISTRO_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedGoal(choice.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                    selectedGoal === choice.id
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-3xl p-2 rounded-2xl bg-secondary shrink-0">
                    {choice.emoji}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-foreground">{choice.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{choice.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Matched Result Card */}
            <div className="rounded-3xl border border-primary/40 bg-card p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 rounded-2xl bg-secondary">
                    {currentDistro.distroLogo}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-foreground">
                      {currentDistro.distroName}
                    </h3>
                    <span className="text-xs text-primary font-semibold">
                      {currentDistro.difficulty}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                  {currentDistro.ramReq}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentDistro.whyBest}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/distros"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center gap-1.5"
                >
                  Learn About {currentDistro.distroName} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/distro-finder"
                  className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition"
                >
                  Detailed Quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free App Replacements */}
      <section className="py-20 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Free App Replacements
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">
                Replace Expensive Software for Free
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Linux has free, high-quality alternatives to everything you use on Windows.
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
                className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition group"
              >
                <div className="space-y-4">
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
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition mt-0.5">
                      → {app.linuxApp}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 AI Helper Q&A Demo */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Your 24/7 AI Helper
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Never Get Stuck on Linux
            </h2>
            <p className="text-sm text-muted-foreground">
              Ask questions in plain English anytime and get friendly, instant explanations.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Question Selector Pills */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Click a question to see how the AI explains it:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {aiAnswers.map((item, idx) => (
                  <button
                    key={item.q}
                    onClick={() => setAiQuestion(idx)}
                    className={`p-3 rounded-2xl border text-left text-xs font-medium transition ${
                      aiQuestion === idx
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Display */}
            <div className="p-5 rounded-2xl bg-background border border-border/80 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Bot className="h-4 w-4" />
                <span>AfroKernel AI Tutor:</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {aiAnswers[aiQuestion].a}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Ask custom questions during any lesson</span>
              <Link
                to="/chat"
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                Chat with AI Assistant <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beginner FAQs */}
      <section className="py-20 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-4xl px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know before getting started.
            </p>
          </div>

          <div className="space-y-4">
            {BEGINNER_FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-border bg-card p-5 transition open:border-primary/40 open:bg-card/90"
              >
                <summary className="font-semibold text-sm sm:text-base text-foreground cursor-pointer flex items-center justify-between list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Modern High-Impact Closing CTA Banner */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/15 p-8 sm:p-14 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 text-primary mx-auto text-3xl shadow-[0_0_25px_var(--primary)]">
              🐧
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground">
                Your Linux Journey Starts <span className="text-gradient">Today</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Join thousands of learners mastering real system administration, cloud skills, and
                free software. 100% free forever.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to={user ? "/courses" : "/auth"}
                search={user ? undefined : { redirect: "/courses", mode: "signup" }}
                className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
              >
                <Zap className="h-4 w-4 fill-current" /> Start Learning Free
              </Link>
              <Link
                to="/tutorials"
                className="px-6 py-4 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition"
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
