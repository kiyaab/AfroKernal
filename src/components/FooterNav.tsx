import { Link } from "@tanstack/react-router";
import { Terminal, Heart, ArrowUpRight } from "lucide-react";

const LOGO_URL = "/afrokernel-logo.png";

export function FooterNav() {
  return (
    <footer className="border-t border-border/80 bg-card/30 pt-16 pb-12 text-xs">
      <div className="mx-auto max-w-7xl px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="AfroKernel" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-bold text-foreground">
              Afro<span className="text-primary">Kernel</span>
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-sm">
            Your home to learn Linux. High-quality tutorials, interactive tools, app alternatives, distro comparisons, and verifiable certifications. 100% free and open education for everyone.
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for the global Linux community.</span>
          </div>
        </div>

        {/* Column 1: Learning */}
        <div className="space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">Courses & Exams</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/tutorials" className="hover:text-primary transition">All Curriculum Tracks</Link></li>
            <li><Link to="/tutorials" className="hover:text-primary transition">Linux Fundamentals 2026</Link></li>
            <li><Link to="/tutorials" className="hover:text-primary transition">Cybersecurity Fundamentals</Link></li>
            <li><Link to="/tutorials" className="hover:text-primary transition">DevOps & Containers</Link></li>
            <li><Link to="/exam/practice" className="hover:text-primary transition">Practice Exam Simulator</Link></li>
            <li><Link to="/certification" className="hover:text-primary transition">Certifications Overview</Link></li>
          </ul>
        </div>

        {/* Column 2: Explore */}
        <div className="space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">Explore & Guides</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/distros" className="hover:text-primary transition">Linux Distributions</Link></li>
            <li><Link to="/distro-finder" className="hover:text-primary transition">Distro Finder Quiz</Link></li>
            <li><Link to="/apps" className="hover:text-primary transition">Windows App Alternatives</Link></li>
            <li><Link to="/gaming" className="hover:text-primary transition">Gaming on Linux & Proton</Link></li>
            <li><Link to="/hardware-compatibility" className="hover:text-primary transition">Hardware Compatibility</Link></li>
            <li><Link to="/migration-guides" className="hover:text-primary transition">OS Migration Guides</Link></li>
          </ul>
        </div>

        {/* Column 3: Interactive Tools */}
        <div className="space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">Tools & Cheat Sheets</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/tools/command-translator" className="hover:text-primary transition">Command Translator</Link></li>
            <li><Link to="/tools/permissions-calculator" className="hover:text-primary transition">Permissions Calculator</Link></li>
            <li><Link to="/tools/cron-builder" className="hover:text-primary transition">Cron Expression Builder</Link></li>
            <li><Link to="/cheat-sheets" className="hover:text-primary transition">Linux Cheat Sheets</Link></li>
            <li><Link to="/lab" className="hover:text-primary transition">Browser Linux Sandbox</Link></li>
            <li><Link to="/chat" className="hover:text-primary transition">AI Linux Tutor</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-6 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground">
        <p>© 2026 AfroKernel · Your Home to Learn Linux. Free, forever.</p>
        <div className="flex items-center gap-6">
          <Link to="/terms" className="hover:text-primary transition">Terms of Service</Link>
          <Link to="/terms" className="hover:text-primary transition">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
