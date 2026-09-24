import { createServerFn } from "@tanstack/react-start";
import { prisma, isDatabaseAvailable } from "./prisma.server";
import type { LearnerRecord, PracticeExamSubmission } from "./AuthContext";

/** Initial curated community learners representing real-world distribution */
export const INITIAL_DATABASE_LEARNERS: LearnerRecord[] = [
  {
    id: "learner-002",
    displayName: "Amara Diallo",
    email: "amara.diallo@afrokernel.dev",
    headline: "Junior Cloud Engineer & Linux Enthusiast",
    bio: "Currently preparing for LFCS certification. Building automated bash backup tools.",
    avatarUrl: "",
    location: "Dakar, Senegal",
    website: "https://diallo.dev",
    githubUrl: "https://github.com/amaradiallo",
    learningGoal: "Pass Linux Foundation Certified System Administrator (LFCS)",
    preferredDistro: "Debian 12",
    xp: 1850,
    level: 8,
    streak: 14,
    roles: ["user"],
    enrolledCourses: ["linux", "scripting"],
    completedLessons: ["lf-01", "lf-02", "lf-03", "lf-04", "lf-05"],
    examSubmissions: [
      {
        id: "exam-amara-01",
        userId: "learner-002",
        trackId: "linux",
        trackLabel: "Linux Fundamentals Exam",
        score: 9,
        totalQuestions: 10,
        percentage: 90,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-003",
    displayName: "Kofi Mensah",
    email: "kofi.mensah@afrokernel.dev",
    headline: "Senior DevOps Engineer & RHCSA Candidate",
    bio: "Passionate about container orchestration, systemd services, and SELinux policies.",
    avatarUrl: "",
    location: "Accra, Ghana",
    website: "https://kofimensah.tech",
    githubUrl: "https://github.com/kmensah-devops",
    learningGoal: "Master SELinux & RHEL Administration for Enterprise Clusters",
    preferredDistro: "Red Hat Enterprise Linux 9",
    xp: 3200,
    level: 13,
    streak: 21,
    roles: ["user", "instructor"],
    enrolledCourses: ["linux", "enterprise-linux", "security"],
    completedLessons: ["lf-01", "lf-02", "lf-03", "lf-04", "lf-05", "lf-06", "el-01"],
    examSubmissions: [
      {
        id: "exam-kofi-01",
        userId: "learner-003",
        trackId: "enterprise",
        trackLabel: "Enterprise RHEL Exam",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-004",
    displayName: "Zainab Al-Mansoor",
    email: "zainab.mansoor@afrokernel.dev",
    headline: "Security Analyst & Linux Hardening Specialist",
    bio: "Focused on Linux kernel security modules, iptables/nftables, and auditd logging.",
    avatarUrl: "",
    location: "Cairo, Egypt",
    website: "https://zainabsec.io",
    githubUrl: "https://github.com/zainab-sec",
    learningGoal: "Complete Linux Server Hardening & Compliance Track",
    preferredDistro: "Fedora 40 Workstation",
    xp: 2900,
    level: 12,
    streak: 18,
    roles: ["user"],
    enrolledCourses: ["linux", "security"],
    completedLessons: ["lf-01", "lf-02", "lf-03", "lf-04", "lf-05", "lf-07"],
    examSubmissions: [
      {
        id: "exam-zainab-01",
        userId: "learner-004",
        trackId: "security",
        trackLabel: "Linux Security Hardening Exam",
        score: 9,
        totalQuestions: 10,
        percentage: 90,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-005",
    displayName: "Fatima Hassan",
    email: "fatima.hassan@afrokernel.dev",
    headline: "System Administrator & Shell Scripter",
    bio: "Automating cron jobs, log rotations, and monitoring on Ubuntu production clusters.",
    avatarUrl: "",
    location: "Nairobi, Kenya",
    website: "https://fatimahassan.cloud",
    githubUrl: "https://github.com/fhassan-sysadmin",
    learningGoal: "Advanced Shell Scripting & Network Troubleshooting",
    preferredDistro: "Ubuntu 22.04 LTS",
    xp: 2480,
    level: 10,
    streak: 19,
    roles: ["user"],
    enrolledCourses: ["linux", "scripting"],
    completedLessons: ["lf-01", "lf-02", "lf-04", "lf-06"],
    examSubmissions: [
      {
        id: "exam-fatima-01",
        userId: "learner-005",
        trackId: "linux",
        trackLabel: "Linux Fundamentals Exam",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
];

export interface FetchAdminLearnersResponse {
  learners: LearnerRecord[];
  isDatabaseConnected: boolean;
  totalDbRecords: number;
  source: "database-rpc" | "database-tables" | "cached-database";
  fetchedAt: string;
}

/**
 * Server function to fetch all user, role, and progress data from the database via Prisma
 */
export const getAdminLearnersServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FetchAdminLearnersResponse> => {
    const fetchedAt = new Date().toISOString();
    const dbOk = await isDatabaseAvailable();

    if (!dbOk) {
      return {
        learners: [],
        isDatabaseConnected: false,
        totalDbRecords: 0,
        source: "cached-database",
        fetchedAt,
      };
    }

    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          userRoles: true,
          userStats: true,
        },
      });

      const learners: LearnerRecord[] = users.map((u) => ({
        id: u.id,
        displayName: u.displayName || u.profile?.displayName || u.email.split("@")[0],
        email: u.email,
        headline: u.profile?.headline || undefined,
        bio: u.profile?.bio || undefined,
        avatarUrl: u.avatarUrl || u.profile?.avatarUrl || undefined,
        location: u.profile?.location || undefined,
        preferredDistro: u.profile?.preferredDistro || undefined,
        xp: u.profile?.xp ?? u.userStats?.xp ?? 100,
        level: u.profile?.level ?? u.userStats?.level ?? 1,
        streak: u.profile?.streakDays ?? u.userStats?.streakDays ?? 1,
        roles: u.userRoles.length > 0 ? u.userRoles.map((r) => r.role) : [u.role],
        enrolledCourses: ["linux"],
        completedLessons: [],
        examSubmissions: [],
        emailVerified: u.emailVerified,
        authProvider: u.authProvider as "email" | "google",
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        lastActive: u.updatedAt.toISOString(),
      }));

      return {
        learners,
        isDatabaseConnected: true,
        totalDbRecords: users.length,
        source: "database-tables",
        fetchedAt,
      };
    } catch (err) {
      console.warn("Prisma getAdminLearnersServerFn error:", err);
      return {
        learners: [],
        isDatabaseConnected: false,
        totalDbRecords: 0,
        source: "cached-database",
        fetchedAt,
      };
    }
  },
);

/**
 * Server function to update a learner's role in Prisma
 */
export const updateLearnerRoleServerFn = createServerFn({ method: "POST" })
  .validator((input: { userId: string; role: string; action: "add" | "remove" }) => input)
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (!dbOk) return { success: true };

    try {
      if (data.action === "add") {
        await prisma.userRole.upsert({
          where: {
            userId_role: { userId: data.userId, role: data.role },
          },
          create: { userId: data.userId, role: data.role },
          update: {},
        });
        if (data.role === "admin") {
          await prisma.user.update({
            where: { id: data.userId },
            data: { role: "admin" },
          });
        }
      } else {
        await prisma.userRole.deleteMany({
          where: { userId: data.userId, role: data.role },
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to update role" };
    }
  });

export const updateUserRoleServerFn = updateLearnerRoleServerFn;

/**
 * Server function to update learner's XP and Level in Prisma
 */
export const updateLearnerXpServerFn = createServerFn({ method: "POST" })
  .validator((input: { userId: string; xp?: number; newXp?: number; newLevel?: number }) => input)
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (!dbOk) return { success: true };

    try {
      const xp = data.xp ?? data.newXp ?? 150;
      const level = data.newLevel ?? Math.floor(xp / 250) + 1;
      await Promise.all([
        prisma.userStats.upsert({
          where: { userId: data.userId },
          create: { userId: data.userId, xp, level, streakDays: 1 },
          update: { xp, level },
        }),
        prisma.profile.updateMany({
          where: { userId: data.userId },
          data: { xp, level },
        }),
      ]);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to update XP" };
    }
  });

export const grantUserXpServerFn = updateLearnerXpServerFn;

/**
 * Server function to create a new learner record in Prisma
 */
export const adminCreateLearnerServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      displayName: string;
      email: string;
      role: string;
      preferredDistro?: string;
      learningGoal?: string;
      initialXp?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const xp = data.initialXp ?? 150;
    const level = Math.floor(xp / 250) + 1;

    const dbOk = await isDatabaseAvailable();
    if (!dbOk) {
      const fallbackId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      return {
        success: true,
        user: {
          id: fallbackId,
          displayName: data.displayName,
          email: cleanEmail,
          xp,
          level,
          streak: 1,
          roles: [data.role],
          preferredDistro: data.preferredDistro || "Ubuntu",
          learningGoal: data.learningGoal || "Master Linux",
        },
      };
    }

    try {
      const user = await prisma.user.create({
        data: {
          email: cleanEmail,
          displayName: data.displayName,
          role: data.role,
          emailVerified: true,
          authProvider: "email",
          profile: {
            create: {
              displayName: data.displayName,
              preferredDistro: data.preferredDistro || "Ubuntu",
              learningGoal: data.learningGoal || "Master Linux",
              xp,
              level,
              streakDays: 1,
            },
          },
          userRoles: {
            create: { role: data.role },
          },
          userStats: {
            create: { xp, level, streakDays: 1 },
          },
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          displayName: data.displayName,
          email: cleanEmail,
          xp,
          level,
          streak: 1,
          roles: [data.role],
          preferredDistro: data.preferredDistro || "Ubuntu",
          learningGoal: data.learningGoal || "Master Linux",
        },
      };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to create learner in database" };
    }
  });

/**
 * Server function to delete a user from the system across tables (Prisma)
 */
export const deleteUserServerFn = createServerFn({ method: "POST" })
  .validator((input: { userId: string; email?: string }) => input)
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (!dbOk) {
      return { success: false, message: "PostgreSQL database is offline. Cannot delete user." };
    }

    try {
      await prisma.user.delete({ where: { id: data.userId } });
      return { success: true, message: "User deleted from PostgreSQL database." };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user in database";
      return { success: false, message };
    }
  });

export const createLearnerServerFn = adminCreateLearnerServerFn;
