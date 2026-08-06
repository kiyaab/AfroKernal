import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLessonQuizForAdmin, upsertQuiz, getLessonChallengeForAdmin, upsertChallenge } from "@/lib/quiz.functions";
import { uploadCourseFile, readNotesFile } from "@/lib/course-uploads";
import { FileUploadField } from "@/components/FileUploadField";
import { ArrowLeft, Plus, Trash2, Video, FileText, Terminal as TermIcon, Save, Eye, GripVertical, Loader2, HelpCircle, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/$courseId")({
  component: CourseEditor,
});

type LessonType = "video" | "notes" | "practice" | "pdf";
type Lesson = {
  id: string; course_id: string; slug: string; title: string; lesson_type: string;
  video_url: string | null; content: string | null; starter_code: string | null;
  expected_output: string | null; xp_reward: number; sort_order: number; published: boolean;
  pdf_url?: string | null;
};

function CourseEditor() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["admin-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("sort_order");
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });

  const [form, setForm] = useState({
    title: "", slug: "", description: "", category: "", difficulty: "beginner",
    cover_url: "", published: false, sort_order: 0,
  });

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title ?? "",
        slug: course.slug ?? "",
        description: course.description ?? "",
        category: course.category ?? "",
        difficulty: course.difficulty ?? "beginner",
        cover_url: course.cover_url ?? "",
        published: !!course.published,
        sort_order: course.sort_order ?? 0,
      });
    }
  }, [course]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").update(form as never).eq("id", courseId);
      if (error) throw error;
      // Publishing a course should unlock its lessons for learners
      if (form.published) {
        await supabase.from("lessons").update({ published: true } as never).eq("course_id", courseId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-course", courseId] });
      qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["public-courses"] });
      qc.invalidateQueries({ queryKey: ["public-course"] });
      qc.invalidateQueries({ queryKey: ["public-course-lessons"] });
      qc.invalidateQueries({ queryKey: ["public-lesson"] });
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => navigate({ to: "/admin" }),
  });

  const [newLesson, setNewLesson] = useState<{ title: string; type: LessonType }>({ title: "", type: "notes" });
  const addLesson = useMutation({
    mutationFn: async () => {
      const slug = newLesson.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `lesson-${Date.now()}`;
      const { error } = await supabase.from("lessons").insert({
        course_id: courseId, title: newLesson.title.trim(), slug,
        lesson_type: newLesson.type,
        published: true,
        sort_order: (lessons?.length ?? 0) + 1,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewLesson({ title: "", type: "notes" });
      qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] });
    },
  });

  if (isLoading) return <div className="text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  if (!course) return <div>Course not found. <Link to="/admin" className="text-primary underline">Back</Link></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> All courses</Link>
        <div className="flex gap-2">
          <Link to="/courses/$slug" params={{ slug: form.slug }} className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent">
            <Eye className="w-3.5 h-3.5" /> Preview
          </Link>
          <button
            onClick={() => { if (confirm("Delete course and all lessons?")) del.mutate(); }}
            className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        {/* Course metadata */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold font-display">Course settings</h1>
          <div className="grid sm:grid-cols-2 gap-3">
            <LabeledInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <LabeledInput label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <LabeledInput label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <LabeledInput label="Cover image URL" value={form.cover_url} onChange={(v) => setForm({ ...form, cover_url: v })} />
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-primary" />
            Published (visible to learners)
          </label>

          {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save course"}
          </button>
        </section>

        {/* Lessons */}
        <aside className="space-y-3">
          <h2 className="text-lg font-semibold">Lessons</h2>
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <input
              placeholder="New lesson title"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <select
                value={newLesson.type}
                onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value as LessonType })}
                className="flex-1 px-2 py-1.5 rounded-lg bg-background border border-border text-sm"
              >
                <option value="notes">📝 Notes</option>
                <option value="video">🎥 Video</option>
                <option value="pdf">📄 PDF</option>
                <option value="practice">💻 Practice</option>

              </select>
              <button
                onClick={() => newLesson.title.trim() && addLesson.mutate()}
                disabled={!newLesson.title.trim() || addLesson.isPending}
                className="px-3 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {(lessons ?? []).map((l) => (
              <LessonRow key={l.id} lesson={l} onChange={() => qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] })} />
            ))}
            {(lessons ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No lessons yet</p>
            )}
          </div>
        </aside>
      </div>

      {/* Lesson editors */}
      <section className="mt-10 space-y-6">
        {(lessons ?? []).map((l) => (
          <LessonEditor key={l.id} lesson={l} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] })} />
        ))}
      </section>
    </div>
  );
}

function LessonRow({ lesson, onChange }: { lesson: Lesson; onChange: () => void }) {
  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
      if (error) throw error;
    },
    onSuccess: onChange,
  });
  const Icon = lesson.lesson_type === "video" ? Video : lesson.lesson_type === "practice" ? TermIcon : FileText;
  return (
    <a href={`#lesson-${lesson.id}`} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-primary/60 text-sm">
      <GripVertical className="w-3 h-3 text-muted-foreground" />
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="flex-1 truncate">{lesson.title}</span>
      {!lesson.published && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Draft</span>}
      <button
        onClick={(e) => { e.preventDefault(); if (confirm("Delete lesson?")) del.mutate(); }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </a>
  );
}

function LessonEditor({ lesson, onSaved }: { lesson: Lesson; onSaved: () => void }) {
  const [form, setForm] = useState({ ...lesson, pdf_url: lesson.pdf_url ?? null });
  useEffect(() => setForm({ ...lesson, pdf_url: lesson.pdf_url ?? null }), [lesson]);
  const save = useMutation({
    mutationFn: async () => {
      const pdfUrl = form.pdf_url || null;
      const { error } = await supabase.from("lessons").update({
        title: form.title, slug: form.slug, lesson_type: form.lesson_type,
        video_url: form.lesson_type === "pdf" ? (pdfUrl || form.video_url) : form.video_url,
        pdf_url: pdfUrl,
        content: form.content,
        // Keep starter_code as optional PDF fallback for older clients
        starter_code: form.lesson_type === "practice" ? form.starter_code : (pdfUrl || form.starter_code),
        expected_output: form.expected_output, xp_reward: form.xp_reward,
        sort_order: form.sort_order, published: form.published,
      } as never).eq("id", lesson.id);
      if (error) throw error;
    },
    onSuccess: onSaved,
  });

  const pdfValue = form.pdf_url || (form.lesson_type === "pdf" ? form.video_url : null) || null;

  return (
    <div id={`lesson-${lesson.id}`} className="rounded-xl border border-border bg-card p-5 scroll-mt-20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-lg font-semibold bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
          />
          <select
            value={form.lesson_type}
            onChange={(e) => setForm({ ...form, lesson_type: e.target.value })}
            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border-0 focus:outline-none"
          >
            <option value="notes">📝 Notes</option>
            <option value="video">🎥 Video</option>
            <option value="pdf">📄 PDF</option>
            <option value="practice">💻 Practice</option>

          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-3.5 w-3.5 accent-primary" />
          Published
        </label>
      </div>

      {form.lesson_type === "video" && (
        <div className="space-y-3 mt-3">
          <LabeledInput label="Video URL (YouTube embed, Vimeo, mp4)" value={form.video_url ?? ""} onChange={(v) => setForm({ ...form, video_url: v })} />
        </div>
      )}

      {(form.lesson_type === "pdf" || form.lesson_type === "video" || form.lesson_type === "notes") && (
        <div className="mt-3 space-y-3 rounded-xl border border-border/70 bg-background/50 p-4">
          <FileUploadField
            label="PDF file (from device)"
            hint="Upload a PDF study sheet. Learners can open it in Reading mode."
            accept="application/pdf,.pdf"
            currentUrl={pdfValue}
            onFile={async (file) => {
              const { url } = await uploadCourseFile(file, `lessons/${lesson.id}`);
              setForm((f) => ({
                ...f,
                pdf_url: url,
                video_url: f.lesson_type === "pdf" ? url : f.video_url,
                starter_code: f.lesson_type === "practice" ? f.starter_code : url,
              }));
            }}
            onClear={() =>
              setForm((f) => ({
                ...f,
                pdf_url: null,
                video_url: f.lesson_type === "pdf" ? null : f.video_url,
                starter_code: f.lesson_type === "practice" ? f.starter_code : null,
              }))
            }
          />
          <LabeledInput
            label="Or paste PDF URL"
            value={pdfValue ?? ""}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                pdf_url: v || null,
                video_url: f.lesson_type === "pdf" ? v || null : f.video_url,
                starter_code: f.lesson_type === "practice" ? f.starter_code : v || null,
              }))
            }
          />
        </div>
      )}

      {(form.lesson_type === "notes" || form.lesson_type === "video" || form.lesson_type === "pdf") && (
        <div className="mt-3 space-y-3">
          <FileUploadField
            label="Notes file (from device)"
            hint="Upload a .md or .txt file — content fills the notes editor below for Reading mode."
            accept=".md,.markdown,.txt,text/plain,text/markdown"
            onFile={async (file) => {
              const text = await readNotesFile(file);
              setForm((f) => ({ ...f, content: text }));
            }}
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes (Markdown)</label>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder={"## Introduction\n\nExplain the concept…\n\n```bash\nsudo systemctl status nginx\n```"}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {form.lesson_type === "practice" && (
        <>
          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Instructions (Markdown)</label>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              placeholder="Explain what the learner should do…"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Starter code / command</label>
              <textarea
                value={form.starter_code ?? ""}
                onChange={(e) => setForm({ ...form, starter_code: e.target.value })}
                rows={5}
                placeholder="ls -la /etc"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected output (grading)</label>
              <textarea
                value={form.expected_output ?? ""}
                onChange={(e) => setForm({ ...form, expected_output: e.target.value })}
                rows={5}
                placeholder="A substring the learner's output must contain"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="text-xs flex items-center gap-2">
          XP reward
          <input
            type="number"
            value={form.xp_reward}
            onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value || "0", 10) })}
            className="w-20 px-2 py-1 rounded bg-background border border-border"
          />
        </label>
        <label className="text-xs flex items-center gap-2">
          Order
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || "0", 10) })}
            className="w-20 px-2 py-1 rounded bg-background border border-border"
          />
        </label>
        <div className="flex-1" />
        {save.error && <span className="text-xs text-destructive">{(save.error as Error).message}</span>}
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save lesson"}
        </button>
      </div>

      <QuizEditor lessonId={lesson.id} />
      <ChallengeEditor lessonId={lesson.id} />
    </div>
  );
}

function QuizEditor({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-quiz", lessonId],
    queryFn: () => getLessonQuizForAdmin({ data: lessonId }),
  });
  const [title, setTitle] = useState("Quiz");
  const [passing, setPassing] = useState(70);
  const [xp, setXp] = useState(25);
  const [questions, setQuestions] = useState<Array<{ id?: string; prompt: string; choices: string[]; correct_index: number; explanation: string; sort_order: number }>>([]);
  useEffect(() => {
    if (!data) return;
    const q = data.quiz as any;
    setTitle(q?.title ?? "Quiz"); setPassing(q?.passing_score ?? 70); setXp(q?.xp_reward ?? 25);
    setQuestions((data.questions as any[]).map((qq: any) => ({
      id: qq.id, prompt: qq.prompt, choices: Array.isArray(qq.choices) ? qq.choices : [],
      correct_index: qq.correct_index ?? 0, explanation: qq.explanation ?? "", sort_order: qq.sort_order ?? 0,
    })));
  }, [data]);

  const save = useMutation({
    mutationFn: () => upsertQuiz({ data: {
      lesson_id: lessonId,
      quiz: { title, passing_score: passing, xp_reward: xp },
      questions: questions.map((q, i) => ({ ...q, sort_order: i })),
    } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-quiz", lessonId] }),
  });

  function addQuestion() {
    setQuestions((qs) => [...qs, { prompt: "", choices: ["", "", "", ""], correct_index: 0, explanation: "", sort_order: qs.length }]);
  }

  return (
    <details className="mt-4 rounded-lg border border-border bg-background/40 p-4 group">
      <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" /> Quiz ({questions.length} questions)
      </summary>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div><label className="text-[11px] uppercase text-muted-foreground">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></div>
        <div><label className="text-[11px] uppercase text-muted-foreground">Passing score %</label>
          <input type="number" value={passing} onChange={(e) => setPassing(parseInt(e.target.value || "0", 10))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></div>
        <div><label className="text-[11px] uppercase text-muted-foreground">XP reward</label>
          <input type="number" value={xp} onChange={(e) => setXp(parseInt(e.target.value || "0", 10))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></div>
      </div>
      <div className="mt-4 space-y-3">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-lg border border-border p-3 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Q{qi + 1}</span>
              <input value={q.prompt} placeholder="Question prompt" onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, prompt: e.target.value } : x))}
                className="flex-1 px-2 py-1 rounded bg-background border border-border text-sm" />
              <button onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.choices.map((c, ci) => (
                <label key={ci} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={`correct-${lessonId}-${qi}`} checked={q.correct_index === ci}
                    onChange={() => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, correct_index: ci } : x))}
                    className="accent-primary" />
                  <input value={c} placeholder={`Choice ${ci + 1}`} onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, choices: x.choices.map((cc, j) => j === ci ? e.target.value : cc) } : x))}
                    className="flex-1 px-2 py-1 rounded bg-background border border-border text-sm" />
                </label>
              ))}
            </div>
            <input value={q.explanation} placeholder="Explanation (shown after grading)"
              onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, explanation: e.target.value } : x))}
              className="mt-2 w-full px-2 py-1 rounded bg-background border border-border text-xs" />
          </div>
        ))}
        <button onClick={addQuestion} className="text-xs px-3 py-1.5 rounded border border-dashed border-border hover:bg-accent inline-flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add question
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        {save.error && <span className="text-xs text-destructive mr-2">{(save.error as Error).message}</span>}
        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save quiz"}
        </button>
      </div>
    </details>
  );
}

function ChallengeEditor({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-challenge", lessonId],
    queryFn: () => getLessonChallengeForAdmin({ data: lessonId }),
  });
  const [form, setForm] = useState({ title: "Command challenge", prompt: "", starter_command: "", expected_output: "", match_mode: "contains", xp_reward: 30 });
  useEffect(() => {
    if (data) setForm({
      title: (data as any).title ?? "Command challenge",
      prompt: (data as any).prompt ?? "",
      starter_command: (data as any).starter_command ?? "",
      expected_output: (data as any).expected_output ?? "",
      match_mode: (data as any).match_mode ?? "contains",
      xp_reward: (data as any).xp_reward ?? 30,
    });
  }, [data]);
  const save = useMutation({
    mutationFn: () => upsertChallenge({ data: { lesson_id: lessonId, ...form } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-challenge", lessonId] }),
  });
  return (
    <details className="mt-3 rounded-lg border border-border bg-background/40 p-4 group">
      <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" /> Command challenge{form.expected_output ? " · configured" : ""}
      </summary>
      <div className="mt-4 space-y-3">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" />
        <textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} rows={2} placeholder="What the learner should do…" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" />
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-[11px] uppercase text-muted-foreground">Starter command</label>
            <textarea value={form.starter_command} onChange={(e) => setForm({ ...form, starter_command: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm" /></div>
          <div><label className="text-[11px] uppercase text-muted-foreground">Expected output (answer key)</label>
            <textarea value={form.expected_output} onChange={(e) => setForm({ ...form, expected_output: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[11px] uppercase text-muted-foreground">Match mode</label>
            <select value={form.match_mode} onChange={(e) => setForm({ ...form, match_mode: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm">
              <option value="contains">Contains substring</option>
              <option value="exact">Exact match</option>
              <option value="regex">Regex</option>
            </select></div>
          <div><label className="text-[11px] uppercase text-muted-foreground">XP reward</label>
            <input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value || "0", 10) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></div>
        </div>
        <div className="flex justify-end">
          {save.error && <span className="text-xs text-destructive mr-2">{(save.error as Error).message}</span>}
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save challenge"}
          </button>
        </div>
      </div>
    </details>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
