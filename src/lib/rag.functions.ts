import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { chat, embed, type ChatMessage } from "./ai-gateway.server";

function serverPublic() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCommands = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await sb
    .from("linux_commands")
    .select("slug,name,category,short_desc")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCommand = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = serverPublic();
    const { data, error } = await sb
      .from("linux_commands")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

// Extract a ~500-char window around the strongest keyword match.
function extractExcerpt(text: string, terms: string[]): { excerpt: string; startOffset: number } {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return { excerpt: "", startOffset: 0 };
  const lower = clean.toLowerCase();
  let best = { idx: -1, term: "" };
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase());
    if (i >= 0 && (best.idx === -1 || i < best.idx)) best = { idx: i, term: t };
  }
  const idx = best.idx >= 0 ? best.idx : 0;
  const start = Math.max(0, idx - 120);
  const end = Math.min(clean.length, start + 480);
  const excerpt = (start > 0 ? "…" : "") + clean.slice(start, end) + (end < clean.length ? "…" : "");
  return { excerpt, startOffset: start };
}

export type TutorLessonContext = {
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
  lessonType?: string;
};

export const askTutor = createServerFn({ method: "POST" })
  .validator((input: {
    question: string;
    history?: ChatMessage[];
    apiKey?: string;
    lessonContext?: TutorLessonContext;
  }) => input)
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const terms = (data.question.toLowerCase().match(/[a-z][a-z0-9-]+/g) ?? []).filter((t) => t.length > 2).slice(0, 8);
    type Row = { name: string; slug: string; short_desc: string; description: string };
    let context: Row[] = [];
    try {
      const vec = await embed(data.question, data.apiKey);
      const { data: matches } = await sb.rpc("match_commands", {
        query_embedding: vec as unknown as string,
        match_count: 4,
      });
      if (Array.isArray(matches) && matches.length > 0) context = matches as Row[];
    } catch {
      /* ignore — fall back to keyword search */
    }
    if (context.length === 0) {
      const or = terms.map((t) => `name.ilike.%${t}%,short_desc.ilike.%${t}%,description.ilike.%${t}%`).join(",");
      if (or) {
        const { data: rows } = await sb
          .from("linux_commands").select("name,slug,short_desc,description").or(or).limit(4);
        context = (rows ?? []) as Row[];
      }
    }

    const contextBlock = context
      .map((c) => `## ${c.name} (${c.slug})\n${c.short_desc}\n${c.description}`)
      .join("\n\n");

    const lc = data.lessonContext;
    const lessonBlock = lc?.lessonTitle
      ? [
          `# Current lesson context`,
          `Course: ${lc.courseTitle ?? "AfroKernel course"}`,
          `Lesson: ${lc.lessonTitle}${lc.lessonType ? ` (${lc.lessonType})` : ""}`,
          lc.lessonContent
            ? `Lesson notes (excerpt):\n${lc.lessonContent.replace(/\s+/g, " ").trim().slice(0, 2500)}`
            : "",
          `Help the learner master THIS lesson. Prefer explanations tied to these notes when relevant.`,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are AfroKernel Tutor — the learning mind of AfroKernel. You are a warm, expert Linux administration mentor. " +
          "Explain clearly, use short paragraphs, prefer real commands in fenced ```bash blocks, and cite the AfroKernel command reference by name when relevant. " +
          "If the user asks about a command that appears in the reference below, ground your answer in it. Do not invent flags. Be encouraging. " +
          "When lesson context is provided, teach from that lesson first — quiz, explain, debug, and suggest practice commands.\n\n" +
          (lessonBlock ? `${lessonBlock}\n\n` : "") +
          (contextBlock
            ? `# AfroKernel Reference (retrieved):\n${contextBlock}`
            : "# AfroKernel Reference: (no direct match found; answer from general Linux knowledge)"),
      },
      ...(data.history ?? []),
      { role: "user", content: data.question },
    ];

    const answer = await chat(messages, data.apiKey);
    const sources = context.map((c) => {
      const { excerpt } = extractExcerpt(`${c.short_desc}\n${c.description}`, terms);
      return { name: c.name, slug: c.slug, short_desc: c.short_desc, excerpt, matchedTerms: terms };
    });
    return { answer, sources };
  });

export const saveConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { question: string; answer: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: conv } = await context.supabase
      .from("chat_conversations")
      .insert({ user_id: context.userId, title: data.question.slice(0, 80) })
      .select("id")
      .single();
    const convId = (conv as { id?: string } | null)?.id;
    if (convId) {
      await context.supabase.from("chat_messages").insert([
        { conversation_id: convId, user_id: context.userId, role: "user", content: data.question },
        { conversation_id: convId, user_id: context.userId, role: "assistant", content: data.answer },
      ]);
    }
    return { ok: true };
  });
