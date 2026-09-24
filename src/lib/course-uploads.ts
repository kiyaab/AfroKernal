const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_NOTE_BYTES = 2 * 1024 * 1024;

/** Upload a PDF (or other binary lesson file). Uses data URL / local media storage. */
export async function uploadCourseFile(
  file: File,
  _folder = "lessons",
): Promise<{ url: string; via: "storage" | "local" }> {
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("File must be under 25 MB.");
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
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
