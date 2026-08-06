import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, Highlighter, Maximize2, Minimize2, Type, X } from "lucide-react";

export function NotesViewer({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [reading, setReading] = useState(false);

  const words = useMemo(
    () => content.replace(/[#*`>\-\[\]()]/g, " ").split(/\s+/).filter(Boolean).length,
    [content],
  );
  const readMin = Math.max(1, Math.ceil(words / 180));

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

  const proseSize =
    fontSize === "sm"
      ? "prose-sm"
      : fontSize === "lg"
        ? "prose-lg"
        : fontSize === "xl"
          ? "prose-xl"
          : "prose-base";

  const FontControls = ({ dark }: { dark?: boolean }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border p-1 ${
        dark ? "border-white/15 bg-white/5" : "border-border bg-background"
      }`}
    >
      <Type className={`ml-1 h-3.5 w-3.5 ${dark ? "text-white/50" : "text-muted-foreground"}`} />
      {(["sm", "base", "lg", "xl"] as const).map((sz) => (
        <button
          key={sz}
          type="button"
          onClick={() => setFontSize(sz)}
          className={`rounded-md px-2 py-1 text-[11px] font-medium ${
            fontSize === sz
              ? dark
                ? "bg-primary text-primary-foreground"
                : "bg-primary text-primary-foreground"
              : dark
                ? "hover:bg-white/10"
                : "hover:bg-accent"
          }`}
        >
          {sz === "sm" ? "A" : sz === "base" ? "A+" : sz === "lg" ? "A++" : "A+++"}
        </button>
      ))}
    </div>
  );

  const article = (
    <article
      className={`prose dark:prose-invert max-w-none ${proseSize} prose-pre:bg-[oklch(0.11_0.01_260)] prose-pre:text-[oklch(0.97_0.01_90)] prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-headings:font-display`}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-[11px] text-muted-foreground">
                {words} words · ~{readMin} min read
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FontControls />
            <button
              type="button"
              onClick={() => setReading(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Reading mode
            </button>
          </div>
        </div>

        <div className="px-5 py-6">{article}</div>
      </div>

      {reading && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[oklch(0.98_0.01_95)] text-[oklch(0.22_0.02_260)] dark:bg-[oklch(0.14_0.01_260)] dark:text-[oklch(0.96_0.01_90)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-2">
              <Highlighter className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="text-[11px] opacity-60">Reading mode · Esc to exit · ~{readMin} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FontControls dark />
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
                className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-14">{article}</div>
          </div>
        </div>
      )}
    </>
  );
}
