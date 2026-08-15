import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Search, CheckCircle2, AlertTriangle, XCircle, Copy, Check, Terminal, ExternalLink, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { HARDWARE_DATA, DIAGNOSTIC_COMMANDS, HardwareItem } from "@/lib/hardware-data";

export const Route = createFileRoute("/hardware-compatibility")({
  component: HardwareCompatibility,
});

function HardwareCompatibility() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = ["All", "GPUs", "Wi-Fi & Bluetooth", "Laptops", "Printers & Scanners"];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredHardware = useMemo(() => {
    return HARDWARE_DATA.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.kernelDriver.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Cpu className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Linux Hardware Compatibility Database</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Check out-of-the-box driver support for GPUs, Wi-Fi chips, laptops, and printers before making the switch to Linux.
        </p>
      </div>

      {/* Hardware Diagnostic Commands Section */}
      <div className="rounded-2xl border border-primary/30 bg-card p-6 md:p-8 shadow-sm mb-10">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
          <Terminal className="h-4 w-4" /> Live Hardware Diagnostic Commands
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Run these commands in your Linux terminal to identify PCI devices, loaded kernel modules, and driver status:
        </p>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DIAGNOSTIC_COMMANDS.map((diag) => (
            <div key={diag.cmd} className="rounded-xl border border-border bg-background/60 p-3.5 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-xs text-foreground block mb-1">{diag.title}</span>
                <p className="text-[11px] text-muted-foreground mb-3">{diag.desc}</p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border font-mono text-[11px]">
                <span className="text-primary truncate">{diag.cmd}</span>
                <button
                  onClick={() => copyToClipboard(diag.cmd)}
                  className="p-1 text-muted-foreground hover:text-foreground shrink-0 transition"
                  title="Copy command"
                >
                  {copiedCmd === diag.cmd ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hardware model or chipset (e.g. 'Intel AX210', 'NVIDIA 4070', 'ThinkPad', 'Realtek')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Results Grid */}
      <div className="space-y-4">
        {filteredHardware.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/30">
            <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="text-lg font-semibold">No hardware match found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try another search keyword or check external databases.</p>
          </div>
        ) : (
          filteredHardware.map((item) => {
            const isPlatinum = item.compatibility.includes("Platinum");
            const isGold = item.compatibility.includes("Gold");

            return (
              <div
                key={item.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                    <span className="text-muted-foreground">
                      Kernel Module: <strong className="font-mono text-primary">{item.kernelDriver}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Tested On: <span className="text-foreground font-medium">{item.testedDistros.join(", ")}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      isPlatinum
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : isGold
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {isPlatinum ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>{item.compatibility}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
