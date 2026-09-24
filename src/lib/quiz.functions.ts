import { createServerFn } from "@tanstack/react-start";
import { requirePrismaAuth } from "@/lib/auth-middleware.server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma.server";

function weekStartISO(d = new Date()): string {
  const day = d.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday-based
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return start.toISOString().slice(0, 10);
}

// In-memory fallbacks when PostgreSQL is offline
const memoryQuizzes = new Map<string, any>();
const memoryChallenges = new Map<string, any>();
const memoryWeeklyGoals = new Map<string, any>();
const memoryLessonProgress = new Map<string, Set<string>>();

async function addXP(userId: string, xp: number) {
  if (xp <= 0) return;
  const dbOk = await isDatabaseAvailable();
  const week = weekStartISO();

  if (dbOk) {
    try {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      const currentXp = stats?.xp ?? 0;
      const nextXp = currentXp + xp;
      const nextLevel = Math.max(1, Math.floor(nextXp / 500) + 1);

      await prisma.userStats.upsert({
        where: { userId },
        update: { xp: nextXp, level: nextLevel, lastActiveAt: new Date() },
        create: { userId, xp: nextXp, level: nextLevel },
      });

      // Update weekly goal
      await prisma.weeklyGoal.upsert({
        where: { userId_weekStart: { userId, weekStart: week } },
        update: { earnedXp: { increment: xp } },
        create: { userId, weekStart: week, earnedXp: xp, targetXp: 250 },
      });
      return;
    } catch {
      /* fall back to memory */
    }
  }

  // Memory fallback
  const goalKey = `${userId}-${week}`;
  const existingGoal = memoryWeeklyGoals.get(goalKey) || { earned_xp: 0 };
  memoryWeeklyGoals.set(goalKey, {
    ...existingGoal,
    earned_xp: (existingGoal.earned_xp ?? 0) + xp,
  });
}

// ---------- QUIZ ----------
export const getLessonQuiz = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .validator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { lessonId },
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
            },
          },
        });
        if (quiz) {
          return {
            quiz: {
              id: quiz.id,
              lesson_id: quiz.lessonId,
              title: quiz.title,
              passing_score: quiz.passingScore,
              xp_reward: quiz.xpReward,
            },
            questions: quiz.questions.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              choices: Array.isArray(q.choices) ? q.choices : [],
              sort_order: q.sortOrder,
            })),
          };
        }
      } catch {
        /* fallback to memory */
      }
    }

    const mem = memoryQuizzes.get(lessonId);
    if (!mem) return null;
    return {
      quiz: mem.quiz,
      questions: (mem.questions || []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        sort_order: q.sort_order,
      })),
    };
  });

export const getLessonQuizForAdmin = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .validator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { lessonId },
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
            },
          },
        });
        if (quiz) {
          return {
            quiz: {
              id: quiz.id,
              lesson_id: quiz.lessonId,
              title: quiz.title,
              passing_score: quiz.passingScore,
              xp_reward: quiz.xpReward,
            },
            questions: quiz.questions.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              choices: Array.isArray(q.choices) ? q.choices : [],
              correct_index: q.correctIndex,
              explanation: q.explanation,
              sort_order: q.sortOrder,
            })),
          };
        }
      } catch {
        /* fallback to memory */
      }
    }

    const mem = memoryQuizzes.get(lessonId);
    if (!mem) return null;
    return mem;
  });

export const upsertQuiz = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator(
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
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    let quizId = data.quiz.id;

    if (dbOk) {
      try {
        const quiz = await prisma.quiz.upsert({
          where: { lessonId: data.lesson_id },
          update: {
            title: data.quiz.title,
            passingScore: data.quiz.passing_score,
            xpReward: data.quiz.xp_reward,
          },
          create: {
            lessonId: data.lesson_id,
            title: data.quiz.title,
            passingScore: data.quiz.passing_score,
            xpReward: data.quiz.xp_reward,
          },
        });
        quizId = quiz.id;

        // Replace questions
        await prisma.quizQuestion.deleteMany({ where: { quizId } });
        if (data.questions.length > 0) {
          await prisma.quizQuestion.createMany({
            data: data.questions.map((q) => ({
              quizId: quizId!,
              prompt: q.prompt,
              choices: q.choices,
              correctIndex: q.correct_index,
              explanation: q.explanation ?? null,
              sortOrder: q.sort_order,
            })),
          });
        }
        return { ok: true, quiz_id: quizId };
      } catch {
        /* fallback to memory */
      }
    }

    quizId = quizId || `quiz-${Date.now()}`;
    memoryQuizzes.set(data.lesson_id, {
      quiz: { id: quizId, lesson_id: data.lesson_id, ...data.quiz },
      questions: data.questions.map((q, idx) => ({
        id: q.id || `q-${quizId}-${idx}`,
        ...q,
      })),
    });
    return { ok: true, quiz_id: quizId };
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator((input: { lesson_id: string; answers: Record<string, number> }) => input)
  .handler(async ({ data, context }) => {
    let qs: Array<{ id: string; correct_index: number; explanation: string | null }> = [];
    let passingScore = 70;
    let xpReward = 25;

    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { lessonId: data.lesson_id },
          include: { questions: true },
        });
        if (quiz) {
          passingScore = quiz.passingScore;
          xpReward = quiz.xpReward;
          qs = quiz.questions.map((q) => ({
            id: q.id,
            correct_index: q.correctIndex,
            explanation: q.explanation,
          }));
        }
      } catch {
        /* fallback */
      }
    }

    if (qs.length === 0) {
      const mem = memoryQuizzes.get(data.lesson_id);
      if (mem) {
        passingScore = mem.quiz?.passing_score ?? 70;
        xpReward = mem.quiz?.xp_reward ?? 25;
        qs = (mem.questions || []).map((q: any) => ({
          id: q.id,
          correct_index: q.correct_index,
          explanation: q.explanation ?? null,
        }));
      }
    }

    if (qs.length === 0) {
      throw new Error("No quiz found for this lesson");
    }

    const total = qs.length || 1;
    let correct = 0;
    const review = qs.map((q) => {
      const picked = data.answers[q.id];
      const ok = picked === q.correct_index;
      if (ok) correct++;
      return { id: q.id, correct: ok, correctIndex: q.correct_index, explanation: q.explanation };
    });
    const score = Math.round((correct / total) * 100);
    const passed = score >= passingScore;

    let awarded = 0;
    if (passed) {
      awarded = xpReward;
      await addXP(context.userId, awarded);
    }
    return { score, passed, correct, total, awarded, review };
  });

// ---------- CHALLENGE ----------
export const getLessonChallenge = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .validator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const challenge = await prisma.challenge.findFirst({
          where: { lessonId },
        });
        if (challenge) {
          return {
            id: challenge.id,
            title: challenge.title,
            prompt: challenge.prompt,
            starter_command: challenge.starterCommand,
            xp_reward: challenge.xpReward,
            match_mode: challenge.matchMode,
          };
        }
      } catch {
        /* fallback */
      }
    }
    return memoryChallenges.get(lessonId) ?? null;
  });

export const getLessonChallengeForAdmin = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .validator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const challenge = await prisma.challenge.findFirst({
          where: { lessonId },
        });
        if (challenge) {
          return {
            id: challenge.id,
            lesson_id: challenge.lessonId,
            title: challenge.title,
            prompt: challenge.prompt,
            starter_command: challenge.starterCommand,
            expected_output: challenge.expectedOutput,
            match_mode: challenge.matchMode,
            xp_reward: challenge.xpReward,
          };
        }
      } catch {
        /* fallback */
      }
    }
    return memoryChallenges.get(lessonId) ?? null;
  });

export const upsertChallenge = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator(
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
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const existing = await prisma.challenge.findFirst({
          where: { lessonId: data.lesson_id },
        });

        if (existing) {
          await prisma.challenge.update({
            where: { id: existing.id },
            data: {
              title: data.title,
              prompt: data.prompt,
              starterCommand: data.starter_command,
              expectedOutput: data.expected_output,
              matchMode: data.match_mode,
              xpReward: data.xp_reward,
            },
          });
        } else {
          await prisma.challenge.create({
            data: {
              lessonId: data.lesson_id,
              title: data.title,
              prompt: data.prompt,
              starterCommand: data.starter_command,
              expectedOutput: data.expected_output,
              matchMode: data.match_mode,
              xpReward: data.xp_reward,
            },
          });
        }
        return { ok: true };
      } catch {
        /* fallback */
      }
    }

    memoryChallenges.set(data.lesson_id, {
      id: `chall-${data.lesson_id}`,
      ...data,
    });
    return { ok: true };
  });

export const submitChallenge = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator((input: { lesson_id: string; output: string }) => input)
  .handler(async ({ data, context }) => {
    let challenge: any = null;
    const dbOk = await isDatabaseAvailable();

    if (dbOk) {
      try {
        challenge = await prisma.challenge.findFirst({
          where: { lessonId: data.lesson_id },
        });
      } catch {
        /* fallback */
      }
    }

    if (!challenge) {
      challenge = memoryChallenges.get(data.lesson_id);
    }

    if (!challenge) throw new Error("No challenge for this lesson");

    const expected = ((challenge.expectedOutput || challenge.expected_output) ?? "").trim();
    const matchMode = challenge.matchMode || challenge.match_mode || "contains";
    const out = data.output.trim();
    let passed = false;

    if (!expected) passed = out.length > 0;
    else if (matchMode === "exact") passed = out === expected;
    else if (matchMode === "regex") {
      try {
        passed = new RegExp(expected).test(out);
      } catch {
        passed = false;
      }
    } else {
      passed = out.includes(expected);
    }

    let awarded = 0;
    if (passed) {
      awarded = challenge.xpReward ?? challenge.xp_reward ?? 30;
      await addXP(context.userId, awarded);

      // Record lesson progress
      if (dbOk) {
        try {
          const prof = await prisma.profile.findUnique({ where: { userId: context.userId } });
          if (prof) {
            await prisma.lessonProgress.upsert({
              where: {
                profileId_lessonId: {
                  profileId: prof.id,
                  lessonId: data.lesson_id,
                },
              },
              update: { completed: true, score: 100, completedAt: new Date() },
              create: {
                profileId: prof.id,
                lessonId: data.lesson_id,
                completed: true,
                score: 100,
                completedAt: new Date(),
              },
            });
          }
        } catch {
          /* ignore */
        }
      }

      // Memory progress fallback
      let userSet = memoryLessonProgress.get(context.userId);
      if (!userSet) {
        userSet = new Set<string>();
        memoryLessonProgress.set(context.userId, userSet);
      }
      userSet.add(data.lesson_id);
    }

    return { passed, awarded, expected: passed ? undefined : expected.slice(0, 200) };
  });

// ---------- WEEKLY GOALS + STREAK FREEZE ----------
export const getWeekly = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .handler(async ({ context }) => {
    const week = weekStartISO();
    let goal: any = null;

    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        goal = await prisma.weeklyGoal.findUnique({
          where: { userId_weekStart: { userId: context.userId, weekStart: week } },
        });
        if (!goal) {
          goal = await prisma.weeklyGoal.create({
            data: { userId: context.userId, weekStart: week, targetXp: 250, earnedXp: 0 },
          });
        }
      } catch {
        /* fallback */
      }
    }

    if (!goal) {
      const key = `${context.userId}-${week}`;
      if (!memoryWeeklyGoals.has(key)) {
        memoryWeeklyGoals.set(key, {
          user_id: context.userId,
          week_start: week,
          target_xp: 250,
          earned_xp: 0,
        });
      }
      goal = memoryWeeklyGoals.get(key);
    }

    return {
      goal: {
        id: goal.id ?? `g-${week}`,
        user_id: goal.userId ?? goal.user_id,
        week_start: goal.weekStart ?? goal.week_start,
        target_xp: goal.targetXp ?? goal.target_xp ?? 250,
        earned_xp: goal.earnedXp ?? goal.earned_xp ?? 0,
        reminders_enabled: goal.remindersEnabled ?? goal.reminders_enabled ?? true,
      },
      freezeTokens: 1,
      notifications: [],
    };
  });

export const setWeeklyTarget = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator((input: { target_xp: number; reminders_enabled?: boolean }) => input)
  .handler(async ({ data, context }) => {
    const week = weekStartISO();
    const dbOk = await isDatabaseAvailable();

    if (dbOk) {
      try {
        await prisma.weeklyGoal.upsert({
          where: { userId_weekStart: { userId: context.userId, weekStart: week } },
          update: {
            targetXp: data.target_xp,
            remindersEnabled: data.reminders_enabled ?? true,
          },
          create: {
            userId: context.userId,
            weekStart: week,
            targetXp: data.target_xp,
            remindersEnabled: data.reminders_enabled ?? true,
          },
        });
        return { ok: true };
      } catch {
        /* fallback */
      }
    }

    const key = `${context.userId}-${week}`;
    const cur = memoryWeeklyGoals.get(key) || {};
    memoryWeeklyGoals.set(key, {
      ...cur,
      user_id: context.userId,
      week_start: week,
      target_xp: data.target_xp,
      reminders_enabled: data.reminders_enabled ?? true,
    });
    return { ok: true };
  });

export const buyStreakFreeze = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .handler(async ({ context }) => {
    const COST = 100;
    const dbOk = await isDatabaseAvailable();

    if (dbOk) {
      try {
        const stats = await prisma.userStats.findUnique({ where: { userId: context.userId } });
        const xp = stats?.xp ?? 0;
        if (xp < COST) throw new Error(`Need ${COST} XP (have ${xp}).`);

        await prisma.userStats.update({
          where: { userId: context.userId },
          data: { xp: xp - COST },
        });
        return { ok: true };
      } catch (err: any) {
        if (err?.message?.includes("Need")) throw err;
      }
    }
    return { ok: true };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .handler(async () => {
    return { ok: true };
  });

// ---------- PROFILE ----------
export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requirePrismaAuth])
  .validator(
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
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        await prisma.profile.upsert({
          where: { userId: context.userId },
          update: {
            displayName: data.display_name,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            headline: data.headline,
            location: data.location,
            website: data.website,
            githubUrl: data.github_url,
            learningGoal: data.learning_goal,
            preferredDistro: data.preferred_distro,
          },
          create: {
            userId: context.userId,
            displayName: data.display_name,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            headline: data.headline,
            location: data.location,
            website: data.website,
            githubUrl: data.github_url,
            learningGoal: data.learning_goal,
            preferredDistro: data.preferred_distro,
          },
        });
        return { ok: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to update profile");
      }
    }
    return { ok: true };
  });

// ---------- LESSON UNLOCK ----------
export const getLessonUnlocks = createServerFn({ method: "GET" })
  .middleware([requirePrismaAuth])
  .validator((courseId: string) => courseId)
  .handler(async ({ context }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const rows = await prisma.lessonProgress.findMany({
          where: { profile: { userId: context.userId }, completed: true },
          select: { lessonId: true },
        });
        return { completed: rows.map((r) => r.lessonId) };
      } catch {
        /* fallback */
      }
    }

    const memSet = memoryLessonProgress.get(context.userId);
    return { completed: memSet ? Array.from(memSet) : [] };
  });
