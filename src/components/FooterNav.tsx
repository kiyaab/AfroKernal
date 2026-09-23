import { Link } from "@tanstack/react-router";

const LOGO_URL = "/afrokernel-logo.png";

export function FooterNav() {
  return (
    <footer className="border-t border-border/70 bg-card/20 py-10 text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-border/50">
          {/* Brand */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="AfroKernel" className="h-7 w-7 object-contain" />
              <span className="font-display text-base font-bold text-foreground tracking-tight">
                Afro<span className="text-primary">Kernel</span>
              </span>
            </div>
            <p className="text-muted-foreground/80 text-xs">
              Free, friendly, and open Linux learning for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <Link to="/courses" className="hover:text-primary transition">
              Courses
            </Link>
            <Link to="/tutorials" className="hover:text-primary transition">
              Tutorials
            </Link>
            <Link to="/distros" className="hover:text-primary transition">
              Distros
            </Link>
            <Link to="/apps" className="hover:text-primary transition">
              App Alternatives
            </Link>
            <Link to="/lab" className="hover:text-primary transition">
              Lab
            </Link>
            <Link to="/cheat-sheets" className="hover:text-primary transition">
              Cheat Sheets
            </Link>
            <Link to="/terms" className="hover:text-primary transition">
              Terms & Privacy
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground/60">
          <p>© 2026 AfroKernel. All rights reserved.</p>
          <p>Built for the global Linux community.</p>
        </div>
      </div>
    </footer>
  );
}
