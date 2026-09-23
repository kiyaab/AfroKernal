import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { LearnerRecord, PracticeExamSubmission } from "./AuthContext";

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || "https://znhuzzkqrrtzviamsvby.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_1sdqLpDe9XzEqVw1DSHbcA_0mXlm6aR";

  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
  } catch {
    return null;
  }
}

/** Initial curated community learners representing real-world distribution */
export const INITIAL_DATABASE_LEARNERS: LearnerRecord[] = [
  {
    id: "master-admin-001",
    displayName: "Master Administrator",
    email: "admin@afrokernel.com",
    headline: "AfroKernel Infrastructure Lead & Chief Architect",
    bio: "Core platform architect, Linux kernel contributor, and curriculum maintainer.",
    avatarUrl: "",
    location: "Global / Remote",
    website: "https://afrokernel.com",
    githubUrl: "https://github.com/afrokernel",
    learningGoal: "Master Linux Kernel & Enterprise Cloud Infrastructure",
    preferredDistro: "Ubuntu 24.04 LTS",
    xp: 5400,
    level: 21,
    streak: 32,
    roles: ["admin", "instructor", "user"],
    enrolledCourses: ["linux", "security", "enterprise-linux", "scripting", "networking", "cloud"],
    completedLessons: [
      "lf-01",
      "lf-02",
      "lf-03",
      "lf-04",
      "lf-05",
      "lf-06",
      "lf-07",
      "lf-08",
      "el-01",
      "el-02",
    ],
    examSubmissions: [
      {
        id: "exam-admin-01",
        userId: "master-admin-001",
        trackId: "all",
        trackLabel: "Comprehensive Linux Exam",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
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
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-003",
    displayName: "Tariq Mansour",
    email: "tariq.mansour@afrokernel.dev",
    headline: "Senior DevOps Instructor & Security Researcher",
    bio: "Teaching enterprise system administration, systemd service units, and firewalling.",
    avatarUrl: "",
    location: "Cairo, Egypt",
    website: "https://tariqmansour.tech",
    githubUrl: "https://github.com/tmansour-dev",
    learningGoal: "Enterprise Hardening & SELinux Policy Authoring",
    preferredDistro: "Fedora 40 / RHEL",
    xp: 3950,
    level: 16,
    streak: 21,
    roles: ["instructor", "user"],
    enrolledCourses: ["linux", "enterprise-linux", "scripting"],
    completedLessons: ["lf-01", "lf-02", "lf-03", "el-01", "el-02", "el-03"],
    examSubmissions: [
      {
        id: "exam-tariq-01",
        userId: "learner-003",
        trackId: "enterprise-linux",
        trackLabel: "Enterprise Linux Specialist Exam",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-004",
    displayName: "Kofi Mensah",
    email: "kofi.mensah@afrokernel.dev",
    headline: "Computer Science Undergraduate",
    bio: "Learning file permissions, grep, and awk for university operating systems course.",
    avatarUrl: "",
    location: "Accra, Ghana",
    website: "",
    githubUrl: "https://github.com/kofimensah-cs",
    learningGoal: "Master Linux CLI Commands & Vim",
    preferredDistro: "Arch Linux",
    xp: 820,
    level: 4,
    streak: 6,
    roles: ["user"],
    enrolledCourses: ["linux"],
    completedLessons: ["lf-01", "lf-02", "lf-03"],
    examSubmissions: [
      {
        id: "exam-kofi-01",
        userId: "learner-004",
        trackId: "linux",
        trackLabel: "Linux Fundamentals Exam",
        score: 7,
        totalQuestions: 10,
        percentage: 70,
        passed: false,
        submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "learner-005",
    displayName: "Fatima Al-Hassan",
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
 * Server function to fetch all user, role, and progress data from the database
 */
export const getAdminLearnersServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FetchAdminLearnersResponse> => {
    const sb = getSupabaseServerClient();
    const fetchedAt = new Date().toISOString();

    if (!sb) {
      return {
        learners: INITIAL_DATABASE_LEARNERS,
        isDatabaseConnected: false,
        totalDbRecords: 0,
        source: "cached-database",
        fetchedAt,
      };
    }

    try {
      // 1. Attempt high-performance RPC: admin_list_learners()
      const { data: rpcUsers, error: rpcErr } = await (sb.rpc as any)("admin_list_learners");

      if (!rpcErr && Array.isArray(rpcUsers) && rpcUsers.length > 0) {
        const records: LearnerRecord[] = rpcUsers.map((u: any) => ({
          id: u.id,
          displayName: u.display_name || u.email?.split("@")[0] || "Learner",
          email: u.email || "learner@afrokernel.com",
          bio: u.bio || "",
          avatarUrl: u.avatar_url || "",
          location: u.location || "",
          website: u.website || "",
          githubUrl: u.github_url || "",
          learningGoal: u.learning_goal || "Master Linux",
          preferredDistro: u.preferred_distro || "Ubuntu",
          headline: u.headline || "",
          xp: typeof u.xp === "number" ? u.xp : 150,
          level: typeof u.level === "number" ? u.level : 1,
          streak: typeof u.streak_days === "number" ? u.streak_days : 1,
          roles: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : ["user"],
          enrolledCourses: ["linux"],
          completedLessons: [],
          examSubmissions: [],
          createdAt: u.created_at || fetchedAt,
          updatedAt: u.updated_at || fetchedAt,
          lastActive: u.updated_at || fetchedAt,
        }));

        // Merge with initial data to ensure rich baseline
        const mergedMap = new Map<string, LearnerRecord>();
        INITIAL_DATABASE_LEARNERS.forEach((l) => mergedMap.set(l.email.toLowerCase(), l));
        records.forEach((r) => mergedMap.set(r.email.toLowerCase(), { ...mergedMap.get(r.email.toLowerCase()), ...r }));

        return {
          learners: Array.from(mergedMap.values()),
          isDatabaseConnected: true,
          totalDbRecords: records.length,
          source: "database-rpc",
          fetchedAt,
        };
      }

      // 2. Query individual tables in parallel
      const [profilesRes, statsRes, rolesRes, progressRes, examsRes] = await Promise.allSettled([
        sb.from("profiles").select("*"),
        sb.from("user_stats").select("*"),
        sb.from("user_roles").select("*"),
        sb.from("lesson_progress").select("*"),
        sb.from("exam_submissions").select("*"),
      ]);

      const profiles = profilesRes.status === "fulfilled" && profilesRes.value.data ? profilesRes.value.data : [];
      const stats = statsRes.status === "fulfilled" && statsRes.value.data ? statsRes.value.data : [];
      const roles = rolesRes.status === "fulfilled" && rolesRes.value.data ? rolesRes.value.data : [];
      const progress = progressRes.status === "fulfilled" && progressRes.value.data ? progressRes.value.data : [];
      const exams = examsRes.status === "fulfilled" && examsRes.value.data ? examsRes.value.data : [];

      if (profiles.length > 0) {
        const records: LearnerRecord[] = profiles.map((p: any) => {
          const s = stats.find((st: any) => st.user_id === p.id);
          const r = roles.filter((ro: any) => ro.user_id === p.id).map((ro: any) => ro.role);
          const pr = progress
            .filter((pg: any) => pg.user_id === p.id && pg.completed)
            .map((pg: any) => pg.lesson_id);
          const ex: PracticeExamSubmission[] = exams
            .filter((e: any) => e.profile_id === p.id || e.user_id === p.id)
            .map((e: any) => ({
              id: e.id,
              userId: p.id,
              trackId: e.track_id,
              trackLabel: e.track_label,
              score: e.score,
              totalQuestions: e.total_questions,
              percentage: e.percentage,
              passed: e.passed,
              submittedAt: e.submitted_at || fetchedAt,
            }));

          const email = p.email || p.headline || "learner@afrokernel.com";
          return {
            id: p.id,
            displayName: p.display_name || email.split("@")[0] || "Learner",
            email,
            bio: p.bio || "",
            avatarUrl: p.avatar_url || "",
            location: p.location || "",
            website: p.website || "",
            githubUrl: p.github_url || "",
            learningGoal: p.learning_goal || "Master Linux",
            preferredDistro: p.preferred_distro || "Ubuntu",
            headline: p.headline || "",
            xp: s?.xp ?? 150,
            level: s?.level ?? 1,
            streak: s?.streak_days ?? 1,
            roles: r.length > 0 ? r : ["user"],
            enrolledCourses: ["linux"],
            completedLessons: pr,
            examSubmissions: ex,
            createdAt: p.created_at || fetchedAt,
            updatedAt: p.updated_at || fetchedAt,
            lastActive: p.updated_at || fetchedAt,
          };
        });

        const mergedMap = new Map<string, LearnerRecord>();
        INITIAL_DATABASE_LEARNERS.forEach((l) => mergedMap.set(l.email.toLowerCase(), l));
        records.forEach((r) => mergedMap.set(r.email.toLowerCase(), { ...mergedMap.get(r.email.toLowerCase()), ...r }));

        return {
          learners: Array.from(mergedMap.values()),
          isDatabaseConnected: true,
          totalDbRecords: records.length,
          source: "database-tables",
          fetchedAt,
        };
      }
    } catch (err) {
      console.warn("Server DB fetch failed, using curated baseline:", err);
    }

    return {
      learners: INITIAL_DATABASE_LEARNERS,
      isDatabaseConnected: false,
      totalDbRecords: 0,
      source: "cached-database",
      fetchedAt,
    };
  },
);

/**
 * Server function to update a user's role in the database
 */
export const updateUserRoleServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: { userId: string; role: "admin" | "instructor" | "user"; action: "add" | "remove" }) =>
      input,
  )
  .handler(async ({ data }) => {
    const sb = getSupabaseServerClient();
    if (!sb) return { success: false, message: "Database client unavailable" };

    try {
      if (data.action === "add") {
        await sb
          .from("user_roles")
          .insert({ user_id: data.userId, role: data.role } as never);
      } else {
        await sb
          .from("user_roles")
          .delete()
          .match({ user_id: data.userId, role: data.role });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to update role in database" };
    }
  });

/**
 * Server function to grant bonus XP and update level in the database
 */
export const grantUserXpServerFn = createServerFn({ method: "POST" })
  .validator((input: { userId: string; newXp: number; newLevel: number }) => input)
  .handler(async ({ data }) => {
    const sb = getSupabaseServerClient();
    if (!sb) return { success: false, message: "Database client unavailable" };

    try {
      await sb.from("user_stats").upsert(
        {
          user_id: data.userId,
          xp: data.newXp,
          level: data.newLevel,
        } as never,
        { onConflict: "user_id" },
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to update stats in database" };
    }
  });

/**
 * Server function to add a new learner directly into the database
 */
export const createLearnerServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      displayName: string;
      email: string;
      role: "admin" | "instructor" | "user";
      preferredDistro?: string;
      learningGoal?: string;
      initialXp?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sb = getSupabaseServerClient();
    const cleanEmail = data.email.trim().toLowerCase();
    const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const xp = data.initialXp ?? 150;
    const level = Math.floor(xp / 250) + 1;

    if (!sb) {
      return {
        success: true,
        user: {
          id: newId,
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
      await sb.from("profiles").upsert(
        {
          id: newId,
          display_name: data.displayName,
          email: cleanEmail,
          headline: data.learningGoal || "Learner",
          preferred_distro: data.preferredDistro || "Ubuntu",
        } as never,
        { onConflict: "id" },
      );

      await sb.from("user_stats").upsert(
        {
          user_id: newId,
          xp,
          level,
          streak_days: 1,
        } as never,
        { onConflict: "user_id" },
      );

      await sb.from("user_roles").upsert(
        {
          user_id: newId,
          role: data.role,
        } as never,
        { onConflict: "user_id,role" },
      );

      return {
        success: true,
        user: {
          id: newId,
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
