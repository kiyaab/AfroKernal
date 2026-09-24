import { createServerFn } from "@tanstack/react-start";
import { requirePrismaAuth } from "./auth-middleware.server";
import { prisma, isDatabaseAvailable } from "./prisma.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const dbOk = await isDatabaseAvailable();

    if (!dbOk) {
      return {
        profile: null,
        stats: { xp: 150, level: 1, streak_days: 1 },
        progress: [],
        quizzes: [],
        sessions: [],
      };
    }

    try {
      const [profile, stats, progress] = await Promise.all([
        prisma.profile.findFirst({ where: { userId } }),
        prisma.userStats.findFirst({ where: { userId } }),
        prisma.lessonProgress.findMany({
          where: { completed: true },
          take: 10,
          orderBy: { completedAt: "desc" },
        }),
      ]);

      return {
        profile,
        stats: stats || { xp: profile?.xp ?? 150, level: profile?.level ?? 1, streak_days: 1 },
        progress: progress ?? [],
        quizzes: [],
        sessions: [],
      };
    } catch {
      return {
        profile: null,
        stats: { xp: 150, level: 1, streak_days: 1 },
        progress: [],
        quizzes: [],
        sessions: [],
      };
    }
  });

export const logTerminalSession = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator((input: { command_count: number; distro?: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const dbOk = await isDatabaseAvailable();
      if (dbOk) {
        const stats = await prisma.userStats.findFirst({ where: { userId: context.userId } });
        const currentXp = stats?.xp ?? 100;
        await prisma.userStats.upsert({
          where: { userId: context.userId },
          create: {
            userId: context.userId,
            xp: currentXp + data.command_count * 2,
            level: Math.floor((currentXp + data.command_count * 2) / 250) + 1,
            streakDays: 1,
          },
          update: {
            xp: currentXp + data.command_count * 2,
            level: Math.floor((currentXp + data.command_count * 2) / 250) + 1,
          },
        });
      }
    } catch {
      /* ignore */
    }
    return { ok: true };
  });
