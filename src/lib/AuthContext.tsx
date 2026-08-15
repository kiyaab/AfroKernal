import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  xp: number;
  level: number;
  streak_days: number;
}

export interface PracticeExamSubmission {
  id: string;
  userId: string;
  trackId: string;
  trackLabel: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  answersSummary?: {
    correct: number;
    incorrect: number;
  };
}

export interface LearnerRecord {
  id: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  learningGoal?: string;
  preferredDistro?: string;
  headline?: string;
  xp: number;
  level: number;
  streak: number;
  roles: string[];
  enrolledCourses: string[]; // slugs
  completedLessons: string[]; // lesson ids
  examSubmissions: PracticeExamSubmission[];
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  stats: UserStats;
  enrolledCourses: string[];
  completedLessons: string[];
  examSubmissions: PracticeExamSubmission[];
  learnerProfile: LearnerRecord | null;
  signOut: () => Promise<void>;
  setLocalSessionUser: (user: User) => void;
  updateLearnerProfile: (data: Partial<LearnerRecord>) => void;
  enrollCourse: (courseSlug: string) => void;
  markLessonCompleted: (courseId: string, lessonId: string, xpReward?: number) => Promise<void>;
  saveExamResult: (submission: Omit<PracticeExamSubmission, "id" | "userId" | "submittedAt">) => Promise<PracticeExamSubmission>;
  isEnrolled: (courseSlug: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const LOCAL_STORAGE_USERS_KEY = "afrokernel_all_learners_v2";
const LOCAL_CURRENT_USER_SESSION_KEY = "afrokernel_current_user_v2";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  stats: { xp: 0, level: 1, streak_days: 0 },
  enrolledCourses: [],
  completedLessons: [],
  examSubmissions: [],
  learnerProfile: null,
  signOut: async () => {},
  setLocalSessionUser: () => {},
  updateLearnerProfile: () => {},
  enrollCourse: () => {},
  markLessonCompleted: async () => {},
  saveExamResult: async () => ({} as PracticeExamSubmission),
  isEnrolled: () => false,
  isLessonCompleted: () => false,
  refreshUserData: async () => {},
});

/** Helper to retrieve all learner records for the Admin Control Center */
export function getAllLearnerRecords(): LearnerRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Helper to upsert a learner record into global local registry */
export function upsertLearnerRecord(record: Partial<LearnerRecord> & { id: string; email: string }) {
  if (typeof window === "undefined") return;
  try {
    const list = getAllLearnerRecords();
    const existingIdx = list.findIndex(
      (u) => u.id === record.id || (u.email && record.email && u.email.toLowerCase() === record.email.toLowerCase())
    );

    const now = new Date().toISOString();
    const base: LearnerRecord = {
      id: record.id,
      displayName: record.displayName || record.email.split("@")[0],
      email: record.email,
      bio: record.bio || "Linux sysadmin & cloud architect in training.",
      avatarUrl: record.avatarUrl || "",
      location: record.location || "Global / Remote",
      website: record.website || "",
      githubUrl: record.githubUrl || "",
      learningGoal: record.learningGoal || "Master Linux Kernel & Enterprise DevOps",
      preferredDistro: record.preferredDistro || "Ubuntu Linux",
      headline: record.headline || "Linux & Cloud Practitioner",
      xp: record.xp ?? 150,
      level: record.level ?? Math.max(1, Math.floor((record.xp ?? 150) / 250) + 1),
      streak: record.streak ?? 1,
      roles: record.roles?.length ? record.roles : ["user"],
      enrolledCourses: record.enrolledCourses || ["linux"],
      completedLessons: record.completedLessons || [],
      examSubmissions: record.examSubmissions || [],
      createdAt: record.createdAt || now,
      updatedAt: now,
      lastActive: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        ...record,
        enrolledCourses: Array.from(new Set([...(list[existingIdx].enrolledCourses || []), ...(record.enrolledCourses || [])])),
        completedLessons: Array.from(new Set([...(list[existingIdx].completedLessons || []), ...(record.completedLessons || [])])),
        examSubmissions: record.examSubmissions ? record.examSubmissions : list[existingIdx].examSubmissions,
        xp: record.xp !== undefined ? record.xp : list[existingIdx].xp,
        level: record.level !== undefined ? record.level : list[existingIdx].level,
        streak: record.streak !== undefined ? record.streak : list[existingIdx].streak,
        updatedAt: now,
        lastActive: now,
      };
    } else {
      list.unshift(base);
    }

    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to upsert learner record:", err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(LOCAL_CURRENT_USER_SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ xp: 150, level: 1, streak_days: 1 });
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(["linux"]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<PracticeExamSubmission[]>([]);
  const [learnerProfile, setLearnerProfile] = useState<LearnerRecord | null>(null);

  // Load user data from local storage or remote
  const loadUserDataForId = async (userId: string, userEmail?: string) => {
    try {
      const allLearners = getAllLearnerRecords();
      const match = allLearners.find(
        (l) => l.id === userId || (userEmail && l.email.toLowerCase() === userEmail.toLowerCase())
      );

      if (match) {
        setStats({ xp: match.xp, level: match.level, streak_days: match.streak || 1 });
        setEnrolledCourses(match.enrolledCourses || ["linux"]);
        setCompletedLessons(match.completedLessons || []);
        setExamSubmissions(match.examSubmissions || []);
        setLearnerProfile(match);
      } else {
        // Init default record
        const email = userEmail || "learner@afrokernel.com";
        const newRecord: LearnerRecord = {
          id: userId,
          displayName: email.split("@")[0],
          email,
          bio: "Linux sysadmin & cloud architect in training.",
          avatarUrl: "",
          location: "Global / Remote",
          website: "",
          githubUrl: "",
          learningGoal: "Master Linux Kernel & Enterprise DevOps",
          preferredDistro: "Ubuntu Linux",
          headline: "Linux & Cloud Practitioner",
          xp: 150,
          level: 1,
          streak: 1,
          roles: ["user"],
          enrolledCourses: ["linux"],
          completedLessons: [],
          examSubmissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        upsertLearnerRecord(newRecord);
        setStats({ xp: newRecord.xp, level: newRecord.level, streak_days: 1 });
        setEnrolledCourses(["linux"]);
        setLearnerProfile(newRecord);
      }

      // Try fetching remote Supabase stats if available
      try {
        const { data: dbStats } = await supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle();
        if (dbStats) {
          setStats((prev) => ({
            xp: Math.max(prev.xp, dbStats.xp ?? 0),
            level: Math.max(prev.level, dbStats.level ?? 1),
            streak_days: Math.max(prev.streak_days, dbStats.streak_days ?? 1),
          }));
        }
      } catch {
        /* ignore network issues */
      }
    } catch (e) {
      console.warn("Could not load user data:", e);
    }
  };

  useEffect(() => {
    // 1. If stored local user, initialize data immediately
    if (user) {
      loadUserDataForId(user.id, user.email);
    }

    // 2. Check Supabase session with network error safety
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const u = data.user ?? null;
        if (u) {
          setUser(u);
          localStorage.setItem(LOCAL_CURRENT_USER_SESSION_KEY, JSON.stringify(u));
          loadUserDataForId(u.id, u.email);
        }
      })
      .catch((err) => {
        console.warn("Supabase initial session check offline/failed, using local session:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 3. Listen for auth state changes
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        if (u) {
          setUser(u);
          localStorage.setItem(LOCAL_CURRENT_USER_SESSION_KEY, JSON.stringify(u));
          loadUserDataForId(u.id, u.email);
        }
        setLoading(false);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const setLocalSessionUser = (localUser: User) => {
    setUser(localUser);
    localStorage.setItem(LOCAL_CURRENT_USER_SESSION_KEY, JSON.stringify(localUser));
    loadUserDataForId(localUser.id, localUser.email);
  };

  const updateLearnerProfile = (data: Partial<LearnerRecord>) => {
    if (!user) return;
    const updated = {
      id: user.id,
      email: user.email || "learner@afrokernel.com",
      ...data,
    };
    upsertLearnerRecord(updated);
    setLearnerProfile((prev) => (prev ? { ...prev, ...data } : null));
    if (data.xp !== undefined) {
      setStats((s) => ({ ...s, xp: data.xp!, level: Math.floor(data.xp! / 250) + 1 }));
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserDataForId(user.id, user.email);
    }
  };

  const enrollCourse = (courseSlug: string) => {
    if (!courseSlug) return;
    setEnrolledCourses((prev) => {
      if (prev.includes(courseSlug)) return prev;
      const updated = [...prev, courseSlug];
      if (user) {
        upsertLearnerRecord({
          id: user.id,
          email: user.email || "user@afrokernel.com",
          enrolledCourses: updated,
        });
      }
      return updated;
    });
  };

  const markLessonCompleted = async (courseId: string, lessonId: string, xpReward: number = 25) => {
    if (!lessonId) return;

    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });

    // Award XP
    setStats((prev) => {
      const newXp = prev.xp + xpReward;
      const newLevel = Math.floor(newXp / 250) + 1;
      const newStreak = Math.max(1, prev.streak_days);

      if (user) {
        upsertLearnerRecord({
          id: user.id,
          email: user.email || "user@afrokernel.com",
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          completedLessons: Array.from(new Set([...completedLessons, lessonId])),
        });

        // Sync to Supabase in background without blocking
        try {
          supabase.from("lesson_progress").upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          } as never).then(() => {}).catch(() => {});

          supabase.from("user_stats").upsert({
            user_id: user.id,
            xp: newXp,
            level: newLevel,
            streak_days: newStreak,
            updated_at: new Date().toISOString(),
          } as never).then(() => {}).catch(() => {});
        } catch {}
      }

      return { xp: newXp, level: newLevel, streak_days: newStreak };
    });
  };

  const saveExamResult = async (submission: Omit<PracticeExamSubmission, "id" | "userId" | "submittedAt">): Promise<PracticeExamSubmission> => {
    const fullRecord: PracticeExamSubmission = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.id || "guest-learner",
      submittedAt: new Date().toISOString(),
      ...submission,
    };

    setExamSubmissions((prev) => [fullRecord, ...prev]);

    // Bonus XP on passing
    const bonusXp = submission.passed ? 150 : 35;
    setStats((prev) => {
      const newXp = prev.xp + bonusXp;
      const newLevel = Math.floor(newXp / 250) + 1;

      if (user) {
        upsertLearnerRecord({
          id: user.id,
          email: user.email || "user@afrokernel.com",
          xp: newXp,
          level: newLevel,
          examSubmissions: [fullRecord, ...examSubmissions],
        });

        try {
          supabase.from("user_stats").upsert({
            user_id: user.id,
            xp: newXp,
            level: newLevel,
            updated_at: new Date().toISOString(),
          } as never).then(() => {}).catch(() => {});
        } catch {}
      }

      return { ...prev, xp: newXp, level: newLevel };
    });

    return fullRecord;
  };

  const isEnrolled = (courseSlug: string) => enrolledCourses.includes(courseSlug);
  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(LOCAL_CURRENT_USER_SESSION_KEY);
    setUser(null);
    setStats({ xp: 0, level: 1, streak_days: 0 });
    setEnrolledCourses([]);
    setCompletedLessons([]);
    setExamSubmissions([]);
    setLearnerProfile(null);

    try {
      sessionStorage.removeItem("afrokernel-admin-unlocked");
      sessionStorage.removeItem("afrokernel-local-admin");
      sessionStorage.removeItem("afrokernel-local-admin-email");
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        stats,
        enrolledCourses,
        completedLessons,
        examSubmissions,
        learnerProfile,
        signOut,
        setLocalSessionUser,
        updateLearnerProfile,
        enrollCourse,
        markLessonCompleted,
        saveExamResult,
        isEnrolled,
        isLessonCompleted,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
