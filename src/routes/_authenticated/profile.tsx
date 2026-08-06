import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/lib/quiz.functions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Save,
  User,
  Camera,
  Github,
  Globe,
  MapPin,
  Target,
  Terminal,
  Loader2,
  Upload,
  Link as LinkIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — AfroKernel" },
      { name: "description", content: "Manage your AfroKernel learner profile: photo, bio, goals, and links." },
      { property: "og:title", content: "My AfroKernel profile" },
      { property: "og:description", content: "Manage your learner profile on AfroKernel." },
    ],
  }),
  component: ProfilePage,
});

type ProfileForm = {
  display_name: string;
  bio: string;
  avatar_url: string;
  headline: string;
  location: string;
  website: string;
  github_url: string;
  learning_goal: string;
  preferred_distro: string;
};

const emptyForm: ProfileForm = {
  display_name: "",
  bio: "",
  avatar_url: "",
  headline: "",
  location: "",
  website: "",
  github_url: "",
  learning_goal: "",
  preferred_distro: "ubuntu",
};

function ProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: stats }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_stats").select("*").eq("user_id", u.user.id).maybeSingle(),
      ]);
      return { user: u.user, profile, stats };
    },
  });

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  useEffect(() => {
    const p = bundle?.profile as Record<string, string> | null | undefined;
    if (p) {
      setForm({
        display_name: p.display_name ?? "",
        bio: p.bio ?? "",
        avatar_url: p.avatar_url ?? "",
        headline: p.headline ?? "",
        location: p.location ?? "",
        website: p.website ?? "",
        github_url: p.github_url ?? "",
        learning_goal: p.learning_goal ?? "",
        preferred_distro: p.preferred_distro ?? "ubuntu",
      });
    }
  }, [bundle]);

  const save = useMutation({
    mutationFn: () => updateProfile({ data: form }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  async function onPickAvatar(file: File | null) {
    if (!file || !bundle?.user) return;
    setUploadMsg(null);
    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (PNG, JPG, WebP).");
      if (file.size > 2_000_000) throw new Error("Image must be under 2 MB.");

      const path = `${bundle.user.id}/avatar-${Date.now()}.${file.name.split(".").pop() || "png"}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

      if (upErr) {
        // Fallback: store compressed data URL if Storage bucket isn't ready yet
        const dataUrl = await fileToDataUrl(file, 512);
        setForm((f) => ({ ...f, avatar_url: dataUrl }));
        setUploadMsg("Saved photo locally — click Save profile. (Enable Storage migration for cloud avatars.)");
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
        setUploadMsg("Photo uploaded — click Save profile to keep it.");
      }
    } catch (e) {
      setUploadMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const stats = bundle?.stats as { xp?: number; level?: number; streak_days?: number } | null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-1 text-sm hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
          <User className="h-7 w-7 text-primary" /> My profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{bundle?.user.email}</p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Avatar card */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <div className="relative mx-auto h-36 w-36">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-primary/20 bg-muted">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 disabled:opacity-50"
                  title="Upload photo"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
                />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                <Upload className="h-3.5 w-3.5" /> Upload profile picture
              </button>
              {uploadMsg && <p className="text-center text-[11px] text-muted-foreground">{uploadMsg}</p>}

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP</span>
                  <span className="font-semibold text-primary">{stats?.xp ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-semibold">{stats?.level ?? 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-semibold">{stats?.streak_days ?? 0}d</span>
                </div>
              </div>
            </section>

            {/* Edit form */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Edit profile</h2>

              <Field label="Display name">
                <input
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name on AfroKernel"
                />
              </Field>

              <Field label="Headline">
                <input
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Aspiring Linux sysadmin"
                />
              </Field>

              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell others what you're learning…"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Location" icon={<MapPin className="h-3 w-3" />}>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="City, Country"
                  />
                </Field>
                <Field label="Preferred distro" icon={<Terminal className="h-3 w-3" />}>
                  <select
                    value={form.preferred_distro}
                    onChange={(e) => setForm({ ...form, preferred_distro: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ubuntu">Ubuntu</option>
                    <option value="debian">Debian</option>
                    <option value="fedora">Fedora</option>
                    <option value="arch">Arch</option>
                    <option value="rocky">Rocky / RHEL</option>
                    <option value="alpine">Alpine</option>
                  </select>
                </Field>
              </div>

              <Field label="Learning goal" icon={<Target className="h-3 w-3" />}>
                <input
                  value={form.learning_goal}
                  onChange={(e) => setForm({ ...form, learning_goal: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Pass RHCSA / land a junior sysadmin role"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Website" icon={<Globe className="h-3 w-3" />}>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://"
                  />
                </Field>
                <Field label="GitHub" icon={<Github className="h-3 w-3" />}>
                  <input
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/you"
                  />
                </Field>
              </div>

              <Field label="Avatar URL (optional)" icon={<LinkIcon className="h-3 w-3" />}>
                <input
                  value={form.avatar_url.startsWith("data:") ? "" : form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Or paste an image URL"
                />
                {form.avatar_url.startsWith("data:") && (
                  <p className="mt-1 text-[11px] text-muted-foreground">Using uploaded photo (data saved on profile).</p>
                )}
              </Field>

              {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
              {save.isSuccess && <p className="text-sm text-primary">Profile saved.</p>}

              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {save.isPending ? "Saving…" : "Save profile"}
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

async function fileToDataUrl(file: File, maxSide: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
