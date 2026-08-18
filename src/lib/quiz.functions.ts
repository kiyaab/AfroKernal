import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function weekStartISO(d = new Date()): string {
  const day = d.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday-based
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return start.toISOString().slice(0, 10);
}

async function addXP(supabase: any, userId: string, xp: number) {
  if (xp <= 0) return;
  const { data } = await supabase
    .from("user_stats")
    .select("xp,level")
    .eq("user_id", userId)
    .maybeSingle();
  const currentXp = (data as { xp?: number; level?: number } | null)?.xp ?? 0;
  const nextXp = currentXp + xp;
  const nextLevel = Math.max(1, Math.floor(nextXp / 500) + 1);
  await supabase.from("user_stats").update({ xp: nextXp, level: nextLevel }).eq("user_id", userId);
  // roll up into weekly goal
  const week = weekStartISO();
  const { data: goal } = await supabase
    .from("weekly_goals")
    .select("id,earned_xp")
    .eq("user_id", userId)
    .eq("week_start", week)
    .maybeSingle();
  if (goal) {
    await supabase
      .from("weekly_goals")
      .update({ earned_xp: ((goal as any).earned_xp ?? 0) + xp })
      .eq("id", (goal as any).id);
  } else {
    await supabase
      .from("weekly_goals")
      .insert({ user_id: userId, week_start: week, earned_xp: xp });
  }
}

// ---------- QUIZ ----------
export const getLessonQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId, context }) => {
    const { data: quiz } = await context.supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (!quiz) return null;
    const { data: questions } = await context.supabase
      .from("quiz_questions")
      .select("id,prompt,choices,sort_order")
      .eq("quiz_id", (quiz as any).id)
      .order("sort_order");
    return { quiz, questions: questions ?? [] };
  });

export const getLessonQuizForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId, context }) => {
    const { data: quiz } = await context.supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (!quiz) return null;
    const { data: questions } = await context.supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", (quiz as any).id)
      .order("sort_order");
    return { quiz, questions: questions ?? [] };
  });

export const upsertQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      lesson_id: string;
      quiz: { id?: string; title: string; passing_score: number; xp_reward: number };
      questions: Array<{
        id?: string;
        prompt: string;
        choices: string[];
        correct_index: number;
        explanation?: string;
        sort_order: number;
      }>;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", data.lesson_id)
      .maybeSingle();
    let quizId = (existing as any)?.id as string | undefined;
    if (quizId) {
      await context.supabase
        .from("quizzes")
        .update({
          title: data.quiz.title,
          passing_score: data.quiz.passing_score,
          xp_reward: data.quiz.xp_reward,
        })
        .eq("id", quizId);
    } else {
      const { data: created } = await context.supabase
        .from("quizzes")
        .insert({
          lesson_id: data.lesson_id,
          title: data.quiz.title,
          passing_score: data.quiz.passing_score,
          xp_reward: data.quiz.xp_reward,
        })
        .select("id")
        .single();
      quizId = (created as any).id;
    }
    // replace questions
    await context.supabase.from("quiz_questions").delete().eq("quiz_id", quizId!);
    if (data.questions.length > 0) {
      await context.supabase.from("quiz_questions").insert(
        data.questions.map((q) => ({
          quiz_id: quizId!,
          prompt: q.prompt,
          choices: q.choices as any,
          correct_index: q.correct_index,
          explanation: q.explanation ?? null,
          sort_order: q.sort_order,
        })),
      );
    }
    return { ok: true, quiz_id: quizId };
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lesson_id: string; answers: Record<string, number> }) => input)
  .handler(async ({ data, context }) => {
    const { data: quiz } = await context.supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", data.lesson_id)
      .maybeSingle();
    if (!quiz) throw new Error("No quiz for this lesson");
    const { data: questions } = await context.supabase
      .from("quiz_questions")
      .select("id,correct_index,explanation")
      .eq("quiz_id", (quiz as any).id);
    const qs = (questions ?? []) as Array<{
      id: string;
      correct_index: number;
      explanation: string | null;
    }>;
    const total = qs.length || 1;
    let correct = 0;
    const review = qs.map((q) => {
      const picked = data.answers[q.id];
      const ok = picked === q.correct_index;
      if (ok) correct++;
      return { id: q.id, correct: ok, correctIndex: q.correct_index, explanation: q.explanation };
    });
    const score = Math.round((correct / total) * 100);
    const passed = score >= ((quiz as any).passing_score ?? 70);
    await context.supabase.from("quiz_results").insert({
      user_id: context.userId,
      quiz_slug: `lesson-${data.lesson_id}`,
      score,
      total_questions: total,
      correct_answers: correct,
    } as any);
    let awarded = 0;
    if (passed) {
      awarded = (quiz as any).xp_reward ?? 25;
      await addXP(context.supabase, context.userId, awarded);
    }
    return { score, passed, correct, total, awarded, review };
  });

// ---------- CHALLENGE ----------
export const getLessonChallenge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId, context }) => {
    const { data } = await context.supabase
      .from("challenges")
      .select("id,title,prompt,starter_command,xp_reward,match_mode")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    return data;
  });

export const getLessonChallengeForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId, context }) => {
    const { data } = await context.supabase
      .from("challenges")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    return data;
  });

export const upsertChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      lesson_id: string;
      title: string;
      prompt: string;
      starter_command: string;
      expected_output: string;
      match_mode: string;
      xp_reward: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("challenges")
      .select("id")
      .eq("lesson_id", data.lesson_id)
      .maybeSingle();
    const payload = {
      lesson_id: data.lesson_id,
      title: data.title,
      prompt: data.prompt,
      starter_command: data.starter_command,
      expected_output: data.expected_output,
      match_mode: data.match_mode,
      xp_reward: data.xp_reward,
    };
    if ((existing as any)?.id) {
      await context.supabase
        .from("challenges")
        .update(payload)
        .eq("id", (existing as any).id);
    } else {
      await context.supabase.from("challenges").insert(payload);
    }
    return { ok: true };
  });

export const submitChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lesson_id: string; output: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: chall } = await context.supabase
      .from("challenges")
      .select("*")
      .eq("lesson_id", data.lesson_id)
      .maybeSingle();
    if (!chall) throw new Error("No challenge for this lesson");
    const c = chall as any;
    const expected = (c.expected_output ?? "").trim();
    const out = data.output.trim();
    let passed = false;
    if (!expected) passed = out.length > 0;
    else if (c.match_mode === "exact") passed = out === expected;
    else if (c.match_mode === "regex") {
      try {
        passed = new RegExp(expected).test(out);
      } catch {
        passed = false;
      }
    } else passed = out.includes(expected);

    let awarded = 0;
    if (passed) {
      awarded = c.xp_reward ?? 30;
      await addXP(context.supabase, context.userId, awarded);
      // mark lesson_progress complete for auto-unlock
      await context.supabase.from("lesson_progress").upsert(
        {
          user_id: context.userId,
          lesson_id: data.lesson_id,
          completed: true,
          score: 100,
          completed_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,lesson_id" },
      );
    }
    await context.supabase.from("challenge_attempts").insert({
      user_id: context.userId,
      challenge_id: c.id,
      output: out,
      passed,
      awarded_xp: awarded,
    });
    return { passed, awarded, expected: passed ? undefined : expected.slice(0, 200) };
  });

// ---------- WEEKLY GOALS + STREAK FREEZE ----------
export const getWeekly = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const week = weekStartISO();
    let { data: goal } = await context.supabase
      .from("weekly_goals")
      .select("*")
      .eq("user_id", context.userId)
      .eq("week_start", week)
      .maybeSingle();
    if (!goal) {
      const { data: created } = await context.supabase
        .from("weekly_goals")
        .insert({ user_id: context.userId, week_start: week })
        .select("*")
        .single();
      goal = created;
    }
    const { data: freezes } = await context.supabase
      .from("streak_freezes")
      .select("delta")
      .eq("user_id", context.userId);
    const tokens = (freezes ?? []).reduce((s: number, r: any) => s + (r.delta ?? 0), 0);
    const { data: notes } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(10);
    return { goal, freezeTokens: tokens, notifications: notes ?? [] };
  });

export const setWeeklyTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { target_xp: number; reminders_enabled?: boolean }) => input)
  .handler(async ({ data, context }) => {
    const week = weekStartISO();
    await context.supabase.from("weekly_goals").upsert(
      {
        user_id: context.userId,
        week_start: week,
        target_xp: data.target_xp,
        reminders_enabled: data.reminders_enabled ?? true,
      } as any,
      { onConflict: "user_id,week_start" },
    );
    return { ok: true };
  });

export const buyStreakFreeze = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const COST = 100;
    const { data: s } = await context.supabase
      .from("user_stats")
      .select("xp")
      .eq("user_id", context.userId)
      .maybeSingle();
    const xp = (s as any)?.xp ?? 0;
    if (xp < COST) throw new Error(`Need ${COST} XP (have ${xp}).`);
    await context.supabase
      .from("user_stats")
      .update({ xp: xp - COST })
      .eq("user_id", context.userId);
    await context.supabase
      .from("streak_freezes")
      .insert({ user_id: context.userId, reason: "purchased", delta: 1 });
    await context.supabase.from("notifications").insert({
      user_id: context.userId,
      kind: "reward",
      title: "Streak freeze purchased 🧊",
      body: "One freeze token added. It protects your streak on a missed day.",
    });
    return { ok: true };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .is("read_at", null);
    return { ok: true };
  });

// ---------- PROFILE ----------
export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      display_name?: string;
      bio?: string;
      avatar_url?: string;
      headline?: string;
      location?: string;
      website?: string;
      github_url?: string;
      learning_goal?: string;
      preferred_distro?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const full: Record<string, string | undefined> = {
      display_name: data.display_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      headline: data.headline,
      location: data.location,
      website: data.website,
      github_url: data.github_url,
      learning_goal: data.learning_goal,
      preferred_distro: data.preferred_distro,
    };
    Object.keys(full).forEach((k) => {
      if (full[k] === undefined) delete full[k];
    });

    const { error } = await context.supabase
      .from("profiles")
      .update(full as any)
      .eq("id", context.userId);
    if (error) {
      // Older DB without new columns — save core fields only
      const basic = {
        display_name: data.display_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
      };
      const retry = await context.supabase
        .from("profiles")
        .update(basic as any)
        .eq("id", context.userId);
      if (retry.error) throw new Error(retry.error.message);
    }
    return { ok: true };
  });

// ---------- LESSON UNLOCK ----------
export const getLessonUnlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((courseId: string) => courseId)
  .handler(async ({ data: courseId, context }) => {
    const { data } = await context.supabase
      .from("lesson_progress")
      .select("lesson_id,completed")
      .eq("user_id", context.userId);
    const completed = new Set(
      (data ?? []).filter((r: any) => r.completed).map((r: any) => r.lesson_id as string),
    );
    // return list of completed lesson ids; UI computes next
    void courseId;
    return { completed: [...completed] };
  });
