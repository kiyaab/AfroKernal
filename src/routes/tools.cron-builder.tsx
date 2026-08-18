import { createFileRoute } from "@tanstack/react-router";
import { Clock, TerminalSquare, Copy, Check, Calendar, Info, Sparkles, Play } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/tools/cron-builder")({
  component: CronBuilder,
});

interface CronPreset {
  label: string;
  expression: string;
  desc: string;
  category: string;
}

const PRESETS: CronPreset[] = [
  {
    label: "Every Minute",
    expression: "* * * * *",
    desc: "Runs every minute continuously",
    category: "Frequent",
  },
  {
    label: "Every 5 Minutes",
    expression: "*/5 * * * *",
    desc: "Runs at minute 0, 5, 10, 15...",
    category: "Frequent",
  },
  {
    label: "Every 15 Minutes",
    expression: "*/15 * * * *",
    desc: "Runs four times per hour",
    category: "Frequent",
  },
  {
    label: "Every Hour on the Hour",
    expression: "0 * * * *",
    desc: "Runs at the start of every hour",
    category: "Hourly",
  },
  {
    label: "Every 6 Hours",
    expression: "0 */6 * * *",
    desc: "Runs at 00:00, 06:00, 12:00, 18:00",
    category: "Hourly",
  },
  {
    label: "Daily at Midnight",
    expression: "0 0 * * *",
    desc: "Runs once per day at 00:00 UTC",
    category: "Daily",
  },
  {
    label: "Daily at 3:00 AM (Nightly Backup)",
    expression: "0 3 * * *",
    desc: "Ideal for system backups & maintenance",
    category: "Daily",
  },
  {
    label: "Weekdays at 9:00 AM",
    expression: "0 9 * * 1-5",
    desc: "Runs Monday through Friday morning",
    category: "Weekly",
  },
  {
    label: "Every Sunday at Midnight",
    expression: "0 0 * * 0",
    desc: "Runs once a week on Sunday",
    category: "Weekly",
  },
  {
    label: "First Day of Every Month",
    expression: "0 0 1 * *",
    desc: "Monthly billing or reporting job",
    category: "Monthly",
  },
];

function CronBuilder() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [commandScript, setCommandScript] = useState("/usr/local/bin/backup.sh");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const expression = `${minute.trim() || "*"} ${hour.trim() || "*"} ${dayOfMonth.trim() || "*"} ${month.trim() || "*"} ${dayOfWeek.trim() || "*"}`;

  const describeCron = (expr: string) => {
    const parts = expr.split(" ");
    if (parts.length !== 5) return "Invalid cron format (must have 5 fields)";

    const [m, h, dom, mon, dow] = parts;

    if (expr === "* * * * *") return "Every single minute of every day";
    if (expr === "*/5 * * * *") return "Every 5 minutes";
    if (expr === "*/15 * * * *") return "Every 15 minutes";
    if (expr === "0 * * * *") return "Every hour, on the hour (minute 0)";
    if (expr === "0 0 * * *") return "Every day at midnight (00:00)";
    if (expr === "0 3 * * *") return "Every day at 03:00 AM";
    if (expr === "0 9 * * 1-5") return "At 09:00 AM, Monday through Friday (Weekdays only)";
    if (expr === "0 0 * * 0") return "At midnight every Sunday";
    if (expr === "0 0 1 * *") return "At midnight on the 1st day of every month";

    let desc = "Runs ";
    if (m === "*") desc += "every minute ";
    else if (m.startsWith("*/")) desc += `every ${m.replace("*/", "")} minutes `;
    else desc += `at minute ${m} `;

    if (h === "*") desc += "of every hour ";
    else if (h.startsWith("*/")) desc += `every ${h.replace("*/", "")} hours `;
    else desc += `past hour ${h}:00 `;

    if (dom !== "*") desc += `on day ${dom} of the month `;
    if (mon !== "*") desc += `in month ${mon} `;
    if (dow !== "*") {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (dow === "1-5") desc += "on weekdays (Mon–Fri) ";
      else if (dayNames[parseInt(dow, 10)]) desc += `on ${dayNames[parseInt(dow, 10)]} `;
      else desc += `on weekday ${dow} `;
    }

    return desc.trim() + ".";
  };

  const nextExecutionTimes = useMemo(() => {
    // Generate sample preview timestamps
    const now = new Date();
    const times: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const next = new Date(
        now.getTime() +
          i * 3600 * 1000 * (hour.startsWith("*/") ? parseInt(hour.replace("*/", ""), 10) : 1),
      );
      times.push(next.toUTCString().replace("GMT", "UTC"));
    }
    return times;
  }, [expression, hour]);

  const applyPreset = (presetExpr: string) => {
    const parts = presetExpr.split(" ");
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fields = [
    { label: "Minute", val: minute, setVal: setMinute, range: "0–59, * */5", eg: "0 or */15" },
    { label: "Hour", val: hour, setVal: setHour, range: "0–23, * */2", eg: "0 or 9 or */6" },
    {
      label: "Day of Month",
      val: dayOfMonth,
      setVal: setDayOfMonth,
      range: "1–31, *",
      eg: "1 or 15 or *",
    },
    { label: "Month", val: month, setVal: setMonth, range: "1–12, *", eg: "1–12 or *" },
    {
      label: "Day of Week",
      val: dayOfWeek,
      setVal: setDayOfWeek,
      range: "0–7 (0/7=Sun), 1-5",
      eg: "1-5 or 0",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Clock className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Cron Expression Builder & Explainer</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Build automated job schedules visually. Translate cryptic cron expressions into
          human-readable English and generate production crontab entries.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Visual 5-Field Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 pb-4 border-b border-border mb-6">
              <TerminalSquare className="h-5 w-5 text-primary" /> Visual 5-Field Schedule Builder
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {fields.map((f, i) => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    <span className="text-primary font-mono mr-1">#{i + 1}</span>
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => f.setVal(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 text-center font-mono text-xl font-bold text-primary focus:border-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground block text-center truncate">
                    {f.range}
                  </span>
                </div>
              ))}
            </div>

            {/* Target Script Input */}
            <div className="pt-4 border-t border-border space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Command / Script to Execute:
              </label>
              <input
                type="text"
                value={commandScript}
                onChange={(e) => setCommandScript(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                placeholder="/path/to/script.sh"
              />
            </div>
          </div>

          {/* Presets Gallery */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
              Common Cron Job Presets
            </span>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const isCurrent = expression === p.expression;
                return (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.expression)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-foreground">{p.label}</span>
                        <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-muted">
                          {p.expression}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Natural English Translation & Crontab Copy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Big Translation Card */}
          <div className="rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />

            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Cron Expression
            </span>
            <div className="my-3 font-mono text-4xl sm:text-5xl font-extrabold text-primary tracking-widest glow-yellow">
              {expression}
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 my-4 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                Natural English Translation:
              </span>
              <p className="text-sm font-semibold text-foreground leading-snug">
                {describeCron(expression)}
              </p>
            </div>

            {/* Generated Crontab Line */}
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Full Crontab Entry:
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border font-mono text-xs">
                <span className="text-foreground truncate">
                  {expression} {commandScript}
                </span>
                <button
                  onClick={() => copyToClipboard(`${expression} ${commandScript}`)}
                  className="p-1 rounded text-muted-foreground hover:text-primary shrink-0 transition"
                  title="Copy crontab line"
                >
                  {copiedText === `${expression} ${commandScript}` ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-left mt-3">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Crontab with Log Redirect:
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border font-mono text-xs">
                <span className="text-muted-foreground truncate">
                  {expression} {commandScript} &gt;&gt; /var/log/cron.log 2&gt;&amp;1
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(`${expression} ${commandScript} >> /var/log/cron.log 2>&1`)
                  }
                  className="p-1 rounded text-muted-foreground hover:text-primary shrink-0 transition"
                  title="Copy crontab with logs"
                >
                  {copiedText === `${expression} ${commandScript} >> /var/log/cron.log 2>&1` ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Syntax Reference Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-xs space-y-3">
            <h4 className="font-bold flex items-center gap-1.5 text-foreground">
              <Info className="h-4 w-4 text-primary" /> Special Operators Reference
            </h4>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="font-mono text-primary font-bold">*</span>
                <span>Any value / every unit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="font-mono text-primary font-bold">,</span>
                <span>Value list separator (e.g. 1,15,30)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="font-mono text-primary font-bold">-</span>
                <span>Range of values (e.g. 1-5 for Mon–Fri)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="font-mono text-primary font-bold">/</span>
                <span>Step values (e.g. */10 for every 10 mins)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
