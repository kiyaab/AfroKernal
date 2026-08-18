import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Disc,
  Search,
  X,
  Check,
  ExternalLink,
  Download,
  Scale,
  Sparkles,
  Filter,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { DISTROS_DATA, LinuxDistro } from "@/lib/distros-data";

export const Route = createFileRoute("/distros/")({
  component: DistrosIndex,
});

function DistrosIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBase, setSelectedBase] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedRelease, setSelectedRelease] = useState<string>("All");
  const [showOldHardwareOnly, setShowOldHardwareOnly] = useState(false);

  // Compare drawer: holds up to 3 distro IDs
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Distro detail modal
  const [viewingDistro, setViewingDistro] = useState<LinuxDistro | null>(null);

  const bases = ["All", "Debian", "Ubuntu", "Arch", "Red Hat / Fedora", "Independent", "openSUSE"];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  const releaseModels = ["All", "Regular / LTS", "Rolling", "Immutable"];

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const filteredDistros = useMemo(() => {
    return DISTROS_DATA.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.packageManager.toLowerCase().includes(q) ||
        d.defaultDesktop.toLowerCase().includes(q);

      const matchesBase = selectedBase === "All" || d.base === selectedBase;
      const matchesDifficulty = selectedDifficulty === "All" || d.difficulty === selectedDifficulty;
      const matchesRelease = selectedRelease === "All" || d.releaseModel.includes(selectedRelease);
      const matchesHardware = !showOldHardwareOnly || d.runsOnOldHardware;

      return matchesSearch && matchesBase && matchesDifficulty && matchesRelease && matchesHardware;
    });
  }, [searchQuery, selectedBase, selectedDifficulty, selectedRelease, showOldHardwareOnly]);

  const comparedDistros = useMemo(() => {
    return DISTROS_DATA.filter((d) => compareIds.includes(d.id));
  }, [compareIds]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
            <Disc className="h-3.5 w-3.5" /> Curated Linux Directory & Comparator
          </div>
          <h1 className="text-4xl font-display font-bold">Linux Distributions</h1>
          <p className="text-muted-foreground text-base max-w-2xl mt-1">
            Browse, filter, and compare Linux distributions side-by-side on difficulty, desktop
            environments, package managers, and hardware requirements.
          </p>
        </div>
        <Link
          to="/distro-finder"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" /> Take Distro Finder Quiz
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by distro name, desktop (GNOME, KDE), package manager (APT, DNF, Pacman)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowOldHardwareOnly(!showOldHardwareOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              showOldHardwareOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            🍃 Runs on Low-Spec / Old Hardware
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-border/60 text-xs">
          {/* Base */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Base:</span>
            <div className="flex flex-wrap gap-1">
              {bases.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBase(b)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    selectedBase === b
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Level:</span>
            <div className="flex flex-wrap gap-1">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    selectedDifficulty === diff
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Release */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Release:</span>
            <div className="flex flex-wrap gap-1">
              {releaseModels.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRelease(r)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    selectedRelease === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between mb-6 text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredDistros.length}</strong> of{" "}
          {DISTROS_DATA.length} distributions
        </span>
        {(searchQuery ||
          selectedBase !== "All" ||
          selectedDifficulty !== "All" ||
          selectedRelease !== "All" ||
          showOldHardwareOnly) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedBase("All");
              setSelectedDifficulty("All");
              setSelectedRelease("All");
              setShowOldHardwareOnly(false);
            }}
            className="text-primary hover:underline font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Distros Grid */}
      {filteredDistros.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/30">
          <Disc className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-semibold">No distributions match your filters</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try resetting or broadening your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDistros.map((d) => {
            const isCompared = compareIds.includes(d.id);
            return (
              <div
                key={d.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-lg group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 rounded-xl bg-primary/10">{d.logo}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                          {d.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">{d.base} base</span>
                      </div>
                    </div>
                    {d.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        {d.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {d.tagline}
                  </p>

                  <div className="space-y-1.5 py-3 border-y border-border/60 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desktop:</span>
                      <span className="font-medium text-foreground">{d.defaultDesktop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pkg Manager:</span>
                      <span className="font-mono text-foreground">{d.packageManager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span
                        className={`font-semibold ${
                          d.difficulty === "Beginner"
                            ? "text-emerald-500"
                            : d.difficulty === "Intermediate"
                              ? "text-amber-500"
                              : "text-rose-500"
                        }`}
                      >
                        {d.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Model:</span>
                      <span className="text-foreground">{d.releaseModel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingDistro(d)}
                      className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => toggleCompare(d.id)}
                      disabled={!isCompared && compareIds.length >= 3}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                        isCompared
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40"
                      }`}
                      title={isCompared ? "Remove from comparison" : "Add to comparison (up to 3)"}
                    >
                      {isCompared ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Scale className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Floating Bar (if items selected) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5">
          <div className="rounded-2xl border border-primary/40 bg-card/95 p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Comparing ({compareIds.length}/3):
              </span>
              <div className="flex items-center gap-2">
                {comparedDistros.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-xs font-semibold text-foreground"
                  >
                    {d.logo} {d.name}
                    <button
                      onClick={() => toggleCompare(d.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)]"
              >
                Compare Now ({compareIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Side-by-Side Distro Comparison</h2>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div
                className={`grid gap-4 ${comparedDistros.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              >
                {comparedDistros.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-border bg-background/60 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{d.logo}</span>
                      <div>
                        <h3 className="text-xl font-bold">{d.name}</h3>
                        <span className="text-xs text-muted-foreground">{d.base} base</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.tagline}</p>

                    <div className="space-y-2 text-xs pt-3 border-t border-border">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Difficulty</span>
                        <span className="font-semibold">{d.difficulty}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Release Model</span>
                        <span>{d.releaseModel}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Default Desktop</span>
                        <span>{d.defaultDesktop}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Package Manager</span>
                        <span className="font-mono">{d.packageManager}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Min / Rec RAM</span>
                        <span>
                          {d.minRamGb}GB / {d.recommendedRamGb}GB
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Gaming Score</span>
                        <span className="font-bold text-primary">{d.gamingScore} / 10</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Developer Score</span>
                        <span className="font-bold text-primary">{d.developerScore} / 10</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-emerald-500">Key Strengths:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {d.pros.slice(0, 2).map((p, i) => (
                          <li key={i} className="flex gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={d.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition"
                    >
                      <Download className="h-3.5 w-3.5" /> Download ISO
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Distro Detail Modal */}
      {viewingDistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{viewingDistro.logo}</span>
                <div>
                  <h2 className="text-2xl font-bold">{viewingDistro.name}</h2>
                  <p className="text-xs text-muted-foreground">{viewingDistro.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDistro(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Overview
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {viewingDistro.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[11px] text-muted-foreground block">Base System</span>
                  <span className="font-semibold text-sm">{viewingDistro.base}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[11px] text-muted-foreground block">Difficulty</span>
                  <span className="font-semibold text-sm">{viewingDistro.difficulty}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[11px] text-muted-foreground block">Default Desktop</span>
                  <span className="font-semibold text-sm">{viewingDistro.defaultDesktop}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[11px] text-muted-foreground block">Package Manager</span>
                  <span className="font-mono text-sm">{viewingDistro.packageManager}</span>
                </div>
              </div>

              {/* Install Command */}
              <div className="p-4 rounded-xl border border-border bg-background">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Package Install Command Syntax:
                </span>
                <code className="font-mono text-xs text-primary">
                  {viewingDistro.packageManagerCmd}
                </code>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
                    Pros / Strengths
                  </span>
                  <ul className="text-xs space-y-1.5 text-foreground/90">
                    {viewingDistro.pros.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">
                    Considerations / Cons
                  </span>
                  <ul className="text-xs space-y-1.5 text-foreground/90">
                    {viewingDistro.cons.map((c, i) => (
                      <li key={i} className="flex gap-2">
                        <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <a
                  href={viewingDistro.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)]"
                >
                  <Download className="h-4 w-4" /> Download Official ISO
                </a>
                <a
                  href={viewingDistro.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition text-muted-foreground hover:text-foreground"
                >
                  Official Website <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
