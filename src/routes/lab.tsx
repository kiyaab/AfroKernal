import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logTerminalSession } from "@/lib/dashboard.functions";
import {
  BASE_PACKAGES,
  PACKAGE_BY_NAME,
  applyPackageInstall,
  enrichAdminFS,
  formatAptShow,
  searchPackages,
  type DirNode as LabDirNode,
} from "@/lib/lab-linux";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  RotateCcw,
  Save,
  Terminal as TermIcon,
  Columns2,
  Square,
  HardDrive,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Linux Lab — Full Sysadmin Sandbox | AfroKernel" },
      {
        name: "description",
        content:
          "Free browser-based Linux terminal with full package catalog, firewall, services, networking, users, disk, and 150+ admin commands for students.",
      },
      { property: "og:title", content: "AfroKernel Dual Linux Lab" },
      {
        property: "og:description",
        content:
          "Practice real Linux administration: apt, systemctl, ufw, docker, networking, and more.",
      },
    ],
  }),
  component: Lab,
});

type FileNode = { type: "file"; content: string; mode?: string };
type DirNode = { type: "dir"; children: Record<string, FSNode>; mode?: string };
type FSNode = FileNode | DirNode;

export type Distro = "ubuntu" | "debian" | "alpine";
const DISTRO_META: Record<
  Distro,
  { hostname: string; os_release: string; label: string; kernel: string }
> = {
  ubuntu: {
    hostname: "afrokernel-ubuntu",
    os_release:
      'NAME="Ubuntu"\nVERSION="24.04 LTS (AfroKernel Simulated)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 24.04 LTS"\n',
    label: "Ubuntu 24.04 LTS",
    kernel: "Linux afrokernel-ubuntu 6.8.0-afrokernel #1 SMP x86_64 GNU/Linux",
  },
  debian: {
    hostname: "afrokernel-debian",
    os_release:
      'NAME="Debian GNU/Linux"\nVERSION="12 (bookworm) â€” AfroKernel Simulated"\nID=debian\nPRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\n',
    label: "Debian 12 (Bookworm)",
    kernel: "Linux afrokernel-debian 6.1.0-afrokernel #1 SMP x86_64 GNU/Linux",
  },
  alpine: {
    hostname: "afrokernel-alpine",
    os_release:
      'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.20.0\nPRETTY_NAME="Alpine Linux v3.20 (AfroKernel)"\n',
    label: "Alpine Linux 3.20",
    kernel: "Linux afrokernel-alpine 6.6.0-afrokernel #1 SMP x86_64 GNU/Linux",
  },
};

function makeFS(distro: Distro = "ubuntu"): DirNode {
  const meta = DISTRO_META[distro];
  const root: DirNode = {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          learner: {
            type: "dir",
            children: {
              "welcome.txt": {
                type: "file",
                content: `Welcome to AfroKernel Full Sysadmin Lab (${meta.label})!
====================================================
Install packages:  apt update && apt install nginx docker.io postgresql
Manage services:   systemctl status nginx && systemctl enable --now nginx
Firewall:          ufw allow 22 && ufw allow 80 && ufw enable
Users:             sudo useradd -m alice && sudo passwd alice
Network:           ip addr && ss -tulpn && dig afrokernel.dev
Disk:              df -h && lsblk && fdisk -l
See:               cat ~/admin-cheatsheet.txt   or   help
PC C: Drive:       /mnt/c/Users/learner/
`,
              },
              "notes.md": {
                type: "file",
                content:
                  "# Linux Administration Notes\n- apt / dnf / apk manage packages\n- systemctl manages services\n- ufw / firewall-cmd / iptables for firewalls\n- journalctl for logs\n",
              },
              "script.sh": {
                type: "file",
                content:
                  "#!/bin/bash\necho 'Running AfroKernel sysadmin check...'\nuname -a\ndf -h /\napt list --installed | head\n",
              },
              "colors.txt": { type: "file", content: "red\ngreen\nblue\nred\ngreen\nyellow\n" },
            },
          },
        },
      },
      etc: {
        type: "dir",
        children: {
          hostname: { type: "file", content: `${meta.hostname}\n` },
          "os-release": { type: "file", content: meta.os_release },
          passwd: {
            type: "file",
            content:
              "root:x:0:0:root:/root:/bin/bash\nlearner:x:1000:1000:Learner:/home/learner:/bin/bash\n",
          },
          group: { type: "file", content: "root:x:0:\nlearner:x:1000:\nsudo:x:27:learner\n" },
          hosts: { type: "file", content: `127.0.0.1 localhost\n127.0.1.1 ${meta.hostname}\n` },
          fstab: {
            type: "file",
            content: "/dev/sda1 / ext4 defaults 0 1\nC:\\ /mnt/c drvfs defaults 0 0\n",
          },
        },
      },
      mnt: {
        type: "dir",
        children: {
          c: {
            type: "dir",
            children: {
              "Program Files": {
                type: "dir",
                children: { "AfroKernel-Agent": { type: "dir", children: {} } },
              },
              Windows: {
                type: "dir",
                children: {
                  System32: {
                    type: "dir",
                    children: { "drivers.sys": { type: "file", content: "System Drivers Data" } },
                  },
                },
              },
              Users: {
                type: "dir",
                children: {
                  learner: {
                    type: "dir",
                    children: {
                      Documents: {
                        type: "file",
                        content: "PC Local Document - Synced to AfroKernel Lab",
                      },
                      Downloads: { type: "dir", children: {} },
                      Desktop: { type: "file", content: "Windows Desktop Files" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      var: { type: "dir", children: { log: { type: "dir", children: {} } } },
      tmp: { type: "dir", children: {} },
      root: { type: "dir", children: {} },
      usr: {
        type: "dir",
        children: {
          bin: { type: "dir", children: {} },
          sbin: { type: "dir", children: {} },
          local: {
            type: "dir",
            children: { bin: { type: "dir", children: {} }, sbin: { type: "dir", children: {} } },
          },
        },
      },
      opt: { type: "dir", children: {} },
      data: { type: "dir", children: {} },
      bin: { type: "dir", children: {} },
      sbin: { type: "dir", children: {} },
    },
  };
  enrichAdminFS(root as unknown as LabDirNode, meta.hostname);
  return root;
}

function resolve(fs: DirNode, cwd: string[]): FSNode | null {
  let n: FSNode = fs;
  for (const p of cwd) {
    if (n.type !== "dir" || !n.children[p]) return null;
    n = n.children[p];
  }
  return n;
}

function normalizePath(cwd: string[], p: string): string[] {
  const abs = p.startsWith("/") ? p : "/" + cwd.join("/") + "/" + p;
  const parts = abs.split("/").filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}

function cloneFS(fs: DirNode): DirNode {
  return JSON.parse(JSON.stringify(fs));
}

function Lab() {
  const [splitView, setSplitView] = useState(true);
  const [commandCount, setCommandCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [globalDistro, setGlobalDistro] = useState<Distro>("ubuntu");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  async function saveSnapshot() {
    if (!signedIn) return;
    try {
      await logTerminalSession({ data: { command_count: commandCount, distro: globalDistro } });
      alert("âœ“ Session saved to profile. +XP awarded!");
    } catch (e) {
      alert(`Save failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSplitView(!splitView)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                splitView
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              {splitView ? (
                <Columns2 className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              {splitView ? "Dual Shell Active" : "Split View"}
            </button>
            <button
              onClick={saveSnapshot}
              disabled={!signedIn}
              title={signedIn ? "Save session & earn XP" : "Sign in to save progress"}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Session
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold font-display flex items-center gap-2">
              <TermIcon className="w-5 h-5 text-primary" /> Browser Linux Lab
              <span className="text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                Ubuntu + Debian + Alpine Shells
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full sysadmin sandbox: 100+ packages, firewall, services, networking, users, disk &
              containers. PC C: Drive at <code className="text-primary font-mono">/mnt/c</code>.
              Type <code className="text-primary font-mono">help</code>.
            </p>
          </div>
        </div>

        <div className={`flex-1 grid gap-4 ${splitView ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          <TerminalPane
            paneId="Terminal #1 (Primary)"
            initialDistro={globalDistro}
            onCommandExecuted={() => setCommandCount((c) => c + 1)}
            onDistroChange={(d) => setGlobalDistro(d)}
          />
          {splitView && (
            <TerminalPane
              paneId="Terminal #2 (Side-by-Side)"
              initialDistro="ubuntu"
              onCommandExecuted={() => setCommandCount((c) => c + 1)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function TerminalPane({
  paneId,
  initialDistro,
  onCommandExecuted,
  onDistroChange,
}: {
  paneId: string;
  initialDistro: Distro;
  onCommandExecuted: () => void;
  onDistroChange?: (d: Distro) => void;
}) {
  const [distro, setDistro] = useState<Distro>(initialDistro);
  const [fs, setFs] = useState<DirNode>(() => makeFS(initialDistro));
  const [cwd, setCwd] = useState<string[]>(["home", "learner"]);
  const [lines, setLines] = useState<Array<{ kind: "prompt" | "out" | "err"; text: string }>>([
    {
      kind: "out",
      text: `AfroKernel Full Sysadmin Lab (${paneId} — ${DISTRO_META[initialDistro].label})`,
    },
    {
      kind: "out",
      text: `${BASE_PACKAGES.length}+ base packages ready · 100+ installable · type help`,
    },
    {
      kind: "out",
      text: "Try: apt search nginx · apt install nginx · systemctl enable --now nginx · ufw allow 80",
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const packagesRef = useRef(new Set(BASE_PACKAGES));
  const servicesRef = useRef<Record<string, { active: boolean; enabled: boolean }>>({
    ssh: { active: true, enabled: true },
    sshd: { active: true, enabled: true },
    cron: { active: true, enabled: true },
    rsyslog: { active: true, enabled: true },
    networking: { active: true, enabled: true },
    ufw: { active: false, enabled: false },
    nginx: { active: false, enabled: false },
    docker: { active: false, enabled: false },
    mysql: { active: false, enabled: false },
    postgresql: { active: false, enabled: false },
    redis: { active: false, enabled: false },
  });
  const firewallRef = useRef<{ enabled: boolean; rules: string[] }>({
    enabled: false,
    rules: ["22/tcp ALLOW IN Anywhere (OpenSSH)"],
  });
  const crontabRef = useRef<string[]>([
    "# m h  dom mon dow  command",
    "0 2 * * * /usr/local/bin/backup.sh",
  ]);
  const usersRef = useRef([
    { name: "root", uid: 0, gid: 0, home: "/root", shell: "/bin/bash" },
    { name: "learner", uid: 1000, gid: 1000, home: "/home/learner", shell: "/bin/bash" },
  ]);
  const groupsRef = useRef([
    { name: "root", gid: 0 },
    { name: "learner", gid: 1000 },
    { name: "sudo", gid: 27 },
    { name: "docker", gid: 999 },
    { name: "www-data", gid: 33 },
  ]);
  const meta = DISTRO_META[distro];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [lines]);

  function prompt(): string {
    return `learner@${meta.hostname}:/${cwd.join("/")}$ `;
  }

  function print(text: string, kind: "out" | "err" = "out") {
    setLines((l) => [...l, { kind, text }]);
  }

  function switchDistro(next: Distro) {
    if (next === distro) return;
    setDistro(next);
    setFs(makeFS(next));
    setCwd(["home", "learner"]);
    packagesRef.current = new Set(BASE_PACKAGES);
    firewallRef.current = { enabled: false, rules: ["22/tcp ALLOW IN Anywhere (OpenSSH)"] };
    crontabRef.current = ["# m h  dom mon dow  command", "0 2 * * * /usr/local/bin/backup.sh"];
    usersRef.current = [
      { name: "root", uid: 0, gid: 0, home: "/root", shell: "/bin/bash" },
      { name: "learner", uid: 1000, gid: 1000, home: "/home/learner", shell: "/bin/bash" },
    ];
    setLines([
      {
        kind: "out",
        text: `Switched shell to ${DISTRO_META[next].label}. Filesystem & packages reset.`,
      },
    ]);
    onDistroChange?.(next);
  }

  function syncPasswd(nextFs: DirNode) {
    const etc = resolve(nextFs, ["etc"]);
    if (etc && etc.type === "dir") {
      etc.children.passwd = {
        type: "file",
        content:
          usersRef.current
            .map((u) => `${u.name}:x:${u.uid}:${u.gid}:${u.name}:${u.home}:${u.shell}`)
            .join("\n") + "\n",
      };
      etc.children.group = {
        type: "file",
        content: groupsRef.current.map((g) => `${g.name}:x:${g.gid}:`).join("\n") + "\n",
      };
    }
  }

  function ensureDir(next: DirNode, parts: string[]) {
    let cur: DirNode = next;
    for (const part of parts) {
      if (!cur.children[part]) cur.children[part] = { type: "dir", children: {} };
      const n = cur.children[part];
      if (n.type !== "dir") return null;
      cur = n;
    }
    return cur;
  }

  function runOne(
    cmd: string,
    args: string[],
    stdin: string,
    workFs: DirNode,
    opts: { setFs?: (f: DirNode) => void },
  ): { out: string | null; err?: string } {
    const runners: Record<string, () => { out: string | null; err?: string }> = {
      help: () => ({
        out: `AfroKernel Full Sysadmin Lab — commands students use to administer Linux:

Filesystem:  pwd ls cd mkdir rmdir touch rm mv cp tree find ln cat less man df du
Text/pipes:  grep sed awk wc head tail sort uniq cut tr tee tar gzip zip unzip
Users:       whoami id useradd usermod userdel groupadd groupdel passwd chown chmod chgrp getent
Packages:    apt apt-get apt-cache dpkg apk yum dnf snap which whereis
Services:    systemctl service journalctl hostnamectl timedatectl
Firewall:    ufw firewall-cmd iptables
Network:     ip ifconfig ping curl wget ss netstat dig nslookup host traceroute nmap tcpdump nc nmcli
Disk/LVM:    lsblk fdisk mount umount blkid free iostat vmstat lvm
Process:     ps top htop kill killall pkill pgrep lsof strace uptime
Security:    ssh scp openssl fail2ban-client aa-status
Containers:  docker docker-compose kubectl podman
Dev:         git python3 node npm jq
Scheduling:  crontab at
Also:        sudo hostname uname date clear history env export sysctl

Tips:
  apt update && apt install nginx docker.io postgresql fail2ban
  systemctl enable --now nginx
  ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
  cat ~/admin-cheatsheet.txt`,
      }),
      pwd: () => ({ out: "/" + cwd.join("/") }),
      whoami: () => ({ out: "learner" }),
      id: () => ({ out: "uid=1000(learner) gid=1000(learner) groups=1000(learner),27(sudo)" }),
      hostname: () => ({ out: meta.hostname }),
      uname: () => ({ out: args.includes("-a") ? meta.kernel : "Linux" }),
      date: () => ({ out: new Date().toString() }),
      clear: () => {
        setLines([]);
        return { out: null };
      },
      history: () => ({ out: history.map((h, i) => `${i + 1}  ${h}`).join("\n") }),
      env: () => ({
        out: "USER=learner\nHOME=/home/learner\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nLANG=en_US.UTF-8\nTERM=xterm-256color",
      }),
      echo: () => ({
        out: args
          .map((a) =>
            a.replace(/\$([A-Z_]+)/g, (_, k) =>
              k === "USER" ? "learner" : k === "HOME" ? "/home/learner" : "",
            ),
          )
          .join(" "),
      }),
      uptime: () => ({
        out: ` ${new Date().toTimeString().slice(0, 8)} up 2 days,  3:14,  1 user,  load average: 0.08, 0.03, 0.01`,
      }),

      ls: () => {
        const path = args.find((a) => !a.startsWith("-"));
        const target = path ? normalizePath(cwd, path) : cwd;
        const node = resolve(workFs, target);
        if (!node)
          return { out: null, err: `ls: cannot access '${path}': No such file or directory` };
        if (node.type === "file") return { out: path! };
        const long = args.some((a) => a.startsWith("-") && a.includes("l"));
        const showHidden = args.some((a) => a.startsWith("-") && a.includes("a"));
        const names = Object.keys(node.children)
          .filter((n) => showHidden || !n.startsWith("."))
          .sort();
        if (long) {
          return {
            out: names
              .map((n) => {
                const c = node.children[n];
                const size = c.type === "file" ? c.content.length : 4096;
                const perm = c.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
                return `${perm}  1 learner learner ${String(size).padStart(6)} Jul 27 10:00 ${n}`;
              })
              .join("\n"),
          };
        }
        return { out: names.join("  ") };
      },

      cd: () => {
        const target = args[0]
          ? normalizePath(cwd, args[0].replace(/^~/, "/home/learner"))
          : ["home", "learner"];
        const node = resolve(workFs, target);
        if (!node) return { out: null, err: `cd: ${args[0]}: No such file or directory` };
        if (node.type !== "dir") return { out: null, err: `cd: ${args[0]}: Not a directory` };
        setCwd(target);
        return { out: null };
      },

      cat: () => {
        if (!args[0]) return { out: stdin };
        const results: string[] = [];
        for (const a of args) {
          const p = normalizePath(cwd, a);
          const node = resolve(workFs, p);
          if (!node) return { out: null, err: `cat: ${a}: No such file or directory` };
          if (node.type !== "file") return { out: null, err: `cat: ${a}: Is a directory` };
          results.push(node.content);
        }
        return { out: results.join("").replace(/\n$/, "") };
      },

      mkdir: () => {
        const parents = args.includes("-p") || args.includes("--parents");
        const targets = args.filter((a) => !a.startsWith("-"));
        if (targets.length === 0) return { out: null, err: "mkdir: missing operand" };
        const next = cloneFS(workFs);
        for (const t of targets) {
          const p = normalizePath(cwd, t);
          if (parents) {
            ensureDir(next, p);
          } else {
            const parent = resolve(next, p.slice(0, -1));
            if (!parent || parent.type !== "dir")
              return {
                out: null,
                err: `mkdir: cannot create directory '${t}': No such file or directory`,
              };
            if (parent.children[p[p.length - 1]])
              return { out: null, err: `mkdir: cannot create directory '${t}': File exists` };
            parent.children[p[p.length - 1]] = { type: "dir", children: {} };
          }
        }
        opts.setFs?.(next);
        return { out: null };
      },

      rmdir: () => {
        const targets = args.filter((a) => !a.startsWith("-"));
        if (!targets.length) return { out: null, err: "rmdir: missing operand" };
        const next = cloneFS(workFs);
        for (const t of targets) {
          const p = normalizePath(cwd, t);
          const node = resolve(next, p);
          const parent = resolve(next, p.slice(0, -1));
          if (!node || node.type !== "dir")
            return { out: null, err: `rmdir: failed to remove '${t}': No such file or directory` };
          if (Object.keys(node.children).length)
            return { out: null, err: `rmdir: failed to remove '${t}': Directory not empty` };
          if (parent && parent.type === "dir") delete parent.children[p[p.length - 1]];
        }
        opts.setFs?.(next);
        return { out: null };
      },

      touch: () => {
        if (!args[0]) return { out: null, err: "touch: missing file operand" };
        const next = cloneFS(workFs);
        for (const a of args.filter((x) => !x.startsWith("-"))) {
          const p = normalizePath(cwd, a);
          const parent = resolve(next, p.slice(0, -1));
          if (!parent || parent.type !== "dir")
            return { out: null, err: `touch: cannot touch '${a}': No such file or directory` };
          if (!parent.children[p[p.length - 1]])
            parent.children[p[p.length - 1]] = { type: "file", content: "" };
        }
        opts.setFs?.(next);
        return { out: null };
      },

      rm: () => {
        const recursive = args.some(
          (a) => a === "-r" || a === "-rf" || a === "-fr" || a.includes("r"),
        );
        const targets = args.filter((a) => !a.startsWith("-"));
        if (targets.length === 0) return { out: null, err: "rm: missing operand" };
        const next = cloneFS(workFs);
        for (const t of targets) {
          const p = normalizePath(cwd, t);
          const parent = resolve(next, p.slice(0, -1));
          const name = p[p.length - 1];
          if (!parent || parent.type !== "dir" || !parent.children[name])
            return { out: null, err: `rm: cannot remove '${t}': No such file or directory` };
          const node = parent.children[name];
          if (node.type === "dir" && !recursive)
            return { out: null, err: `rm: cannot remove '${t}': Is a directory` };
          delete parent.children[name];
        }
        opts.setFs?.(next);
        return { out: null };
      },

      mv: () => {
        if (args.length < 2) return { out: null, err: "mv: missing file operand" };
        const src = normalizePath(cwd, args[0]);
        const dstArg = args[1];
        const next = cloneFS(workFs);
        const srcParent = resolve(next, src.slice(0, -1));
        const srcName = src[src.length - 1];
        if (!srcParent || srcParent.type !== "dir" || !srcParent.children[srcName])
          return { out: null, err: `mv: cannot stat '${args[0]}': No such file or directory` };
        const node = srcParent.children[srcName];
        let dst = normalizePath(cwd, dstArg);
        const dstNode = resolve(next, dst);
        if (dstNode && dstNode.type === "dir") dst = [...dst, srcName];
        const dstParent = resolve(next, dst.slice(0, -1));
        if (!dstParent || dstParent.type !== "dir")
          return { out: null, err: `mv: cannot move to '${dstArg}': No such directory` };
        dstParent.children[dst[dst.length - 1]] = node;
        delete srcParent.children[srcName];
        opts.setFs?.(next);
        return { out: null };
      },

      cp: () => {
        if (args.length < 2) return { out: null, err: "cp: missing file operand" };
        const srcArgs = args.filter((a) => !a.startsWith("-"));
        if (srcArgs.length < 2) return { out: null, err: "cp: missing destination" };
        const next = cloneFS(workFs);
        const destPath = normalizePath(cwd, srcArgs[srcArgs.length - 1]);
        for (const s of srcArgs.slice(0, -1)) {
          const src = normalizePath(cwd, s);
          const node = resolve(next, src);
          if (!node) return { out: null, err: `cp: cannot stat '${s}': No such file or directory` };
          let dest = destPath;
          const destNode = resolve(next, dest);
          if (destNode && destNode.type === "dir") dest = [...dest, src[src.length - 1]];
          const parent = resolve(next, dest.slice(0, -1));
          if (!parent || parent.type !== "dir")
            return { out: null, err: `cp: cannot create '${srcArgs.at(-1)}'` };
          parent.children[dest[dest.length - 1]] = JSON.parse(JSON.stringify(node));
        }
        opts.setFs?.(next);
        return { out: null };
      },

      tree: () => {
        const start = args[0] ? normalizePath(cwd, args[0]) : cwd;
        const root = resolve(workFs, start);
        if (!root || root.type !== "dir")
          return { out: null, err: `tree: ${args[0] || "."}: not a directory` };
        const linesOut: string[] = [args[0] || "."];
        function walk(node: DirNode, prefix: string) {
          const names = Object.keys(node.children).sort();
          names.forEach((n, i) => {
            const last = i === names.length - 1;
            const branch = last ? "└── " : "├── ";
            linesOut.push(prefix + branch + n);
            const child = node.children[n];
            if (child.type === "dir") walk(child, prefix + (last ? "    " : "│   "));
          });
        }
        walk(root, "");
        return { out: linesOut.join("\n") };
      },

      find: () => {
        const start = args[0] && !args[0].startsWith("-") ? normalizePath(cwd, args[0]) : cwd;
        const nameIdx = args.indexOf("-name");
        const pattern =
          nameIdx >= 0 ? args[nameIdx + 1]?.replace(/\*/g, ".*").replace(/\?/g, ".") : ".*";
        const rx = new RegExp(`^${pattern}$`);
        const hits: string[] = [];
        function walk(node: FSNode, pathParts: string[]) {
          const base = pathParts[pathParts.length - 1] || "";
          if (!pathParts.length || rx.test(base)) hits.push("/" + pathParts.join("/"));
          if (node.type === "dir") {
            for (const [n, c] of Object.entries(node.children)) walk(c, [...pathParts, n]);
          }
        }
        const root = resolve(workFs, start);
        if (!root) return { out: null, err: `find: '${args[0]}': No such file or directory` };
        walk(root, start);
        return { out: hits.join("\n") };
      },

      ln: () => {
        if (args.length < 2) return { out: null, err: "ln: missing file operand" };
        const next = cloneFS(workFs);
        const target = args[args.length - 2];
        const link = args[args.length - 1];
        const p = normalizePath(cwd, link);
        const parent = resolve(next, p.slice(0, -1));
        if (!parent || parent.type !== "dir")
          return { out: null, err: `ln: failed to create link '${link}'` };
        parent.children[p[p.length - 1]] = { type: "file", content: `symlink -> ${target}\n` };
        opts.setFs?.(next);
        return { out: null };
      },

      useradd: () => {
        const createHome = args.includes("-m");
        const name = args.filter((a) => !a.startsWith("-")).at(-1);
        if (!name) return { out: null, err: "useradd: must provide a username" };
        if (usersRef.current.some((u) => u.name === name))
          return { out: null, err: `useradd: user '${name}' already exists` };
        const uid = Math.max(...usersRef.current.map((u) => u.uid)) + 1;
        const home = `/home/${name}`;
        usersRef.current.push({ name, uid, gid: uid, home, shell: "/bin/bash" });
        groupsRef.current.push({ name, gid: uid });
        const next = cloneFS(workFs);
        if (createHome) {
          ensureDir(next, ["home", name]);
          const homeDir = resolve(next, ["home", name]);
          if (homeDir && homeDir.type === "dir") {
            homeDir.children[".bashrc"] = {
              type: "file",
              content: `# ~/.bashrc for ${name}\nexport PS1='\\u@\\h:\\w\\$ '\n`,
            };
          }
        }
        syncPasswd(next);
        opts.setFs?.(next);
        return { out: `✓ user '${name}' created (uid=${uid}) home=${home}` };
      },

      usermod: () => {
        const name = args.filter((a) => !a.startsWith("-")).at(-1);
        if (!name) return { out: null, err: "usermod: user name required" };
        const u = usersRef.current.find((x) => x.name === name);
        if (!u) return { out: null, err: `usermod: user '${name}' does not exist` };
        const shellIdx = args.indexOf("-s");
        if (shellIdx >= 0 && args[shellIdx + 1]) u.shell = args[shellIdx + 1];
        const next = cloneFS(workFs);
        syncPasswd(next);
        opts.setFs?.(next);
        return { out: `✓ usermod applied to '${name}'` };
      },

      userdel: () => {
        const name = args.filter((a) => !a.startsWith("-")).at(-1);
        if (!name) return { out: null, err: "userdel: user name required" };
        if (name === "root" || name === "learner")
          return { out: null, err: `userdel: cannot remove protected user '${name}'` };
        usersRef.current = usersRef.current.filter((u) => u.name !== name);
        const next = cloneFS(workFs);
        if (args.includes("-r")) {
          const home = resolve(next, ["home"]);
          if (home && home.type === "dir") delete home.children[name];
        }
        syncPasswd(next);
        opts.setFs?.(next);
        return { out: `✓ user '${name}' removed` };
      },

      groupadd: () => {
        const name = args.filter((a) => !a.startsWith("-")).at(-1);
        if (!name) return { out: null, err: "groupadd: group name required" };
        if (groupsRef.current.some((g) => g.name === name))
          return { out: null, err: `groupadd: group '${name}' already exists` };
        const gid = Math.max(...groupsRef.current.map((g) => g.gid)) + 1;
        groupsRef.current.push({ name, gid });
        const next = cloneFS(workFs);
        syncPasswd(next);
        opts.setFs?.(next);
        return { out: `✓ group '${name}' created (gid=${gid})` };
      },

      passwd: () => {
        const name = args[0] || "learner";
        if (!usersRef.current.some((u) => u.name === name))
          return { out: null, err: `passwd: user '${name}' does not exist` };
        return {
          out: `Changing password for ${name}.\nNew password: ********\nRetype new password: ********\npasswd: password updated successfully`,
        };
      },

      systemctl: () => {
        const action = args[0];
        const unitRaw = args.find((a) => !a.startsWith("-") && a !== action) || args[1] || "";
        const unit = unitRaw.replace(/\.service$/, "") || "nginx";
        const ensureSvc = (name: string) => {
          if (!servicesRef.current[name])
            servicesRef.current[name] = { active: false, enabled: false };
          return servicesRef.current[name];
        };
        if (
          action === "list-units" ||
          action === "list-unit-files" ||
          args.includes("--type=service")
        ) {
          return {
            out: Object.entries(servicesRef.current)
              .map(
                ([n, s]) =>
                  `${n}.service`.padEnd(28) +
                  (s.active ? "loaded active running" : "loaded inactive dead").padEnd(28) +
                  (s.enabled ? "enabled" : "disabled"),
              )
              .join("\n"),
          };
        }
        if (action === "status") {
          const s = ensureSvc(unit);
          return {
            out: `● ${unit}.service - AfroKernel Managed Service
     Loaded: loaded (/lib/systemd/system/${unit}.service; ${s.enabled ? "enabled" : "disabled"}; vendor preset: enabled)
     Active: ${s.active ? "active (running)" : "inactive (dead)"} since Mon 2026-08-01 10:00:00 UTC
   Main PID: ${s.active ? "1284" : "n/a"} (${unit})
      Tasks: ${s.active ? "2" : "0"}
     Memory: ${s.active ? "12.4M" : "0B"}`,
          };
        }
        if (action === "start") {
          ensureSvc(unit).active = true;
          return { out: "" };
        }
        if (action === "stop") {
          ensureSvc(unit).active = false;
          return { out: "" };
        }
        if (action === "restart" || action === "reload") {
          ensureSvc(unit).active = true;
          return { out: `✓ ${unit}.service ${action}ed` };
        }
        if (action === "enable") {
          const s = ensureSvc(unit);
          s.enabled = true;
          if (args.includes("--now")) s.active = true;
          return {
            out: `Created symlink /etc/systemd/system/multi-user.target.wants/${unit}.service`,
          };
        }
        if (action === "disable") {
          const s = ensureSvc(unit);
          s.enabled = false;
          if (args.includes("--now")) s.active = false;
          return { out: `Removed ${unit}.service from multi-user.target` };
        }
        if (action === "is-active") return { out: ensureSvc(unit).active ? "active" : "inactive" };
        if (action === "is-enabled")
          return { out: ensureSvc(unit).enabled ? "enabled" : "disabled" };
        if (action === "daemon-reload") return { out: "" };
        return {
          out: "systemctl status|start|stop|restart|reload|enable|disable|list-units [--now] <service>",
        };
      },
      service: () => {
        if (args.length < 2) return { out: "Usage: service <name> start|stop|restart|status" };
        return runOne("systemctl", [args[1], args[0]], stdin, workFs, opts);
      },
      journalctl: () => {
        const unitIdx = args.indexOf("-u");
        const unit = unitIdx >= 0 ? args[unitIdx + 1] : "nginx";
        return {
          out: `-- Logs begin at Mon 2026-08-01 08:00:00 UTC --
Aug 01 10:00:01 ${meta.hostname} systemd[1]: Started ${unit}.
Aug 01 10:00:02 ${meta.hostname} ${unit}[1284]: ready to accept connections
Aug 01 10:00:05 ${meta.hostname} sshd[1024]: Server listening on 0.0.0.0 port 22.
Aug 01 10:01:12 ${meta.hostname} kernel: AfroKernel lab audit event`,
        };
      },
      hostnamectl: () => ({
        out: ` Static hostname: ${meta.hostname}
       Icon name: computer-vm
         Chassis: vm
      Machine ID: a1b2c3d4e5f6789012345678abcdef01
         Boot ID: 11223344556677889900aabbccddeeff
  Operating System: ${DISTRO_META[distro].label}
            Kernel: ${meta.kernel.split(" ")[2] || "6.8.0-afrokernel"}
      Architecture: x86-64`,
      }),
      timedatectl: () => ({
        out: `               Local time: ${new Date().toUTCString()}
           Universal time: ${new Date().toISOString()}
                 RTC time: ${new Date().toISOString()}
                Time zone: UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no`,
      }),

      apt: () => {
        const sub = args[0];
        const pkgs = args.slice(1).filter((a) => !a.startsWith("-") && a !== "--installed");
        if (sub === "update") {
          return {
            out: `Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:3 http://security.ubuntu.com/ubuntu noble-security InRelease
Reading package lists... Done
Building dependency tree... Done
${searchPackages("").length} packages available in AfroKernel catalog`,
          };
        }
        if (sub === "upgrade" || sub === "full-upgrade" || sub === "dist-upgrade") {
          return {
            out: "Reading package lists... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove.\n✓ System up to date",
          };
        }
        if (sub === "search" || (sub === "list" && args.includes("--all"))) {
          const q = pkgs[0] || "";
          const hits = searchPackages(q);
          return {
            out:
              hits
                .slice(0, 50)
                .map((p) => `${p.name}/noble ${p.version} amd64\n  ${p.description}`)
                .join("\n") || "No packages found.",
          };
        }
        if (sub === "show" || sub === "info") {
          const name = pkgs[0];
          if (!name) return { out: null, err: "apt show: package name required" };
          const info = PACKAGE_BY_NAME.get(name);
          if (!info) return { out: null, err: `E: No packages found matching '${name}'` };
          return {
            out:
              formatAptShow(info) +
              (packagesRef.current.has(name)
                ? "\nStatus: install ok installed"
                : "\nStatus: available"),
          };
        }
        if (sub === "install" || sub === "add") {
          if (!pkgs.length) return { out: null, err: "apt: package name required" };
          const next = cloneFS(workFs);
          const installed: string[] = [];
          const deps: string[] = [];
          for (const pkg of pkgs) {
            const info = PACKAGE_BY_NAME.get(pkg);
            for (const d of info?.depends ?? []) {
              if (!packagesRef.current.has(d) && !pkgs.includes(d)) {
                packagesRef.current.add(d);
                applyPackageInstall(next as unknown as LabDirNode, d);
                deps.push(d);
              }
            }
            packagesRef.current.add(pkg);
            applyPackageInstall(next as unknown as LabDirNode, pkg);
            installed.push(pkg);
            const svcName = pkg
              .replace(/\.io$/, "")
              .replace(/-server$/, "")
              .replace(/^openssh-/, "");
            if (
              [
                "nginx",
                "apache2",
                "docker",
                "mysql",
                "mariadb",
                "postgresql",
                "redis",
                "sshd",
                "fail2ban",
              ].some((s) => pkg.includes(s))
            ) {
              if (!servicesRef.current[svcName])
                servicesRef.current[svcName] = { active: false, enabled: false };
            }
          }
          opts.setFs?.(next);
          return {
            out: `Reading package lists... Done
Building dependency tree... Done
The following additional packages will be installed:
  ${[...deps, ...installed].join(" ")}
0 upgraded, ${installed.length + deps.length} newly installed.
Unpacking ${installed.join(", ")}...
Setting up ${installed.join(", ")} (${installed.map((p) => PACKAGE_BY_NAME.get(p)?.version ?? "1.0").join(", ")}) ...
✓ Packages installed — binaries in /usr/bin`,
          };
        }
        if (sub === "remove" || sub === "purge" || sub === "autoremove") {
          for (const pkg of pkgs) packagesRef.current.delete(pkg);
          return { out: `Removing ${pkgs.join(" ") || "unused packages"}...\n✓ Done` };
        }
        if (sub === "list") {
          const installedOnly = args.includes("--installed") || !args.includes("--all");
          const list = installedOnly
            ? Array.from(packagesRef.current).sort()
            : searchPackages("").map((p) => p.name);
          return {
            out: list
              .map((p) => {
                const info = PACKAGE_BY_NAME.get(p);
                const flag = packagesRef.current.has(p) ? "ii" : "un";
                return `${flag}  ${p.padEnd(28)} ${info?.version ?? "1.0"}  amd64  ${info?.description ?? ""}`;
              })
              .join("\n"),
          };
        }
        if (sub === "policy") {
          const name = pkgs[0] || "?";
          return {
            out: `${name}:\n  Installed: ${packagesRef.current.has(name) ? (PACKAGE_BY_NAME.get(name)?.version ?? "1.0") : "(none)"}\n  Candidate: ${PACKAGE_BY_NAME.get(name)?.version ?? "1.0"}\n  Version table:\n *** ${PACKAGE_BY_NAME.get(name)?.version ?? "1.0"} 500`,
          };
        }
        return {
          out: "apt update | upgrade | install <pkg…> | remove <pkg> | search <q> | show <pkg> | list [--installed] | policy <pkg>",
        };
      },
      "apt-get": () => runOne("apt", args, stdin, workFs, opts),
      "apt-cache": () => {
        if (args[0] === "search")
          return runOne("apt", ["search", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "show" || args[0] === "policy")
          return runOne("apt", args, stdin, workFs, opts);
        return { out: "apt-cache search|show|policy <pkg>" };
      },
      dpkg: () => {
        if (args.includes("-l") || args[0] === "-l") {
          return {
            out:
              "Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n||/ Name                       Version\n+++-==========================-========================\n" +
              Array.from(packagesRef.current)
                .sort()
                .map((p) => `ii  ${p.padEnd(28)} ${PACKAGE_BY_NAME.get(p)?.version ?? "1.0"}`)
                .join("\n"),
          };
        }
        if (args[0] === "-s" || args[0] === "--status") {
          const name = args[1];
          if (!name || !packagesRef.current.has(name))
            return { out: null, err: `dpkg-query: package '${name}' is not installed` };
          return {
            out: formatAptShow(
              PACKAGE_BY_NAME.get(name) ?? {
                name,
                version: "1.0",
                section: "unknown",
                description: name,
              },
            ),
          };
        }
        return {
          out: Array.from(packagesRef.current)
            .sort()
            .map((p) => `ii  ${p}`)
            .join("\n"),
        };
      },
      apk: () => {
        if (args[0] === "update") return runOne("apt", ["update"], stdin, workFs, opts);
        if (args[0] === "add")
          return runOne("apt", ["install", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "del")
          return runOne("apt", ["remove", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "search")
          return runOne("apt", ["search", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "info") return runOne("apt", ["list", "--installed"], stdin, workFs, opts);
        return { out: "apk update | apk add <pkg> | apk del <pkg> | apk search <q>" };
      },
      yum: () => {
        if (args[0] === "install")
          return runOne("apt", ["install", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "remove")
          return runOne("apt", ["remove", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "search")
          return runOne("apt", ["search", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "info")
          return runOne("apt", ["show", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "list") return runOne("apt", ["list", "--installed"], stdin, workFs, opts);
        return { out: "yum install|remove|search|info|list" };
      },
      dnf: () => runOne("yum", args, stdin, workFs, opts),
      snap: () => {
        if (args[0] === "find" || args[0] === "search")
          return runOne("apt", ["search", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "install")
          return runOne("apt", ["install", ...args.slice(1)], stdin, workFs, opts);
        if (args[0] === "list")
          return {
            out: "Name    Version  Rev  Tracking  Publisher\ncore    16-2     1    latest    canonical",
          };
        return { out: "snap find|install|list <name>" };
      },
      which: () => {
        const name = args[0];
        if (!name) return { out: null, err: "which: missing argument" };
        const node =
          resolve(workFs, ["usr", "bin", name]) ||
          resolve(workFs, ["usr", "sbin", name]) ||
          resolve(workFs, ["bin", name]);
        if (node || packagesRef.current.has(name)) return { out: `/usr/bin/${name}` };
        return { out: null, err: `${name} not found` };
      },
      whereis: () => {
        const name = args[0];
        if (!name) return { out: null, err: "whereis: missing argument" };
        return { out: `${name}: /usr/bin/${name} /usr/share/man/man1/${name}.1.gz` };
      },

      ip: () => {
        if (args.includes("addr") || args.includes("a") || args.length === 0) {
          return {
            out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.1.150/24 brd 192.168.1.255 scope global eth0`,
          };
        }
        return { out: "192.168.1.1 via eth0" };
      },
      ifconfig: () => runOne("ip", ["addr"], stdin, workFs, opts),
      ping: () => {
        const host = args.find((a) => !a.startsWith("-")) || "8.8.8.8";
        return {
          out: `PING ${host} (${host}) 56(84) bytes of data.\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=12.4 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=11.8 ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`,
        };
      },
      curl: () => {
        const url = args.find((a) => !a.startsWith("-")) || "https://afrokernel.dev";
        return {
          out: `<!DOCTYPE html>\n<html><head><title>AfroKernel</title></head>\n<body><h1>Connected to ${url}</h1><p>HTTP/2 200 OK</p></body></html>`,
        };
      },
      wget: () => {
        const url = args.find((a) => !a.startsWith("-")) || "https://afrokernel.dev/file.tar.gz";
        const name = url.split("/").pop() || "download";
        const next = cloneFS(workFs);
        const parent = resolve(next, cwd);
        if (parent && parent.type === "dir")
          parent.children[name] = { type: "file", content: `# downloaded from ${url}\n` };
        opts.setFs?.(next);
        return {
          out: `--2026-07-31 10:00:00-- ${url}\nSaving to: '${name}'\n100%[===================>] done`,
        };
      },
      ss: () => {
        const listening = args.some(
          (a) => a.includes("l") || a.includes("tulpn") || a === "-tulpn" || a === "-ltnp",
        );
        if (listening) {
          const rows = [
            "Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process",
            'tcp   LISTEN 0      128        0.0.0.0:22       0.0.0.0:*    users:(("sshd",pid=431,fd=3))',
          ];
          if (servicesRef.current.nginx?.active)
            rows.push(
              'tcp   LISTEN 0      511        0.0.0.0:80       0.0.0.0:*    users:(("nginx",pid=1284,fd=6))',
            );
          if (servicesRef.current.nginx?.active)
            rows.push(
              'tcp   LISTEN 0      511        0.0.0.0:443      0.0.0.0:*    users:(("nginx",pid=1284,fd=7))',
            );
          if (servicesRef.current.docker?.active)
            rows.push(
              'tcp   LISTEN 0      4096     127.0.0.1:2375     0.0.0.0:*    users:(("dockerd",pid=900,fd=8))',
            );
          if (servicesRef.current.mysql?.active || servicesRef.current.mariadb?.active)
            rows.push(
              'tcp   LISTEN 0      151      127.0.0.1:3306     0.0.0.0:*    users:(("mysqld",pid=1500,fd=21))',
            );
          if (servicesRef.current.postgresql?.active)
            rows.push(
              'tcp   LISTEN 0      200      127.0.0.1:5432     0.0.0.0:*    users:(("postgres",pid=1600,fd=5))',
            );
          return { out: rows.join("\n") };
        }
        return {
          out: "Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port\ntcp   LISTEN 0      128        0.0.0.0:22       0.0.0.0:*\ntcp   ESTAB  0      0      192.168.1.150:22    192.168.1.10:51422",
        };
      },
      netstat: () => runOne("ss", args.length ? args : ["-tulpn"], stdin, workFs, opts),

      df: () => ({
        out: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       41151808 12450000  26585808  32% /
/dev/sda2        1048572        0   1048572   0% [SWAP]
C:\\             512000000 120000000 392000000  24% /mnt/c
tmpfs            4020000        0   4020000   0% /dev/shm
tmpfs            815400         12    815388   1% /run`,
      }),
      du: () => ({ out: `4096\t./notes.md\n8192\t./welcome.txt\n12288\t.` }),
      free: () => ({
        out: `               total        used        free      shared  buff/cache   available
Mem:         8154000     2104000     4020000      120000     2030000     5930000
Swap:        2097152           0     2097152`,
      }),
      lsblk: () => ({
        out: `NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   40G  0 disk
├─sda1   8:1    0   39G  0 part /
└─sda2   8:2    0    1G  0 part [SWAP]
sdb      8:16   0  100G  0 disk`,
      }),
      fdisk: () => ({
        out: "Disk /dev/sda: 40 GiB, 42949672960 bytes, 83886080 sectors\nDisk /dev/sdb: 100 GiB\nUse fdisk /dev/sdb to create partitions (simulated).",
      }),
      blkid: () => ({
        out: '/dev/sda1: UUID="a1b2c3d4" TYPE="ext4" PARTUUID="1111"\n/dev/sda2: UUID="e5f6g7h8" TYPE="swap"',
      }),
      mount: () => {
        if (!args.length) return runOne("df", [], stdin, workFs, opts);
        return { out: `✓ mounted ${args[0]} on ${args[1] || "/mnt"}` };
      },
      umount: () => ({ out: `✓ unmounted ${args[0] || "/mnt"}` }),

      top: () => ({
        out: `top - ${new Date().toTimeString().slice(0, 8)} up 2 days,  3:14,  1 user,  load average: 0.08, 0.03, 0.01
Tasks: 110 total,   1 running, 109 sleeping
  PID USER      PR  NI    VIRT    RES  %CPU  %MEM COMMAND
    1 root      20   0  168000  12000   0.0   0.1 systemd
  431 root      20   0   14000   5200   0.0   0.1 sshd
 1024 learner   20   0    8900   3400   0.0   0.0 bash
 1284 root      20   0   12400   4500   0.3   0.1 nginx`,
      }),
      htop: () => runOne("top", args, stdin, workFs, opts),
      ps: () => ({
        out: "  PID TTY          TIME CMD\n    1 ?        00:00:01 systemd\n  431 ?        00:00:00 sshd\n 1024 pts/0    00:00:00 bash\n 1284 ?        00:00:02 nginx\n 1337 pts/0    00:00:00 ps",
      }),
      kill: () => ({
        out: args[0] ? `✓ sent signal to PID ${args.find((a) => !a.startsWith("-")) || "?"}` : null,
        err: args[0] ? undefined : "kill: usage: kill [-s sig] pid",
      }),
      killall: () => ({ out: `✓ killed processes matching ${args[0] || "?"}` }),
      pkill: () => runOne("killall", args, stdin, workFs, opts),

      grep: () => {
        const flags = args.filter((a) => a.startsWith("-"));
        const rest = args.filter((a) => !a.startsWith("-"));
        const [pat, ...files] = rest;
        if (!pat) return { out: null, err: "grep: missing pattern" };
        const ci = flags.some((f) => f.includes("i"));
        const rx = new RegExp(pat, ci ? "i" : "");
        function scan(text: string): string {
          return text
            .split("\n")
            .filter((ln) => rx.test(ln))
            .join("\n");
        }
        if (files.length === 0) return { out: scan(stdin) };
        const parts: string[] = [];
        for (const f of files) {
          const p = normalizePath(cwd, f);
          const node = resolve(workFs, p);
          if (!node || node.type !== "file") return { out: null, err: `grep: ${f}: No such file` };
          parts.push(scan(node.content));
        }
        return { out: parts.join("\n") };
      },
      wc: () => {
        const text =
          stdin ||
          (args[0]
            ? (resolve(workFs, normalizePath(cwd, args[0])) as FileNode)?.content || ""
            : "");
        const linesN = text ? text.trim().split("\n").length : 0;
        const words = text ? (text.match(/\S+/g) ?? []).length : 0;
        return { out: `${linesN} ${words} ${text.length}` };
      },
      head: () => ({
        out: (
          stdin ||
          (args[0] ? (resolve(workFs, normalizePath(cwd, args[0])) as FileNode)?.content || "" : "")
        )
          .split("\n")
          .slice(0, 10)
          .join("\n"),
      }),
      tail: () => {
        const lns = (
          stdin ||
          (args[0] ? (resolve(workFs, normalizePath(cwd, args[0])) as FileNode)?.content || "" : "")
        ).split("\n");
        return { out: lns.slice(Math.max(0, lns.length - 10)).join("\n") };
      },
      sort: () => ({ out: (stdin || "").split("\n").sort().join("\n") }),
      uniq: () => ({ out: Array.from(new Set((stdin || "").split("\n"))).join("\n") }),
      cut: () => {
        const dIdx = args.indexOf("-d");
        const fIdx = args.indexOf("-f");
        const delim = dIdx >= 0 ? args[dIdx + 1] : "\t";
        const field = fIdx >= 0 ? Number(args[fIdx + 1]) - 1 : 0;
        return {
          out: (stdin || "")
            .split("\n")
            .map((ln) => ln.split(delim)[field] ?? "")
            .join("\n"),
        };
      },
      tr: () => {
        if (args.length < 2) return { out: stdin };
        return { out: (stdin || "").split(args[0]).join(args[1]) };
      },
      tee: () => {
        if (args[0]) {
          const next = cloneFS(workFs);
          const p = normalizePath(cwd, args[0]);
          const parent = resolve(next, p.slice(0, -1));
          if (parent && parent.type === "dir")
            parent.children[p[p.length - 1]] = {
              type: "file",
              content: stdin + (stdin.endsWith("\n") ? "" : "\n"),
            };
          opts.setFs?.(next);
        }
        return { out: stdin };
      },

      dig: () => {
        const host = args.find((a) => !a.startsWith("-") && !a.includes("=")) || "afrokernel.dev";
        return {
          out: `; <<>> DiG 9.18.28 <<>> ${host}
;; QUESTION SECTION:
;${host}.\t\tIN\tA
;; ANSWER SECTION:
${host}.\t\t300\tIN\tA\t104.21.16.1
;; Query time: 12 msec
;; SERVER: 1.1.1.1#53`,
        };
      },
      nslookup: () => {
        const host = args[0] || "afrokernel.dev";
        return {
          out: `Server:\t\t1.1.1.1\nAddress:\t1.1.1.1#53\n\nNon-authoritative answer:\nName:\t${host}\nAddress: 104.21.16.1`,
        };
      },
      host: () => ({ out: `${args[0] || "afrokernel.dev"} has address 104.21.16.1` }),
      traceroute: () => {
        const host = args.find((a) => !a.startsWith("-")) || "8.8.8.8";
        return {
          out: `traceroute to ${host} (${host}), 30 hops max\n 1  gateway (192.168.1.1)  1.2 ms\n 2  isp.isp.net (10.0.0.1)  8.4 ms\n 3  ${host} (${host})  12.1 ms`,
        };
      },
      nmap: () => {
        const host = args.find((a) => !a.startsWith("-")) || "127.0.0.1";
        return {
          out: `Starting Nmap 7.94 ( https://nmap.org ) at AfroKernel Lab
Nmap scan report for ${host}
Host is up (0.00020s latency).
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  ${servicesRef.current.nginx?.active ? "open" : "closed"}  http
443/tcp ${servicesRef.current.nginx?.active ? "open" : "closed"}  https
Nmap done: 1 IP address (1 host up) scanned`,
        };
      },
      tcpdump: () => ({
        out: `tcpdump: verbose output suppressed, use -v\nlistening on eth0, link-type EN10MB\n10:00:01.123 IP 192.168.1.150.22 > 192.168.1.10.51422: Flags [P.], length 64\n10:00:01.124 IP 192.168.1.10.51422 > 192.168.1.150.22: Flags [.], length 0\n✓ (simulated capture — Ctrl+C to stop)`,
      }),
      nc: () => ({
        out:
          args.includes("-l") || args.includes("-zv")
            ? `Connection to ${args.find((a) => !a.startsWith("-")) || "host"} ${args.find((a) => /^\d+$/.test(a)) || "22"} port [tcp/*] succeeded!`
            : "usage: nc [-l] [-zv] host port",
      }),
      netcat: () => runOne("nc", args, stdin, workFs, opts),
      nmcli: () => {
        if (args[0] === "device" || args[0] === "d") {
          return {
            out: "DEVICE  TYPE      STATE      CONNECTION\neth0    ethernet  connected  Wired connection 1\nlo      loopback  unmanaged  --",
          };
        }
        if (args[0] === "connection" || args[0] === "c") {
          return {
            out: "NAME                UUID                                  TYPE      DEVICE\nWired connection 1  a1b2c3d4-e5f6-7890-abcd-ef1234567890  ethernet  eth0",
          };
        }
        return {
          out: "nmcli device|connection|general\nGENERAL.DEVICE:eth0\nGENERAL.STATE:100 (connected)\nIP4.ADDRESS[1]:192.168.1.150/24\nIP4.GATEWAY:192.168.1.1",
        };
      },

      ufw: () => {
        const sub = args[0];
        if (sub === "status" || args.includes("status")) {
          const verbose = args.includes("verbose") || args.includes("numbered");
          if (!firewallRef.current.enabled && !args.includes("verbose")) {
            return { out: "Status: inactive" };
          }
          return {
            out: `Status: ${firewallRef.current.enabled ? "active" : "inactive"}
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
${firewallRef.current.rules.map((r, i) => (verbose ? `[ ${i + 1}] ${r}` : r)).join("\n")}`,
          };
        }
        if (sub === "enable") {
          firewallRef.current.enabled = true;
          servicesRef.current.ufw = { active: true, enabled: true };
          return { out: "Firewall is active and enabled on system startup" };
        }
        if (sub === "disable") {
          firewallRef.current.enabled = false;
          servicesRef.current.ufw = { active: false, enabled: false };
          return { out: "Firewall stopped and disabled on system startup" };
        }
        if (sub === "allow" || sub === "deny" || sub === "reject") {
          const rule = args.slice(1).join(" ") || "22/tcp";
          const line = `${rule} ${sub.toUpperCase()} IN Anywhere`;
          if (!firewallRef.current.rules.includes(line)) firewallRef.current.rules.push(line);
          return { out: `Rule added:\n${sub} ${rule}` };
        }
        if (sub === "delete" || sub === "reset") {
          if (sub === "reset") firewallRef.current.rules = ["22/tcp ALLOW IN Anywhere (OpenSSH)"];
          else firewallRef.current.rules.pop();
          return { out: "✓ Rules updated" };
        }
        if (sub === "app" && args[1] === "list")
          return {
            out: "Available applications:\n  Nginx Full\n  Nginx HTTP\n  Nginx HTTPS\n  OpenSSH",
          };
        return { out: "ufw enable|disable|status|allow|deny|delete|reset|app list" };
      },
      "firewall-cmd": () => {
        if (args.includes("--state"))
          return { out: firewallRef.current.enabled ? "running" : "not running" };
        if (args.includes("--list-all") || args.includes("--list-ports")) {
          return {
            out: `public (active)\n  ports: ${firewallRef.current.rules.map((r) => r.split(" ")[0]).join(" ")}\n  services: ssh${servicesRef.current.nginx?.active ? " http https" : ""}`,
          };
        }
        if (
          args.includes("--add-port") ||
          args.includes("--add-service") ||
          args.includes("--permanent")
        ) {
          const port =
            args.find((a) => a.includes("/")) ||
            args[args.indexOf("--add-service") + 1] ||
            "22/tcp";
          firewallRef.current.rules.push(`${port} ALLOW IN Anywhere`);
          return { out: "success" };
        }
        if (args.includes("--reload")) return { out: "success" };
        return {
          out: "firewall-cmd --state|--list-all|--add-port=80/tcp|--add-service=http|--reload",
        };
      },
      iptables: () => {
        if (args.includes("-L") || args.includes("--list") || args[0] === "-L") {
          return {
            out: `Chain INPUT (policy ${firewallRef.current.enabled ? "DROP" : "ACCEPT"})
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh
${firewallRef.current.rules.map((r) => `ACCEPT     tcp  --  anywhere             anywhere             /* ${r} */`).join("\n")}
ACCEPT     all  --  anywhere             anywhere

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`,
          };
        }
        if (args.includes("-A") || args.includes("-I"))
          return { out: "✓ iptables rule added (simulated)" };
        if (args.includes("-F")) return { out: "✓ flushed iptables rules" };
        if (args.includes("-S") || args.includes("--list-rules"))
          return { out: "-P INPUT ACCEPT\n-A INPUT -p tcp --dport 22 -j ACCEPT" };
        return { out: "iptables -L|-A|-I|-F|-S  (simulated packet filter)" };
      },

      crontab: () => {
        if (args.includes("-l")) return { out: crontabRef.current.join("\n") };
        if (args.includes("-e") || args.includes("-r")) {
          if (args.includes("-r")) crontabRef.current = ["# m h  dom mon dow  command"];
          return {
            out: args.includes("-r")
              ? "✓ crontab removed"
              : "crontab: installing new crontab\n✓ (edit simulated — use: echo '0 * * * * cmd' | crontab -)",
          };
        }
        if (stdin.trim()) {
          crontabRef.current = stdin.trim().split("\n");
          return { out: "✓ crontab installed" };
        }
        return { out: "usage: crontab [-l|-e|-r]" };
      },
      at: () => ({ out: `job 1 at ${new Date(Date.now() + 3600000).toUTCString()}` }),

      docker: () => {
        if (!packagesRef.current.has("docker.io") && !packagesRef.current.has("docker")) {
          return { out: null, err: "docker: command not found — try: apt install docker.io" };
        }
        const sub = args[0] || "ps";
        if (sub === "ps" || (sub === "container" && args[1] === "ls")) {
          const all = args.includes("-a");
          return {
            out: all
              ? "CONTAINER ID   IMAGE          STATUS         PORTS     NAMES\na1b2c3d4e5f6   nginx:alpine    Up 2 hours     80/tcp    web\nb2c3d4e5f6a7   redis:7         Exited (0)              cache"
              : "CONTAINER ID   IMAGE          STATUS         PORTS     NAMES\na1b2c3d4e5f6   nginx:alpine    Up 2 hours     80/tcp    web",
          };
        }
        if (sub === "images" || sub === "image") {
          return {
            out: "REPOSITORY   TAG       IMAGE ID       CREATED       SIZE\nnginx        alpine    605c77ea0810   2 weeks ago   40.7MB\nubuntu       24.04     ba6acccabd90   3 weeks ago   78.1MB\nredis        7         7614ae9453d1   4 weeks ago   116MB",
          };
        }
        if (sub === "run") {
          servicesRef.current.docker = { active: true, enabled: true };
          const name = args.includes("--name") ? args[args.indexOf("--name") + 1] : "eager_afro";
          return { out: `${name.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "a1b2c3d4e5f6"}` };
        }
        if (sub === "pull")
          return {
            out: `Using default tag: latest\nlatest: Pulling from library/${args[1] || "nginx"}\nDigest: sha256:afrokernel\nStatus: Downloaded newer image`,
          };
        if (sub === "stop" || sub === "start" || sub === "rm" || sub === "logs" || sub === "exec") {
          return { out: `✓ docker ${sub} ${args[1] || ""}`.trim() };
        }
        if (sub === "compose" || sub === "version")
          return { out: "Docker version 24.0.7, build AfroKernel\nDocker Compose version v2.24.0" };
        return { out: "docker ps|images|run|pull|stop|start|rm|logs|compose|version" };
      },
      "docker-compose": () => runOne("docker", ["compose", ...args], stdin, workFs, opts),
      kubectl: () => {
        if (!packagesRef.current.has("kubectl"))
          return { out: null, err: "kubectl: command not found — apt install kubectl" };
        if (args[0] === "get" && (args[1] === "pods" || args[1] === "nodes" || args[1] === "svc")) {
          return {
            out:
              args[1] === "nodes"
                ? "NAME                 STATUS   ROLES           AGE   VERSION\nafrokernel-control   Ready    control-plane   10d   v1.29.2"
                : args[1] === "svc"
                  ? "NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)\nkubernetes   ClusterIP   10.96.0.1      <none>        443/TCP\nweb          ClusterIP   10.96.10.20    <none>        80/TCP"
                  : "NAME                     READY   STATUS    RESTARTS   AGE\nnginx-7d8b49c5b9-xk2pq   1/1     Running   0          2d",
          };
        }
        return { out: "kubectl get pods|nodes|svc | kubectl apply -f … (simulated)" };
      },
      podman: () => runOne("docker", args, stdin, workFs, opts),

      ssh: () => ({
        out: `learner@${args.find((a) => a.includes("@") || !a.startsWith("-")) || meta.hostname}: Permission granted (simulated session)\nLast login: Aug 1 10:00:00 2026 from 192.168.1.10`,
      }),
      scp: () => ({
        out: `${args[0] || "file"}          100% 4096    1.2MB/s   00:00\n✓ transfer complete`,
      }),
      rsync: () => ({
        out: `sending incremental file list\n./\nwelcome.txt\n\nsent 120 bytes  received 26 bytes  292.00 bytes/sec\ntotal size is 4.0K  speedup is 27.4`,
      }),
      openssl: () => {
        if (args[0] === "version") return { out: "OpenSSL 3.0.13 30 Jan 2024 (AfroKernel Lab)" };
        if (args[0] === "rand")
          return { out: btoa("afrokernel-lab-secret-key-material").slice(0, 32) };
        if (args.includes("x509") || args[0] === "req")
          return {
            out: "✓ certificate operation simulated (use real openssl on a VM for production keys)",
          };
        return { out: "openssl version|rand -base64 32|req|x509" };
      },
      "fail2ban-client": () => {
        if (args[0] === "status") {
          return {
            out: `Status\n|- Number of jail:      2\n\`- Jail list:\tsshd, nginx-http-auth`,
          };
        }
        return { out: "fail2ban-client status|status sshd" };
      },
      "aa-status": () => ({
        out: "apparmor module is loaded.\n16 profiles are loaded.\n13 profiles are in enforce mode.\n3 profiles are in complain mode.",
      }),

      tar: () => {
        const create = args.some((a) => a.includes("c"));
        const extract = args.some((a) => a.includes("x"));
        const fileIdx = args.findIndex((a) => a === "-f" || a === "--file");
        const archive =
          fileIdx >= 0
            ? args[fileIdx + 1]
            : args.find((a) => a.endsWith(".tar") || a.endsWith(".gz") || a.endsWith(".tgz")) ||
              "archive.tar.gz";
        if (create) {
          const next = cloneFS(workFs);
          const parent = resolve(next, cwd);
          if (parent && parent.type === "dir")
            parent.children[archive.split("/").pop()!] = {
              type: "file",
              content: `# tar archive of ${args.filter((a) => !a.startsWith("-") && a !== archive).join(" ")}\n`,
            };
          opts.setFs?.(next);
          return { out: `✓ created ${archive}` };
        }
        if (extract) return { out: `✓ extracted ${archive}` };
        return { out: "tar -czvf archive.tar.gz <paths> | tar -xzvf archive.tar.gz" };
      },
      gzip: () => {
        const f = args.find((a) => !a.startsWith("-"));
        if (!f) return { out: null, err: "gzip: missing file" };
        return { out: `✓ ${f}.gz created` };
      },
      gunzip: () => ({ out: `✓ decompressed ${args[0] || "file.gz"}` }),
      zip: () => ({
        out: `  adding: ${args.slice(1).join(" ") || "files"} (stored 0%)\n✓ ${args[0] || "archive.zip"}`,
      }),
      unzip: () => ({
        out: `Archive:  ${args[0] || "archive.zip"}\n  inflating: file1\n  inflating: file2`,
      }),

      sed: () => {
        const expr = args.find((a) => a.startsWith("s/") || a.startsWith("s#")) || args[0];
        const fileArg = args.find((a) => !a.startsWith("-") && a !== expr);
        let text = stdin;
        if (!text && fileArg) {
          const node = resolve(workFs, normalizePath(cwd, fileArg));
          text = node && node.type === "file" ? node.content : "";
        }
        if (!expr) return { out: text };
        const m = expr.match(/^s[/|](.+?)[/|](.*?)[/|]([gip]*)$/);
        if (!m) return { out: text };
        try {
          const rx = new RegExp(m[1], m[3].includes("g") ? "g" : "");
          return {
            out: text
              .split("\n")
              .map((ln) => ln.replace(rx, m[2]))
              .join("\n"),
          };
        } catch {
          return { out: text };
        }
      },
      awk: () => {
        const text = stdin || "";
        const fieldMatch = args.find((a) => a.includes("$"))?.match(/\$(\d+)/);
        const n = fieldMatch ? Number(fieldMatch[1]) - 1 : 0;
        return {
          out: text
            .split("\n")
            .map((ln) => ln.trim().split(/\s+/)[n] ?? "")
            .join("\n"),
        };
      },
      less: () => runOne("cat", args, stdin, workFs, opts),
      more: () => runOne("cat", args, stdin, workFs, opts),
      man: () => {
        const topic = args[0] || "bash";
        return {
          out: `${topic.toUpperCase()}(1)                          AfroKernel Lab Manual\n\nNAME\n       ${topic} — simulated manual page for sysadmin practice\n\nSYNOPSIS\n       ${topic} [options]\n\nDESCRIPTION\n       Practice this command in the AfroKernel Lab. Type 'help' for the full command list.\n\nSEE ALSO\n       help(1), apt(8), systemctl(1)`,
        };
      },
      nano: () => ({
        out: `GNU nano 7.2  (AfroKernel Lab)\nFile: ${args[0] || "New Buffer"}\n[ Simulated editor — use cat/tee/echo > file to write content ]`,
      }),
      vim: () => runOne("nano", args, stdin, workFs, opts),
      vi: () => runOne("nano", args, stdin, workFs, opts),

      git: () => {
        if (args[0] === "version" || args[0] === "--version") return { out: "git version 2.43.0" };
        if (args[0] === "status")
          return { out: "On branch main\nnothing to commit, working tree clean" };
        if (args[0] === "clone")
          return {
            out: `Cloning into '${(args[1] || "repo")
              .split("/")
              .pop()
              ?.replace(/\.git$/, "")}'...\n✓ clone complete (simulated)`,
          };
        if (args[0] === "init") {
          const next = cloneFS(workFs);
          ensureDir(next, [...cwd, ".git"]);
          opts.setFs?.(next);
          return { out: `Initialized empty Git repository in /${[...cwd, ".git"].join("/")}/` };
        }
        return { out: "git version|status|init|clone <url> (simulated)" };
      },
      python3: () => ({
        out:
          args[0] === "-V" || args[0] === "--version" || args.length === 0
            ? "Python 3.12.3"
            : `✓ ran python script (simulated)`,
      }),
      python: () => runOne("python3", args, stdin, workFs, opts),
      node: () => ({
        out:
          args[0] === "-v" || args[0] === "--version"
            ? "v18.19.1"
            : "Welcome to Node.js v18.19.1 (AfroKernel).",
      }),
      npm: () => ({ out: args[0] === "-v" ? "9.2.0" : `✓ npm ${args[0] || "help"} (simulated)` }),
      jq: () => {
        const text = stdin || "{}";
        try {
          const data = JSON.parse(text);
          if (args[0] === "." || !args[0]) return { out: JSON.stringify(data, null, 2) };
          return { out: JSON.stringify(data, null, 2) };
        } catch {
          return { out: text };
        }
      },

      lsof: () => ({
        out: `COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
sshd     431     root   3u   IPv4  12345      0t0  TCP *:ssh (LISTEN)
bash    1024  learner   0u   CHR  136,0      0t0   pts/0
nginx   1284     root   6u   IPv4  23456      0t0  TCP *:http (LISTEN)`,
      }),
      strace: () => ({
        out: `execve("/usr/bin/${args.find((a) => !a.startsWith("-")) || "ls"}", [...], ...) = 0\nwrite(1, "ok\\n", 3) = 3\nexit_group(0) = ?`,
      }),
      pgrep: () => ({
        out: args[0] ? "1284\n1024" : null,
        err: args[0] ? undefined : "pgrep: pattern required",
      }),
      iostat: () => ({
        out: `Linux 6.8.0-afrokernel\navg-cpu:  %user   %nice %system %iowait  %steal   %idle\n           2.10    0.00    0.80    0.20    0.00   96.90\nDevice             tps    kB_read/s    kB_wrtn/s\nsda               12.4        180.2        95.1`,
      }),
      vmstat: () => ({
        out: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 1  0      0 4020000 200000 2030000    0    0     5     3  110  220  2  1 96  1  0`,
      }),
      mpstat: () => runOne("iostat", args, stdin, workFs, opts),
      sar: () => runOne("iostat", args, stdin, workFs, opts),
      lvm: () => ({
        out: "  PV /dev/sdb1   VG vgdata   lvm2 [100.00 GiB / 40.00 GiB free]\n  LV lvdata     VG vgdata   -wi-ao---- 60.00 GiB",
      }),
      lvcreate: () => ({
        out: `✓ Logical volume "lv_${args.find((a) => !a.startsWith("-")) || "data"}" created.`,
      }),
      vgcreate: () => ({ out: `✓ Volume group "${args[0] || "vgdata"}" successfully created` }),
      pvcreate: () => ({
        out: `✓ Physical volume "${args[0] || "/dev/sdb1"}" successfully created.`,
      }),
      sysctl: () => {
        if (args[0] === "-a")
          return {
            out: "net.ipv4.ip_forward = 1\nvm.swappiness = 10\nkernel.hostname = " + meta.hostname,
          };
        if (args[0]?.includes("=")) return { out: args[0] };
        if (args[0]) return { out: `${args[0]} = 1` };
        return { out: "sysctl -a | sysctl net.ipv4.ip_forward=1" };
      },
      getent: () => {
        if (args[0] === "passwd")
          return {
            out: usersRef.current
              .map((u) => `${u.name}:x:${u.uid}:${u.gid}:${u.name}:${u.home}:${u.shell}`)
              .join("\n"),
          };
        if (args[0] === "group")
          return { out: groupsRef.current.map((g) => `${g.name}:x:${g.gid}:`).join("\n") };
        if (args[0] === "hosts")
          return { out: `127.0.0.1 localhost\n192.168.1.150 ${meta.hostname}` };
        return { out: "getent passwd|group|hosts [name]" };
      },
      groupdel: () => {
        const name = args[0];
        if (!name) return { out: null, err: "groupdel: group name required" };
        groupsRef.current = groupsRef.current.filter((g) => g.name !== name);
        return { out: `✓ group '${name}' removed` };
      },
      export: () => ({
        out: args[0]
          ? `✓ exported ${args[0]}`
          : "USER=learner\nHOME=/home/learner\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      }),
      printenv: () => runOne("env", args, stdin, workFs, opts),
      alias: () => ({ out: "alias ll='ls -la'\nalias la='ls -A'\nalias grep='grep --color=auto'" }),

      chmod: () => ({ out: "✓ Changed file permissions" }),
      chown: () => ({ out: "✓ Changed file owner" }),
      chgrp: () => ({ out: "✓ Changed file group" }),
      sudo: () =>
        args.length === 0
          ? { out: null, err: "sudo: command required" }
          : runOne(args[0], args.slice(1), stdin, workFs, opts),
    };

    const fn = runners[cmd];
    if (!fn) return { out: null, err: `${cmd}: command not found (type 'help' for full list)` };
    return fn();
  }

  function exec(raw: string) {
    const trimmed = raw.trim();
    setLines((l) => [...l, { kind: "prompt", text: prompt() + raw }]);
    if (!trimmed) return;
    setHistory((h) => [...h, trimmed]);
    setHistIdx(-1);
    onCommandExecuted();

    let pipeline = trimmed;
    let redirect: { file: string; append: boolean } | null = null;
    const rApp = trimmed.match(/^(.*?)\s*>>\s*(\S+)\s*$/);
    const rOne = trimmed.match(/^(.*?)\s*>\s*(\S+)\s*$/);
    if (rApp) {
      pipeline = rApp[1];
      redirect = { file: rApp[2], append: true };
    } else if (rOne) {
      pipeline = rOne[1];
      redirect = { file: rOne[2], append: false };
    }

    const stages = pipeline
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    let stdin = "";
    let workFs = fs;
    let pendingFs: DirNode | null = null;
    let hadErr: string | null = null;

    for (let i = 0; i < stages.length; i++) {
      const tokens = stages[i].match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
      const parts = tokens.map((t) => t.replace(/^["']|["']$/g, ""));
      const [cmd, ...args] = parts;
      const res = runOne(cmd, args, stdin, workFs, {
        setFs: (f) => {
          pendingFs = f;
          workFs = f;
        },
      });
      if (res.err) {
        hadErr = res.err;
        break;
      }
      stdin = res.out ?? "";
    }

    if (pendingFs) setFs(pendingFs);
    if (hadErr) {
      print(hadErr, "err");
      return;
    }

    if (redirect) {
      const p = normalizePath(cwd, redirect.file);
      const parent = resolve(workFs, p.slice(0, -1));
      if (!parent || parent.type !== "dir") {
        print(`bash: ${redirect.file}: No such file or directory`, "err");
        return;
      }
      const next = cloneFS(workFs);
      const parent2 = resolve(next, p.slice(0, -1))!;
      if (parent2.type !== "dir") return;
      const name = p[p.length - 1];
      const existing = parent2.children[name];
      const content =
        (redirect.append && existing && existing.type === "file" ? existing.content : "") +
        stdin +
        (stdin.endsWith("\n") ? "" : "\n");
      parent2.children[name] = { type: "file", content };
      setFs(next);
    } else if (stdin !== "") {
      print(stdin);
    }
  }

  function reset() {
    setFs(makeFS(distro));
    setCwd(["home", "learner"]);
    setLines([{ kind: "out", text: `Terminal reset. Fresh ${meta.label} instance.` }]);
  }

  return (
    <div className="flex flex-col h-[580px] rounded-2xl bg-[oklch(0.11_0.01_260)] text-[oklch(0.9_0.01_90)] border border-border/80 shadow-2xl overflow-hidden">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-border/50 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 font-semibold text-primary">{paneId}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/60 overflow-hidden text-[11px]">
            {(Object.keys(DISTRO_META) as Distro[]).map((d) => (
              <button
                key={d}
                onClick={() => switchDistro(d)}
                className={`px-2.5 py-0.5 capitalize transition ${
                  d === distro
                    ? "bg-primary text-black font-semibold"
                    : "bg-card/40 hover:bg-accent text-muted-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              try {
                const handle = await (window as any).showDirectoryPicker({ mode: "read" });
                setLines((l) => [
                  ...l,
                  { kind: "out", text: `Scanning local folder '${handle.name}'...` },
                ]);

                async function readDir(dirHandle: any, depth = 0): Promise<DirNode> {
                  const node: DirNode = { type: "dir", children: {} };
                  if (depth > 4) return node; // Max depth to prevent crashing
                  for await (const [name, entry] of dirHandle.entries()) {
                    if (entry.kind === "directory") {
                      node.children[name] = await readDir(entry, depth + 1);
                    } else if (entry.kind === "file") {
                      try {
                        const f = await entry.getFile();
                        if (f.size < 1024 * 1024) {
                          node.children[name] = { type: "file", content: await f.text() };
                        } else {
                          node.children[name] = {
                            type: "file",
                            content: "[File too large (>1MB)]",
                          };
                        }
                      } catch {
                        node.children[name] = { type: "file", content: "[Unreadable]" };
                      }
                    }
                  }
                  return node;
                }

                const root = await readDir(handle);
                const next = cloneFS(fs);
                const mnt = resolve(next, ["mnt"]);
                if (mnt && mnt.type === "dir") {
                  mnt.children["c"] = { type: "dir", children: { [handle.name]: root } };
                  setFs(next);
                  setCwd(["mnt", "c", handle.name]);
                  setLines((l) => [
                    ...l,
                    { kind: "out", text: `✓ Successfully mounted to /mnt/c/${handle.name}` },
                  ]);
                }
              } catch (e) {
                setLines((l) => [
                  ...l,
                  {
                    kind: "err",
                    text: `Mount aborted or failed: ${e instanceof Error ? e.message : String(e)}`,
                  },
                ]);
              }
            }}
            title="Mount Local Folder to /mnt/c"
            className="px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-[11px] flex items-center gap-1"
          >
            <HardDrive className="w-3 h-3" /> Mount Folder
          </button>
          <button
            onClick={reset}
            title="Reset Shell"
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "err"
                ? "text-[oklch(0.7_0.22_27)]"
                : l.kind === "prompt"
                  ? "text-[oklch(0.86_0.17_92)] font-semibold"
                  : "text-[oklch(0.92_0.01_260)]"
            }
          >
            <pre className="whitespace-pre-wrap leading-relaxed">{l.text}</pre>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            exec(input);
            setInput("");
          }}
          className="flex items-center pt-1"
        >
          <span className="text-[oklch(0.86_0.17_92)] font-semibold shrink-0">{prompt()}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
                if (history[idx] != null) {
                  setInput(history[idx]);
                  setHistIdx(idx);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const idx = histIdx < 0 ? -1 : Math.min(history.length, histIdx + 1);
                setHistIdx(idx);
                setInput(idx >= history.length ? "" : (history[idx] ?? ""));
              }
            }}
            className="flex-1 bg-transparent outline-none ml-1.5 text-[oklch(0.95_0.01_90)] caret-[oklch(0.86_0.17_92)] font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
