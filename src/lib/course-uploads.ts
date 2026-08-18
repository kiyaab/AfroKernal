import { supabase } from "@/integrations/supabase/client";

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_NOTE_BYTES = 2 * 1024 * 1024;

function safeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/** Upload a PDF (or other binary lesson file) to Supabase Storage. Falls back to a data URL if storage isn't ready. */
export async function uploadCourseFile(
  file: File,
  folder = "lessons",
): Promise<{ url: string; via: "storage" | "local" }> {
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("File must be under 25 MB.");
  }

  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? "anon";
  const path = `${folder}/${uid}/${Date.now()}-${safeName(file.name)}`;

  const { error } = await supabase.storage.from("course-materials").upload(path, file, {
    upsert: false,
    contentType: file.type || "application/pdf",
  });

  if (!error) {
    const { data } = supabase.storage.from("course-materials").getPublicUrl(path);
    return { url: data.publicUrl, via: "storage" };
  }

  // Fallback when bucket/policies aren't applied yet — works for smaller PDFs
  if (file.size > 4 * 1024 * 1024) {
    throw new Error(
      `Cloud upload failed (${error.message}). Apply the course-materials storage migration, or use a file under 4 MB for local fallback.`,
    );
  }
  const url = await readAsDataUrl(file);
  return { url, via: "local" };
}

/** Read a notes file (.md / .txt) into plain text for the lesson content field. */
export async function readNotesFile(file: File): Promise<string> {
  const ok =
    file.type.startsWith("text/") ||
    /\.(md|markdown|txt|rst)$/i.test(file.name) ||
    file.type === "application/octet-stream";
  if (!ok) throw new Error("Please choose a Markdown (.md) or text (.txt) notes file.");
  if (file.size > MAX_NOTE_BYTES) throw new Error("Notes file must be under 2 MB.");
  return file.text();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
