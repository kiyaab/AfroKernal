import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { askTutor, saveConversation } from "@/lib/rag.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";

type Source = {
  name: string;
  slug: string;
  short_desc?: string;
  excerpt?: string;
  matchedTerms?: string[];
};
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };

export type TutorLessonContext = {
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
  lessonType?: string;
};

function getApiKey() {
  if (typeof window === "undefined") return undefined;
  return (
    localStorage.getItem("afrokernel_ai_key") ||
    // fallback used by the existing AfroKernel tutor integration
    "sk-bl-ByY6O0JUgGm5ZWa4DhT8SDdiiB6zZOjaLgLaszaJHZ_AFzrX"
  );
}

function highlight(text: string, terms: string[] = []): React.ReactNode[] {
  if (!text) return [""];
  const clean = terms
    .filter((t) => t && t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (clean.length === 0) return [text];
  const rx = new RegExp(`(${clean.join("|")})`, "gi");
  const parts = text.split(rx);
  return parts.map((p, i) =>
    rx.test(p) ? (
      <mark key={i} className="rounded bg-primary/25 px-0.5 text-foreground">
        {p}
      </mark>
    ) : (
      p
    ),
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Cited from AfroKernel docs
      </p>
      {sources.map((s, i) => {
        const open = openIdx === i;
        return (
          <div
            key={s.slug + i}
            className="overflow-hidden rounded-lg border border-primary/25 bg-primary/5"
          >
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10"
            >
              <span className="font-mono text-sm text-primary">{s.name}</span>
              {s.short_desc && (
                <span className="truncate text-xs text-muted-foreground">— {s.short_desc}</span>
              )}
              <span className="flex-1" />
              <Link
                to="/docs/$command"
                params={{ command: s.slug }}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open <ExternalLink className="h-3 w-3" />
              </Link>
              {open ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
            {open && s.excerpt && (
              <div className="border-t border-primary/20 bg-background/40 px-3 py-2 text-xs leading-relaxed text-foreground/90">
                {highlight(s.excerpt, s.matchedTerms ?? [])}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type TutorChatProps = {
  lessonContext?: TutorLessonContext;
  compact?: boolean;
  initialQuestion?: string;
  suggestions?: string[];
  className?: string;
};

export function TutorChat({
  lessonContext,
  compact = false,
  initialQuestion,
  suggestions,
  className = "",
}: TutorChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialQuestion ?? "");
  const [open, setOpen] = useState(!compact);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const seededRef = useRef(false);

  const defaultSuggestions =
    suggestions ??
    (lessonContext?.lessonTitle
      ? [
          `Explain "${lessonContext.lessonTitle}" in simple terms`,
          "What commands should I practice for this lesson?",
          "Quiz me on this lesson",
          "I got stuck — help me debug",
        ]
      : [
          "How do I use grep with regex?",
          "Explain systemctl vs service",
          "Best way to tail a rotating log?",
          "How do file permissions work?",
        ]);

  const mutation = useMutation({
    mutationFn: (question: string) =>
      askTutor({
        data: {
          question,
          history: messages.map(({ role, content }) => ({ role, content })),
          apiKey: getApiKey(),
          lessonContext,
        },
      }),
    onSuccess: async (res, question) => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.answer, sources: res.sources as Source[] },
      ]);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) await saveConversation({ data: { question, answer: res.answer } });
      } catch {
        /* skip */
      }
    },
    onError: (err) => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Request failed"}`,
        },
      ]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  useEffect(() => {
    if (initialQuestion && !seededRef.current && open) {
      seededRef.current = true;
      send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    if (!open) setOpen(true);
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    mutation.mutate(trimmed);
  }

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 ${className}`}
      >
        <MessageCircle className="h-4 w-4" /> Ask AI Tutor
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl ${
        compact
          ? "fixed bottom-6 right-6 z-50 h-[min(560px,70vh)] w-[min(400px,calc(100vw-2rem))]"
          : "min-h-[420px]"
      } ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">AfroKernel AI Tutor</p>
            {lessonContext?.lessonTitle && (
              <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                Helping with: {lessonContext.lessonTitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <Link
              to="/docs"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" /> Docs
            </Link>
          )}
          {compact && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-accent"
              aria-label="Close tutor"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {lessonContext?.lessonTitle
                ? "Ask anything about this lesson — commands, errors, or concepts."
                : "Ask anything about Linux. Answers cite the AfroKernel docs."}
            </p>
            <div className="mt-4 grid gap-2">
              {defaultSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition hover:border-primary/60 hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-3">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-accent" : "bg-primary/10 text-primary"
                }`}
              >
                {m.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                  {m.role === "user" ? "You" : "Tutor"}
                </p>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-[oklch(0.11_0.01_260)] prose-pre:text-[oklch(0.97_0.01_90)] prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.sources && m.sources.length > 0 && <SourceList sources={m.sources} />}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-border/60 px-3 py-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={lessonContext ? "Ask about this lesson…" : "Ask about any Linux topic…"}
          className="max-h-28 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={mutation.isPending || !input.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
