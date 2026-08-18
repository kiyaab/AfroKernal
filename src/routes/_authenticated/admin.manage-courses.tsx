import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCourseFile, readNotesFile } from "@/lib/course-uploads";
import { FileUploadField } from "@/components/FileUploadField";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/manage-courses")({
  component: ManageCoursesPage,
});

function ManageCoursesPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [course, setCourse] = useState({
    title: "",
    slug: "",
    description: "",
    category: "Fundamentals",
    difficulty: "beginner",
    cover_url: "",
  });

  const [lesson, setLesson] = useState({
    title: "Lesson 1: Introduction",
    video_url: "",
    pdf_url: "",
    content: "",
    xp_reward: 50,
  });

  const [quiz, setQuiz] = useState({
    title: "Lesson 1 Quiz",
    passing_score: 70,
    xp_reward: 25,
  });

  const [questions, setQuestions] = useState<
    Array<{ prompt: string; choices: string[]; correct_index: number; explanation: string }>
  >([{ prompt: "", choices: ["", "", "", ""], correct_index: 0, explanation: "" }]);

  async function handleSave() {
    setBusy(true);
    setError(null);
    setSuccess(false);

    try {
      const courseSlug =
        course.slug ||
        course.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const lessonSlug = lesson.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!course.title || !lesson.title) throw new Error("Course and Lesson titles are required.");

      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id;

      const { data: newCourse, error: cErr } = await supabase
        .from("courses")
        .insert({
          title: course.title,
          slug: courseSlug,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          cover_url: course.cover_url,
          published: true,
          sort_order: 99,
          created_by: userId,
        } as never)
        .select("id")
        .single();

      if (cErr) throw cErr;
      const courseId = newCourse.id;

      const { data: newLesson, error: lErr } = await supabase
        .from("lessons")
        .insert({
          course_id: courseId,
          title: lesson.title,
          slug: lessonSlug,
          lesson_type: "video",
          video_url: lesson.video_url,
          pdf_url: lesson.pdf_url || null,
          starter_code: lesson.pdf_url || null,
          content: lesson.content,
          xp_reward: lesson.xp_reward,
          sort_order: 1,
          published: true,
        } as never)
        .select("id")
        .single();

      if (lErr) throw lErr;
      const lessonId = newLesson.id;

      const validQuestions = questions.filter((q) => q.prompt.trim() !== "");
      if (validQuestions.length > 0) {
        const { error: quizErr } = await supabase.from("quizzes").insert({
          lesson_id: lessonId,
          title: quiz.title,
          passing_score: quiz.passing_score,
          xp_reward: quiz.xp_reward,
        } as never);
        if (quizErr) throw quizErr;

        const { data: insertedQuiz } = await supabase
          .from("quizzes")
          .select("id")
          .eq("lesson_id", lessonId)
          .single();
        if (insertedQuiz) {
          const qInserts = validQuestions.map((q, i) => ({
            quiz_id: insertedQuiz.id,
            prompt: q.prompt,
            choices: q.choices,
            correct_index: q.correct_index,
            explanation: q.explanation,
            sort_order: i,
          }));
          const { error: qErr } = await supabase.from("quiz_questions").insert(qInserts as never);
          if (qErr) throw qErr;
        }
      }

      setSuccess(true);
      setTimeout(() => navigate({ to: "/admin" }), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-destructive">{error}</span>}
            {success && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Created successfully!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={busy || success}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 shadow-md transition"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Full Course
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Create All-in-One Course
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Generate a complete course package (Course + Video + PDF + Quiz). Upload PDF and notes
            from your device — learners get Reading mode.
          </p>
        </div>

        <section className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h2 className="text-lg font-semibold">Course Details</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <LabeledInput
              label="Course Title"
              value={course.title}
              onChange={(v) => setCourse({ ...course, title: v })}
              placeholder="e.g. Linux Basics"
            />
            <LabeledInput
              label="URL Slug (Optional)"
              value={course.slug}
              onChange={(v) => setCourse({ ...course, slug: v })}
              placeholder="e.g. linux-basics"
            />
            <LabeledInput
              label="Category"
              value={course.category}
              onChange={(v) => setCourse({ ...course, category: v })}
            />
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={course.difficulty}
                onChange={(e) => setCourse({ ...course, difficulty: e.target.value })}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <LabeledInput
            label="Cover Image URL"
            value={course.cover_url}
            onChange={(v) => setCourse({ ...course, cover_url: v })}
          />
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={3}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </section>

        <section className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" /> Video Lesson & Resources
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <LabeledInput
                label="Lesson Title"
                value={lesson.title}
                onChange={(v) => setLesson({ ...lesson, title: v })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                XP Reward
              </label>
              <input
                type="number"
                value={lesson.xp_reward}
                onChange={(e) =>
                  setLesson({ ...lesson, xp_reward: parseInt(e.target.value || "0") })
                }
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <LabeledInput
            label="YouTube Video URL"
            value={lesson.video_url}
            onChange={(v) => setLesson({ ...lesson, video_url: v })}
            placeholder="https://www.youtube.com/watch?v=..."
          />

          <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
            <FileUploadField
              label="PDF study material (from device)"
              hint="Learners can read this PDF in full-screen Reading mode."
              accept="application/pdf,.pdf"
              currentUrl={lesson.pdf_url || null}
              onFile={async (file) => {
                const { url } = await uploadCourseFile(file, "prepare-course");
                setLesson((l) => ({ ...l, pdf_url: url }));
              }}
              onClear={() => setLesson((l) => ({ ...l, pdf_url: "" }))}
            />
            <LabeledInput
              label="Or paste PDF URL"
              value={lesson.pdf_url}
              onChange={(v) => setLesson({ ...lesson, pdf_url: v })}
              placeholder="https://link-to-your-pdf.pdf"
            />
          </div>

          <div className="space-y-3">
            <FileUploadField
              label="Notes file (from device)"
              hint="Upload .md or .txt — fills the Markdown notes below."
              accept=".md,.markdown,.txt,text/plain,text/markdown"
              onFile={async (file) => {
                const text = await readNotesFile(file);
                setLesson((l) => ({ ...l, content: text }));
              }}
            />
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Markdown Notes
              </label>
              <textarea
                value={lesson.content}
                onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
                rows={5}
                placeholder="## Lesson Notes\n\nExplain the concept here..."
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Lesson Quiz Exam
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <LabeledInput
                label="Quiz Title"
                value={quiz.title}
                onChange={(v) => setQuiz({ ...quiz, title: v })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Passing Score %
              </label>
              <input
                type="number"
                value={quiz.passing_score}
                onChange={(e) =>
                  setQuiz({ ...quiz, passing_score: parseInt(e.target.value || "0") })
                }
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quiz XP Reward
              </label>
              <input
                type="number"
                value={quiz.xp_reward}
                onChange={(e) => setQuiz({ ...quiz, xp_reward: parseInt(e.target.value || "0") })}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-primary bg-primary/20 w-6 h-6 rounded flex items-center justify-center">
                    Q{qi + 1}
                  </span>
                  <input
                    value={q.prompt}
                    placeholder="Question prompt (leave blank to skip)"
                    onChange={(e) =>
                      setQuestions((qs) =>
                        qs.map((x, i) => (i === qi ? { ...x, prompt: e.target.value } : x)),
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 pl-8">
                  {q.choices.map((c, ci) => (
                    <label
                      key={ci}
                      className="flex items-center gap-2 text-sm bg-background px-3 py-1.5 rounded-lg border border-border"
                    >
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correct_index === ci}
                        onChange={() =>
                          setQuestions((qs) =>
                            qs.map((x, i) => (i === qi ? { ...x, correct_index: ci } : x)),
                          )
                        }
                        className="accent-primary w-4 h-4"
                      />
                      <input
                        value={c}
                        placeholder={`Option ${ci + 1}`}
                        onChange={(e) =>
                          setQuestions((qs) =>
                            qs.map((x, i) =>
                              i === qi
                                ? {
                                    ...x,
                                    choices: x.choices.map((cc, j) =>
                                      j === ci ? e.target.value : cc,
                                    ),
                                  }
                                : x,
                            ),
                          )
                        }
                        className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
                <div className="pl-8 mt-3">
                  <input
                    value={q.explanation}
                    placeholder="Explanation (shown after answering)"
                    onChange={(e) =>
                      setQuestions((qs) =>
                        qs.map((x, i) => (i === qi ? { ...x, explanation: e.target.value } : x)),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setQuestions([
                  ...questions,
                  { prompt: "", choices: ["", "", "", ""], correct_index: 0, explanation: "" },
                ])
              }
              className="text-sm px-4 py-2 rounded-xl border border-dashed border-border hover:bg-accent hover:text-primary inline-flex items-center justify-center w-full gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />
    </div>
  );
}
