import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Check,
  Lock,
  UserCheck,
  Flame,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EXAM_QUESTIONS, ExamQuestion } from "@/lib/exam-questions-data";
import { useAuth } from "@/lib/AuthContext";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";

export const Route = createFileRoute("/exam/practice")({
  head: () => ({
    meta: [
      { title: "Linux Practice Certification Exam — AfroKernel" },
      {
        name: "description",
        content:
          "Test your Linux administration, cybersecurity, and DevOps knowledge with timed practice questions, instant grading, and explanations.",
      },
      { property: "og:title", content: "AfroKernel Linux Practice Exam" },
    ],
  }),
  component: ExamPracticePage,
});

function ExamPracticePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, saveExamResult, stats } = useAuth();

  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [isExamActive, setIsExamActive] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Active exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes

  const questions: ExamQuestion[] = EXAM_QUESTIONS.filter(
    (q) => selectedTrack === "all" || q.track === selectedTrack,
  );

  const currentQ = questions[currentIndex] || questions[0];

  // Timer countdown
  useEffect(() => {
    if (!isExamActive || isExamCompleted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExamActive, isExamCompleted]);

  const handleStartExam = () => {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: "/exam/practice", mode: "signup" },
      });
      return;
    }

    setUserAnswers({});
    setCurrentIndex(0);
    setTimeLeftSeconds(600);
    setIsExamActive(true);
    setIsExamCompleted(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 70;
    return { correct, total: questions.length, percentage, passed };
  };

  const handleFinishExam = async () => {
    setIsExamCompleted(true);
    setIsExamActive(false);

    const { correct, total, percentage, passed } = calculateScore();

    const trackLabels: Record<string, string> = {
      all: "Comprehensive (All Domains)",
      linux: "Linux Fundamentals",
      security: "Cybersecurity Fundamentals",
      devops: "DevOps Fundamentals",
    };

    if (user) {
      await saveExamResult({
        trackId: selectedTrack,
        trackLabel: trackLabels[selectedTrack] || "Linux Practice Exam",
        score: correct,
        totalQuestions: total,
        percentage,
        passed,
        answersSummary: {
          correct,
          incorrect: total - correct,
        },
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-12">
        {/* Top Banner */}
        {!isExamActive && !isExamCompleted && (
          <div className="mb-10 text-center flex flex-col gap-3 items-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
              <Award className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-display font-black text-foreground">
              Linux Practice Exam
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Test your knowledge with real multiple-choice questions before taking official
              certification. Instant scoring, explanations, and results saved to your profile and
              admin dashboard.
            </p>
          </div>
        )}

        {/* Mode 1: Start Screen & Track Selector */}
        {!isExamActive && !isExamCompleted && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold mb-2">Select Exam Specialization Track</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Choose a track to test your specific skills:
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "all",
                    label: "Comprehensive (All Domains)",
                    icon: "🎯",
                    desc: "Mix of Linux, Security & DevOps",
                  },
                  {
                    id: "linux",
                    label: "Linux Fundamentals",
                    icon: "🐧",
                    desc: "Commands, Permissions, Filesystem & Systemd",
                  },
                  {
                    id: "security",
                    label: "Cybersecurity Fundamentals",
                    icon: "🔒",
                    desc: "Nmap, Wireshark, Hardening & Firewalls",
                  },
                  {
                    id: "devops",
                    label: "DevOps & Containers",
                    icon: "⚙️",
                    desc: "Docker, Kubernetes, CI/CD & Automation",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedTrack === t.id
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_var(--primary)]"
                        : "border-border bg-secondary/30 hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <span className="text-2xl mb-2 block">{t.icon}</span>
                      <h3 className="font-bold text-sm text-foreground">{t.label}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Rules & Details */}
            <div className="rounded-2xl bg-secondary/40 border border-border p-5 text-xs space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Exam Parameters
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 text-muted-foreground">
                <div>
                  <span className="text-foreground font-semibold block">Questions:</span>
                  <span>{questions.length} multiple-choice</span>
                </div>
                <div>
                  <span className="text-foreground font-semibold block">Time Limit:</span>
                  <span>10 Minutes (600s)</span>
                </div>
                <div>
                  <span className="text-foreground font-semibold block">Passing Threshold:</span>
                  <span>70% (Instant Grading)</span>
                </div>
              </div>
            </div>

            {/* Auth Gate Box */}
            {!user ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-xs space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="font-bold text-primary flex items-center justify-center sm:justify-start gap-1.5 text-sm">
                    <Lock className="h-4 w-4" /> Sign Up / Sign In to Start Exam
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Your exam answers and certificate readiness will be automatically saved to your
                    profile and admin records.
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate({
                      to: "/auth",
                      search: { redirect: "/exam/practice", mode: "signup" },
                    })
                  }
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 shrink-0 shadow-[var(--shadow-glow)]"
                >
                  Sign Up Free & Start
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span>
                    Ready as <strong className="text-foreground">{user.email}</strong>
                  </span>
                </div>
                <button
                  onClick={handleStartExam}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
                >
                  Start Practice Exam <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Active Exam Screen */}
        {isExamActive && !isExamCompleted && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in">
            {/* Header Bar with Timer & Question Navigator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <h3 className="text-sm font-semibold text-muted-foreground">{currentQ.domain}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-background font-mono text-sm font-bold text-primary">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </div>

                <button
                  onClick={handleFinishExam}
                  className="px-4 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                >
                  Submit Exam ({answeredCount}/{questions.length})
                </button>
              </div>
            </div>

            {/* Question Index Pills */}
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : isAnswered
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Body */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground leading-snug">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_var(--primary)]"
                          : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:text-primary">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span
                          className={`text-sm font-medium ${isSelected ? "text-primary font-bold" : "text-foreground"}`}
                        >
                          {optionText}
                        </span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-0 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-1.5"
                >
                  Next Question <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)]"
                >
                  Finish & Submit Exam
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode 3: Results & Explanations */}
        {isExamCompleted && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {(() => {
              const { correct, total, percentage, passed } = calculateScore();
              return (
                <div
                  className={`rounded-3xl border p-8 text-center space-y-4 shadow-xl ${
                    passed
                      ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]"
                      : "border-amber-500/40 bg-amber-500/5"
                  }`}
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto text-white ${
                      passed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  >
                    {passed ? <CheckCircle2 className="h-8 w-8" /> : <Award className="h-8 w-8" />}
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Practice Exam Result
                    </span>
                    <h2 className="text-3xl font-display font-bold text-foreground">
                      {passed ? "Congratulations! You Passed" : "Good Effort — Keep Studying!"}
                    </h2>
                  </div>

                  <div className="font-mono text-6xl font-extrabold text-primary my-3 glow-yellow">
                    {percentage}%
                  </div>

                  <p className="text-sm text-muted-foreground">
                    You answered <strong className="text-foreground">{correct}</strong> out of{" "}
                    {total} questions correctly.
                    {passed
                      ? " You have demonstrated solid command-line fundamentals and earned +150 XP!"
                      : " A score of 70% or higher is required to pass. Review the explanations below and try again."}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <button
                      onClick={handleStartExam}
                      className="px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" /> Retake Practice Exam
                    </button>
                    <Link
                      to="/certification"
                      className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
                    >
                      Get Officially Certified <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Questions Review */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Questions & Explanations Review
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-6 space-y-4 bg-card ${
                        isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                              isCorrect ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-sm text-foreground">{q.question}</h4>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isThisCorrect = optIdx === q.correctIndex;
                          const isThisUserChoice = optIdx === userChoice;

                          let style = "border-border bg-background/50 text-muted-foreground";
                          if (isThisCorrect) {
                            style =
                              "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold";
                          } else if (isThisUserChoice && !isThisCorrect) {
                            style = "border-rose-500 bg-rose-500/10 text-rose-500 line-through";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                            >
                              <span>{opt}</span>
                              {isThisCorrect && (
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3.5 rounded-xl bg-secondary/50 border border-border text-xs space-y-1">
                        <span className="font-bold text-primary block">Explanation:</span>
                        <p className="text-foreground/90 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
