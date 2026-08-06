import { useRef, useState } from "react";
import { FileUp, Loader2, CheckCircle2, X } from "lucide-react";

type Props = {
  label: string;
  hint?: string;
  accept: string;
  currentUrl?: string | null;
  busy?: boolean;
  onFile: (file: File) => Promise<void> | void;
  onClear?: () => void;
};

export function FileUploadField({ label, hint, accept, currentUrl, busy, onFile, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [localBusy, setLocalBusy] = useState(false);
  const uploading = busy || localBusy;

  async function handleChange(file: File | null) {
    if (!file) return;
    setMsg(null);
    setErr(null);
    setLocalBusy(true);
    try {
      await onFile(file);
      setMsg(`Loaded: ${file.name}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLocalBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload from device"}
        </button>
        {currentUrl && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void handleChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {currentUrl && (
        <p className="truncate rounded-lg border border-border bg-background px-3 py-2 font-mono text-[11px] text-muted-foreground">
          {currentUrl.startsWith("data:") ? "Attached file (local / embedded)" : currentUrl}
        </p>
      )}
      {msg && (
        <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> {msg}
        </p>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
