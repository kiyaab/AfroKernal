import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Search,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Printer,
  Sparkles,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { CHEATSHEETS_DATA, CheatSheetCategory } from "@/lib/cheatsheets-data";

export const Route = createFileRoute("/cheat-sheets")({
  component: CheatSheets,
});

function CheatSheets() {
  const [selectedSheetId, setSelectedSheetId] = useState<string>(CHEATSHEETS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeSheet = CHEATSHEETS_DATA.find((s) => s.id === selectedSheetId) || CHEATSHEETS_DATA[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return activeSheet.sections;
    const q = searchQuery.toLowerCase();

    return activeSheet.sections
      .map((sec) => {
        const filteredItems = sec.items.filter(
          (item) =>
            item.command.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.example && item.example.toLowerCase().includes(q)),
        );
        return { ...sec, items: filteredItems };
      })
      .filter((sec) => sec.items.length > 0);
  }, [activeSheet, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
            <FileText className="h-3.5 w-3.5" /> High-Density Reference Library
          </div>
          <h1 className="text-4xl font-display font-bold">Linux Cheat Sheets</h1>
          <p className="text-muted-foreground text-base max-w-2xl mt-1">
            Quick-reference cheat sheets for the tools you use every day. Search commands, copy
            snippets in 1 click, or print to keep on your desk.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Cheat Sheet Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {CHEATSHEETS_DATA.map((sheet) => {
          const isSelected = sheet.id === selectedSheetId;
          return (
            <button
              key={sheet.id}
              onClick={() => {
                setSelectedSheetId(sheet.id);
                setSearchQuery("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span>{sheet.icon}</span>
              <span>{sheet.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Cheat Sheet Container */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 rounded-2xl bg-secondary/80">{activeSheet.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeSheet.title} Cheat Sheet
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeSheet.summary}</p>
            </div>
          </div>

          {/* Search bar inside sheet */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeSheet.title} commands...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Sections */}
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/30">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-sm text-muted-foreground">No commands matched "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map((sec) => (
              <div key={sec.sectionTitle} className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {sec.sectionTitle}
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  {sec.items.map((item) => (
                    <div
                      key={item.command}
                      className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between hover:border-primary/40 transition group"
                    >
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg truncate">
                            {item.command}
                          </code>
                          <button
                            onClick={() => copyToClipboard(item.command)}
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground shrink-0 transition"
                            title="Copy command"
                          >
                            {copiedCmd === item.command ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {item.example && (
                        <div className="pt-2 border-t border-border/60 font-mono text-[11px] text-muted-foreground">
                          <span className="text-[10px] text-muted-foreground/60 block font-sans">
                            Example:
                          </span>
                          <span className="text-foreground/90 whitespace-pre-wrap">
                            {item.example}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
