import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import {
  Terminal,
  BookOpen,
  Disc,
  AppWindow,
  Gamepad2,
  Cpu,
  ArrowRightLeft,
  Calculator,
  Clock,
  Award,
  FileText,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";

const LOGO_URL = "/afrokernel-logo.png";

export function HeaderNav() {
  const { user, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/40 bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)] transition group-hover:scale-105">
              <img src={LOGO_URL} alt="AfroKernel" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Afro<span className="text-primary">Kernel</span>
            </span>
          </Link>

          {/* Desktop Navigation Mega Menu */}
          <nav className="hidden items-center gap-1 lg:flex text-sm font-medium">
            {/* 1. Courses Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition">
                <span>Courses</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${coursesOpen ? "rotate-180" : ""}`} />
              </button>

              {coursesOpen && (
                <div className="absolute left-0 top-full pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-xl space-y-1">
                    <Link
                      to="/tutorials"
                      onClick={() => setCoursesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-primary/10">🐧</span>
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Linux Fundamentals 2026</div>
                        <div className="text-[11px] text-muted-foreground">38 tutorials · Core system admin</div>
                      </div>
                    </Link>
                    <Link
                      to="/tutorials"
                      onClick={() => setCoursesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-primary/10">🔒</span>
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Cybersecurity Fundamentals</div>
                        <div className="text-[11px] text-muted-foreground">Nmap, Wireshark, hardening & pentest</div>
                      </div>
                    </Link>
                    <Link
                      to="/tutorials"
                      onClick={() => setCoursesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-primary/10">⚙️</span>
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">DevOps & Containers</div>
                        <div className="text-[11px] text-muted-foreground">Docker, Kubernetes, CI/CD & Ansible</div>
                      </div>
                    </Link>
                    <div className="pt-2 border-t border-border mt-1">
                      <Link
                        to="/tutorials"
                        onClick={() => setCoursesOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition"
                      >
                        <span>View All 7 Curriculum Tracks</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Explore Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition">
                <span>Explore</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 top-full pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-xl space-y-1">
                    <Link
                      to="/distros"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Disc className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Linux Distributions</div>
                        <div className="text-[11px] text-muted-foreground">Browse & compare 16+ distros side-by-side</div>
                      </div>
                    </Link>
                    <Link
                      to="/apps"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <AppWindow className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">App Alternatives</div>
                        <div className="text-[11px] text-muted-foreground">Windows & Mac software mapped to Linux</div>
                      </div>
                    </Link>
                    <Link
                      to="/gaming"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Gamepad2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Gaming on Linux</div>
                        <div className="text-[11px] text-muted-foreground">Steam Proton & live Anti-Cheat matrix</div>
                      </div>
                    </Link>
                    <Link
                      to="/hardware-compatibility"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Hardware Compatibility</div>
                        <div className="text-[11px] text-muted-foreground">GPUs, Wi-Fi chips, laptops & diagnostic commands</div>
                      </div>
                    </Link>
                    <Link
                      to="/migration-guides"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <ArrowRightLeft className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Migration Guides</div>
                        <div className="text-[11px] text-muted-foreground">Step-by-step Windows & Mac transition checklists</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition">
                <span>Tools</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 top-full pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-xl space-y-1">
                    <Link
                      to="/distro-finder"
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Distro Finder Quiz</div>
                        <div className="text-[11px] text-muted-foreground">5-question smart matching engine</div>
                      </div>
                    </Link>
                    <Link
                      to="/tools/command-translator"
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Terminal className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Command Translator</div>
                        <div className="text-[11px] text-muted-foreground">Windows CMD / PowerShell to Linux Bash</div>
                      </div>
                    </Link>
                    <Link
                      to="/tools/permissions-calculator"
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Calculator className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Permissions Calculator</div>
                        <div className="text-[11px] text-muted-foreground">Visual chmod octal & symbolic calculator</div>
                      </div>
                    </Link>
                    <Link
                      to="/tools/cron-builder"
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary">Cron Builder & Explainer</div>
                        <div className="text-[11px] text-muted-foreground">Visual schedule builder with English translation</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Certifications Link */}
            <Link
              to="/certification"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
            >
              Certifications
            </Link>

            {/* 5. Cheat Sheets Link */}
            <Link
              to="/cheat-sheets"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
            >
              Cheat Sheets
            </Link>

            {/* 6. Lab Link */}
            <Link
              to="/lab"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition flex items-center gap-1"
            >
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Lab</span>
            </Link>
          </nav>

          {/* Right Action Row */}
          <div className="flex items-center gap-3">
            {/* Cmd+K Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              title="Search everything (Ctrl+K / Cmd+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Quick search...</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
                >
                  <User className="h-3.5 w-3.5" /> Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="hidden sm:block text-xs font-semibold text-muted-foreground hover:text-foreground transition px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/exam/practice"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
                >
                  Practice Exam
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border lg:hidden text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slideout Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card p-6 space-y-4 animate-in slide-in-from-top-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" /> Search distros, commands, cheat sheets...
              </span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link to="/tutorials" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                📚 Courses & Tutorials
              </Link>
              <Link to="/distros" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                💿 Distro Directory
              </Link>
              <Link to="/distro-finder" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                ✨ Distro Finder Quiz
              </Link>
              <Link to="/apps" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                🪟 App Alternatives
              </Link>
              <Link to="/gaming" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                🎮 Gaming on Linux
              </Link>
              <Link to="/hardware-compatibility" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                💻 Hardware Checker
              </Link>
              <Link to="/tools/command-translator" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                ⌨️ Command Translator
              </Link>
              <Link to="/tools/permissions-calculator" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                🛡️ Permissions Calculator
              </Link>
              <Link to="/tools/cron-builder" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                ⏰ Cron Builder
              </Link>
              <Link to="/migration-guides" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                🔄 Migration Guides
              </Link>
              <Link to="/cheat-sheets" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                📄 Cheat Sheets
              </Link>
              <Link to="/certification" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl bg-background border border-border">
                🏆 Certifications
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal Trigger */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
