import { createFileRoute } from "@tanstack/react-router";
import { AppWindow, Search, ThumbsUp, Copy, Check, ExternalLink, Plus, Filter, Sparkles, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { APPS_DATA, WindowsApp, AppAlternative } from "@/lib/apps-data";

export const Route = createFileRoute("/apps")({
  component: AppsDirectory,
});

function AppsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Community votes tracking in local storage
  const [votesState, setVotesState] = useState<Record<string, { count: number; userVoted: boolean }>>(() => {
    const initial: Record<string, { count: number; userVoted: boolean }> = {};
    APPS_DATA.forEach((app) => {
      app.alternatives.forEach((alt) => {
        const key = `${app.id}_${alt.name}`;
        initial[key] = { count: alt.votes, userVoted: false };
      });
    });
    return initial;
  });

  // Suggest modal state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ windowsApp: "", linuxAlt: "", category: "Graphics", website: "", notes: "" });
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);

  const categories = ["All", "Graphics", "Office", "Media", "Development", "Communication", "Utilities", "Gaming", "Security"];

  const handleVote = (appId: string, altName: string) => {
    const key = `${appId}_${altName}`;
    setVotesState((prev) => {
      const current = prev[key] || { count: 0, userVoted: false };
      const newVoted = !current.userVoted;
      const newCount = newVoted ? current.count + 1 : current.count - 1;
      return {
        ...prev,
        [key]: { count: newCount, userVoted: newVoted },
      };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredApps = useMemo(() => {
    return APPS_DATA.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(q) ||
        app.summary.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.alternatives.some((alt) => alt.name.toLowerCase().includes(q) || alt.description.toLowerCase().includes(q));

      const matchesCat = selectedCategory === "All" || app.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
            <AppWindow className="h-3.5 w-3.5" /> Windows to Linux Software Directory
          </div>
          <h1 className="text-4xl font-display font-bold">Linux App Alternatives</h1>
          <p className="text-muted-foreground text-base max-w-2xl mt-1">
            Find the best free and open-source Linux replacements for proprietary Windows and macOS software. Compare features, upvote community favorites, and get instant terminal install commands.
          </p>
        </div>
        <button
          onClick={() => setIsSuggestModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Suggest Alternative
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Windows app or Linux replacement (e.g. 'Photoshop', 'GIMP', 'Office', 'Discord')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* App Cards List */}
      <div className="space-y-8">
        {filteredApps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/30">
            <AppWindow className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="text-lg font-semibold">No applications found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try searching for a different app or submit a suggestion.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app.id} className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              {/* Windows App Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-secondary/80">{app.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{app.name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {app.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{app.summary}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary self-start sm:self-auto bg-primary/10 px-3 py-1 rounded-full">
                  {app.alternatives.length} Linux Alternatives
                </span>
              </div>

              {/* Linux Alternatives Grid */}
              <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {app.alternatives.map((alt) => {
                  const voteKey = `${app.id}_${alt.name}`;
                  const currentVote = votesState[voteKey] || { count: alt.votes, userVoted: false };
                  const bestInstallCmd = alt.installCmds.flatpak || alt.installCmds.apt || alt.installCmds.pacman || "";

                  return (
                    <div
                      key={alt.name}
                      className="rounded-xl border border-border bg-background/50 p-5 flex flex-col justify-between hover:border-primary/40 transition group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition">{alt.name}</h3>
                            <span className="text-[10px] font-semibold text-emerald-500">{alt.license}</span>
                          </div>
                          <button
                            onClick={() => handleVote(app.id, alt.name)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                              currentVote.userVoted
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                            }`}
                            title="Upvote this alternative"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{currentVote.count}</span>
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{alt.description}</p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {alt.packageTypes.map((pkg) => (
                            <span key={pkg} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              {pkg}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-border/60">
                        {bestInstallCmd && (
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border font-mono text-[11px]">
                            <span className="text-muted-foreground truncate">{bestInstallCmd}</span>
                            <button
                              onClick={() => copyToClipboard(bestInstallCmd)}
                              className="p-1 rounded text-muted-foreground hover:text-primary shrink-0 transition"
                              title="Copy install command"
                            >
                              {copiedCmd === bestInstallCmd ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        )}
                        <a
                          href={alt.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        >
                          Visit Website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggest Alternative Modal */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-xl font-bold">Suggest an App Alternative</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Help fellow Linux users discover great software.</p>
              </div>
              <button onClick={() => setIsSuggestModalOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {suggestSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold">Thank You!</h4>
                <p className="text-sm text-muted-foreground">Your app suggestion has been recorded for review by the community.</p>
                <button
                  onClick={() => {
                    setIsSuggestModalOpen(false);
                    setSuggestSubmitted(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSuggestSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-semibold block mb-1">Windows / Mac Software</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AutoCAD, Ableton Live, Notion"
                    value={suggestForm.windowsApp}
                    onChange={(e) => setSuggestForm({ ...suggestForm, windowsApp: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Recommended Linux Alternative</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FreeCAD, Bitwig Studio, Obsidian"
                    value={suggestForm.linuxAlt}
                    onChange={(e) => setSuggestForm({ ...suggestForm, linuxAlt: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <select
                      value={suggestForm.category}
                      onChange={(e) => setSuggestForm({ ...suggestForm, category: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
                    >
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Website URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={suggestForm.website}
                      onChange={(e) => setSuggestForm({ ...suggestForm, website: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Why is this a great alternative?</label>
                  <textarea
                    rows={3}
                    placeholder="Notes on installation, compatibility, and features..."
                    value={suggestForm.notes}
                    onChange={(e) => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSuggestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-[var(--shadow-glow)]"
                  >
                    Submit Alternative
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
