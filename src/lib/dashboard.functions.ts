import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, stats, progress, quizzes, sessions] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("lesson_progress")
        .select(
          "id,lesson_id,completed,completed_at,lessons(id,title,slug,course_id,courses(title,slug))",
        )
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false })
        .limit(10),
      supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("terminal_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    return {
      profile: profile.data,
      stats: stats.data,
      progress: progress.data ?? [],
      quizzes: quizzes.data ?? [],
      sessions: sessions.data ?? [],
    };
  });

export const logTerminalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { command_count: number; distro?: string }) => input)
  .handler(async ({ data, context }) => {
    const distro = data.distro ?? "ubuntu";
    await context.supabase.from("terminal_sessions").insert({
      user_id: context.userId,
      command_count: data.command_count,
      distro,
    } as never);
    const { data: s } = await context.supabase
      .from("user_stats")
      .select("xp")
      .eq("user_id", context.userId)
      .maybeSingle();
    const currentXp = (s as { xp?: number } | null)?.xp ?? 0;
    await context.supabase
      .from("user_stats")
      .update({ xp: currentXp + data.command_count * 2 } as never)
      .eq("user_id", context.userId);
    return { ok: true };
  });
