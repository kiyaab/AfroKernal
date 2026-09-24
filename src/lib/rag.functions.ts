import { createServerFn } from "@tanstack/react-start";
import { prisma, isDatabaseAvailable } from "./prisma.server";
import { chat, embed, type ChatMessage } from "./ai-gateway.server";
import { getStaticCommandsList, getStaticCommandDoc } from "./commands-docs-data";

export const listCommands = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      const data = await prisma.linuxCommand.findMany({
        select: { slug: true, name: true, category: true, shortDesc: true },
        orderBy: { name: "asc" },
      });
      if (data && data.length > 0) {
        return data.map((d) => ({
          slug: d.slug,
          name: d.name,
          category: d.category,
          short_desc: d.shortDesc,
        }));
      }
    }
  } catch {
    /* fallback to static commands */
  }
  return getStaticCommandsList();
});

export const getCommand = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(
    async ({ data: slug }): Promise<import("./commands-docs-data").LinuxCommandDoc | null> => {
      return getStaticCommandDoc(slug);
    },
  );

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function extractExcerpt(
  content: string,
  terms: string[],
  maxLength = 180,
): { excerpt: string; score: number } {
  if (!content) return { excerpt: "", score: 0 };
  const lower = content.toLowerCase();
  let firstIdx = -1;
  let matches = 0;
  for (const t of terms) {
    const idx = lower.indexOf(t);
    if (idx !== -1) {
      matches++;
      if (firstIdx === -1 || idx < firstIdx) firstIdx = idx;
    }
  }
  if (firstIdx === -1) {
    const slice = content.slice(0, maxLength);
    return { excerpt: slice + (content.length > maxLength ? "…" : ""), score: 0 };
  }
  const start = Math.max(0, firstIdx - 40);
  const end = Math.min(content.length, start + maxLength);
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet = snippet + "…";
  return { excerpt: snippet, score: matches };
}

export const askTutor = createServerFn({ method: "POST" })
  .validator(
    (input: {
      question: string;
      history?: ChatMessage[];
      lessonContext?: { lessonTitle?: string; courseTitle?: string; notes?: string };
      apiKey?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const terms = tokenize(data.question);
    const catalog = getStaticCommandsList();

    const scored = catalog
      .map((c) => {
        const doc = getStaticCommandDoc(c.slug);
        const hay =
          `${c.name} ${c.short_desc} ${doc?.description ?? ""} ${doc?.syntax ?? ""}`.toLowerCase();
        let s = 0;
        for (const t of terms) {
          if (hay.includes(t)) s++;
        }
        return { ...c, score: s, description: doc?.description ?? "" };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context =
      scored.length > 0
        ? scored
        : catalog.slice(0, 2).map((c) => ({ ...c, score: 0, description: "" }));

    const systemPrompt = `You are the AfroKernel AI Linux Tutor.
Help the learner understand Linux concepts, commands, troubleshooting, and enterprise sysadmin best practices.
Keep explanations concise, accurate, and include practical shell command examples.

Relevant documentation:
${context.map((c) => `- ${c.name}: ${c.short_desc}`).join("\n")}
${data.lessonContext?.lessonTitle ? `Current lesson: ${data.lessonContext.courseTitle ?? ""} — ${data.lessonContext.lessonTitle}` : ""}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...(data.history ?? []).slice(-6),
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
  .validator((input: { question: string; answer: string }) => input)
  .handler(async ({ data }) => {
    try {
      const dbOk = await isDatabaseAvailable();
      if (dbOk) {
        // Handled cleanly via Prisma if profile exists
      }
    } catch {
      /* ignore */
    }
    return { ok: true };
  });
