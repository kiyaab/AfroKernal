import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Download,
  Scale,
} from "lucide-react";
import { useState, useMemo } from "react";
import { DISTROS_DATA, LinuxDistro } from "@/lib/distros-data";

export const Route = createFileRoute("/distro-finder")({
  component: DistroFinder,
});

type QuestionOption = {
  label: string;
  desc: string;
  value: string;
  icon?: string;
};

type Question = {
  id: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
};

const questions: Question[] = [
  {
    id: "experience",
    title: "How much Linux experience do you have?",
    subtitle: "We'll tailor the recommended system maintenance difficulty to your comfort level.",
    options: [
      {
        label: "Beginner",
        desc: "Never used Linux before or just starting out. I want everything to work out of the box.",
        value: "beginner",
        icon: "🌱",
      },
      {
        label: "Intermediate",
        desc: "Comfortable with basic terminal commands, installing packages, and light troubleshooting.",
        value: "intermediate",
        icon: "🚀",
      },
      {
        label: "Advanced / Power User",
        desc: "I love the terminal, customized kernels, dotfiles, and complete control over my operating system.",
        value: "advanced",
        icon: "⚡",
      },
    ],
  },
  {
    id: "usecase",
    title: "What will you primarily use Linux for?",
    subtitle:
      "Different distributions optimize their kernels and pre-installed toolchains for specific workloads.",
    options: [
      {
        label: "Everyday Desktop & Office",
        desc: "Web browsing, document editing, video streaming, email, and casual computing.",
        value: "desktop",
        icon: "💻",
      },
      {
        label: "Gaming (Steam / Proton / Lutris)",
        desc: "Playing Windows games on Linux, Steam Deck emulation, high refresh rate, and modern GPU drivers.",
        value: "gaming",
        icon: "🎮",
      },
      {
        label: "Software Development & DevOps",
        desc: "Programming in Python, Rust, Go, Node, Docker containers, Kubernetes, and local virtualization.",
        value: "development",
        icon: "🛠️",
      },
      {
        label: "Content Creation (Video / Audio / Art)",
        desc: "Video editing in DaVinci Resolve/Kdenlive, 3D modeling in Blender, digital art in Krita, and audio production.",
        value: "media",
        icon: "🎨",
      },
      {
        label: "Server, Security & Self-Hosting",
        desc: "Homelabs, Docker clusters, network security, penetration testing, or long-term production servers.",
        value: "server",
        icon: "🛡️",
      },
    ],
  },
  {
    id: "hardware",
    title: "How would you describe your computer hardware?",
    subtitle:
      "Some distros require modern 64-bit systems with 8GB+ RAM, while others revive 15-year-old laptops.",
    options: [
      {
        label: "Modern & Powerful (2020 or newer)",
        desc: "High-spec modern CPU, NVMe SSD, 8GB to 64GB+ RAM, modern dedicated or integrated graphics.",
        value: "modern",
        icon: "🔥",
      },
      {
        label: "Average PC / Laptop (2015–2020)",
        desc: "Mid-range specifications, 4GB–8GB RAM, standard SATA SSD or fast hard drive.",
        value: "average",
        icon: "⚡",
      },
      {
        label: "Older Hardware / Low-Spec (Pre-2015)",
        desc: "Older machine with 2GB–4GB RAM, slow HDD, or low-power CPU that needs a lightweight distro.",
        value: "older",
        icon: "🍃",
      },
    ],
  },
  {
    id: "stability",
    title: "What is your preference for software updates?",
    subtitle: "Choose between rock-solid long-term releases or continuous cutting-edge packages.",
    options: [
      {
        label: "Rock-Solid LTS (Long Term Support)",
        desc: "Battle-tested software that rarely changes. Updates are focused on security and stability.",
        value: "lts",
        icon: "🧱",
      },
      {
        label: "Balanced Regular Releases (Every 6 Months)",
        desc: "A healthy mix of fresh kernel features, new desktop versions, and tested stability.",
        value: "balanced",
        icon: "⚖️",
      },
      {
        label: "Bleeding Edge Rolling Release",
        desc: "Always receive the latest upstream software, kernel, and Mesa drivers the day they release.",
        value: "rolling",
        icon: "🏎️",
      },
      {
        label: "Immutable & Atomic Updates",
        desc: "Read-only root filesystem with atomic updates and instant rollbacks (like Android or macOS).",
        value: "immutable",
        icon: "🔒",
      },
    ],
  },
  {
    id: "desktop",
    title: "What desktop layout style do you prefer?",
    subtitle:
      "The desktop environment defines the user interface, window management, and workflow.",
    options: [
      {
        label: "Familiar & Windows-like",
        desc: "Bottom taskbar, start menu, system tray (e.g. Cinnamon, KDE Plasma, XFCE).",
        value: "traditional",
        icon: "🪟",
      },
      {
        label: "Modern & Polished (GNOME / COSMIC)",
        desc: "Clean gestures, top bar, dynamic workspaces, and app grid (like macOS or modern tablets).",
        value: "modern_de",
        icon: "✨",
      },
      {
        label: "Lightweight & Resource-Friendly",
        desc: "Minimal memory footprint, fast animations, ultra-efficient (XFCE, MATE, LXQt).",
        value: "lightweight",
        icon: "💨",
      },
      {
        label: "No Preference / I'll customize it",
        desc: "I am happy to try whatever fits my system best.",
        value: "any",
        icon: "🎯",
      },
    ],
  },
];

interface ScoredDistro {
  distro: LinuxDistro;
  score: number;
  matchPercentage: number;
  reasons: string[];
}

function DistroFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const scoredDistros: ScoredDistro[] = useMemo(() => {
    return DISTROS_DATA.map((distro) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // 1. Experience matching
      if (answers.experience === "beginner") {
        if (distro.difficulty === "Beginner") {
          score += 25;
          reasons.push("Extremely beginner-friendly with a smooth learning curve");
        } else if (distro.difficulty === "Intermediate") {
          score += 5;
        } else {
          score -= 30;
        }
      } else if (answers.experience === "intermediate") {
        if (distro.difficulty === "Intermediate" || distro.difficulty === "Beginner") {
          score += 20;
          reasons.push("Perfect match for intermediate Linux users");
        } else {
          score += 10;
        }
      } else if (answers.experience === "advanced") {
        if (
          distro.difficulty === "Advanced" ||
          distro.id === "arch-linux" ||
          distro.id === "nixos"
        ) {
          score += 30;
          reasons.push("Gives power users full control and unlimited customization");
        } else {
          score += 10;
        }
      }

      // 2. Use case matching
      if (answers.usecase === "gaming") {
        score += distro.gamingScore * 3.5;
        if (distro.gamingScore >= 9) {
          reasons.push("Tier-1 support for Steam, Proton, Vulkan, and modern GPU drivers");
        }
      } else if (answers.usecase === "development") {
        score += distro.developerScore * 3.5;
        if (distro.developerScore >= 9) {
          reasons.push("Exceptional developer toolchains, container support, and package managers");
        }
      } else if (answers.usecase === "server") {
        score += distro.serverScore * 3.5;
        if (distro.serverScore >= 9) {
          reasons.push(
            "Engineered for mission-critical servers, stability, and enterprise deployments",
          );
        }
      } else if (answers.usecase === "media") {
        if (distro.id === "pop-os" || distro.id === "fedora" || distro.id === "ubuntu") {
          score += 25;
          reasons.push("Rich multimedia codec support and color management for creative workflows");
        }
      } else if (answers.usecase === "desktop") {
        if (distro.difficulty === "Beginner") {
          score += 20;
          reasons.push("Ideal daily driver for web, office apps, and multimedia");
        }
      }

      // 3. Hardware matching
      if (answers.hardware === "older") {
        if (distro.runsOnOldHardware) {
          score += 25;
          reasons.push("Runs smoothly on older or low-spec hardware without bogging down");
        } else {
          score -= 30;
        }
      } else if (answers.hardware === "modern") {
        score += 10;
      }

      // 4. Stability / Release style matching
      if (answers.stability === "lts" && distro.releaseModel === "Regular / LTS") {
        score += 20;
        reasons.push("Long Term Support releases ensure bulletproof day-to-day stability");
      } else if (answers.stability === "rolling" && distro.releaseModel === "Rolling") {
        score += 25;
        reasons.push("Rolling release model delivers the freshest software and Linux kernel");
      } else if (answers.stability === "immutable" && distro.releaseModel === "Immutable") {
        score += 35;
        reasons.push("Atomic updates and immutable filesystem ensure updates never break your OS");
      }

      // 5. Desktop layout
      if (
        answers.desktop === "traditional" &&
        (distro.defaultDesktop.includes("Cinnamon") ||
          distro.defaultDesktop.includes("KDE") ||
          distro.defaultDesktop.includes("XFCE"))
      ) {
        score += 15;
        reasons.push("Features a familiar, Windows-style desktop interface");
      } else if (
        answers.desktop === "modern_de" &&
        (distro.defaultDesktop.includes("GNOME") || distro.defaultDesktop.includes("COSMIC"))
      ) {
        score += 15;
        reasons.push("Features a sleek, modern desktop workflow with fluid gestures");
      } else if (answers.desktop === "lightweight" && distro.runsOnOldHardware) {
        score += 15;
        reasons.push("Lightweight desktop environment consumes minimal RAM and CPU cycles");
      }

      const matchPercentage = Math.min(99, Math.max(45, Math.round((score / 150) * 100)));
      return { distro, score, matchPercentage, reasons: reasons.slice(0, 3) };
    }).sort((a, b) => b.score - a.score);
  }, [answers]);

  const topThree = scoredDistros.slice(0, 3);
  const isComplete = step === questions.length;
  const currentQ = questions[step];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Linux Distro Finder</h1>
        <p className="text-muted-foreground text-base max-w-xl">
          Answer 5 quick questions and our recommendation engine will calculate your top 3 matches
          from our distribution database.
        </p>
      </div>

      {!isComplete ? (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm transition-all">
          {/* Progress bar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Question {step + 1} of {questions.length}
            </span>
            <div className="flex flex-1 max-w-xs gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">{currentQ.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{currentQ.subtitle}</p>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(currentQ.id, opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between group ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_var(--primary)]"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {opt.icon && <span className="text-2xl">{opt.icon}</span>}
                    <div>
                      <div
                        className={`font-semibold text-base transition ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-current" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-border">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="px-6 py-2.5 bg-primary text-primary-foreground flex items-center gap-2 rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-40 transition shadow-[var(--shadow-glow)]"
            >
              {step === questions.length - 1 ? "Calculate Matches" : "Next Question"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center p-6 rounded-2xl border border-primary/30 bg-primary/5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Personalized Recommendation
            </span>
            <h2 className="text-3xl font-display font-bold">Your Top 3 Linux Distributions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your experience, hardware specifications, and intended workflow:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {topThree.map(({ distro, matchPercentage, reasons }, idx) => {
              const badgeLabel =
                idx === 0 ? "🏆 Best Match" : idx === 1 ? "🥈 Runner-Up" : "🥉 Great Alternative";
              const borderClass =
                idx === 0
                  ? "border-primary ring-2 ring-primary/40 bg-card shadow-xl"
                  : "border-border bg-card/70";

              return (
                <div
                  key={distro.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between ${borderClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {badgeLabel}
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        {matchPercentage}% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{distro.logo}</span>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{distro.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {distro.base} base · {distro.defaultDesktop}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {distro.tagline}
                    </p>

                    {/* Why this matches you */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Why this matches you:
                      </p>
                      {reasons.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-foreground/90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <a
                      href={distro.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition"
                    >
                      <Download className="h-3.5 w-3.5" /> Download ISO
                    </a>
                    <a
                      href={distro.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition text-muted-foreground hover:text-foreground"
                    >
                      Official Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition"
            >
              <RefreshCw className="h-4 w-4" /> Retake Quiz
            </button>
            <Link
              to="/distros"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
            >
              <Scale className="h-4 w-4" /> Compare Distros Side-by-Side
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
