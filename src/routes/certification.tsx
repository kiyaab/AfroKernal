import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, ShieldCheck, Clock, Download, ExternalLink, ArrowRight, Sparkles, Check, HelpCircle } from "lucide-react";
import { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";

export const Route = createFileRoute("/certification")({
  head: () => ({
    meta: [
      { title: "Linux Certifications — AfroKernel" },
      { name: "description", content: "Earn verifiable Linux, Cybersecurity, and DevOps certifications. Share on LinkedIn with permanent verification." },
      { property: "og:title", content: "AfroKernel Linux Certifications" },
    ],
  }),
  component: Certification,
});

interface CertTrack {
  id: string;
  name: string;
  badge: string;
  icon: string;
  hero: string;
  description: string;
  topics: string[];
  sampleQuestion: string;
}

const TRACKS: CertTrack[] = [
  {
    id: "linux",
    name: "Linux Fundamentals",
    badge: "Most Popular",
    icon: "🐧",
    hero: "Master the Linux command line, permissions, process management, networking, and system administration.",
    description: "Demonstrate competence across standard Unix/Linux system administration commands, text processing (grep, sed, awk), user management, and systemd services.",
    topics: [
      "Command Line & Navigation",
      "File System & Inodes",
      "Permissions (chmod, chown, umask)",
      "Process Management (ps, top, kill)",
      "Networking & SSH",
      "Package Management (APT, DNF, Pacman)",
      "Shell Scripting Basics",
      "Systemd Services & Logs",
    ],
    sampleQuestion: "Which command lists all open files and active network connections associated with process ID 1284?",
  },
  {
    id: "security",
    name: "Cybersecurity Fundamentals",
    badge: "In Demand",
    icon: "🔒",
    hero: "Demonstrate knowledge of network scanning, cryptography, system hardening, and penetration testing fundamentals.",
    description: "Prove your ability to audit Linux servers, configure host firewalls (UFW/iptables), analyze Wireshark packet captures, and identify common vulnerabilities.",
    topics: [
      "Network Scanning with Nmap",
      "Wireshark & Traffic Analysis",
      "Cryptography & OpenSSL",
      "SSH & System Hardening",
      "Firewalls (iptables, UFW, nftables)",
      "Web Security (OWASP Top 10)",
      "Privilege Escalation Vectors",
      "Digital Forensics & Logging",
    ],
    sampleQuestion: "What is the primary benefit of running 'nmap -sS' over a standard full TCP connect scan?",
  },
  {
    id: "devops",
    name: "DevOps & Containers",
    badge: "Career Booster",
    icon: "⚙️",
    hero: "Prove your hands-on skills with Docker containers, CI/CD pipelines, Kubernetes, Ansible, and modern deployment workflows.",
    description: "Validate real-world containerization expertise: multi-stage Dockerfiles, Docker Compose architectures, Kubernetes Pods/Services, and declarative infrastructure.",
    topics: [
      "Docker & Container Architecture",
      "Multi-Stage Dockerfiles",
      "Docker Compose Microservices",
      "CI/CD Pipelines (GitHub Actions)",
      "Kubernetes Core (Pods, Deployments)",
      "Ansible Configuration as Code",
      "Nginx Reverse Proxy & SSL",
      "Monitoring with Prometheus",
    ],
    sampleQuestion: "How do multi-stage Dockerfiles reduce final production container image attack surface and size?",
  },
];

function Certification() {
  const [selectedTrack, setSelectedTrack] = useState<CertTrack>(TRACKS[0]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-1 mx-auto max-w-7xl px-6 py-12">
        {/* Top Banner */}
        <div className="mb-12 text-center flex flex-col gap-3 items-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold">Linux Certifications</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Prove your skills with official, verifiable credentials. Three specialized tracks shareable on LinkedIn with instant public verification.
          </p>
        </div>

      {/* 3 Tracks Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-16">
        {TRACKS.map((t) => {
          const isSelected = t.id === selectedTrack.id;
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTrack(t)}
              className={`cursor-pointer rounded-3xl border p-8 flex flex-col justify-between transition relative overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xl"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl p-2 rounded-2xl bg-secondary/80">{t.icon}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {t.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{t.hero}</p>

                <div className="space-y-2 text-xs py-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>50 Multiple Choice Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>60 Minutes Time Limit</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>70% Passing Threshold</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Permanent Credential (Never Expires)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <Link
                  to="/exam/practice"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)]"
                >
                  Start Practice Exam <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Track Deep Dive */}
      <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm space-y-8 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Selected Certification Track</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{selectedTrack.name} Exam Syllabus</h2>
          </div>

          <Link
            to="/exam/practice"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)] shrink-0"
          >
            Take Free Practice Test <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Topics Grid */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Core Knowledge Domains Covered:</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedTrack.topics.map((topic, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-background/60 border border-border flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Question Preview */}
        <div className="p-6 rounded-2xl bg-secondary/40 border border-border space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">Sample Exam Question:</span>
          <p className="text-sm font-semibold text-foreground">{selectedTrack.sampleQuestion}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Practice this and 50+ real exam questions on the free practice test simulator.</span>
          </div>
        </div>
      </div>

      {/* Verifiable Certificate Benefits Showcase */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-12 shadow-sm">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Verifiable Credential</span>
            <h2 className="text-3xl font-display font-bold">What happens after you pass</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upon completing any certification exam with a score of 70% or higher, your verifiable certificate is generated automatically.
            </p>
            <ul className="space-y-3 text-xs text-foreground/90 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Verifiable PDF Download</strong> — Instantly download your high-resolution signed PDF certificate.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Add to LinkedIn Profile</strong> — Display under "Licenses & Certifications" with a permanent public verification URL.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Permanent Access</strong> — Your credentials and Road Warrior tutorials remain unlocked forever.</span>
              </li>
            </ul>
          </div>

          {/* Certificate Mockup Preview */}
          <div className="rounded-2xl border-2 border-primary/30 bg-background/90 p-8 shadow-2xl space-y-4 text-center font-serif relative">
            <div className="flex justify-between items-center text-xs font-sans text-muted-foreground pb-4 border-b border-border">
              <span>AFROKERNEL CERTIFICATION</span>
              <span className="font-mono text-primary font-bold">ID: AK-9482-CERT</span>
            </div>
            <div className="text-2xl font-bold font-sans text-foreground">Certificate of Excellence</div>
            <p className="text-xs font-sans text-muted-foreground">This is to certify that</p>
            <div className="text-xl font-bold text-primary font-sans">Linux Administrator Candidate</div>
            <p className="text-xs font-sans text-muted-foreground">has successfully passed the comprehensive exam for</p>
            <div className="text-sm font-bold font-sans text-foreground bg-primary/10 py-1 rounded-md">
              Linux Fundamentals Certified Administrator
            </div>
            <div className="flex justify-between items-center text-[10px] font-sans text-muted-foreground pt-4 border-t border-border">
              <span>Issued: August 2026</span>
              <span>Score: 94% (PASSED)</span>
              <span>Status: Verified & Active</span>
            </div>
          </div>
        </div>
      </div>
      </main>

      <FooterNav />
    </div>
  );
}
