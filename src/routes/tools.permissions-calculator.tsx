import { createFileRoute } from "@tanstack/react-router";
import { Shield, Calculator, Copy, Check, Info, Sparkles, FolderLock, FileCode, KeyRound, Globe, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/tools/permissions-calculator")({
  component: PermissionsCalculator,
});

type PermissionTarget = "owner" | "group" | "others";
type PermissionType = "read" | "write" | "execute";
type SpecialBit = "suid" | "sgid" | "sticky";

interface Preset {
  label: string;
  octal: string;
  desc: string;
  icon: typeof Globe;
  recommendedFor: string;
}

const PRESETS: Preset[] = [
  {
    label: "Web Public Directory",
    octal: "755",
    desc: "Owner has full access (rwx); Group & Others can read and enter directory (r-x).",
    icon: Globe,
    recommendedFor: "/var/www/html, public web directories"
  },
  {
    label: "Standard Document / Config",
    octal: "644",
    desc: "Owner can read & write (rw-); Group & Others can only read (r--).",
    icon: FileCode,
    recommendedFor: "HTML, CSS, JSON, text configs"
  },
  {
    label: "SSH Private Key",
    octal: "600",
    desc: "Read & write exclusively for owner (rw-); zero access for group or others (---).",
    icon: KeyRound,
    recommendedFor: "~/.ssh/id_rsa, ~/.ssh/id_ed25519"
  },
  {
    label: "Private User Folder",
    octal: "700",
    desc: "Full access for owner (rwx); completely locked to all other users (---).",
    icon: FolderLock,
    recommendedFor: "~/.ssh directory, private backups"
  },
  {
    label: "Team Collaboration Folder",
    octal: "775",
    desc: "Owner and group members have full access (rwx); others can read & execute (r-x).",
    icon: Users,
    recommendedFor: "Shared team project directories"
  },
  {
    label: "SUID Root Executable",
    octal: "4755",
    desc: "Executes with permissions of file owner (root) regardless of calling user.",
    icon: Shield,
    recommendedFor: "passwd, sudo, ping binaries"
  }
];

function PermissionsCalculator() {
  const [permissions, setPermissions] = useState<Record<PermissionTarget, Record<PermissionType, boolean>>>({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
  });

  const [specialBits, setSpecialBits] = useState<Record<SpecialBit, boolean>>({
    suid: false,
    sgid: false,
    sticky: false,
  });

  const [filename, setFilename] = useState("file.txt");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const togglePermission = (target: PermissionTarget, type: PermissionType) => {
    setPermissions((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [type]: !prev[target][type],
      },
    }));
  };

  const toggleSpecialBit = (bit: SpecialBit) => {
    setSpecialBits((prev) => ({
      ...prev,
      [bit]: !prev[bit],
    }));
  };

  const getTargetDigit = (target: PermissionTarget) => {
    let sum = 0;
    if (permissions[target].read) sum += 4;
    if (permissions[target].write) sum += 2;
    if (permissions[target].execute) sum += 1;
    return sum;
  };

  const getSpecialDigit = () => {
    let sum = 0;
    if (specialBits.suid) sum += 4;
    if (specialBits.sgid) sum += 2;
    if (specialBits.sticky) sum += 1;
    return sum;
  };

  const octalValue = `${getSpecialDigit() > 0 ? getSpecialDigit() : ""}${getTargetDigit("owner")}${getTargetDigit("group")}${getTargetDigit("others")}`;
  const standardThreeDigit = `${getTargetDigit("owner")}${getTargetDigit("group")}${getTargetDigit("others")}`;

  const getSymbolicTarget = (target: PermissionTarget) => {
    let str = "";
    str += permissions[target].read ? "r" : "-";
    str += permissions[target].write ? "w" : "-";

    if (target === "owner" && specialBits.suid) {
      str += permissions.owner.execute ? "s" : "S";
    } else if (target === "group" && specialBits.sgid) {
      str += permissions.group.execute ? "s" : "S";
    } else if (target === "others" && specialBits.sticky) {
      str += permissions.others.execute ? "t" : "T";
    } else {
      str += permissions[target].execute ? "x" : "-";
    }
    return str;
  };

  const symbolicValue = `-${getSymbolicTarget("owner")}${getSymbolicTarget("group")}${getSymbolicTarget("others")}`;

  const applyOctalString = (octalStr: string) => {
    const clean = octalStr.trim();
    if (clean.length === 3 || clean.length === 4) {
      const hasSpecial = clean.length === 4;
      const specialNum = hasSpecial ? parseInt(clean[0], 10) : 0;
      const ownerNum = parseInt(hasSpecial ? clean[1] : clean[0], 10);
      const groupNum = parseInt(hasSpecial ? clean[2] : clean[1], 10);
      const othersNum = parseInt(hasSpecial ? clean[3] : clean[2], 10);

      if (!isNaN(ownerNum) && !isNaN(groupNum) && !isNaN(othersNum)) {
        setSpecialBits({
          suid: (specialNum & 4) !== 0,
          sgid: (specialNum & 2) !== 0,
          sticky: (specialNum & 1) !== 0,
        });
        setPermissions({
          owner: { read: (ownerNum & 4) !== 0, write: (ownerNum & 2) !== 0, execute: (ownerNum & 1) !== 0 },
          group: { read: (groupNum & 4) !== 0, write: (groupNum & 2) !== 0, execute: (groupNum & 1) !== 0 },
          others: { read: (othersNum & 4) !== 0, write: (othersNum & 2) !== 0, execute: (othersNum & 1) !== 0 },
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const targets: { key: PermissionTarget; label: string; desc: string }[] = [
    { key: "owner", label: "Owner (User / u)", desc: "The creator or owner of the file" },
    { key: "group", label: "Group (g)", desc: "Users belonging to the file's assigned group" },
    { key: "others", label: "Others (Public / o)", desc: "All other system users" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Top Banner */}
      <div className="mb-10 text-center flex flex-col gap-3 items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-display font-bold">Linux Permissions Calculator</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Visual interactive <span className="font-mono text-primary font-semibold">chmod</span> builder. Toggle read, write, execute, and special bits to generate octal and symbolic commands instantly.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Col: Visual Checkbox Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold flex items-center justify-between pb-4 border-b border-border mb-6">
              <span className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" /> Permission Matrix
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type Octal:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={octalValue}
                  onChange={(e) => applyOctalString(e.target.value)}
                  className="w-16 rounded-lg border border-primary/40 bg-background px-2.5 py-1 text-center font-mono text-sm font-bold text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </h2>

            {/* Standard Permissions Rows */}
            <div className="space-y-6">
              {targets.map(({ key, label, desc }) => (
                <div key={key} className="space-y-2 pb-5 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-foreground">{label}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Digit: <strong className="text-primary">{getTargetDigit(key)}</strong> ({getSymbolicTarget(key)})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {(["read", "write", "execute"] as PermissionType[]).map((type) => {
                      const isChecked = permissions[key][type];
                      const val = type === "read" ? "+4" : type === "write" ? "+2" : "+1";
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => togglePermission(key, type)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition ${
                            isChecked
                              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                              : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                          }`}
                        >
                          <span className="capitalize text-xs">{type}</span>
                          <span className="text-[10px] font-mono opacity-80">{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Special Bits (SUID, SGID, Sticky Bit) */}
            <div className="mt-6 pt-6 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Special Permissions (Optional)
              </span>
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => toggleSpecialBit("suid")}
                  className={`p-3 rounded-xl border text-left transition ${
                    specialBits.suid
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">SUID (+4000)</span>
                    <span className="text-[10px] font-mono">u+s</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">Run as file owner</p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSpecialBit("sgid")}
                  className={`p-3 rounded-xl border text-left transition ${
                    specialBits.sgid
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">SGID (+2000)</span>
                    <span className="text-[10px] font-mono">g+s</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">Inherit folder group</p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSpecialBit("sticky")}
                  className={`p-3 rounded-xl border text-left transition ${
                    specialBits.sticky
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">Sticky Bit (+1000)</span>
                    <span className="text-[10px] font-mono">+t</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">Only owner can delete (like /tmp)</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Display & Generated Commands (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Big Octal & Symbolic Card */}
          <div className="rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />

            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Calculated Octal Value</span>
            <div className="my-3 font-mono text-7xl font-extrabold text-primary tracking-wider glow-yellow">
              {octalValue}
            </div>
            <div className="inline-block font-mono text-lg px-3 py-1 rounded-lg bg-muted text-muted-foreground font-semibold">
              {symbolicValue}
            </div>

            {/* Target Filename Input */}
            <div className="mt-6 pt-5 border-t border-border text-left">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target File / Folder Name:</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value || "filename")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Generated Commands */}
            <div className="mt-4 space-y-3 text-left">
              {/* Command 1: Octal */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground">Octal Command:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border font-mono text-xs mt-1">
                  <span className="text-primary truncate">chmod {octalValue} {filename}</span>
                  <button
                    onClick={() => copyToClipboard(`chmod ${octalValue} ${filename}`)}
                    className="p-1 rounded text-muted-foreground hover:text-primary shrink-0 transition"
                    title="Copy command"
                  >
                    {copiedText === `chmod ${octalValue} ${filename}` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Command 2: Recursive */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground">Recursive Directory Command:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border font-mono text-xs mt-1">
                  <span className="text-muted-foreground truncate">chmod -R {octalValue} {filename}/</span>
                  <button
                    onClick={() => copyToClipboard(`chmod -R ${octalValue} ${filename}/`)}
                    className="p-1 rounded text-muted-foreground hover:text-primary shrink-0 transition"
                    title="Copy recursive command"
                  >
                    {copiedText === `chmod -R ${octalValue} ${filename}/` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
              Common Recommended Presets
            </span>
            <div className="space-y-2.5">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isCurrent = standardThreeDigit === preset.octal || octalValue === preset.octal;
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyOctalString(preset.octal)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{preset.label}</span>
                          <span className="font-mono text-xs font-extrabold text-primary">({preset.octal})</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{preset.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
