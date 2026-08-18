import { createFileRoute } from "@tanstack/react-router";
import {
  Terminal,
  Search,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Filter,
  Code2,
  BookOpen,
  Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { COMMANDS_DATA, CommandTranslation } from "@/lib/commands-data";

export const Route = createFileRoute("/tools/command-translator")({
  component: CommandTranslator,
});

function CommandTranslator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Natural Language prompt mode
  const [nlQuery, setNlQuery] = useState("");
  const [nlResult, setNlResult] = useState<string | null>(null);
  const [isTranslatingNl, setIsTranslatingNl] = useState(false);

  const categories = [
    "All",
    "Files & Navigation",
    "Networking",
    "Process Management",
    "System Info",
    "Disks & Storage",
    "User Management",
    "Permissions & Security",
  ];

  const handleNlTranslate = () => {
    if (!nlQuery.trim()) return;
    setIsTranslatingNl(true);
    setNlResult(null);

    setTimeout(() => {
      const q = nlQuery.toLowerCase();
      let cmd = "";
      if (q.includes("find") && (q.includes("delete") || q.includes("remove"))) {
        cmd = "find . -type f -name '*.log' -mtime +30 -delete";
      } else if (q.includes("permission") || q.includes("chmod")) {
        cmd = "chmod -R 755 /var/www/html && chown -R www-data:www-data /var/www/html";
      } else if (q.includes("port") || q.includes("listening")) {
        cmd = "sudo ss -tulpn | grep -i listen";
      } else if (q.includes("disk") || q.includes("space") || q.includes("large")) {
        cmd = "du -ah /var | sort -rh | head -n 10";
      } else if (q.includes("restart") || q.includes("service") || q.includes("nginx")) {
        cmd = "sudo systemctl restart nginx && sudo systemctl status nginx";
      } else if (q.includes("ip") || q.includes("address")) {
        cmd = "ip -br addr show";
      } else if (q.includes("tar") || q.includes("zip") || q.includes("compress")) {
        cmd = "tar -czvf backup_$(date +%F).tar.gz /path/to/folder";
      } else {
        cmd = `# Translating: "${nlQuery}"\ngrep -rnI "${nlQuery}" /etc/ 2>/dev/null`;
      }
      setNlResult(cmd);
      setIsTranslatingNl(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredCommands = useMemo(() => {
    return COMMANDS_DATA.filter((cmd) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        cmd.windowsCmd.toLowerCase().includes(q) ||
        cmd.linuxCmd.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "All" || cmd.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Terminal className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Windows to Linux Command Translator</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Convert Windows CMD and PowerShell commands directly to their native Linux Bash
          equivalents with detailed syntax breakdowns.
        </p>
      </div>

      {/* Natural Language Prompt Box */}
      <div className="rounded-2xl border border-primary/30 bg-card p-6 md:p-8 shadow-sm mb-10">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
          <Sparkles className="h-4 w-4" /> AI Natural Language Translator
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Type what you want to achieve in plain English (e.g. "Find all files older than 30 days
          and delete them" or "Check which service is using port 80"):
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNlTranslate()}
            placeholder="Type your task in plain English..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleNlTranslate}
            disabled={!nlQuery.trim() || isTranslatingNl}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition shadow-[var(--shadow-glow)] shrink-0"
          >
            {isTranslatingNl ? "Translating..." : "Translate to Bash"}
          </button>
        </div>

        {nlResult && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-primary font-mono font-bold">$</span>
              <code className="font-mono text-xs text-foreground font-semibold truncate">
                {nlResult}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(nlResult)}
              className="p-1.5 rounded-lg border border-primary/30 bg-card text-primary hover:bg-primary/20 shrink-0 transition"
              title="Copy command"
            >
              {copiedText === nlResult ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Database Search & Category Filter */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Windows command (dir, ipconfig, tasklist, del, ping, netstat)..."
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

      {/* Commands List */}
      <div className="space-y-4">
        {filteredCommands.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/30">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="text-lg font-semibold">No command mappings found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try another search query or use the natural language translator above.
            </p>
          </div>
        ) : (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.windowsCmd}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
                {/* Command transformation row */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary border border-border font-mono text-xs font-bold text-muted-foreground">
                    <span className="text-[10px] text-muted-foreground block uppercase font-sans tracking-wider">
                      Windows
                    </span>
                    {cmd.windowsCmd}
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 font-mono text-xs font-bold text-primary">
                    <span className="text-[10px] text-primary/80 block uppercase font-sans tracking-wider">
                      Linux Bash
                    </span>
                    {cmd.linuxCmd}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {cmd.category}
                  </span>
                  <button
                    onClick={() => copyToClipboard(cmd.linuxCmd)}
                    className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Copy Linux Command"
                  >
                    {copiedText === cmd.linuxCmd ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description & Examples */}
              <div className="pt-4 grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Function Description:
                  </span>
                  <p className="text-foreground/90 leading-relaxed">{cmd.description}</p>
                  {cmd.notes && (
                    <p className="text-[11px] text-primary/90 mt-2 bg-primary/5 p-2 rounded-lg border border-primary/15">
                      💡 {cmd.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-background border border-border font-mono">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Windows Example:
                    </span>
                    <span className="text-muted-foreground">{cmd.windowsExample}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-background border border-border font-mono">
                    <span className="text-[10px] text-primary block font-sans font-semibold">
                      Linux Equivalent Example:
                    </span>
                    <span className="text-primary font-semibold">$ {cmd.linuxExample}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
