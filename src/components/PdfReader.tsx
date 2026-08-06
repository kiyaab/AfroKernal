import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, FileDown, Maximize2, Minimize2, X } from "lucide-react";

export function PdfReader({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (!reading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReading(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [reading]);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-[11px] text-muted-foreground">PDF study material · Reading mode available</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReading(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Reading mode
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open
            </a>
            <a
              href={url}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent"
            >
              <FileDown className="h-3.5 w-3.5" /> Download
            </a>
          </div>
        </div>
        <div className="bg-[oklch(0.16_0.01_260)]">
          <iframe title={`${title} PDF`} src={url} className="h-[min(70vh,640px)] w-full border-0" />
        </div>
      </div>

      {reading && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[oklch(0.14_0.01_260)] text-[oklch(0.96_0.01_90)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-[11px] text-white/50">Reading mode · Esc to exit</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] hover:bg-white/10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> New tab
              </a>
              <button
                type="button"
                onClick={() => setReading(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
              >
                <Minimize2 className="h-3.5 w-3.5" /> Exit
              </button>
              <button
                type="button"
                aria-label="Close reading mode"
                onClick={() => setReading(false)}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <iframe title={`${title} reading mode`} src={url} className="min-h-0 flex-1 w-full border-0" />
        </div>
      )}
    </>
  );
}
