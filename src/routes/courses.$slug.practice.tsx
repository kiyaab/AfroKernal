import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getCourseBySlug, CATALOG_COURSES } from "@/lib/courses-catalog-data";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudyTimer } from "@/components/StudyTimer";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
  Lock,
  ArrowRight,
  Award,
  Sparkles,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug/practice")({
  head: ({ params }) => ({
    meta: [
      { title: `Practice Quiz — ${params.slug.toUpperCase()} | AfroKernel` },
      { name: "description", content: `Practice quiz for the AfroKernel ${params.slug} course.` },
    ],
  }),
  component: PracticePage,
});

type QuestionItem = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  lessonTitle: string;
};

function PracticePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, saveExamResult, stats } = useAuth();

  const [mode, setMode] = useState<"menu" | "quiz" | "result">("menu");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [score, setScore] = useState<{
    correct: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  const courseMeta = getCourseBySlug(slug) || CATALOG_COURSES[0];

  // Extract all questions from course lessons
  const questions: QuestionItem[] = courseMeta.lessons
    .filter((l) => !!l.quiz)
    .map((l) => ({
      id: l.id,
      question: l.quiz!.question,
      choices: l.quiz!.choices,
      correctIndex: l.quiz!.correctIndex,
      explanation: l.quiz!.explanation,
      lessonTitle: l.title,
    }));

  const currentQ = questions[activeIdx] || questions[0];

  function startQuiz() {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: `/courses/${slug}/practice`, mode: "signup" },
      });
      return;
    }

    setAnswers({});
    setActiveIdx(0);
    setScore(null);
    setMode("quiz");
  }

  async function submitQuiz() {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const total = questions.length || 1;
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= 70;

    const result = { correct, total, percentage, passed };
    setScore(result);
    setMode("result");

    // Save to user data and admin center
    if (user) {
      await saveExamResult({
        trackId: slug,
        trackLabel: `${courseMeta.title} (Practice Quiz)`,
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
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/courses/$slug"
              params={{ slug }}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Syllabus
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="font-bold text-xs text-foreground truncate max-w-xs">
              {courseMeta.title} Practice Quiz
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StudyTimer />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10">
        {/* Mode 1: Menu / Start Screen */}
        {mode === "menu" && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 text-center space-y-6 shadow-xl">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                End-of-Course Knowledge Check
              </span>
              <h1 className="text-3xl font-display font-black text-foreground">
                {courseMeta.title} Practice Quiz
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Test your understanding across all {courseMeta.lessons.length} lessons. Instant
                scoring, explanation reviews, and bonus XP upon passing.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs text-left max-w-lg mx-auto py-2">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground block">Questions:</span>
                <span className="font-bold text-foreground text-sm">
                  {questions.length} Questions
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground block">Passing Score:</span>
                <span className="font-bold text-foreground text-sm">70% Required</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground block">Reward:</span>
                <span className="font-bold text-primary text-sm">+150 Bonus XP</span>
              </div>
            </div>

            {/* Auth check before starting */}
            {!user ? (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 max-w-md mx-auto text-xs space-y-3">
                <div className="font-bold text-primary flex items-center justify-center gap-1.5">
                  <Lock className="h-4 w-4" /> Sign In Required to Record Score
                </div>
                <p className="text-muted-foreground">
                  Sign up or log in to record your test scores in your profile and Admin overview.
                </p>
                <button
                  onClick={() =>
                    navigate({
                      to: "/auth",
                      search: { redirect: `/courses/${slug}/practice`, mode: "signup" },
                    })
                  }
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110"
                >
                  Sign In to Start Quiz
                </button>
              </div>
            ) : (
              <button
                onClick={startQuiz}
                className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition shadow-[var(--shadow-glow)] inline-flex items-center gap-2"
              >
                Start Practice Quiz <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Mode 2: Active Quiz */}
        {mode === "quiz" && questions.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in">
            {/* Header / Question Counter */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Question {activeIdx + 1} of {questions.length}
                </span>
                <p className="text-xs text-muted-foreground">{currentQ.lessonTitle}</p>
              </div>

              <button
                onClick={submitQuiz}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-primary hover:text-primary-foreground transition"
              >
                Submit ({Object.keys(answers).length}/{questions.length})
              </button>
            </div>

            {/* Question Body */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground leading-snug">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.choices.map((choice, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }))}
                      className={`w-full p-4 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-secondary/30 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center font-mono font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="font-medium text-foreground">{choice}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-0"
              >
                Previous
              </button>

              {activeIdx < questions.length - 1 ? (
                <button
                  onClick={() => setActiveIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  Finish & View Score
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode 3: Result & Explanations */}
        {mode === "result" && score && (
          <div className="space-y-8 animate-in fade-in">
            <div
              className={`rounded-3xl border p-8 text-center space-y-4 shadow-xl ${
                score.passed
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto text-white ${
                  score.passed ? "bg-emerald-500" : "bg-amber-500"
                }`}
              >
                {score.passed ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <Award className="h-8 w-8" />
                )}
              </div>

              <h2 className="text-3xl font-display font-black text-foreground">
                {score.passed ? "Quiz Passed! Great Job!" : "Quiz Completed"}
              </h2>

              <div className="font-mono text-5xl font-black text-primary my-2">
                {score.percentage}%
              </div>

              <p className="text-sm text-muted-foreground">
                You answered <strong className="text-foreground">{score.correct}</strong> of{" "}
                {score.total} questions correctly.
                {score.passed
                  ? " You've successfully proven your knowledge on this track!"
                  : " A score of 70% is required. Review the explanations below and try again."}
              </p>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={startQuiz}
                  className="px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-secondary flex items-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" /> Retake Quiz
                </button>
                <Link
                  to="/courses/$slug"
                  params={{ slug }}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  Back to Syllabus
                </Link>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Answer Explanations</h3>
              {questions.map((q, idx) => {
                const userChoice = answers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-foreground">
                        {idx + 1}. {q.question}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-secondary/50 text-muted-foreground">
                      <span className="font-bold text-primary block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
