/**
 * AfroKernel Lab — Linux package catalog & admin filesystem extras.
 * Simulated packages a student would install/administer on a real server.
 */

export type PackageInfo = {
  name: string;
  version: string;
  section: string;
  description: string;
  depends?: string[];
  /** Binary names created under /usr/bin on install */
  bins?: string[];
  /** Config / data paths seeded on install */
  seeds?: Array<{ path: string[]; content: string; dir?: boolean }>;
};

/** Comprehensive catalog of packages students can apt/yum/apk install */
export const PACKAGE_CATALOG: PackageInfo[] = [
  // Web & reverse proxy
  {
    name: "nginx",
    version: "1.24.0-2ubuntu7",
    section: "web",
    description: "high performance web server",
    bins: ["nginx"],
    depends: ["libssl3"],
  },
  {
    name: "apache2",
    version: "2.4.58-1ubuntu4",
    section: "web",
    description: "Apache HTTP Server",
    bins: ["apache2", "apachectl"],
    depends: ["libssl3"],
  },
  {
    name: "caddy",
    version: "2.7.6",
    section: "web",
    description: "Fast HTTPS web server",
    bins: ["caddy"],
  },
  {
    name: "haproxy",
    version: "2.8.5-1ubuntu3",
    section: "web",
    description: "reliable load balancer",
    bins: ["haproxy"],
  },
  {
    name: "certbot",
    version: "2.9.0-1",
    section: "web",
    description: "Let's Encrypt ACME client",
    bins: ["certbot"],
  },

  // Databases
  {
    name: "mysql-server",
    version: "8.0.36-0ubuntu0.24.04.1",
    section: "database",
    description: "MySQL database server",
    bins: ["mysqld", "mysql"],
    depends: ["mysql-client"],
  },
  {
    name: "mysql-client",
    version: "8.0.36-0ubuntu0.24.04.1",
    section: "database",
    description: "MySQL client",
    bins: ["mysql"],
  },
  {
    name: "mariadb-server",
    version: "1:10.11.7-2ubuntu2",
    section: "database",
    description: "MariaDB database server",
    bins: ["mariadbd", "mariadb"],
  },
  {
    name: "postgresql",
    version: "16+257build1.1",
    section: "database",
    description: "PostgreSQL object-relational database",
    bins: ["psql", "postgres"],
    depends: ["postgresql-client"],
  },
  {
    name: "postgresql-client",
    version: "16+257build1.1",
    section: "database",
    description: "PostgreSQL client",
    bins: ["psql"],
  },
  {
    name: "redis-server",
    version: "5:7.0.15-1ubuntu0.24.04.1",
    section: "database",
    description: "Persistent key-value store",
    bins: ["redis-server", "redis-cli"],
  },
  {
    name: "mongodb",
    version: "1:7.0.8",
    section: "database",
    description: "MongoDB document database",
    bins: ["mongod", "mongosh"],
  },

  // Containers & orchestration
  {
    name: "docker.io",
    version: "24.0.7-0ubuntu4",
    section: "admin",
    description: "Linux container runtime",
    bins: ["docker", "dockerd"],
  },
  {
    name: "docker-compose",
    version: "1.29.2-6ubuntu1",
    section: "admin",
    description: "Compose multi-container apps",
    bins: ["docker-compose"],
  },
  {
    name: "containerd",
    version: "1.7.12-0ubuntu2",
    section: "admin",
    description: "container runtime",
    bins: ["containerd", "ctr"],
  },
  {
    name: "kubectl",
    version: "1.29.2-00",
    section: "admin",
    description: "Kubernetes command-line tool",
    bins: ["kubectl"],
  },
  {
    name: "helm",
    version: "3.14.2-1",
    section: "admin",
    description: "Kubernetes package manager",
    bins: ["helm"],
  },
  {
    name: "podman",
    version: "4.9.3-1",
    section: "admin",
    description: "daemonless container engine",
    bins: ["podman"],
  },

  // Security & firewall
  {
    name: "ufw",
    version: "0.36.2-6",
    section: "admin",
    description: "uncomplicated firewall",
    bins: ["ufw"],
  },
  {
    name: "firewalld",
    version: "2.1.1-1",
    section: "admin",
    description: "dynamically managed firewall",
    bins: ["firewall-cmd", "firewalld"],
  },
  {
    name: "iptables",
    version: "1.8.10-3ubuntu2",
    section: "admin",
    description: "packet filtering tools",
    bins: ["iptables", "iptables-save"],
  },
  {
    name: "fail2ban",
    version: "1.0.2-3",
    section: "admin",
    description: "ban hosts that cause multiple auth failures",
    bins: ["fail2ban-client", "fail2ban-server"],
  },
  {
    name: "openssh-server",
    version: "1:9.6p1-3ubuntu13",
    section: "admin",
    description: "OpenSSH SSH server",
    bins: ["sshd"],
  },
  {
    name: "openssh-client",
    version: "1:9.6p1-3ubuntu13",
    section: "net",
    description: "OpenSSH SSH client",
    bins: ["ssh", "scp", "sftp"],
  },
  {
    name: "openssl",
    version: "3.0.13-0ubuntu3",
    section: "libs",
    description: "Secure Sockets Layer toolkit",
    bins: ["openssl"],
  },
  {
    name: "gnupg",
    version: "2.4.4-2ubuntu17",
    section: "utils",
    description: "GNU privacy guard",
    bins: ["gpg", "gpg-agent"],
  },
  {
    name: "apparmor",
    version: "4.0.0-beta3-0ubuntu3",
    section: "admin",
    description: "AppArmor user-space utilities",
    bins: ["aa-status", "apparmor_parser"],
  },
  {
    name: "auditd",
    version: "1:3.1.2-2.1build1",
    section: "admin",
    description: "Linux Audit daemon",
    bins: ["auditctl", "ausearch"],
  },
  {
    name: "clamav",
    version: "1.0.5+dfsg-1ubuntu1",
    section: "utils",
    description: "anti-virus toolkit",
    bins: ["clamscan", "freshclam"],
  },

  // Networking
  {
    name: "net-tools",
    version: "2.10-0.1ubuntu4",
    section: "net",
    description: "NET-3 networking toolkit",
    bins: ["ifconfig", "netstat", "route", "arp"],
  },
  {
    name: "iproute2",
    version: "6.1.0-1ubuntu6",
    section: "net",
    description: "networking and traffic control",
    bins: ["ip", "ss", "tc"],
  },
  {
    name: "dnsutils",
    version: "1:9.18.28-0ubuntu0.24.04.1",
    section: "net",
    description: "DNS clients (dig, nslookup)",
    bins: ["dig", "nslookup", "host"],
  },
  {
    name: "bind9",
    version: "1:9.18.28-0ubuntu0.24.04.1",
    section: "net",
    description: "Internet Domain Name Server",
    bins: ["named"],
  },
  {
    name: "traceroute",
    version: "1:2.1.5-1",
    section: "net",
    description: "traces the route taken by packets",
    bins: ["traceroute"],
  },
  {
    name: "tcpdump",
    version: "4.99.4-3ubuntu4",
    section: "net",
    description: "command-line packet analyzer",
    bins: ["tcpdump"],
  },
  {
    name: "nmap",
    version: "7.94+git20230807.3be01efb1+dfsg-3",
    section: "net",
    description: "network exploration tool",
    bins: ["nmap"],
  },
  {
    name: "wget",
    version: "1.21.4-1ubuntu4",
    section: "web",
    description: "retrieves files using HTTP/FTP",
    bins: ["wget"],
  },
  {
    name: "curl",
    version: "8.5.0-2ubuntu10",
    section: "web",
    description: "command line tool for transferring data",
    bins: ["curl"],
  },
  {
    name: "rsync",
    version: "3.2.7-1ubuntu1",
    section: "net",
    description: "fast incremental file transfer",
    bins: ["rsync"],
  },
  {
    name: "samba",
    version: "2:4.19.5+dfsg-4ubuntu9",
    section: "net",
    description: "SMB/CIFS file server",
    bins: ["smbd", "nmbd", "smbclient"],
  },
  {
    name: "nfs-kernel-server",
    version: "1:2.6.4-3ubuntu5",
    section: "net",
    description: "NFS server support",
    bins: ["exportfs", "rpc.nfsd"],
  },
  {
    name: "nfs-common",
    version: "1:2.6.4-3ubuntu5",
    section: "net",
    description: "NFS client support",
    bins: ["mount.nfs", "showmount"],
  },
  {
    name: "wireguard",
    version: "1.0.20210914-1ubuntu4",
    section: "net",
    description: "fast VPN",
    bins: ["wg", "wg-quick"],
  },
  {
    name: "openvpn",
    version: "2.6.9-1ubuntu4",
    section: "net",
    description: "virtual private network daemon",
    bins: ["openvpn"],
  },
  {
    name: "network-manager",
    version: "1.46.0-1ubuntu2",
    section: "net",
    description: "network management framework",
    bins: ["nmcli", "nmtui"],
  },

  // Monitoring & process tools
  {
    name: "htop",
    version: "3.3.0-4build1",
    section: "utils",
    description: "interactive process viewer",
    bins: ["htop"],
  },
  {
    name: "procps",
    version: "2:4.0.4-4ubuntu3",
    section: "admin",
    description: "/proc utilities",
    bins: ["ps", "top", "free", "kill", "pgrep"],
  },
  {
    name: "sysstat",
    version: "12.6.1-2",
    section: "admin",
    description: "system performance tools",
    bins: ["iostat", "mpstat", "sar", "vmstat"],
  },
  {
    name: "iotop",
    version: "0.6-42-ga14256a-0.2",
    section: "admin",
    description: "simple top-like I/O monitor",
    bins: ["iotop"],
  },
  {
    name: "lsof",
    version: "4.95.0-1.1ubuntu0.1",
    section: "utils",
    description: "list open files",
    bins: ["lsof"],
  },
  {
    name: "strace",
    version: "6.8-0ubuntu2",
    section: "utils",
    description: "system call tracer",
    bins: ["strace"],
  },
  {
    name: "tcpdump",
    version: "4.99.4-3ubuntu4",
    section: "net",
    description: "dump traffic on a network",
    bins: ["tcpdump"],
  },
  {
    name: "netcat-openbsd",
    version: "1.226-1ubuntu2",
    section: "net",
    description: "TCP/IP swiss army knife",
    bins: ["nc", "netcat"],
  },
  {
    name: "tmux",
    version: "3.4-1ubuntu0.1",
    section: "admin",
    description: "terminal multiplexer",
    bins: ["tmux"],
  },
  {
    name: "screen",
    version: "4.9.1-1build1",
    section: "admin",
    description: "terminal multiplexer",
    bins: ["screen"],
  },
  {
    name: "logrotate",
    version: "3.21.0-2build1",
    section: "admin",
    description: "log rotation utility",
    bins: ["logrotate"],
  },
  {
    name: "cron",
    version: "3.0pl1-184ubuntu2",
    section: "admin",
    description: "process scheduling daemon",
    bins: ["crontab", "cron"],
  },
  {
    name: "at",
    version: "3.2.5-2ubuntu2",
    section: "admin",
    description: "Delayed job execution",
    bins: ["at", "atq", "atrm"],
  },

  // Editors & shells
  {
    name: "vim",
    version: "2:9.1.0016-1ubuntu7",
    section: "editors",
    description: "Vi IMproved",
    bins: ["vim", "vi"],
  },
  {
    name: "nano",
    version: "7.2-2ubuntu0.1",
    section: "editors",
    description: "small friendly text editor",
    bins: ["nano"],
  },
  {
    name: "emacs-nox",
    version: "1:29.1+1-5ubuntu1",
    section: "editors",
    description: "GNU Emacs editor (no X)",
    bins: ["emacs"],
  },
  {
    name: "bash",
    version: "5.2.21-2ubuntu4",
    section: "shells",
    description: "GNU Bourne Again SHell",
    bins: ["bash"],
  },
  {
    name: "zsh",
    version: "5.9-6ubuntu2",
    section: "shells",
    description: "shell with lots of features",
    bins: ["zsh"],
  },
  {
    name: "fish",
    version: "3.7.0-1",
    section: "shells",
    description: "friendly interactive shell",
    bins: ["fish"],
  },

  // Dev tools
  {
    name: "git",
    version: "1:2.43.0-1ubuntu7",
    section: "vcs",
    description: "fast, scalable, distributed VCS",
    bins: ["git"],
  },
  {
    name: "build-essential",
    version: "12.10ubuntu1",
    section: "devel",
    description: "compilers and make",
    bins: ["gcc", "g++", "make"],
  },
  {
    name: "python3",
    version: "3.12.3-0ubuntu2",
    section: "python",
    description: "interactive high-level language",
    bins: ["python3", "python"],
  },
  {
    name: "python3-pip",
    version: "24.0+dfsg-1ubuntu1",
    section: "python",
    description: "Python package installer",
    bins: ["pip3", "pip"],
  },
  {
    name: "nodejs",
    version: "18.19.1+dfsg-6ubuntu5",
    section: "web",
    description: "evented I/O for V8 JavaScript",
    bins: ["node", "nodejs"],
  },
  {
    name: "npm",
    version: "9.2.0-2",
    section: "web",
    description: "package manager for Node.js",
    bins: ["npm"],
  },
  {
    name: "golang-go",
    version: "2:1.22-1",
    section: "devel",
    description: "Go programming language",
    bins: ["go"],
  },
  {
    name: "openjdk-17-jdk",
    version: "17.0.11+9-1",
    section: "java",
    description: "OpenJDK Development Kit",
    bins: ["java", "javac"],
  },
  {
    name: "php",
    version: "2:8.3+93ubuntu2",
    section: "php",
    description: "server-side scripting language",
    bins: ["php"],
  },
  {
    name: "ruby",
    version: "1:3.2~ubuntu1",
    section: "ruby",
    description: "interpreter of object-oriented scripting",
    bins: ["ruby", "gem"],
  },

  // Core / archive / utils
  {
    name: "coreutils",
    version: "9.4-3ubuntu6",
    section: "utils",
    description: "GNU core utilities",
    bins: ["ls", "cp", "mv", "rm", "cat", "echo"],
  },
  {
    name: "util-linux",
    version: "2.39.3-9ubuntu6",
    section: "utils",
    description: "miscellaneous system utilities",
    bins: ["mount", "umount", "fdisk", "lsblk"],
  },
  {
    name: "findutils",
    version: "4.9.0-5build1",
    section: "utils",
    description: "utilities for finding files",
    bins: ["find", "xargs"],
  },
  {
    name: "grep",
    version: "3.11-4build1",
    section: "utils",
    description: "GNU grep, egrep and fgrep",
    bins: ["grep", "egrep", "fgrep"],
  },
  {
    name: "sed",
    version: "4.9-2build1",
    section: "utils",
    description: "stream editor",
    bins: ["sed"],
  },
  {
    name: "gawk",
    version: "1:5.2.1-2build3",
    section: "utils",
    description: "GNU awk",
    bins: ["awk", "gawk"],
  },
  {
    name: "tar",
    version: "1.35+dfsg-3build1",
    section: "utils",
    description: "GNU version of the tar archiver",
    bins: ["tar"],
  },
  {
    name: "gzip",
    version: "1.12-1ubuntu3",
    section: "utils",
    description: "GNU compression utilities",
    bins: ["gzip", "gunzip"],
  },
  {
    name: "bzip2",
    version: "1.0.8-5.1",
    section: "utils",
    description: "high-quality block-sorting file compressor",
    bins: ["bzip2", "bunzip2"],
  },
  {
    name: "xz-utils",
    version: "5.6.1+really5.4.5-1",
    section: "utils",
    description: "XZ-format compression utilities",
    bins: ["xz", "unxz"],
  },
  {
    name: "zip",
    version: "3.0-13ubuntu0.1",
    section: "utils",
    description: "Archiver for .zip files",
    bins: ["zip"],
  },
  {
    name: "unzip",
    version: "6.0-28ubuntu4",
    section: "utils",
    description: "De-archiver for .zip files",
    bins: ["unzip"],
  },
  {
    name: "less",
    version: "590-2ubuntu2",
    section: "text",
    description: "pager program similar to more",
    bins: ["less"],
  },
  {
    name: "man-db",
    version: "2.12.0-4build2",
    section: "doc",
    description: "manual page viewer",
    bins: ["man"],
  },
  {
    name: "sudo",
    version: "1.9.15p5-3ubuntu5",
    section: "admin",
    description: "provide limited super user privileges",
    bins: ["sudo"],
  },
  {
    name: "adduser",
    version: "3.137ubuntu1",
    section: "admin",
    description: "add and remove users and groups",
    bins: ["adduser", "deluser"],
  },
  {
    name: "passwd",
    version: "1:4.13+dfsg1-4ubuntu3",
    section: "admin",
    description: "change and administer password and group data",
    bins: ["passwd", "chage"],
  },
  {
    name: "systemd",
    version: "255.4-1ubuntu8",
    section: "admin",
    description: "system and service manager",
    bins: ["systemctl", "journalctl", "hostnamectl", "timedatectl"],
  },
  {
    name: "ca-certificates",
    version: "20240203",
    section: "misc",
    description: "Common CA certificates",
  },
  {
    name: "locales",
    version: "2.39-0ubuntu8",
    section: "libs",
    description: "GNU C Library: National Language Support",
  },
  {
    name: "tzdata",
    version: "2024a-2ubuntu1",
    section: "libs",
    description: "time zone and daylight-saving time data",
  },
  {
    name: "jq",
    version: "1.7.1-3build1",
    section: "utils",
    description: "lightweight JSON processor",
    bins: ["jq"],
  },
  {
    name: "tree",
    version: "2.1.1-2ubuntu2",
    section: "utils",
    description: "displays directory tree",
    bins: ["tree"],
  },
  {
    name: "lvm2",
    version: "2.03.16-3ubuntu3",
    section: "admin",
    description: "Linux Logical Volume Manager",
    bins: ["lvm", "lvcreate", "vgcreate", "pvcreate"],
  },
  {
    name: "mdadm",
    version: "4.3-1ubuntu2",
    section: "admin",
    description: "tool for managing Linux MD arrays",
    bins: ["mdadm"],
  },
  {
    name: "smartmontools",
    version: "7.4-2build1",
    section: "utils",
    description: "control and monitor storage systems",
    bins: ["smartctl"],
  },
  {
    name: "quota",
    version: "4.06-1build5",
    section: "admin",
    description: "disk quota management",
    bins: ["quota", "edquota", "repquota"],
  },
  {
    name: "acl",
    version: "2.3.2-1build1.1",
    section: "utils",
    description: "access control list utilities",
    bins: ["getfacl", "setfacl"],
  },
  {
    name: "attr",
    version: "1:2.5.2-1build1",
    section: "utils",
    description: "utilities for manipulating filesystem extended attributes",
    bins: ["getfattr", "setfattr"],
  },
  {
    name: "rsyslog",
    version: "8.2312.0-3ubuntu9",
    section: "admin",
    description: "reliable system and kernel logging daemon",
    bins: ["rsyslogd"],
  },
  {
    name: "chrony",
    version: "4.5-1ubuntu4",
    section: "admin",
    description: "Versatile NTP daemon",
    bins: ["chronyc", "chronyd"],
  },
  {
    name: "ntp",
    version: "1:4.2.8p15+dfsg-2ubuntu1",
    section: "net",
    description: "Network Time Protocol daemon",
    bins: ["ntpd", "ntpdate"],
  },
  {
    name: "snapd",
    version: "2.63+24.04",
    section: "admin",
    description: "Daemon and tooling for snap packages",
    bins: ["snap"],
  },
  {
    name: "flatpak",
    version: "1.14.6-1",
    section: "admin",
    description: "Application deployment framework",
    bins: ["flatpak"],
  },
];

export const PACKAGE_BY_NAME = new Map(PACKAGE_CATALOG.map((p) => [p.name, p]));

/** Base packages present on a fresh lab VM */
export const BASE_PACKAGES = [
  "bash",
  "coreutils",
  "util-linux",
  "findutils",
  "grep",
  "sed",
  "gawk",
  "tar",
  "gzip",
  "curl",
  "wget",
  "openssh-client",
  "openssh-server",
  "iproute2",
  "procps",
  "sudo",
  "passwd",
  "adduser",
  "systemd",
  "ca-certificates",
  "locales",
  "tzdata",
  "less",
  "man-db",
  "nano",
  "vim",
  "net-tools",
  "dnsutils",
  "cron",
  "rsyslog",
  "ufw",
  "iptables",
  "openssl",
  "jq",
  "tree",
  "rsync",
  "lsof",
  "htop",
  "sysstat",
];

export function searchPackages(query: string): PackageInfo[] {
  const q = query.toLowerCase();
  if (!q) return PACKAGE_CATALOG.slice(0, 40);
  return PACKAGE_CATALOG.filter(
    (p) => p.name.includes(q) || p.description.toLowerCase().includes(q) || p.section.includes(q),
  );
}

export function formatAptShow(p: PackageInfo): string {
  return [
    `Package: ${p.name}`,
    `Version: ${p.version}`,
    `Priority: optional`,
    `Section: ${p.section}`,
    `Architecture: amd64`,
    `Depends: ${(p.depends ?? []).join(", ") || "libc6"}`,
    `Description: ${p.description}`,
  ].join("\n");
}

export type FSNode =
  | { type: "file"; content: string; mode?: string }
  | { type: "dir"; children: Record<string, FSNode>; mode?: string };
export type DirNode = Extract<FSNode, { type: "dir" }>;

/** Seed realistic /etc, /var, /proc-style admin layout into an existing root FS */
export function enrichAdminFS(root: DirNode, hostname: string): void {
  const etc = ensure(root, ["etc"]);
  put(etc, "hostname", `${hostname}\n`);
  put(etc, "issue", `AfroKernel Linux Lab \\n \\l\n`);
  put(etc, "motd", `Welcome to AfroKernel Sysadmin Lab — practice real Linux administration.\n`);
  put(etc, "timezone", "UTC\n");
  put(etc, "resolv.conf", "nameserver 1.1.1.1\nnameserver 8.8.8.8\nsearch afrokernel.lab\n");
  put(etc, "hosts", `127.0.0.1 localhost\n127.0.1.1 ${hostname}\n::1 localhost ip6-localhost\n`);
  put(
    etc,
    "fstab",
    "/dev/sda1 / ext4 defaults,errors=remount-ro 0 1\n/dev/sda2 none swap sw 0 0\nC: /mnt/c drvfs defaults 0 0\n",
  );
  put(
    etc,
    "sudoers",
    `# /etc/sudoers\nroot ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\nlearner ALL=(ALL) NOPASSWD:ALL\n`,
  );
  put(etc, "shells", "/bin/sh\n/bin/bash\n/bin/zsh\n/usr/bin/fish\n");
  put(
    etc,
    "crontab",
    `# /etc/crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n17 * * * * root cd / && run-parts --report /etc/cron.hourly\n`,
  );

  const ssh = ensure(etc, ["ssh"]);
  put(
    ssh,
    "sshd_config",
    `# OpenSSH server config (AfroKernel Lab)\nPort 22\nPermitRootLogin prohibit-password\nPasswordAuthentication yes\nPubkeyAuthentication yes\nAllowUsers learner\nX11Forwarding no\n`,
  );
  put(ssh, "ssh_config", `Host *\n  StrictHostKeyChecking ask\n  IdentityFile ~/.ssh/id_ed25519\n`);

  const nginx = ensure(etc, ["nginx"]);
  put(
    nginx,
    "nginx.conf",
    `user www-data;\nworker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  server {\n    listen 80 default_server;\n    root /var/www/html;\n    index index.html;\n    location / { try_files $uri $uri/ =404; }\n  }\n}\n`,
  );
  ensure(nginx, ["sites-available"]);
  ensure(nginx, ["sites-enabled"]);
  put(
    ensure(nginx, ["sites-available"]),
    "default",
    `server {\n  listen 80 default_server;\n  root /var/www/html;\n  index index.html;\n  server_name _;\n}\n`,
  );

  const systemd = ensure(etc, ["systemd"]);
  const system = ensure(systemd, ["system"]);
  put(
    system,
    "nginx.service",
    `[Unit]\nDescription=A high performance web server\nAfter=network.target\n\n[Service]\nType=forking\nExecStart=/usr/sbin/nginx\nExecReload=/bin/kill -s HUP $MAINPID\n\n[Install]\nWantedBy=multi-user.target\n`,
  );
  put(
    system,
    "ssh.service",
    `[Unit]\nDescription=OpenBSD Secure Shell server\nAfter=network.target\n\n[Service]\nExecStart=/usr/sbin/sshd -D\n\n[Install]\nWantedBy=multi-user.target\n`,
  );

  const ufw = ensure(etc, ["ufw"]);
  put(ufw, "ufw.conf", `ENABLED=yes\nLOGLEVEL=low\n`);
  const ufwApps = ensure(ufw, ["applications.d"]);
  put(ufwApps, "OpenSSH", `[OpenSSH]\ntitle=OpenSSH\ndescription=SSH server\nports=22/tcp\n`);
  put(ufwApps, "Nginx Full", `[Nginx Full]\ntitle=Nginx Full\nports=80,443/tcp\n`);

  const cronD = ensure(etc, ["cron.d"]);
  put(cronD, "afrokernel", `# Example cron job\n0 2 * * * root /usr/local/bin/backup.sh\n`);
  ensure(etc, ["cron.daily"]);
  ensure(etc, ["cron.hourly"]);
  ensure(etc, ["cron.weekly"]);

  const defaultDir = ensure(etc, ["default"]);
  put(defaultDir, "ufw", `IPV6=yes\n`);
  put(defaultDir, "nginx", `# nginx defaults\n`);

  const security = ensure(etc, ["security"]);
  put(
    security,
    "limits.conf",
    `# /etc/security/limits.conf\n* soft nofile 65535\n* hard nofile 65535\n`,
  );

  const sysctl = ensure(etc, ["sysctl.d"]);
  put(sysctl, "99-afrokernel.conf", `net.ipv4.ip_forward=1\nvm.swappiness=10\n`);

  const www = ensure(root, ["var", "www", "html"]);
  put(
    www,
    "index.html",
    `<!DOCTYPE html>\n<html><head><title>${hostname}</title></head>\n<body><h1>It works! AfroKernel Lab</h1><p>Edit /var/www/html/index.html</p></body></html>\n`,
  );

  const log = ensure(root, ["var", "log"]);
  put(
    log,
    "syslog",
    `Aug 01 10:00:00 ${hostname} systemd[1]: Started AfroKernel Lab Environment.\nAug 01 10:00:01 ${hostname} kernel: Linux booting\nAug 01 10:00:02 ${hostname} nginx: started high-performance web server\nAug 01 10:00:05 ${hostname} sshd[1024]: Server listening on 0.0.0.0 port 22.\n`,
  );
  put(
    log,
    "auth.log",
    `Aug 01 10:00:05 ${hostname} sshd[1024]: Accepted publickey for learner from 192.168.1.10\n`,
  );
  put(
    log,
    "kern.log",
    `Aug 01 10:00:00 ${hostname} kernel: [0.000000] Linux version 6.8.0-afrokernel\n`,
  );
  ensure(log, ["nginx"]);
  put(
    ensure(log, ["nginx"]),
    "access.log",
    `192.168.1.10 - - [01/Aug/2026:10:00:10 +0000] "GET / HTTP/1.1" 200 312\n`,
  );
  put(ensure(log, ["nginx"]), "error.log", ``);
  ensure(root, ["var", "lib", "apt", "lists"]);
  ensure(root, ["var", "cache", "apt", "archives"]);
  ensure(root, ["var", "spool", "cron", "crontabs"]);
  ensure(root, ["var", "backups"]);
  ensure(root, ["var", "tmp"]);

  const proc = ensure(root, ["proc"]);
  put(
    proc,
    "cpuinfo",
    `processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: AfroKernel Virtual CPU @ 2.40GHz\ncpu cores\t: 4\n`,
  );
  put(
    proc,
    "meminfo",
    `MemTotal:        8154000 kB\nMemFree:         4020000 kB\nMemAvailable:    5930000 kB\nSwapTotal:       2097152 kB\nSwapFree:        2097152 kB\n`,
  );
  put(
    proc,
    "version",
    `Linux version 6.8.0-afrokernel (afro@kernel) (gcc) #1 SMP PREEMPT_DYNAMIC\n`,
  );
  put(proc, "uptime", `187234.12 452100.88\n`);
  put(proc, "loadavg", `0.08 0.03 0.01 1/110 1337\n`);
  put(
    proc,
    "mounts",
    `/dev/sda1 / ext4 rw,relatime 0 0\ntmpfs /dev/shm tmpfs rw 0 0\nC: /mnt/c drvfs rw 0 0\n`,
  );

  ensure(root, ["sys", "class", "net"]);
  ensure(root, ["dev", "pts"]);
  put(ensure(root, ["dev"]), "null", ``);
  put(ensure(root, ["dev"]), "zero", ``);

  const bin = ensure(root, ["usr", "bin"]);
  const sbin = ensure(root, ["usr", "sbin"]);
  for (const name of [
    "bash",
    "curl",
    "wget",
    "vim",
    "nano",
    "systemctl",
    "journalctl",
    "ufw",
    "iptables",
    "sshd",
    "nginx",
    "ps",
    "top",
    "htop",
    "ip",
    "ss",
    "dig",
    "nslookup",
    "traceroute",
    "rsync",
    "scp",
    "ssh",
    "openssl",
    "tar",
    "gzip",
    "crontab",
    "lsof",
    "iostat",
    "vmstat",
    "free",
    "df",
    "du",
    "mount",
    "umount",
    "fdisk",
    "lsblk",
    "useradd",
    "userdel",
    "groupadd",
    "passwd",
    "sudo",
    "chmod",
    "chown",
    "find",
    "grep",
    "sed",
    "awk",
    "jq",
    "tree",
    "man",
    "less",
    "nc",
    "tcpdump",
    "nmap",
    "fail2ban-client",
    "docker",
    "git",
    "python3",
    "node",
  ]) {
    if (!bin.children[name])
      bin.children[name] = { type: "file", content: `#!/bin/sh\n# ${name} (AfroKernel Lab)\n` };
  }
  for (const name of [
    "nginx",
    "sshd",
    "ufw",
    "iptables",
    "sysctl",
    "service",
    "adduser",
    "deluser",
    "usermod",
    "groupdel",
    "visudo",
    "logrotate",
    "update-rc.d",
  ]) {
    if (!sbin.children[name])
      sbin.children[name] = { type: "file", content: `#!/bin/sh\n# ${name} (AfroKernel Lab)\n` };
  }

  ensure(root, ["opt", "afrokernel"]);
  ensure(root, ["srv"]);
  ensure(root, ["boot"]);
  ensure(root, ["media"]);
  ensure(root, ["run"]);
  put(
    ensure(root, ["home", "learner", ".ssh"]),
    "authorized_keys",
    `# add your public keys here\n`,
  );
  put(
    ensure(root, ["home", "learner", ".ssh"]),
    "config",
    `Host lab\n  HostName ${hostname}\n  User learner\n`,
  );
  put(
    ensure(root, ["home", "learner"]),
    ".bashrc",
    `# ~/.bashrc\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nalias ll='ls -la'\nalias la='ls -A'\n`,
  );
  put(
    ensure(root, ["home", "learner"]),
    "admin-cheatsheet.txt",
    `AfroKernel Linux Admin Cheatsheet
================================
Packages:  apt update && apt install nginx
Services:  systemctl status|start|stop|restart|enable nginx
Firewall:  ufw allow 22/tcp && ufw allow 'Nginx Full' && ufw enable
Users:     useradd -m -s /bin/bash alice && passwd alice
Disk:      df -h && lsblk && fdisk -l
Network:   ip addr && ss -tulpn && dig afrokernel.dev
Logs:      journalctl -u nginx -f && tail -f /var/log/syslog
Cron:      crontab -e
Archive:   tar -czvf backup.tar.gz /var/www
Sync:      rsync -avz /var/www/ backup@host:/backups/
Docker:    apt install docker.io && docker ps
`,
  );
}

function ensure(root: DirNode, parts: string[]): DirNode {
  let cur = root;
  for (const part of parts) {
    if (!cur.children[part] || cur.children[part].type !== "dir") {
      cur.children[part] = { type: "dir", children: {} };
    }
    cur = cur.children[part] as DirNode;
  }
  return cur;
}

function put(dir: DirNode, name: string, content: string) {
  dir.children[name] = { type: "file", content };
}

/** Apply package install side-effects (bins + config seeds) */
export function applyPackageInstall(root: DirNode, pkgName: string): void {
  const info = PACKAGE_BY_NAME.get(pkgName);
  const bin = ensure(root, ["usr", "bin"]);
  const sbin = ensure(root, ["usr", "sbin"]);
  const names = info?.bins?.length ? info.bins : [pkgName.replace(/\.io$/, "")];
  for (const b of names) {
    bin.children[b] = {
      type: "file",
      content: `#!/bin/sh\necho '${pkgName} ${info?.version ?? "1.0"} (AfroKernel simulated)'\n`,
    };
    if (["nginx", "sshd", "mysqld", "postgres", "dockerd", "redis-server", "named"].includes(b)) {
      sbin.children[b] = { type: "file", content: `#!/bin/sh\necho 'starting ${b}...'\n` };
    }
  }
  if (pkgName === "nginx" || names.includes("nginx")) {
    const www = ensure(root, ["var", "www", "html"]);
    if (!www.children["index.html"]) {
      put(www, "index.html", `<h1>Welcome to nginx on AfroKernel Lab!</h1>\n`);
    }
  }
  if (pkgName === "docker.io" || pkgName === "docker-compose") {
    ensure(root, ["var", "lib", "docker"]);
  }
  if (pkgName === "mysql-server" || pkgName === "mariadb-server") {
    ensure(root, ["var", "lib", "mysql"]);
    put(
      ensure(root, ["etc", "mysql"]),
      "my.cnf",
      `[mysqld]\nbind-address = 127.0.0.1\nport = 3306\n`,
    );
  }
  if (pkgName === "postgresql") {
    ensure(root, ["var", "lib", "postgresql"]);
  }
  if (info?.seeds) {
    for (const seed of info.seeds) {
      if (seed.dir) ensure(root, seed.path);
      else {
        const parent = ensure(root, seed.path.slice(0, -1));
        put(parent, seed.path[seed.path.length - 1], seed.content);
      }
    }
  }
}
