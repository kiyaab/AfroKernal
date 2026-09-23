export interface CourseLesson {
  id: string;
  slug: string;
  title: string;
  lesson_type: "video" | "notes" | "lab" | "quiz";
  video_url?: string | null;
  duration_minutes: number;
  xp_reward: number;
  sort_order: number;
  content: string;
  quiz?: {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Fundamentals" | "Enterprise Linux" | "Networking" | "Scripting";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_hours: number;
  rating: number;
  review_count: number;
  learner_count: number;
  featured?: boolean;
  certificate_available: boolean;
  learning_outcomes: string[];
  prerequisites: string[];
  skills: string[];
  lessons: CourseLesson[];
}

export const CATALOG_COURSES: CourseData[] = [
  {
    id: "course-linux-fundamentals",
    slug: "linux",
    title: "Linux Fundamentals & System Administration",
    subtitle:
      "Master the Linux command line, filesystem hierarchy, permissions, process management, and systemd services.",
    description:
      "The definitive Linux foundation course for developers, sysadmins, and engineers. Learn how Linux operates under the hood with hands-on web terminal exercises.",
    category: "Fundamentals",
    difficulty: "beginner",
    duration_hours: 4.5,
    rating: 4.9,
    review_count: 2340,
    learner_count: 14200,
    featured: true,
    certificate_available: true,
    learning_outcomes: [
      "Navigate the Linux filesystem and manipulate files with confidence",
      "Manage users, groups, file permissions, and access control lists (chmod, chown)",
      "Monitor processes, system resources, and manage daemon background jobs",
      "Control system services and daemon targets with systemctl and systemd",
      "Automate basic administrative tasks and configure SSH remote access",
    ],
    prerequisites: [
      "No prior Linux experience required",
      "Basic computer literacy and curiosity to learn",
    ],
    skills: [
      "Bash CLI",
      "File Permissions",
      "Systemd",
      "Process Management",
      "Package Management (apt/dnf)",
      "SSH",
    ],
    lessons: [
      {
        id: "lf-01",
        slug: "01-welcome-to-linux",
        title: "1. Welcome to Linux & Architecture Overview",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=Wgi-OfbP2Gw",
        duration_minutes: 15,
        xp_reward: 20,
        sort_order: 1,
        content: `# Welcome to Linux & Kernel Architecture

Linux is an open-source Unix-like kernel created by Linus Torvalds in 1991. Today, Linux powers over 90% of cloud servers, supercomputers, Android phones, and modern DevOps infrastructure.

## Key Architectural Layers
1. **Hardware**: CPU, Memory, Disks, Network Interfaces.
2. **Linux Kernel**: The core engine managing hardware abstraction, virtual memory, process scheduling, and security.
3. **System Shell & Utilities**: The command interpreter (Bash, Zsh) and POSIX core utilities (\`coreutils\`).
4. **Applications & Daemons**: Web servers (Nginx), databases (PostgreSQL), Docker, and user tools.

## Practice in the AfroKernel Lab
Open the interactive terminal and run:
\`\`\`bash
uname -a
whoami
pwd
cat /etc/os-release
\`\`\`
`,
        quiz: {
          question: "What is the primary role of the Linux Kernel?",
          choices: [
            "Render desktop graphical themes",
            "Manage hardware resources, virtual memory, and process scheduling",
            "Write Python web applications",
            "Act as a web browser",
          ],
          correctIndex: 1,
          explanation:
            "The Linux kernel is the bridge between software and hardware, managing CPU scheduling, memory, device drivers, and system calls.",
        },
      },
      {
        id: "lf-02",
        slug: "02-terminal-basics",
        title: "2. Terminal Navigation & Essential Commands",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=ROjZy1WbCIA",
        duration_minutes: 20,
        xp_reward: 25,
        sort_order: 2,
        content: `# Terminal Navigation & Essential Commands

Mastering terminal movement is the first superpower of any Linux engineer.

## Core Navigation Commands
- \`pwd\` — **P**rint **W**orking **D**irectory.
- \`ls -la\` — List directory contents with hidden files and permissions.
- \`cd /path\` — Change directory (e.g. \`cd ~\`, \`cd ..\`, \`cd -\`).
- \`mkdir -p path/to/dir\` — Create nested directories.
- \`tree -L 2\` — Visualize directory hierarchies.

## Hands-on Lab Challenge
\`\`\`bash
mkdir -p /home/learner/workspace/project1
cd /home/learner/workspace/project1
touch README.md config.json
ls -la
\`\`\`
`,
        quiz: {
          question: "Which command returns you to your previous working directory in Linux?",
          choices: ["cd ..", "cd -", "cd ~", "back"],
          correctIndex: 1,
          explanation:
            "`cd -` switches back to the previous directory using the $OLDPWD environment variable.",
        },
      },
      {
        id: "lf-03",
        slug: "03-files-and-folders",
        title: "3. Files, Inodes & Directory Structure (FHS)",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# Filesystem Hierarchy Standard (FHS)

Everything in Linux is represented as a file stream.

## Key Directory Roles
- \`/bin\` & \`/sbin\` — Essential binaries (ls, cp, systemctl).
- \`/etc\` — System configuration files.
- \`/home\` — User personal directories.
- \`/var/log\` — System and service runtime logs.
- \`/proc\` & \`/sys\` — Virtual in-memory filesystems exposing kernel stats and hardware.
- \`/dev\` — Device node interfaces (sda, null, zero, urandom).

## File Manipulation Commands
\`\`\`bash
cp source.txt destination.txt
mv old_name.txt new_name.txt
rm -rf temporary_directory
find /var/log -name "*.log" -size +10M
\`\`\`
`,
        quiz: {
          question: "Where are system-wide configuration files stored on a Linux distribution?",
          choices: ["/var", "/bin", "/etc", "/dev"],
          correctIndex: 2,
          explanation:
            "/etc contains all host-specific system configuration files and service configs.",
        },
      },
      {
        id: "lf-04",
        slug: "04-users-and-permissions",
        title: "4. Linux Permissions, Ownership & Sudo Privileges",
        lesson_type: "notes",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 4,
        content: `# Linux Permissions & Ownership Model

Every file in Linux has three permission classes: **User (u)**, **Group (g)**, and **Others (o)**, with **Read (4)**, **Write (2)**, and **Execute (1)** permissions.

## Octal Representation
- \`755\` = \`rwxr-xr-x\` (Full owner, read/execute group and others)
- \`644\` = \`rw-r--r--\` (Read/write owner, read-only group and others)
- \`600\` = \`rw-------\` (Read/write owner only — standard for SSH private keys)

## Command Usage
\`\`\`bash
chmod 755 /var/www/html/script.sh
chown www-data:www-data /var/www/html -R
sudo usermod -aG sudo learner
\`\`\`
`,
        quiz: {
          question: "What octal number corresponds to permissions 'rwxr-xr-x'?",
          choices: ["644", "777", "755", "700"],
          correctIndex: 2,
          explanation: "rwx = 4+2+1=7, r-x = 4+0+1=5, r-x = 4+0+1=5 -> 755.",
        },
      },
      {
        id: "lf-05",
        slug: "05-packages-and-software",
        title: "5. Package Management (APT, DNF, Pacman, Snap)",
        lesson_type: "notes",
        duration_minutes: 20,
        xp_reward: 25,
        sort_order: 5,
        content: `# Package Managers in Modern Linux

Different Linux families utilize different package architectures:
- **Debian / Ubuntu**: \`apt\`, \`dpkg\`, \`.deb\`
- **RHEL / Fedora / CentOS**: \`dnf\`, \`rpm\`
- **Arch Linux**: \`pacman\`
- **Universal / Sandbox**: \`Flatpak\`, \`Snap\`, \`AppImage\`

## Essential APT Workflow
\`\`\`bash
sudo apt update          # Sync package repository indexes
sudo apt upgrade -y      # Upgrade all outdated packages
sudo apt install nginx -y # Install new package
sudo apt autoremove -y   # Clean up unused dependencies
\`\`\`
`,
        quiz: {
          question:
            "Which command updates the local repository package index list on Ubuntu/Debian?",
          choices: ["apt upgrade", "apt update", "apt install", "apt refresh"],
          correctIndex: 1,
          explanation:
            "`apt update` downloads latest package lists from repositories, while `apt upgrade` installs available updates.",
        },
      },
      {
        id: "lf-06",
        slug: "06-systemd-and-services",
        title: "6. Systemd Daemons, Services & Journalctl Logs",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=S95eN6t5_tA",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 6,
        content: `# Managing Services with Systemd

Systemd is the standard init system (PID 1) across modern Linux distros.

## Critical Service Commands
\`\`\`bash
sudo systemctl status nginx     # Check status and recent logs
sudo systemctl start nginx      # Start service
sudo systemctl stop nginx       # Stop service
sudo systemctl restart nginx    # Full restart
sudo systemctl enable nginx     # Start automatically on boot
sudo journalctl -u nginx -f     # Stream live systemd logs for unit
\`\`\`
`,
        quiz: {
          question:
            "How do you configure a service to start automatically during system boot with systemd?",
          choices: [
            "systemctl run <service>",
            "systemctl enable <service>",
            "systemctl start <service>",
            "systemctl boot <service>",
          ],
          correctIndex: 1,
          explanation:
            "`systemctl enable` creates symbolic links to ensure the unit starts upon booting target.",
        },
      },
      {
        id: "lf-07",
        slug: "07-processes-and-monitoring",
        title: "7. Process Management, Signals & Resource Monitoring",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 7,
        content: `# Process Management & Resource Troubleshooting

Every program running in Linux is allocated a Unique Process ID (**PID**).

## Process Inspection Tools
- \`ps aux | grep node\` — Snapshot of running processes.
- \`top\` or \`htop\` — Interactive live process & CPU/RAM monitor.
- \`kill -9 <PID>\` — Send SIGKILL (force terminate).
- \`kill -15 <PID>\` — Send SIGTERM (graceful shutdown).
- \`nice -n 10 command\` — Run with altered scheduling priority.
`,
        quiz: {
          question:
            "Which signal requests a graceful shutdown of a process allowing it to save state?",
          choices: ["SIGKILL (9)", "SIGTERM (15)", "SIGSTOP (19)", "SIGHUP (1)"],
          correctIndex: 1,
          explanation:
            "SIGTERM (15) asks the process to shut down cleanly, while SIGKILL (9) abruptly terminates it.",
        },
      },
      {
        id: "lf-08",
        slug: "08-networking-and-ssh",
        title: "8. Networking Fundamentals & Secure SSH Access",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 45,
        sort_order: 8,
        content: `# Linux Networking & SSH Key Authentication

## Essential Networking Commands
\`\`\`bash
ip addr show        # Display IP addresses and network interfaces
ss -tulwn           # Show open TCP/UDP listening ports
ping -c 4 8.8.8.8   # Test ICMP network connectivity
curl -I https://afrokernel.com # Inspect HTTP headers
dig +short afrokernel.com     # DNS lookup query
\`\`\`

## Passwordless SSH Keys
\`\`\`bash
ssh-keygen -t ed25519 -C "admin@ak.com"
ssh-copy-id user@192.168.1.100
ssh user@192.168.1.100
\`\`\`
`,
        quiz: {
          question: "Which command shows all listening TCP and UDP sockets with port numbers?",
          choices: ["ss -tulwn", "ping -a", "ip route", "traceroute"],
          correctIndex: 0,
          explanation:
            "`ss -tulwn` displays (t)cp, (u)dp, (l)istening, (w)ide, and (n)umeric port formats.",
        },
      },
    ],
  },
  {
    id: "course-shell-scripting",
    slug: "scripting",
    title: "Advanced Bash Scripting & Automation",
    subtitle:
      "Master strict mode, regex parsing with awk/sed, exit codes, traps, and automation crons.",
    description:
      "Transform from typing one-off terminal commands to writing bulletproof, production-ready Bash automation scripts. Learn regex text processing, system health check daemons, and error handling.",
    category: "Scripting",
    difficulty: "intermediate",
    duration_hours: 4.0,
    rating: 4.88,
    review_count: 940,
    learner_count: 6700,
    featured: false,
    certificate_available: true,
    learning_outcomes: [
      "Write resilient Bash scripts using strict mode (set -euo pipefail)",
      "Process structured log streams with awk, sed, cut, and jq",
      "Implement robust error trapping, exit code propagation, and log rotation",
      "Automate server health reporting, backup pipelines, and cron triggers",
    ],
    prerequisites: ["Familiarity with basic Linux commands"],
    skills: [
      "Bash Strict Mode",
      "Awk & Sed",
      "Cron Automation",
      "Regex Parsing",
      "Exit Codes & Traps",
      "Jq",
    ],
    lessons: [
      {
        id: "bs-01",
        slug: "01-bash-strict-mode",
        title: "1. Bash Strict Mode & Script Boilerplate",
        lesson_type: "notes",
        duration_minutes: 20,
        xp_reward: 25,
        sort_order: 1,
        content: `# Unofficial Bash Strict Mode

Always begin production scripts with:
\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
\`\`\`
- \`-e\`: Exit immediately if any command returns a non-zero exit status.
- \`-u\`: Treat unset variables as an error and exit immediately.
- \`-o pipefail\`: Return value of a pipeline is the status of the last command that failed.
`,
        quiz: {
          question: "What does 'set -e' do in a Bash script?",
          choices: [
            "Executes the script in echo mode",
            "Exits immediately if any command returns a non-zero exit status",
            "Encrypts the script",
            "Enables emoji output",
          ],
          correctIndex: 1,
          explanation:
            "`set -e` ensures errors are not silently ignored by stopping execution immediately upon command failure.",
        },
      },
      {
        id: "bs-02",
        slug: "02-awk-and-sed-processing",
        title: "2. Text Processing with Awk & Sed",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Awk and Sed for Log Analysis

\`\`\`bash
# Print column 1 and column 4 from space-delimited log
awk '{print $1, $4}' /var/log/nginx/access.log

# Replace all occurrences of "localhost" with "127.0.0.1"
sed -i 's/localhost/127.0.0.1/g' config.env

# Count top 10 requesting IP addresses
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -n 10
\`\`\`
`,
        quiz: {
          question:
            "Which Awk variable holds the total number of fields in the current input record/line?",
          choices: ["NR", "NF", "FS", "$0"],
          correctIndex: 1,
          explanation: "`NF` represents the Number of Fields on the current line.",
        },
      },
      {
        id: "bs-03",
        slug: "03-traps-and-cleanup",
        title: "3. Signal Traps & Temporary File Cleanup",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# Trapping Signals (SIGINT, SIGTERM, EXIT)

Ensure temporary scratch files and lockfiles are always deleted even if the user hits Ctrl+C:
\`\`\`bash
TMP_DIR=$(mktemp -d)
cleanup() {
    echo "Cleaning up temporary directory: $TMP_DIR"
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT
\`\`\`
`,
        quiz: {
          question: "When is a Bash function assigned to 'trap cleanup EXIT' executed?",
          choices: [
            "Only when an error occurs",
            "Whenever the script terminates for any reason",
            "Only when killed by SIGKILL",
            "Never",
          ],
          correctIndex: 1,
          explanation:
            "The pseudo-signal EXIT runs the specified handler when the shell script exits under any condition.",
        },
      },
      {
        id: "bs-04",
        slug: "04-automated-backup-pipeline",
        title: "4. Building an Automated Server Backup Pipeline",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 40,
        sort_order: 4,
        content: `# Automated Backup Script

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TAR_FILE="$BACKUP_DIR/data_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"
tar -czf "$TAR_FILE" /var/www/html /etc/nginx

# Delete backups older than 14 days
find "$BACKUP_DIR" -name "data_*.tar.gz" -mtime +14 -delete
echo "Backup completed successfully: $TAR_FILE"
\`\`\`
`,
        quiz: {
          question: "Which tar command flags create a gzip-compressed archive file?",
          choices: ["-czf", "-xvf", "-tvf", "-rf"],
          correctIndex: 0,
          explanation: "-c (create), -z (gzip compress), -f (specify archive filename).",
        },
      },
      {
        id: "bs-05",
        slug: "05-cron-and-timers",
        title: "5. Scheduling with Cron & Systemd Timers",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 5,
        content: `# Cron Schedules vs Systemd Timers

## Standard Cron Syntax
\`\`\`
* * * * * command_to_run
┬ ┬ ┬ ┬ ┬
│ │ │ │ └─ Day of week (0-6)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
\`\`\`
Example: \`0 2 * * * /usr/local/bin/backup.sh\` runs every day at 2:00 AM.
`,
        quiz: {
          question: "What does the cron schedule '*/15 * * * *' specify?",
          choices: [
            "At 15:00 every day",
            "Every 15 minutes",
            "On the 15th of every month",
            "Every 15 hours",
          ],
          correctIndex: 1,
          explanation: "*/15 in the minute position executes the job every 15 minutes.",
        },
      },
    ],
  },
  {
    id: "course-networking",
    slug: "networking",
    title: "Enterprise Linux Network Administration",
    subtitle:
      "TCP/IP subnetting, routing tables, DNS resolution with BIND/systemd-resolved, and socket debugging.",
    description:
      "Deep dive into Linux networking fundamentals: understand OSI and TCP/IP models, CIDR subnet calculation, iptables NAT masquerading, DNS troubleshooting, and packet routing.",
    category: "Networking",
    difficulty: "advanced",
    duration_hours: 4.5,
    rating: 4.91,
    review_count: 820,
    learner_count: 5100,
    featured: false,
    certificate_available: true,
    learning_outcomes: [
      "Calculate IPv4 CIDR subnets, broadcast addresses, and netmasks",
      "Configure static routing tables and default gateway metrics with ip route",
      "Diagnose DNS latency and delegation chains with dig, drill, and host",
      "Manage Linux network bridges and virtual ethernet (veth) pairs",
    ],
    prerequisites: ["Linux Fundamentals completion"],
    skills: [
      "TCP/IP Stack",
      "Subnetting / CIDR",
      "DNS Diagnostics (dig)",
      "Routing Tables",
      "Linux Bridges",
      "Socket Stats",
    ],
    lessons: [
      {
        id: "net-01",
        slug: "01-tcp-ip-subnetting",
        title: "1. TCP/IP Architecture & CIDR Subnetting",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 1,
        content: `# TCP/IP Stack & Subnetting

## Subnet Calculations
- \`/24\` = 256 addresses (254 usable) • Netmask: \`255.255.255.0\`
- \`/28\` = 16 addresses (14 usable) • Netmask: \`255.255.255.240\`
- \`/16\` = 65,536 addresses • Netmask: \`255.255.0.0\`
`,
        quiz: {
          question: "How many usable host IP addresses are available in a /24 IPv4 subnet?",
          choices: ["256", "254", "128", "512"],
          correctIndex: 1,
          explanation:
            "A /24 subnet has 256 total addresses, minus network address (0) and broadcast address (255) = 254 usable host addresses.",
        },
      },
      {
        id: "net-02",
        slug: "02-ip-routing-tables",
        title: "2. Linux Routing Tables & Interface Management",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Managing Network Interfaces & Routes

\`\`\`bash
ip link show
sudo ip link set eth1 up
ip route show
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0
\`\`\`
`,
        quiz: {
          question: "Which modern command replaces legacy 'ifconfig' on Linux?",
          choices: ["ip addr / ip link", "netstat", "route", "ping"],
          correctIndex: 0,
          explanation:
            "`ip` from the `iproute2` package replaces deprecated `ifconfig` and `route` tools.",
        },
      },
      {
        id: "net-03",
        slug: "03-dns-resolution-troubleshooting",
        title: "3. DNS Resolution & Debugging with Dig",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 3,
        content: `# DNS Query Analysis

\`\`\`bash
dig +trace afrokernel.com
dig @8.8.8.8 afrokernel.com MX
dig -x 8.8.8.8 # Reverse DNS query
resolvectl status # Systemd-resolved DNS status
\`\`\`
`,
        quiz: {
          question: "What does 'dig +trace' do?",
          choices: [
            "Performs an iterative query starting from the root nameservers down to the authoritative zone",
            "Pings the target 100 times",
            "Encrypts DNS traffic",
            "Clears the DNS cache",
          ],
          correctIndex: 0,
          explanation:
            "`dig +trace` traces the full hierarchical resolution path from Root (.) -> TLD -> Authoritative DNS servers.",
        },
      },
      {
        id: "net-04",
        slug: "04-network-namespaces-veth",
        title: "4. Network Namespaces & Virtual Ethernet (veth) Pairs",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 4,
        content: `# Isolated Network Namespaces

\`\`\`bash
sudo ip netns add red
sudo ip netns add blue
sudo ip link add veth-red type veth peer name veth-blue
sudo ip link set veth-red netns red
sudo ip link set veth-blue netns blue
\`\`\`
`,
        quiz: {
          question: "What is a veth pair in Linux networking?",
          choices: [
            "A virtual bidirectional ethernet cable connecting two network namespaces",
            "A physical PCIe card",
            "A Wi-Fi antenna",
            "A Bluetooth receiver",
          ],
          correctIndex: 0,
          explanation:
            "Virtual ethernet (veth) devices act like a software patch cable: packets transmitted on one peer arrive on the other.",
        },
      },
      {
        id: "net-05",
        slug: "05-load-balancing-nat",
        title: "5. NAT Masquerading, Port Forwarding & Load Balancing",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 5,
        content: `# IP Forwarding & NAT (Network Address Translation)

\`\`\`bash
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 80
\`\`\`
`,
        quiz: {
          question:
            "Which kernel sysctl setting must be enabled for a Linux machine to forward packets between interfaces as a router?",
          choices: [
            "net.ipv4.ip_forward=1",
            "net.ipv4.icmp_echo_ignore_all=1",
            "net.core.somaxconn=1024",
            "fs.file-max=100000",
          ],
          correctIndex: 0,
          explanation:
            "`net.ipv4.ip_forward=1` allows the Linux kernel to route packets between different network interfaces.",
        },
      },
    ],
  },
  {
    id: "course-red-hat-enterprise-linux",
    slug: "rhel",
    title: "Red Hat Enterprise Linux (RHEL) & RHCSA Administration",
    subtitle:
      "Master enterprise RHEL 9 administration, DNF/RPM package architecture, SELinux enforcement, LVM storage, Firewalld, and Cockpit.",
    description:
      "The comprehensive guide to enterprise Linux infrastructure and the Red Hat Certified System Administrator (RHCSA EX200) curriculum. Learn how to deploy, configure, and secure RHEL 9 servers with hands-on enterprise scenarios.",
    category: "Enterprise Linux",
    difficulty: "intermediate",
    duration_hours: 6.0,
    rating: 4.96,
    review_count: 1420,
    learner_count: 8650,
    featured: true,
    certificate_available: true,
    learning_outcomes: [
      "Manage enterprise software with DNF, RPM, Flatpak, and Red Hat Subscription Manager",
      "Configure and audit SELinux security contexts, boolean flags, and troubleshoot AVC denials",
      "Administer LVM (Logical Volume Manager), physical volumes, volume groups, and XFS/VDO filesystems",
      "Control systemd targets, custom timer units, and recover root access via GRUB emergency targets",
      "Secure enterprise networks using Firewalld zones, rich rules, and NetworkManager (nmcli)",
      "Automate system administration with Cockpit web console and Kickstart provisioning profiles",
    ],
    prerequisites: [
      "Basic Linux terminal navigation or completion of Linux Fundamentals",
      "Comfort with text editing (vim/nano) and standard shell commands",
    ],
    skills: [
      "RHEL 9 / CentOS Stream",
      "SELinux Policy & Booleans",
      "DNF & RPM Packages",
      "LVM Storage Slicing",
      "Firewalld & nmcli",
      "Systemd Boot Targets",
      "Cockpit Web Console",
      "RHCSA Objectives",
    ],
    lessons: [
      {
        id: "rhel-01",
        slug: "01-rhel-architecture-and-ecosystem",
        title: "1. Red Hat Enterprise Linux (RHEL 9) Ecosystem & Architecture",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=s0K88j5oUvM",
        duration_minutes: 20,
        xp_reward: 25,
        sort_order: 1,
        content: `# Red Hat Enterprise Linux (RHEL) & Ecosystem

Red Hat Enterprise Linux (**RHEL**) is the dominant enterprise Linux distribution powering Fortune 500 banks, telecommunications, government agencies, and hybrid cloud infrastructures.

## The Red Hat Distribution Relationship
- **Fedora**: Rapid upstream community innovation sandbox (new features release every 6 months).
- **CentOS Stream**: Midstream development track tracking upcoming RHEL minor point releases.
- **RHEL**: Production-grade, certified, enterprise-supported OS with a guaranteed 10-year support lifecycle and strict API/ABI stability.
- **Rocky Linux / AlmaLinux**: 1:1 binary-compatible downstream community builds created to provide freely redistributable alternatives.

\`\`\`
Fedora (Upstream Innovation)
       ↓
CentOS Stream (Continuous Midstream Integration)
       ↓
RHEL (Stable Enterprise Release — 10 Year Lifecycle)
       ↓
Rocky Linux / AlmaLinux (Binary-Compatible Downstreams)
\`\`\`

## Key Architectural Highlights in RHEL 9
1. **Linux Kernel 5.14+** with hybrid cloud and eBPF tracing optimizations.
2. **GCC 11 & glibc 2.34** modern toolchain.
3. **OpenSSL 3.0** with enterprise TLS 1.3 default crypto policies.
4. **Wayland** default display server alongside GNOME 40+.
5. **Cockpit Web Console** out of the box for browser-based systems management.

## Practice: Inspecting System Release & Kernel
\`\`\`bash
cat /etc/redhat-release
cat /etc/os-release
uname -r
rpm -q redhat-release
\`\`\`
`,
        quiz: {
          question: "In the Red Hat development model, what role does CentOS Stream serve?",
          choices: [
            "A completely unrelated non-Linux operating system",
            "The continuous midstream development branch tracking upcoming RHEL minor releases",
            "A legacy system that is no longer maintained",
            "A proprietary Windows emulator",
          ],
          correctIndex: 1,
          explanation:
            "CentOS Stream sits between upstream Fedora and downstream RHEL as a public continuous delivery branch where upcoming RHEL patches are developed in the open.",
        },
      },
      {
        id: "rhel-02",
        slug: "02-dnf-rpm-subscription-manager",
        title: "2. Enterprise Package Management: DNF, RPM & Repositories",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Enterprise Package Management: DNF, RPM & Subscriptions

RHEL utilizes **DNF** (Dandified YUM) on top of the low-level **RPM** (Red Hat Package Manager) engine.

## Red Hat Subscription Manager
On production RHEL nodes, repositories are enabled via Red Hat subscription entitlements:
\`\`\`bash
sudo subscription-manager register --username <rh_user> --password <rh_pass>
sudo subscription-manager attach --auto
sudo subscription-manager repos --list-enabled
\`\`\`

## Essential DNF Commands
\`\`\`bash
# Search and install packages
sudo dnf search nginx
sudo dnf install -y nginx firewalld htop

# Module streams (Application Streams / AppStream)
sudo dnf module list nodejs
sudo dnf module enable nodejs:20 -y
sudo dnf install -y nodejs

# Rollback and transaction history
sudo dnf history
sudo dnf history info 5
sudo dnf history undo 5 -y
\`\`\`

## Low-Level RPM Querying
RPM inspects local package metadata directly without querying remote mirrors:
\`\`\`bash
# Check if a package is installed
rpm -q httpd

# Query all installed files belonging to a package
rpm -ql nginx

# Find out WHICH package owns a specific file on the filesystem (Essential RHCSA skill)
rpm -qf /etc/nginx/nginx.conf
rpm -qf /bin/ls

# Verify package file integrity against original RPM checksums
rpm -V nginx
\`\`\`
`,
        quiz: {
          question:
            "Which command identifies which RPM package owns a specific file on disk (such as /usr/bin/systemctl)?",
          choices: [
            "dnf search /usr/bin/systemctl",
            "rpm -qf /usr/bin/systemctl",
            "rpm -i /usr/bin/systemctl",
            "which /usr/bin/systemctl",
          ],
          correctIndex: 1,
          explanation:
            "`rpm -qf <file_path>` queries the local RPM database to find the package that originally provided the specified file.",
        },
      },
      {
        id: "rhel-03",
        slug: "03-enterprise-users-and-sudoers",
        title: "3. Enterprise User Management, Groups & Sudo Policies",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# Enterprise User Administration & Sudo Policies

Enterprise environments require deterministic user provisioning, strict password aging policies, and granular root privilege delegation.

## Creating Users & Secondary Groups
\`\`\`bash
# Create developer user with specific UID, comment, and secondary group
sudo groupadd -g 2001 devops
sudo useradd -u 1500 -g devops -G wheel -c "Alice Jenkins - SRE" -m alice

# Password aging policy enforcement
sudo chage -M 90 -W 7 -m 1 alice  # Max 90 days, 7 day warning, min 1 day
sudo chage -l alice                # List account aging attributes
\`\`\`

## Wheel Group & Granular Sudoers Configuration
In RHEL, members of the \`wheel\` group have sudo privileges by default. Never edit \`/etc/sudoers\` directly; use \`visudo\` or drop files into \`/etc/sudoers.d/\`.

\`\`\`bash
# Create drop-in file: /etc/sudoers.d/99-devops
sudo visudo -f /etc/sudoers.d/99-devops
\`\`\`

Inside the file:
\`\`\`sudoers
# Allow members of devops group to restart web services without password
%devops ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/systemctl status nginx
\`\`\`

## Account Locking & Shadow Passwords
\`\`\`bash
# Temporarily lock user account
sudo usermod -L alice

# Unlock user account
sudo usermod -U alice
\`\`\`
`,
        quiz: {
          question:
            "What is the standard, safest way to create granular sudo rules on RHEL without risking corruption of /etc/sudoers?",
          choices: [
            "Directly edit /etc/passwd",
            "Create a validated drop-in file in /etc/sudoers.d/ using visudo -f",
            "Disable all security with chmod 777 /etc/shadow",
            "Delete the root user",
          ],
          correctIndex: 1,
          explanation:
            "Using `visudo -f /etc/sudoers.d/filename` ensures syntax validation before saving, preventing accidental syntax errors that could lock admins out of sudo.",
        },
      },
      {
        id: "rhel-04",
        slug: "04-lvm-storage-and-xfs",
        title: "4. Storage Administration: LVM, Stratis & XFS Filesystems",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 45,
        sort_order: 4,
        content: `# Storage Management: Logical Volume Manager (LVM) & XFS

LVM abstracts physical storage disks into flexible, dynamic virtual partitions that can be extended or shrunk on the fly without repartitioning.

## The 3-Tier LVM Architecture
1. **Physical Volumes (PV)**: Raw block devices (e.g. \`/dev/sdb\`, \`/dev/nvme0n1p1\`).
2. **Volume Groups (VG)**: Pool of storage combining multiple PVs into a unified storage pool.
3. **Logical Volumes (LV)**: Virtual partitions carved out of a VG that hold filesystems (XFS, ext4).

\`\`\`
Physical Disks: [/dev/sdb1]  [/dev/sdc1]
                       ↓         ↓
Physical Volumes:    [ PV 1 ]  [ PV 2 ]
                           ↘     ↙
Volume Group:         [ vg_data (100GB Pool) ]
                           ↙     ↘
Logical Volumes:    [ lv_web (40GB) ]  [ lv_db (60GB) ]
                           ↓                  ↓
Filesystems:         mkfs.xfs           mkfs.xfs
                           ↓                  ↓
Mount Points:        /var/www           /var/lib/pgsql
\`\`\`

## Hands-On LVM Provisioning Step-by-Step
\`\`\`bash
# 1. Initialize physical disk
sudo pvcreate /dev/sdb

# 2. Create Volume Group named 'vg_data'
sudo vgcreate vg_data /dev/sdb

# 3. Create Logical Volume named 'lv_storage' of size 20GB
sudo lvcreate -n lv_storage -L 20G vg_data

# 4. Format with RHEL default XFS filesystem
sudo mkfs.xfs /dev/vg_data/lv_storage

# 5. Create mount point and mount
sudo mkdir -p /data
sudo mount /dev/vg_data/lv_storage /data

# 6. Persistent Mount in /etc/fstab using UUID
sudo blkid /dev/vg_data/lv_storage
# Add to /etc/fstab:
# UUID=xxxx-xxxx-xxxx  /data  xfs  defaults  0  0
\`\`\`

## Online Logical Volume Growth (Zero Downtime)
\`\`\`bash
# Extend the LV and resize the underlying XFS filesystem in a single command:
sudo lvextend -r -L +10G /dev/vg_data/lv_storage
\`\`\`
*(Note: \`-r\` automatically triggers \`xfs_growfs\` or \`resize2fs\`).*
`,
        quiz: {
          question:
            "Which flag in 'lvextend' automatically resizes the underlying filesystem (such as XFS or ext4) in the same operation?",
          choices: ["-r (--resizefs)", "-f (--force)", "-n (--new)", "-z (--zero)"],
          correctIndex: 0,
          explanation:
            "`lvextend -r` (or `--resizefs`) seamlessly expands both the logical volume container and the underlying filesystem without needing a separate `xfs_growfs` command.",
        },
      },
      {
        id: "rhel-05",
        slug: "05-systemd-targets-and-rescue-boot",
        title: "5. Systemd Targets, Timers & Emergency Rescue Boot",
        lesson_type: "notes",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 5,
        content: `# Systemd Targets, Service Management & Root Password Recovery

In RHEL 9, traditional SysV runlevels are replaced by declarative **systemd target units**.

## Core Systemd Boot Targets
| Target Unit | Legacy Runlevel | Purpose |
|---|---|---|
| \`poweroff.target\` | 0 | Halts and powers off system |
| \`rescue.target\` | 1 | Single-user maintenance mode (requires root password) |
| \`multi-user.target\` | 3 | Full multi-user CLI mode with networking (default server target) |
| \`graphical.target\` | 5 | Full multi-user mode with GNOME GUI |
| \`reboot.target\` | 6 | Reboots system |
| \`emergency.target\` | - | Minimal initramfs emergency shell with root mounted read-only |

\`\`\`bash
# Inspect current default boot target
sudo systemctl get-default

# Change default boot target to non-GUI server multi-user mode
sudo systemctl set-default multi-user.target

# Switch target on a running system without rebooting
sudo systemctl isolate graphical.target
\`\`\`

## Recovering Lost Root Password via GRUB2 (RHCSA Core Requirement)
If you lose the root password on a physical/virtual RHEL machine:
1. Reboot the server.
2. At the GRUB2 boot menu, press **\`e\`** to edit the default kernel boot parameters.
3. Locate the line starting with **\`linux\`** and append:
   \`\`\`text
   rd.break
   \`\`\`
4. Press **\`Ctrl + x\`** to boot into the emergency initramfs prompt.
5. Remount the sysroot with read-write permissions and reset the password:
   \`\`\`bash
   mount -o remount,rw /sysroot
   chroot /sysroot
   passwd root
   # Trigger SELinux auto-relabeling on next boot:
   touch /.autorelabel
   exit
   exit
   \`\`\`
`,
        quiz: {
          question:
            "When performing an emergency root password reset on RHEL via rd.break, why is 'touch /.autorelabel' required before rebooting?",
          choices: [
            "To reset the system time",
            "To force SELinux to recalculate security contexts for modified password shadow files on boot",
            "To delete temporary logs",
            "To format the hard drive",
          ],
          correctIndex: 1,
          explanation:
            "When modifying `/etc/shadow` from an emergency chroot without SELinux loaded, files lack proper security contexts. `touch /.autorelabel` signals the kernel to relabel the entire filesystem upon next startup.",
        },
      },
      {
        id: "rhel-06",
        slug: "06-selinux-contexts-and-booleans",
        title: "6. SELinux Security: Modes, Contexts, Booleans & Auditing",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 45,
        sort_order: 6,
        content: `# SELinux (Security-Enhanced Linux) Administration

SELinux is the mandatory access control (**MAC**) architecture built into the Linux kernel by the NSA and Red Hat. Unlike Discretionary Access Control (chmod/chown), SELinux restricts even the \`root\` user based on defined security policies.

## 3 SELinux Operating Modes
- **Enforcing**: Security policy is enforced; unauthorized access is blocked and logged.
- **Permissive**: Policy is NOT enforced; unauthorized access is permitted, but warnings (AVC denials) are logged.
- **Disabled**: SELinux is completely inactive.

\`\`\`bash
# Check current operating mode
getenforce

# Temporarily toggle mode without rebooting
sudo setenforce 0   # Switch to Permissive
sudo setenforce 1   # Switch to Enforcing

# Persistent mode configuration in /etc/selinux/config:
# SELINUX=enforcing
\`\`\`

## SELinux Contexts & Type Enforcement
Every file, process, and port has a security label: \`user:role:type:level\`. The **Type** (\`_t\`) determines access rights.

\`\`\`bash
# View SELinux contexts on files
ls -Z /var/www/html
# Example: system_u:object_r:httpd_sys_content_t:s0

# View SELinux contexts on running processes
ps -eZ | grep nginx

# Permanently assign context to a custom directory (e.g. /custom_web)
sudo semanage fcontext -a -t httpd_sys_content_t "/custom_web(/.*)?"
sudo restorecon -Rv /custom_web
\`\`\`

## Managing SELinux Booleans (Feature Toggles)
Booleans allow enabling or disabling specific security capabilities at runtime without recompiling policies:
\`\`\`bash
# Search for HTTP-related booleans
getsebool -a | grep httpd

# Allow Apache/Nginx to connect to network databases persistently across reboots
sudo setsebool -P httpd_can_network_connect_db on
\`\`\`

## Troubleshooting AVC Denials
\`\`\`bash
# Search recent Access Vector Cache denials
sudo ausearch -m avc -ts recent

# Generate plain-English diagnostic suggestions
sudo sealert -a /var/log/audit/audit.log
\`\`\`
`,
        quiz: {
          question:
            "Which flag ensures that a setsebool boolean change remains persistent across system reboots on RHEL?",
          choices: ["-P (persistent)", "-s (save)", "-f (force)", "-a (all)"],
          correctIndex: 0,
          explanation:
            "`setsebool -P <boolean> on/off` writes the change directly to the permanent policy store so it survives reboots.",
        },
      },
      {
        id: "rhel-07",
        slug: "07-firewalld-and-nmcli",
        title: "7. Enterprise Networking with NetworkManager (nmcli) & Firewalld",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 40,
        sort_order: 7,
        content: `# Enterprise Network Configuration: nmcli & Firewalld

RHEL standardizes networking via **NetworkManager** and host firewall rules via **Firewalld**.

## Configuring Static IPs with nmcli (NetworkManager CLI)
\`\`\`bash
# View network devices and connections
nmcli device status
nmcli connection show

# Add a static IP connection on interface eth0
sudo nmcli connection add type ethernet con-name "prod-eth0" ifname eth0 \
  ipv4.method manual \
  ipv4.addresses 192.168.1.150/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8 1.1.1.1"

# Activate connection
sudo nmcli connection up "prod-eth0"
\`\`\`

## Managing Firewalld Zones & Services
Firewalld uses dynamic zones (e.g. \`public\`, \`dmz\`, \`internal\`, \`trusted\`).

\`\`\`bash
# Check default zone and status
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all

# Allow web server traffic persistently
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Open a specific custom port
sudo firewall-cmd --permanent --add-port=8080/tcp

# Reload firewalld to activate permanent rules without dropping active connections
sudo firewall-cmd --reload
\`\`\`

## Port Forwarding & Rich Rules
\`\`\`bash
# Forward incoming port 80 traffic to internal port 8080
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080

# Restrict SSH access to a specific trusted management subnet
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.10.0.0/16" service name="ssh" accept'
sudo firewall-cmd --reload
\`\`\`
`,
        quiz: {
          question:
            "After adding firewall rules with 'firewall-cmd --permanent', what command must be run to apply the changes to the active firewall without dropping current connections?",
          choices: ["systemctl restart network", "firewall-cmd --reload", "iptables -F", "reboot"],
          correctIndex: 1,
          explanation:
            "`firewall-cmd --reload` loads the permanent configuration into runtime memory without disrupting established client connections.",
        },
      },
      {
        id: "rhel-08",
        slug: "08-cockpit-and-automation",
        title: "8. Cockpit Web Console & RHCSA Exam Preparation",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 35,
        sort_order: 8,
        content: `# Cockpit Web Console & RHCSA Certification Blueprint

RHEL includes **Cockpit**, a modern, responsive web-based administration console designed for single-server and multi-server management.

## Enabling Cockpit on RHEL 9
\`\`\`bash
# Enable and start the cockpit on-demand systemd socket
sudo systemctl enable --now cockpit.socket

# Allow cockpit port in firewalld (Port 9090)
sudo firewall-cmd --permanent --add-service=cockpit
sudo firewall-cmd --reload
\`\`\`
Access the web console securely via: \`https://<server-ip>:9090\` using any authorized Linux user account.

## Cockpit Capabilities
1. **Real-time Performance Monitoring**: Live CPU, RAM, Network, and Disk I/O graphs.
2. **Storage Management**: Create Volume Groups, thin pools, Stratis pools, and inspect SMART disk health.
3. **Network Configuration**: Bond interfaces, configure VLANs, and manage bridges.
4. **Log Inspection**: Filter systemd journalctl alerts by severity and service.
5. **Container Management**: Manage Podman containers and images directly from the browser.

## RHCSA (EX200) Exam Final Checklist
To pass the Red Hat Certified System Administrator practical hands-on exam:
- [x] Understand essential tools: grep, tar, gzip, star, rsync, find, redirection.
- [x] Create simple shell scripts with exit codes and loops.
- [x] Configure local storage: partitions, LVM PV/VG/LV, and swap space.
- [x] Create and configure file systems: XFS, ext4, persistent mounting in \`/etc/fstab\`.
- [x] Deploy and maintain systems: DNF, RPM, kernel updates, systemd boot targets.
- [x] Manage basic networking: nmcli static IPs, hostnames, DNS.
- [x] Manage users and groups: sudoers, password aging, access control lists (ACLs).
- [x] Manage security: SELinux contexts, booleans, AVC troubleshooting, and firewalld.
- [x] Manage containers: Podman rootless containers, systemd container service generation (\`podman generate systemd\`).
`,
        quiz: {
          question:
            "Which systemd socket unit manages on-demand socket activation for the Red Hat Cockpit Web Console?",
          choices: ["cockpit.socket", "webadmin.service", "rhel-dashboard.socket", "httpd.service"],
          correctIndex: 0,
          explanation:
            "`cockpit.socket` listens on port 9090 and starts the Cockpit service on-demand when an incoming HTTPS connection arrives, saving system memory when idle.",
        },
      },
    ],
  },
];

export function getCourseBySlug(slug: string): CourseData | undefined {
  return CATALOG_COURSES.find((c) => c.slug === slug);
}

export function getAllCourses(): CourseData[] {
  return CATALOG_COURSES;
}
