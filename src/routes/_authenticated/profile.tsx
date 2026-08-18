import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth, LearnerRecord } from "@/lib/AuthContext";
import { CATALOG_COURSES } from "@/lib/courses-catalog-data";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import {
  ArrowLeft,
  User,
  Github,
  Globe,
  MapPin,
  Target,
  Terminal,
  Loader2,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  BookOpen,
  Share2,
  Edit3,
  Check,
  Shield,
  Star,
  ExternalLink,
  Sparkles,
  Download,
  Calendar,
  Lock,
  Cpu,
  Play,
  RotateCcw,
  QrCode,
  Printer,
  Copy,
  Camera,
  Settings,
  Activity,
  Trophy,
  ChevronRight,
  BarChart2,
  Clock,
  TrendingUp,
  Link2,
  Eye,
  Mail,
  X,
  LayoutDashboard,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Learner Profile & Portfolio — AfroKernel" },
      {
        name: "description",
        content:
          "Your professional Linux engineer portfolio: verifiable badges, course progress, practice exam scores, and system skills.",
      },
      { property: "og:title", content: "AfroKernel Learner Portfolio" },
    ],
  }),
  component: ProfilePage,
});

const DISTROS = [
  "Ubuntu Linux",
  "Arch Linux",
  "Fedora Workstation",
  "Debian GNU/Linux",
  "Kali Linux",
  "Alpine Linux",
  "Red Hat Enterprise Linux (RHEL)",
  "Linux Mint",
  "Pop!_OS",
  "NixOS",
];

const AVATAR_PRESETS = [
  {
    id: "tux",
    label: "Tux Penguin",
    icon: "🐧",
    bg: "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30",
  },
  {
    id: "hacker",
    label: "Cyber Defender",
    icon: "🔒",
    bg: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    icon: "⚙️",
    bg: "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30",
  },
  {
    id: "cloud",
    label: "Cloud Architect",
    icon: "☁️",
    bg: "from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "terminal",
    label: "CLI Master",
    icon: "💻",
    bg: "from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30",
  },
  {
    id: "kernel",
    label: "Kernel Hacker",
    icon: "⚡",
    bg: "from-yellow-500/20 to-yellow-600/10 text-yellow-400 border-yellow-500/30",
  },
];

const BADGES = [
  {
    id: "badge-linux-foundation",
    name: "Linux Core Administrator",
    category: "Fundamentals",
    icon: "🐧",
    desc: "Mastered Linux filesystem, commands, permissions, and systemd daemons.",
    req: "Complete 4+ Linux lessons",
    date: "August 2026",
    certId: "AK-LNX-84920",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
  },
  {
    id: "badge-security-guardian",
    name: "Cybersecurity Defender",
    category: "Security",
    icon: "🔒",
    desc: "Demonstrated competence in Nmap scanning, SSH hardening, and host firewalls.",
    req: "Complete Cybersecurity track",
    date: "August 2026",
    certId: "AK-SEC-49201",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    id: "badge-container-pro",
    name: "Docker Practitioner",
    category: "DevOps",
    icon: "🐳",
    desc: "Authored multi-stage Dockerfiles and orchestrated multi-container stacks.",
    req: "Complete DevOps track",
    date: "August 2026",
    certId: "AK-DOK-38291",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
  },
  {
    id: "badge-exam-ace",
    name: "Practice Exam Ace",
    category: "Assessment",
    icon: "🎯",
    desc: "Scored 80% or higher on the timed Practice Exam simulator.",
    req: "Pass Practice Exam with 80%+",
    date: "August 2026",
    certId: "AK-EXM-99120",
    color: "from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400",
  },
  {
    id: "badge-streak-fire",
    name: "Streak Warrior",
    category: "Consistency",
    icon: "🔥",
    desc: "Maintained active study streak on the AfroKernel platform.",
    req: "Active learning streak",
    date: "Active",
    certId: "AK-STR-10294",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400",
  },
  {
    id: "badge-xp-master",
    name: "XP Legend",
    category: "Mastery",
    icon: "⚡",
    desc: "Accumulated 1000+ XP through consistent learning and challenge completion.",
    req: "Earn 1000+ XP",
    date: "August 2026",
    certId: "AK-XPM-55012",
    color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400",
  },
];

type ProfileTab = "overview" | "progress" | "badges" | "certificates" | "settings";

function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    stats,
    enrolledCourses,
    completedLessons,
    examSubmissions,
    learnerProfile,
    updateLearnerProfile,
    signOut,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<(typeof BADGES)[0] | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<(typeof BADGES)[0] | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState("tux");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("Linux & DevOps Practitioner");
  const [bio, setBio] = useState(
    "Practicing Linux systems administration, cloud infrastructure, and shell automation.",
  );
  const [preferredDistro, setPreferredDistro] = useState("Ubuntu Linux");
  const [learningGoal, setLearningGoal] = useState("Master Linux Kernel & Enterprise DevOps");
  const [location, setLocation] = useState("Global / Remote");
  const [githubUrl, setGithubUrl] = useState("");
  const [website, setWebsite] = useState("");

  // Sync profile data when learnerProfile or user loads
  useEffect(() => {
    if (learnerProfile) {
      if (learnerProfile.displayName) setDisplayName(learnerProfile.displayName);
      if (learnerProfile.headline) setHeadline(learnerProfile.headline);
      if (learnerProfile.bio) setBio(learnerProfile.bio);
      if (learnerProfile.preferredDistro) setPreferredDistro(learnerProfile.preferredDistro);
      if (learnerProfile.learningGoal) setLearningGoal(learnerProfile.learningGoal);
      if (learnerProfile.location) setLocation(learnerProfile.location);
      if (learnerProfile.githubUrl) setGithubUrl(learnerProfile.githubUrl);
      if (learnerProfile.website) setWebsite(learnerProfile.website);
      if (learnerProfile.avatarUrl) setSelectedAvatarPreset(learnerProfile.avatarUrl);
    } else if (user) {
      const fallbackName =
        (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Learner";
      setDisplayName((prev) => prev || fallbackName);
    }
  }, [learnerProfile, user]);

  const effectiveDisplayName =
    displayName || learnerProfile?.displayName || user?.email?.split("@")[0] || "Learner";
  const xp = stats?.xp || learnerProfile?.xp || 150;
  const level = stats?.level || learnerProfile?.level || 1;
  const streak = stats?.streak_days || learnerProfile?.streak || 1;
  const xpCurrentLevelFloor = (level - 1) * 250;
  const levelProgressPct = Math.min(100, Math.round(((xp - xpCurrentLevelFloor) / 250) * 100));
  const badgesEarned = BADGES.slice(0, Math.min(BADGES.length, Math.max(1, Math.floor(xp / 200))));
  const currentPreset =
    AVATAR_PRESETS.find((p) => p.id === selectedAvatarPreset) || AVATAR_PRESETS[0];

  // 12-week activity heatmap
  const heatmapData = useMemo(
    () =>
      Array.from({ length: 84 }).map((_, i) => ({
        day: i,
        intensity: i % 2 === 0 || i % 5 === 0 || i > 75 ? (i % 4) + 1 : 0,
      })),
    [],
  );

  const skillsData = [
    { name: "Linux CLI & Navigation", pct: 90, grade: "Advanced" },
    { name: "File Permissions (chmod/chown)", pct: 85, grade: "Advanced" },
    { name: "Systemd & Daemons", pct: 75, grade: "Proficient" },
    { name: "Bash Scripting", pct: 70, grade: "Proficient" },
    { name: "Docker Containers", pct: 65, grade: "Intermediate" },
    { name: "Network Diagnostics", pct: 60, grade: "Intermediate" },
  ];

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateLearnerProfile({
      displayName: effectiveDisplayName,
      headline,
      bio,
      preferredDistro,
      learningGoal,
      location,
      githubUrl,
      website,
      avatarUrl: selectedAvatarPreset,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
    setActiveTab("overview");
  }

  function handleShareProfile() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function selectPresetAndSave(presetId: string) {
    setSelectedAvatarPreset(presetId);
    updateLearnerProfile({ avatarUrl: presetId });
    setIsEditingAvatar(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "badges", label: "Badges", icon: Trophy },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      {/* Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-card p-4 shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-500">Profile Updated</h4>
            <p className="text-[11px] text-muted-foreground">
              Changes saved to your learner portfolio.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Nav */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-secondary flex items-center gap-1.5 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copiedLink ? "Link Copied! ✓" : "Share Profile"}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className="px-3.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5 transition"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </button>
          </div>
        </div>

        {/* ── HERO CARD ── */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
          {/* Banner */}
          <div
            className="h-40 sm:h-52 w-full relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse 90% 80% at 10% 10%, oklch(0.86 0.17 92 / 0.2), transparent 55%),
                radial-gradient(ellipse 70% 60% at 90% 90%, oklch(0.5 0.25 270 / 0.25), transparent 50%),
                radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.4 0.15 200 / 0.15), transparent 60%),
                linear-gradient(135deg, oklch(0.11 0.02 260), oklch(0.18 0.03 280))
              `,
            }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            {/* Decorative floating elements */}
            <div className="absolute top-4 right-6 text-4xl opacity-20 animate-pulse">🐧</div>
            <div className="absolute top-8 right-24 text-2xl opacity-15">⚡</div>
            <div className="absolute bottom-4 right-40 text-xl opacity-10">🔒</div>
            <div className="absolute bottom-3 left-6 font-mono text-[11px] text-primary/60 bg-black/30 px-3 py-1 rounded-full border border-primary/20">
              afrokernel:~$ whoami
            </div>
            {/* Level badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-primary/30 backdrop-blur text-xs font-bold text-primary flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Level {level} — {xp} XP
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 backdrop-blur text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> {streak}d Streak
              </div>
            </div>
          </div>

          {/* Profile content */}
          <div className="px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Avatar */}
                <div className="relative group">
                  <div
                    className={`h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-4 border-card shadow-2xl flex items-center justify-center text-5xl sm:text-6xl bg-gradient-to-br ${currentPreset.bg} border`}
                  >
                    {currentPreset.icon}
                  </div>
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition hover:scale-110"
                    title="Change Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground">
                      {effectiveDisplayName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Shield className="h-3 w-3" /> Certified Practitioner
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{headline}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-foreground/80">
                      🐧 {preferredDistro}
                    </span>
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition"
                      >
                        <Github className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Portfolio
                      </a>
                    )}
                  </div>
                  {bio && (
                    <p className="text-xs text-muted-foreground max-w-xl mt-2 leading-relaxed">
                      {bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side stats */}
              <div className="shrink-0 flex flex-row sm:flex-col items-end gap-3 pb-1">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Level Progress</div>
                  <div className="w-40 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                      style={{ width: `${levelProgressPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {levelProgressPct}% → Level {level + 1}
                  </div>
                </div>
                <div className="flex gap-2">
                  {badgesEarned.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      title={b.name}
                      className="text-xl cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setSelectedBadge(b)}
                    >
                      {b.icon}
                    </div>
                  ))}
                  {badgesEarned.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border text-xs font-bold flex items-center justify-center text-muted-foreground">
                      +{badgesEarned.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-primary" },
                {
                  label: "Lessons Done",
                  value: completedLessons?.length || 0,
                  icon: CheckCircle2,
                  color: "text-emerald-400",
                },
                {
                  label: "Courses",
                  value: enrolledCourses?.length || 1,
                  icon: BookOpen,
                  color: "text-blue-400",
                },
                {
                  label: "Badges Earned",
                  value: badgesEarned.length,
                  icon: Trophy,
                  color: "text-amber-400",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-secondary/40 p-4 text-center hover:border-primary/30 transition"
                >
                  <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
                  <div className="text-xl font-bold font-mono text-foreground">{value}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex flex-wrap gap-1 border-b border-border pb-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                activeTab === id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* ══ TAB: OVERVIEW ══ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Activity Heatmap */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Learning Activity (12 Weeks)
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedLessons?.length || 0} contributions
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {heatmapData.map((cell) => (
                  <div
                    key={cell.day}
                    title={`Day ${cell.day + 1}`}
                    className={`w-3.5 h-3.5 rounded-sm transition hover:ring-1 hover:ring-primary/50 ${
                      cell.intensity === 0
                        ? "bg-secondary/60"
                        : cell.intensity === 1
                          ? "bg-primary/25"
                          : cell.intensity === 2
                            ? "bg-primary/45"
                            : cell.intensity === 3
                              ? "bg-primary/70"
                              : "bg-primary"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                {[
                  "bg-secondary/60",
                  "bg-primary/25",
                  "bg-primary/45",
                  "bg-primary/70",
                  "bg-primary",
                ].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Technical Skills
              </h2>
              <div className="space-y-3">
                {skillsData.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">{skill.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          skill.pct >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : skill.pct >= 65
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {skill.grade}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Exams */}
            {examSubmissions && examSubmissions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Recent Exam Results
                </h2>
                <div className="space-y-2">
                  {examSubmissions.slice(0, 5).map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border"
                    >
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {exam.trackLabel}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {new Date(exam.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold font-mono ${exam.passed ? "text-emerald-400" : "text-amber-400"}`}
                        >
                          {exam.percentage}%
                        </div>
                        <div
                          className={`text-[10px] font-bold ${exam.passed ? "text-emerald-400" : "text-amber-400"}`}
                        >
                          {exam.passed ? "✓ Passed" : "✗ Failed"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: PROGRESS ══ */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <h2 className="font-bold text-sm text-foreground">Overall Progress</h2>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="text-xl font-bold font-mono text-primary">
                    {completedLessons?.length || 0}
                  </div>
                  <div className="text-muted-foreground mt-1">Lessons Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {enrolledCourses?.length || 1}
                  </div>
                  <div className="text-muted-foreground mt-1">Courses Enrolled</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {examSubmissions?.length || 0}
                  </div>
                  <div className="text-muted-foreground mt-1">Exams Taken</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {CATALOG_COURSES.map((course) => {
                const courseLessons = course.lessons ?? [];
                const completed = courseLessons.filter((l) =>
                  completedLessons?.includes(l.slug),
                ).length;
                const pct =
                  courseLessons.length > 0
                    ? Math.round((completed / courseLessons.length) * 100)
                    : 0;
                const isEnrolled =
                  enrolledCourses?.includes(course.slug) || course.slug === "linux";

                return (
                  <div
                    key={course.id}
                    className={`rounded-2xl border bg-card p-5 space-y-3 transition ${isEnrolled ? "border-border hover:border-primary/30" : "border-border/40 opacity-60"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-foreground">{course.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                            {course.category}
                          </span>
                          {pct === 100 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{course.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-base font-bold font-mono ${pct === 100 ? "text-emerald-400" : pct > 0 ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {pct}%
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {completed}/{courseLessons.length} lessons
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {courseLessons.slice(0, 8).map((lesson) => {
                          const done = completedLessons?.includes(lesson.slug);
                          return (
                            <div
                              key={lesson.slug}
                              title={lesson.title}
                              className={`w-2.5 h-2.5 rounded-full ${done ? "bg-primary" : "bg-secondary border border-border"}`}
                            />
                          );
                        })}
                        {courseLessons.length > 8 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{courseLessons.length - 8}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/courses/$slug"
                        params={{ slug: course.slug }}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        {pct > 0 ? "Continue" : "Start"} <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ TAB: BADGES ══ */}
        {activeTab === "badges" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-foreground">Achievement Badges</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {badgesEarned.length} earned · {BADGES.length - badgesEarned.length} locked
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map((badge, idx) => {
                const earned = idx < badgesEarned.length;
                return (
                  <button
                    key={badge.id}
                    onClick={() => earned && setSelectedBadge(badge)}
                    className={`text-left rounded-2xl border bg-card p-5 space-y-3 transition ${earned ? "hover:border-primary/40 cursor-pointer" : "opacity-40 cursor-default"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`text-3xl p-2 rounded-xl bg-gradient-to-br ${badge.color} border`}
                      >
                        {badge.icon}
                      </div>
                      {earned ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Earned
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{badge.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">{badge.desc}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                        {badge.category}
                      </span>
                      {earned && <span className="text-muted-foreground">{badge.date}</span>}
                      {!earned && <span className="text-muted-foreground">{badge.req}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ TAB: CERTIFICATES ══ */}
        {activeTab === "certificates" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-lg text-foreground">Verifiable Certificates</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your earned credentials — share, download, or verify online.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {badgesEarned.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <h3 className="font-bold text-sm text-foreground">{badge.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{badge.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-[10px] text-muted-foreground">
                        Certificate ID
                      </span>
                      <code className="text-[11px] font-mono font-bold text-primary">
                        {badge.certId}
                      </code>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Issued: {badge.date}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingCertificate(badge)}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://afrokernel.com/verify/${badge.certId}`,
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {badgesEarned.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">No certificates yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete courses to earn verifiable credentials
                </p>
                <Link
                  to="/courses"
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Browse Courses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: SETTINGS ══ */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-bold text-lg text-foreground">Profile Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your public learner profile and portfolio information.
              </p>
            </div>

            {/* Avatar picker */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-foreground">Avatar / Identity</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatarPreset(preset.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                      selectedAvatarPreset === preset.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal info */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-foreground">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Linux & DevOps Engineer"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short bio about your Linux journey..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nairobi, Kenya"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Preferred Linux Distro
                  </label>
                  <select
                    value={preferredDistro}
                    onChange={(e) => setPreferredDistro(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {DISTROS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Learning Goal
                </label>
                <input
                  type="text"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="e.g. Get RHCSA certified by Q4 2026"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Social links */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-foreground">Social & Portfolio Links</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Profile Changes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-5 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Avatar Selection Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Choose Your Avatar
              </h3>
              <button
                onClick={() => setIsEditingAvatar(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPresetAndSave(preset.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition hover:scale-105 ${
                    selectedAvatarPreset === preset.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <span className="text-4xl">{preset.icon}</span>
                  <span className="text-xs font-bold text-foreground">{preset.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsEditingAvatar(false)}
              className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedBadge.color} border flex items-center justify-center text-4xl mx-auto`}
            >
              {selectedBadge.icon}
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-black text-xl text-foreground">
                {selectedBadge.name}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedBadge.desc}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{selectedBadge.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-semibold">{selectedBadge.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate ID</span>
                <code className="font-mono text-primary font-bold">{selectedBadge.certId}</code>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewingCertificate(selectedBadge)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> View Certificate
              </button>
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Certificate design */}
            <div
              className="relative p-10 text-center space-y-6"
              style={{
                background: "linear-gradient(135deg, oklch(0.12 0.02 260), oklch(0.18 0.03 290))",
                border: "2px solid oklch(0.86 0.17 92 / 0.4)",
                borderRadius: "1.5rem",
              }}
            >
              <div className="absolute inset-0 grid-bg opacity-10 rounded-3xl" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-center gap-3">
                  <Shield className="w-7 h-7 text-primary" />
                  <span className="text-primary font-mono font-bold text-sm tracking-widest">
                    AFROKERNEL SYSTEMS
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    This is to certify that
                  </p>
                  <h2 className="text-3xl font-display font-black text-foreground mt-2">
                    {effectiveDisplayName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    has been awarded
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="text-4xl">{viewingCertificate.icon}</span>
                    <h3 className="text-2xl font-display font-black text-gradient">
                      {viewingCertificate.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    {viewingCertificate.desc}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/40 text-xs">
                  <div>
                    <div className="text-muted-foreground">Issued</div>
                    <div className="font-semibold text-foreground">{viewingCertificate.date}</div>
                  </div>
                  <div className="h-8 border-l border-border/60" />
                  <div>
                    <div className="text-muted-foreground">Certificate ID</div>
                    <code className="font-mono font-bold text-primary">
                      {viewingCertificate.certId}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-secondary border border-border font-bold text-xs hover:bg-secondary/80 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://afrokernel.com/verify/${viewingCertificate.certId}`,
                  );
                }}
                className="flex-1 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5" /> Copy Verify Link
              </button>
              <button
                onClick={() => setViewingCertificate(null)}
                className="px-6 py-3 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterNav />
    </div>
  );
}
