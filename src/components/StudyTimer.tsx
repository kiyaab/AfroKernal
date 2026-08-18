import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

export function StudyTimer({ storageKey = "afrokernel-study-timer" }: { storageKey?: string }) {
  const [seconds, setSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(storageKey) || 0);
  });
  const [running, setRunning] = useState(true);
  const [goalMin, setGoalMin] = useState(25);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (tick.current) window.clearInterval(tick.current);
      return;
    }
    tick.current = window.setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        sessionStorage.setItem(storageKey, String(next));
        return next;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running, storageKey]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const goalSecs = goalMin * 60;
  const pct = Math.min(100, Math.round((seconds / Math.max(1, goalSecs)) * 100));
  const done = seconds >= goalSecs;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Timer className="h-4 w-4 text-primary" /> Study timer
        </div>
        <select
          value={goalMin}
          onChange={(e) => setGoalMin(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-2 py-1 text-[11px]"
        >
          <option value={15}>15 min</option>
          <option value={25}>25 min (Pomodoro)</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>
      </div>

      <div
        className={`font-display text-3xl font-bold tracking-tight ${done ? "text-primary" : ""}`}
      >
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {done ? "Goal reached — nice work! Take a short break." : `Focus goal: ${goalMin} minutes`}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSeconds(0);
            sessionStorage.setItem(storageKey, "0");
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}
