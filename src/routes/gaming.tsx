import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gamepad2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Terminal,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ANTI_CHEAT_GAMES, GPU_DRIVER_GUIDES, AntiCheatGame } from "@/lib/gaming-data";

export const Route = createFileRoute("/gaming")({
  component: Gaming,
});

function Gaming() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const statuses = ["All", "Supported", "Unsupported"];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredGames = useMemo(() => {
    return ANTI_CHEAT_GAMES.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        g.name.toLowerCase().includes(q) ||
        g.antiCheat.toLowerCase().includes(q) ||
        g.notes.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Supported" &&
          (g.status.includes("Supported") || g.status.includes("Playable"))) ||
        (selectedStatus === "Unsupported" && g.status.includes("Unsupported"));

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">
          Gaming on Linux Guide & Anti-Cheat Matrix
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Everything you need to play modern Windows games on Linux using Steam Play, Proton,
          Lutris, Wine, and optimized GPU drivers.
        </p>
      </div>

      {/* 3 Main Setup Pillars */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition">
          <div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Steam Play & Proton</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Valve's compatibility layer lets you run tens of thousands of Windows DirectX 11/12
              and Vulkan games directly from your Steam library with zero manual setup.
            </p>
            <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
              <span className="font-semibold text-primary block">How to enable in Steam:</span>
              <p className="text-muted-foreground text-[11px]">
                Steam → Settings → Compatibility → Enable "Steam Play for all other titles" → Select
                Proton Experimental.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition">
          <div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Heroic & Lutris (Epic / GOG)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Play games outside Steam. Heroic Games Launcher handles Epic Games, GOG, and Amazon
              Prime Gaming natively. Lutris manages Battle.net, EA App, and Ubisoft Connect.
            </p>
            <div className="p-3 rounded-xl bg-background border border-border font-mono text-[11px]">
              <span className="text-muted-foreground block font-sans text-[10px] mb-0.5">
                Install Heroic (Flatpak):
              </span>
              <span className="text-primary font-semibold">
                flatpak install flathub com.heroicgameslauncher.hgl
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition">
          <div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">GameMode & MangoHud</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Feral GameMode requests high-performance CPU governor and GPU clocks during gameplay.
              MangoHud provides an in-game FPS, frametime, temperature, and VRAM overlay.
            </p>
            <div className="p-3 rounded-xl bg-background border border-border font-mono text-[11px]">
              <span className="text-muted-foreground block font-sans text-[10px] mb-0.5">
                Steam Launch Option:
              </span>
              <span className="text-primary font-semibold">gamemoderun mangohud %command%</span>
            </div>
          </div>
        </div>
      </div>

      {/* GPU Driver Installation Guides */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm mb-12">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Terminal className="h-5 w-5 text-primary" /> GPU Driver Installation Commands
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Make sure you have official proprietary or Mesa Vulkan drivers installed for optimal frame
          rates:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {GPU_DRIVER_GUIDES.map((gpu) => (
            <div
              key={gpu.gpu}
              className="rounded-xl border border-border bg-background/60 p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-foreground mb-1">{gpu.gpu}</h3>
                <p className="text-xs text-muted-foreground mb-3">{gpu.description}</p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Ubuntu / Mint:
                    </span>
                    <span className="text-foreground truncate block">{gpu.ubuntu}</span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Fedora:
                    </span>
                    <span className="text-foreground truncate block">{gpu.fedora}</span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block font-sans">Arch:</span>
                    <span className="text-foreground truncate block">{gpu.arch}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-primary/80 pt-2 border-t border-border/50">
                💡 {gpu.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Anti-Cheat Compatibility Matrix */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" /> Anti-Cheat Game Compatibility
              Database
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Check if your favorite multiplayer titles support Linux Proton or are blocked by
              anti-cheat kernel drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === st
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-muted"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search game title or anti-cheat engine (e.g. 'Counter-Strike 2', 'Elden Ring', 'Valorant', 'Easy Anti-Cheat')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Games Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {filteredGames.map((g) => {
              const isSupported = g.status.includes("Supported");
              return (
                <div
                  key={g.name}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-foreground">{g.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {g.antiCheat}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{g.notes}</p>
                    {g.launchOptions && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-muted-foreground">Launch Option:</span>
                        <code className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {g.launchOptions}
                        </code>
                        <button
                          onClick={() => copyToClipboard(g.launchOptions!)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                          title="Copy launch option"
                        >
                          {copiedText === g.launchOptions ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isSupported
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                      }`}
                    >
                      {isSupported ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {g.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
