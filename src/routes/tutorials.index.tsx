import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Search, Terminal, Shield, Settings, Network, Cloud, Container, FileCode, CheckCircle2, ArrowRight, Sparkles, Award } from "lucide-react";
import { useState, useMemo } from "react";

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
  hasCertificate: boolean;
  modules: string[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "linux",
    name: "Linux Fundamentals 2026",
    description: "From the command line to enterprise system administration. Master file structures, permissions, bash navigation, and systemd.",
    icon: "🐧",
    lucideIcon: Terminal,
    tutorialCount: 38,
    badge: "Core Curriculum",
    hasCertificate: true,
    modules: ["Command Line Basics", "Navigation & Inodes", "Permissions & chmod", "Processes & Signals", "Package Managers", "Systemd Services"]
  },
  {
    slug: "security",
    name: "Cybersecurity Fundamentals",
    description: "Network scanning with Nmap, Wireshark traffic analysis, Linux system hardening, host firewalls, and penetration testing essentials.",
    icon: "🔒",
    lucideIcon: Shield,
    tutorialCount: 10,
    badge: "Hands-on Labs",
    hasCertificate: true,
    modules: ["Nmap Port Scanning", "Wireshark Packet Analysis", "SSH Hardening & Keys", "UFW & iptables Firewalls", "OWASP Top 10 Basics"]
  },
  {
    slug: "devops",
    name: "DevOps Fundamentals",
    description: "Container architecture, CI/CD automated pipelines, multi-stage Docker builds, Kubernetes clusters, and Ansible infrastructure as code.",
    icon: "⚙️",
    lucideIcon: Settings,
    tutorialCount: 10,
    badge: "Industry Favorite",
    hasCertificate: true,
    modules: ["Docker Engine Architecture", "Dockerfile Optimization", "Docker Compose Multi-Container", "GitHub Actions CI/CD", "Ansible Playbooks"]
  },
  {
    slug: "networking",
    name: "Networking Fundamentals",
    description: "Master TCP/IP protocols, IPv4/IPv6 subnetting, DNS resolution hierarchies, routing tables, and socket debugging with ss and tcpdump.",
    icon: "🌐",
    lucideIcon: Network,
    tutorialCount: 12,
    hasCertificate: false,
    modules: ["OSI & TCP/IP Model", "Subnetting & CIDR", "DNS Records & Dig", "Linux Routing & Gateways", "Socket Statistics (ss, netstat)"]
  },
  {
    slug: "cloud",
    name: "Cloud & Infrastructure",
    description: "AWS, GCP, and Azure cloud computing essentials: virtual machines, cloud-init provisioning, IAM security, and Terraform IaC.",
    icon: "☁️",
    lucideIcon: Cloud,
    tutorialCount: 11,
    hasCertificate: false,
    modules: ["Cloud Compute & VMs", "Cloud Storage & S3", "IAM Roles & Security", "Terraform Provider Basics", "Cloud-Init Automation"]
  },
  {
    slug: "containers",
    name: "Containers & Kubernetes",
    description: "Deep dive into OCI runtimes, cgroups, namespaces, Kubernetes Pods, Services, Deployments, Persistent Volumes, and Ingress controllers.",
    icon: "🐳",
    lucideIcon: Container,
    tutorialCount: 11,
    hasCertificate: false,
    modules: ["Linux Namespaces & Cgroups", "Kubernetes Architecture", "Pods, Deployments & ReplicaSets", "K8s Services & ClusterIP", "Helm Package Manager"]
  },
  {
    slug: "scripting",
    name: "Scripting & Automation",
    description: "Advanced Bash scripting, Python for sysadmins, regex text parsing with awk/sed, cron scheduling, and error-handling pipelines.",
    icon: "📜",
    lucideIcon: FileCode,
    tutorialCount: 11,
    hasCertificate: false,
    modules: ["Bash Strict Mode & Traps", "Python Automation Scripts", "Awk & Sed Text Processing", "Cron & Systemd Timers", "Error Handling & Logging"]
  }
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
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
            <BookOpen className="h-3.5 w-3.5" /> Structured Curriculum & Tutorials
          </div>
          <h1 className="text-4xl font-display font-bold">Linux Courses & Tutorials</h1>
          <p className="text-muted-foreground text-base max-w-2xl mt-1">
            Structured hands-on tracks with interactive lessons, command line practice, quizzes, and verifiable certifications. 100% free.
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
          const Icon = path.lucideIcon;
          return (
            <div
              key={path.slug}
              className="rounded-3xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 rounded-2xl bg-secondary/80">{path.icon}</span>
                  <div className="flex items-center gap-2">
                    {path.hasCertificate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        <Award className="h-3 w-3" /> Certificate Included
                      </span>
                    )}
                    {path.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {path.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
                  {path.name}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{path.description}</p>

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
    </div>
  );
}
