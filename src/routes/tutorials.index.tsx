import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Terminal,
  Network,
  FileCode,
  CheckCircle2,
  ArrowRight,
  Server,
} from "lucide-react";
import { useState, useMemo } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import { BackToHome } from "@/components/BackToHome";

export const Route = createFileRoute("/tutorials/")({
  component: TutorialsIndex,
});

interface LearningPath {
  slug: string;
  name: string;
  description: string;
  icon: string;
  lucideIcon: typeof Terminal;
  tutorialCount: number;
  badge?: string;
  modules: string[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "linux",
    name: "Linux Fundamentals 2026",
    description:
      "Core command line essentials, Unix filesystem navigation, file permissions, users and groups, systemd service management, and process architecture.",
    icon: "🐧",
    lucideIcon: Terminal,
    tutorialCount: 38,
    badge: "Most Popular",
    modules: [
      "Command Line Basics",
      "Navigation & Inodes",
      "Permissions & chmod",
      "Processes & Signals",
      "Package Managers",
      "Systemd Services",
    ],
  },
  {
    slug: "rhel",
    name: "Red Hat Enterprise Linux (RHEL 9) & RHCSA",
    description:
      "Enterprise system administration, DNF/RPM package architecture, SELinux enforcement, LVM storage, Firewalld zones, and Cockpit web console.",
    icon: "🎩",
    lucideIcon: Server,
    tutorialCount: 8,
    badge: "Enterprise Standard",
    modules: [
      "RHEL 9 & CentOS Stream Architecture",
      "DNF, RPM & Subscription Manager",
      "SELinux Security Contexts & Booleans",
      "LVM Storage Slicing (PV, VG, LV) & XFS",
      "Systemd Targets & rd.break Rescue",
      "NetworkManager (nmcli) & Firewalld",
      "Cockpit Web Console Management",
    ],
  },
  {
    slug: "networking",
    name: "Networking Fundamentals",
    description:
      "Master TCP/IP protocols, IPv4/IPv6 subnetting, DNS resolution hierarchies, routing tables, and socket debugging with ss and tcpdump.",
    icon: "🌐",
    lucideIcon: Network,
    tutorialCount: 12,
    modules: [
      "OSI & TCP/IP Model",
      "Subnetting & CIDR",
      "DNS Records & Dig",
      "Linux Routing & Gateways",
      "Socket Statistics (ss, netstat)",
    ],
  },
  {
    slug: "scripting",
    name: "Scripting & Automation",
    description:
      "Advanced Bash scripting, Python for sysadmins, regex text parsing with awk/sed, cron scheduling, and error-handling pipelines.",
    icon: "📜",
    lucideIcon: FileCode,
    tutorialCount: 11,
    modules: [
      "Bash Strict Mode & Traps",
      "Python Automation Scripts",
      "Awk & Sed Text Processing",
      "Cron & Systemd Timers",
      "Error Handling & Logging",
    ],
  },
];

function TutorialsIndex() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPaths = useMemo(() => {
    return LEARNING_PATHS.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.modules.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-1 mx-auto max-w-7xl px-6 py-12 space-y-8 w-full">
        <BackToHome />
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/80">
          <div>
            <h1 className="text-4xl font-display font-bold">Linux Courses & Tutorials</h1>
            <p className="text-muted-foreground text-base max-w-2xl mt-1">
              Structured hands-on tracks with interactive lessons, command line practice, and
              quizzes. 100% free.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tracks or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPaths.map((path) => {
            return (
              <div
                key={path.slug}
                className="rounded-3xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-2xl bg-secondary/80">{path.icon}</span>
                    {path.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {path.badge}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
                    {path.name}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {path.description}
                  </p>

                  <div className="space-y-1.5 py-4 border-t border-border/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      Key Modules:
                    </span>
                    {path.modules.slice(0, 4).map((mod, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {path.tutorialCount} Tutorials
                  </span>
                  <Link
                    to="/courses/$slug"
                    params={{ slug: path.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition"
                  >
                    Start Track <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <FooterNav />
    </div>
  );
}
