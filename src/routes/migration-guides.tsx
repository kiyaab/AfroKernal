import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Search, CheckCircle2, AlertTriangle, Lightbulb, Copy, Check, Terminal, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { MIGRATION_GUIDES, MigrationGuide } from "@/lib/migration-data";

export const Route = createFileRoute("/migration-guides")({
  component: MigrationGuides,
});

function MigrationGuides() {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("windows-to-linux");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeGuide = MIGRATION_GUIDES.find((g) => g.id === selectedGuideId) || MIGRATION_GUIDES[0];

  const toggleStep = (stepIndex: number) => {
    const key = `${selectedGuideId}_step_${stepIndex}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getGuideProgress = (guide: MigrationGuide) => {
    let completed = 0;
    guide.steps.forEach((_, idx) => {
      if (completedSteps[`${guide.id}_step_${idx}`]) {
        completed++;
      }
    });
    return Math.round((completed / guide.steps.length) * 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const progressPercent = getGuideProgress(activeGuide);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <ArrowRightLeft className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Operating System Migration Guides</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Step-by-step interactive checklists to safely transition your workflow, files, and applications from Windows or macOS to Linux.
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {MIGRATION_GUIDES.map((guide) => {
          const isSelected = guide.id === selectedGuideId;
          const prog = getGuideProgress(guide);
          return (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{guide.icon}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {guide.estimatedTime}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground mb-1">{guide.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{guide.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{guide.steps.length} Steps</span>
                <span className="font-bold text-primary">{prog}% Done</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Guide Content */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm space-y-8">
        {/* Guide Header & Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeGuide.icon}</span>
              <h2 className="text-2xl font-bold text-foreground">{activeGuide.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground">{activeGuide.subtitle}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Checklist Progress</span>
              <span className="text-lg font-bold text-primary">{progressPercent}% Completed</span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 flex items-center justify-center font-bold text-xs text-primary bg-primary/10">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-6">
          {activeGuide.steps.map((step, idx) => {
            const isChecked = completedSteps[`${activeGuide.id}_step_${idx}`] || false;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-6 transition ${
                  isChecked
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-90"
                    : "border-border bg-background/50 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`mt-1 h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 transition ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border bg-card hover:border-primary"
                    }`}
                    title={isChecked ? "Mark incomplete" : "Mark step complete"}
                  >
                    {isChecked && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-3 flex-1">
                    <h3 className={`text-base font-bold transition ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>

                    {step.commands && step.commands.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {step.commands.map((cmd, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border font-mono text-xs">
                            <span className="text-primary truncate">{cmd}</span>
                            <button
                              onClick={() => copyToClipboard(cmd)}
                              className="p-1 text-muted-foreground hover:text-foreground shrink-0 transition"
                              title="Copy command"
                            >
                              {copiedCmd === cmd ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span><strong>Warning:</strong> {step.warning}</span>
                      </div>
                    )}

                    {step.tip && (
                      <div className="flex items-start gap-2 p-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <span><strong>Pro-Tip:</strong> {step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
