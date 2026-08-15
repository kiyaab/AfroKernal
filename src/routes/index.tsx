import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import {
  Terminal,
  BookOpen,
  Sparkles,
  Cpu,
  ShieldCheck,
  Award,
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
  Search,
  Disc,
  AppWindow,
  Gamepad2,
  Calculator,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { DISTROS_DATA } from "@/lib/distros-data";
import { APPS_DATA } from "@/lib/apps-data";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";

const LOGO_URL = "/afrokernel-logo.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

const paths = [
  { slug: "linux", icon: "🐧", title: "Linux Fundamentals 2026", lessons: 38, level: "Beginner", desc: "Command line, files, permissions, networking, and system administration with a certificate.", hasCert: true },
  { slug: "security", icon: "🔒", title: "Cybersecurity Fundamentals", lessons: 10, level: "Intermediate", desc: "Nmap port scanning, Wireshark traffic analysis, system hardening, and penetration testing.", hasCert: true },
  { slug: "devops", icon: "⚙️", title: "DevOps & Containers", lessons: 10, level: "Advanced", desc: "Docker, Kubernetes, GitHub Actions CI/CD, and Ansible automation with a certificate.", hasCert: true },
  { slug: "networking", icon: "🌐", title: "Networking Fundamentals", lessons: 12, level: "Intermediate", desc: "TCP/IP, subnetting, DNS hierarchies, routing tables, and socket analysis.", hasCert: false },
  { slug: "cloud", icon: "☁️", title: "Cloud & Infrastructure", lessons: 11, level: "Advanced", desc: "AWS, GCP, Azure VMs, cloud-init provisioning, IAM security, and Terraform.", hasCert: false },
  { slug: "containers", icon: "🐳", title: "Containers & Kubernetes", lessons: 11, level: "Advanced", desc: "Namespaces, cgroups, Pods, Deployments, Services, Helm charts, and Ingress.", hasCert: false },
];

function Landing() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [terminalCmd, setTerminalCmd] = useState("neofetch");
  const [terminalOutput, setTerminalOutput] = useState<string>(`       _,met$$$$$gg.          learner@afrokernel
    ,g$$$$$$$$$$$$$$$P.       ------------------
  ,g$$P"''       '""Y$$.".    OS: AfroKernel Linux 2026 (x86_64)
 ,$$P'              '$$$.     Kernel: 6.8.0-afrokernel-generic
',$$P       ,ggs.     '$$b:   Uptime: 14 days, 3 hours
'd$$'     ,$P"'   .    $$$    Shell: bash 5.2.21
 $$P      d$'     ,    $$P    DE: Open Education Cloud
 $$:      $.   -  ,d$$'       Terminal: Browser Virtual TTY
 $$;      Y$b._   _,d$P'      CPU: Cloud Virtual CPU (4 cores)
 Y$$.    '.'"Y$$$$P"'         Memory: 1024MB / 4096MB
  '$$b      "-.__             Disk (/): 14.2GB / 50GB (ext4)
   'Y$$                       Status: All-Access Ready (100% Free)`);

  const runTerminalCommand = (cmd: string) => {
    setTerminalCmd(cmd);
    const clean = cmd.trim().toLowerCase();
    if (clean === "neofetch") {
      setTerminalOutput(`       _,met$$$$$gg.          learner@afrokernel
    ,g$$$$$$$$$$$$$$$P.       ------------------
  ,g$$P"''       '""Y$$.".    OS: AfroKernel Linux 2026 (x86_64)
 ,$$P'              '$$$.     Kernel: 6.8.0-afrokernel-generic
',$$P       ,ggs.     '$$b:   Uptime: 14 days, 3 hours
'd$$'     ,$P"'   .    $$$    Shell: bash 5.2.21
 $$P      d$'     ,    $$P    DE: Open Education Cloud
 $$:      $.   -  ,d$$'       Terminal: Browser Virtual TTY
 $$;      Y$b._   _,d$P'      CPU: Cloud Virtual CPU (4 cores)
 Y$$.    '.'"Y$$$$P"'         Memory: 1024MB / 4096MB
  '$$b      "-.__             Disk (/): 14.2GB / 50GB (ext4)
   'Y$$                       Status: All-Access Ready (100% Free)`);
    } else if (clean.startsWith("chmod")) {
      setTerminalOutput(`[OK] Changed file permissions to 755 (-rwxr-xr-x) for deploy.sh
Owner: rwx (read, write, execute)
Group: r-x (read, execute)
Others: r-x (read, execute)`);
    } else if (clean.startsWith("docker")) {
      setTerminalOutput(`CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS
7c82a1b9f0e1   nginx:alpine   "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp
e31c44208a9f   redis:7-alpine "docker-entrypoint.s…"   10 hours ago    Up 10 hours    0.0.0.0:6379->6379/tcp`);
    } else if (clean.startsWith("nmap")) {
      setTerminalOutput(`Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-14 12:00 UTC
Nmap scan report for target.internal (192.168.1.50)
Host is up (0.00042s latency).
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu
80/tcp   open  http    nginx/1.24.0
443/tcp  open  ssl/http nginx/1.24.0
Nmap done: 1 IP address (1 host up) scanned in 0.48 seconds`);
    } else {
      setTerminalOutput(`total 32
drwxr-xr-x 4 learner learner 4096 Aug 14 12:00 .
drwxr-xr-x 3 root    root    4096 Aug 14 10:00 ..
-rwxr-xr-x 1 learner learner  248 Aug 14 11:30 deploy.sh
-rw-r--r-- 1 learner learner 1420 Aug 14 11:45 nginx.conf
drwxr-xr-x 2 learner learner 4096 Aug 14 11:15 src
drwxr-xr-x 2 learner learner 4096 Aug 14 11:20 tests`);
    }
  };

  const featuredDistros = DISTROS_DATA.slice(0, 4);
  const featuredApps = APPS_DATA.slice(0, 3);

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background">
      {/* Mega Navigation Header */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Hero Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-[0_0_15px_-5px_var(--primary)]">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Your Home to Learn Linux · 100% Free & Open</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.05]">
              Master Linux. <br />
              <span className="text-gradient">From your first command</span> <br />
              to certified expert.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Step-by-step tutorials, interactive tools, app alternatives, distro finders, and verifiable certifications. The complete hands-on Linux learning ecosystem.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={user ? "/courses" : "/auth"}
                search={user ? undefined : { redirect: "/courses", mode: "signup" }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
              >
                <Zap className="h-4 w-4" /> Start Learning Free
              </Link>
              <Link
                to="/distro-finder"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Find Your Distro Quiz
              </Link>
            </div>

            {/* Hero Quick Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full max-w-md flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card/60 text-xs text-muted-foreground hover:border-primary/40 transition group"
            >
              <span className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-primary" />
                <span>Search 30+ distros, 60+ commands, app alternatives...</span>
              </span>
              <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>

            {/* Value checklist */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> No credit card</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> No ads or paywalls</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Real browser terminal</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Verifiable certificate</div>
            </div>
          </div>

          {/* Hero Right: Interactive Mini Terminal Sandbox */}
          <div className="relative">
            <div className="rounded-3xl border border-primary/30 bg-card p-2 shadow-2xl backdrop-blur relative overflow-hidden">
              <div className="rounded-2xl bg-background p-4 sm:p-6 font-mono text-xs space-y-4">
                {/* Terminal top header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] text-muted-foreground font-semibold">learner@afrokernel-cloud:~</span>
                  </div>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">Interactive Sandbox</span>
                </div>

                {/* Quick command buttons */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    onClick={() => runTerminalCommand("neofetch")}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      terminalCmd === "neofetch" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    neofetch
                  </button>
                  <button
                    onClick={() => runTerminalCommand("ls -la")}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      terminalCmd === "ls -la" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    ls -la
                  </button>
                  <button
                    onClick={() => runTerminalCommand("chmod 755 deploy.sh")}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      terminalCmd.startsWith("chmod") ? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    chmod 755
                  </button>
                  <button
                    onClick={() => runTerminalCommand("docker ps")}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      terminalCmd.startsWith("docker") ? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    docker ps
                  </button>
                  <button
                    onClick={() => runTerminalCommand("nmap 192.168.1.50")}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      terminalCmd.startsWith("nmap") ? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    nmap scan
                  </button>
                </div>

                {/* Terminal output display */}
                <div className="space-y-1">
                  <div className="text-primary font-bold">
                    <span>$ </span>
                    <span className="text-foreground">{terminalCmd}</span>
                  </div>
                  <pre className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto p-3 rounded-xl bg-card/60 border border-border/40 max-h-56">
                    {terminalOutput}
                  </pre>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border">
                  <span>Type commands or click pills above</span>
                  <Link to="/lab" className="text-primary font-bold hover:underline flex items-center gap-1">
                    Open Full Dual Linux Lab <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      <section className="border-b border-border/60 bg-card/20 py-8">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="font-mono text-3xl font-extrabold text-primary">16+</div>
            <div className="text-xs text-muted-foreground font-medium">Linux Distributions Profiled</div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-extrabold text-primary">60+</div>
            <div className="text-xs text-muted-foreground font-medium">Windows to Linux App Alternatives</div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-extrabold text-primary">7</div>
            <div className="text-xs text-muted-foreground font-medium">Structured Learning Tracks</div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-3xl font-extrabold text-primary">100%</div>
            <div className="text-xs text-muted-foreground font-medium">Free & Community Governed</div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Structured Curriculum</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">Featured Learning Tracks</h2>
              <p className="text-sm text-muted-foreground mt-1">From the bash command line to enterprise cloud infrastructure.</p>
            </div>
            <Link
              to="/tutorials"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start md:self-auto"
            >
              Browse All 7 Tracks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => (
              <div
                key={p.slug}
                className="rounded-3xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary/80">{p.icon}</span>
                    {p.hasCert && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        <Award className="h-3 w-3" /> Certificate Included
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">{p.desc}</p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">{p.lessons} Tutorials</span>
                  <Link
                    to={user ? "/courses/$slug" : "/auth"}
                    params={user ? { slug: p.slug } : undefined}
                    search={user ? undefined : { redirect: `/courses/${p.slug}`, mode: "signup" }}
                    className="font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    Start Track <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools Showcase */}
      <section className="py-20 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Interactive Utility Suite</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Essential Linux Productivity Tools</h2>
            <p className="text-sm text-muted-foreground">
              Powerful calculators, translators, and builders designed to simplify daily Linux workflows.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Distro Finder */}
            <Link
              to="/distro-finder"
              className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">Distro Finder Quiz</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  5-question smart quiz to discover your top 3 Linux distribution matches based on hardware and workflow.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-border/60 text-xs font-bold text-primary flex items-center gap-1">
                Take Quiz <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Permissions Calculator */}
            <Link
              to="/tools/permissions-calculator"
              className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">Permissions Calculator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Visual chmod octal & symbolic calculator with SUID/SGID/Sticky bits and security presets.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-border/60 text-xs font-bold text-primary flex items-center gap-1">
                Calculate chmod <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Cron Builder */}
            <Link
              to="/tools/cron-builder"
              className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">Cron Expression Builder</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Build automated schedules visually with plain English translation and production crontab export.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-border/60 text-xs font-bold text-primary flex items-center gap-1">
                Build Cron Job <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Command Translator */}
            <Link
              to="/tools/command-translator"
              className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">Command Translator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Convert Windows CMD & PowerShell commands directly to Linux Bash with detailed argument explanations.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-border/60 text-xs font-bold text-primary flex items-center gap-1">
                Translate Commands <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Distros Showcase */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Operating Systems</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">Popular Linux Distributions</h2>
              <p className="text-sm text-muted-foreground mt-1">Discover, compare, and download the finest Linux distributions.</p>
            </div>
            <Link
              to="/distros"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              View All 16+ Distros <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredDistros.map((d) => (
              <div key={d.id} className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-1 rounded-xl bg-primary/10">{d.logo}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {d.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">{d.name}</h3>
                  <span className="text-xs text-muted-foreground block mb-2">{d.base} base · {d.defaultDesktop}</span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{d.tagline}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="font-mono text-xs text-primary font-bold">{d.gamingScore}/10 Gaming</span>
                  <Link to="/distros" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Alternatives Spotlight */}
      <section className="py-20 border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Switching Software</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mt-1">Windows to Linux App Alternatives</h2>
              <p className="text-sm text-muted-foreground mt-1">Replace proprietary software with high-quality open-source tools.</p>
            </div>
            <Link
              to="/apps"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Explore 60+ App Alternatives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredApps.map((app) => (
              <div key={app.id} className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-secondary">{app.icon}</span>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{app.name}</h3>
                    <span className="text-xs text-muted-foreground">{app.category}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Best Linux Replacements:</span>
                  {app.alternatives.map((alt) => (
                    <div key={alt.name} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                      <span className="font-semibold text-foreground">{alt.name}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">{alt.license}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications CTA Banner */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-14 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mx-auto shadow-[0_0_20px_var(--primary)]">
              <Award className="h-8 w-8" />
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground">
                Prove Your Skills with <span className="text-gradient">Official Certifications</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take timed 50-question practice exams across Linux Fundamentals, Cybersecurity, and DevOps. Earn shareable credentials verified on LinkedIn.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/exam/practice"
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
              >
                Start Free Practice Exam <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/certification"
                className="px-6 py-3.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition"
              >
                View Certification Details
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
