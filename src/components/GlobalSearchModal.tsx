import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  Disc,
  Terminal,
  AppWindow,
  FileText,
  ArrowRight,
  CornerDownLeft,
  GraduationCap,
} from "lucide-react";
import { DISTROS_DATA } from "@/lib/distros-data";
import { APPS_DATA } from "@/lib/apps-data";
import { COMMANDS_DATA } from "@/lib/commands-data";
import { CHEATSHEETS_DATA } from "@/lib/cheatsheets-data";
import { CATALOG_COURSES } from "@/lib/courses-catalog-data";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return null;
    const q = query.toLowerCase();

    const distros = DISTROS_DATA.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.base.toLowerCase().includes(q),
    ).slice(0, 3);

    const apps = APPS_DATA.flatMap((app) => {
      const matchApp = app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
      const matchedAlts = app.alternatives.filter(
        (alt) => alt.name.toLowerCase().includes(q) || alt.description.toLowerCase().includes(q),
      );
      if (matchApp || matchedAlts.length > 0) {
        return [{ app, matchedAlts }];
      }
      return [];
    }).slice(0, 3);

    const commands = COMMANDS_DATA.filter(
      (c) =>
        c.windowsCmd.toLowerCase().includes(q) ||
        c.linuxCmd.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    ).slice(0, 4);

    const courses = CATALOG_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)),
    ).slice(0, 3);

    const cheatsheets = CHEATSHEETS_DATA.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.sections.some(
          (s) =>
            s.sectionTitle.toLowerCase().includes(q) ||
            s.items.some(
              (item) =>
                item.command.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q),
            ),
        ),
    ).slice(0, 3);

    return { courses, distros, apps, commands, cheatsheets };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search courses, distros, commands, cheat sheets... (e.g. 'Red Hat', 'chmod', 'ubuntu')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Quick Suggestions</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {["Red Hat", "Linux Course", "Ubuntu", "chmod", "Photoshop", "Vim", "RHCSA"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition"
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {query && results && (
            <>
              {/* Courses */}
              {results.courses.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" /> Interactive Courses &
                    Certifications
                  </div>
                  <div className="space-y-2">
                    {results.courses.map((course) => (
                      <Link
                        key={course.id}
                        to="/courses/$slug"
                        params={{ slug: course.slug }}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {course.slug === "rhel" ? "🎩" : "🎓"}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground group-hover:text-primary truncate">
                              {course.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {course.subtitle || course.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {course.category}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Commands */}
              {results.commands.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Terminal className="h-3.5 w-3.5 text-primary" /> Command Translator
                  </div>
                  <div className="space-y-2">
                    {results.commands.map((cmd) => (
                      <Link
                        key={cmd.windowsCmd}
                        to="/tools/command-translator"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {cmd.windowsCmd}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="font-mono text-xs font-semibold text-primary">
                            {cmd.linuxCmd}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {cmd.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Distros */}
              {results.distros.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Disc className="h-3.5 w-3.5 text-primary" /> Linux Distributions
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results.distros.map((d) => (
                      <Link
                        key={d.id}
                        to="/distros"
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition group"
                      >
                        <span className="text-2xl">{d.logo}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-foreground group-hover:text-primary">
                            {d.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{d.tagline}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Apps */}
              {results.apps.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <AppWindow className="h-3.5 w-3.5 text-primary" /> App Alternatives
                  </div>
                  <div className="space-y-2">
                    {results.apps.map(({ app }) => (
                      <Link
                        key={app.id}
                        to="/apps"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{app.icon}</span>
                          <div>
                            <span className="text-sm font-medium text-foreground">{app.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({app.alternatives.length} Linux alts)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <span>{app.alternatives[0]?.name}</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Cheat Sheets */}
              {results.cheatsheets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Cheat Sheets
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results.cheatsheets.map((cs) => (
                      <Link
                        key={cs.id}
                        to="/cheat-sheets"
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition group"
                      >
                        <span className="text-2xl">{cs.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-foreground group-hover:text-primary">
                            {cs.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{cs.summary}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {results.courses.length === 0 &&
                results.distros.length === 0 &&
                results.apps.length === 0 &&
                results.commands.length === 0 &&
                results.cheatsheets.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for{" "}
                    <span className="font-semibold text-foreground">"{query}"</span>. Try another
                    keyword or browse courses.
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> select
            </span>
          </div>
          <span>LinuxBasecamp Quick Search</span>
        </div>
      </div>
    </div>
  );
}
