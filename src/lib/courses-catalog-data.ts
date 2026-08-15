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
  category: "Fundamentals" | "Cybersecurity" | "DevOps" | "Networking" | "Scripting" | "Cloud";
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
    subtitle: "Master the Linux command line, filesystem hierarchy, permissions, process management, and systemd services.",
    description: "The definitive Linux foundation course for developers, sysadmins, and cybersecurity professionals. Learn how Linux operates under the hood with hands-on web terminal exercises.",
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
      "Automate basic administrative tasks and configure SSH remote access"
    ],
    prerequisites: [
      "No prior Linux experience required",
      "Basic computer literacy and curiosity to learn"
    ],
    skills: ["Bash CLI", "File Permissions", "Systemd", "Process Management", "Package Management (apt/dnf)", "SSH"],
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
            "Act as a web browser"
          ],
          correctIndex: 1,
          explanation: "The Linux kernel is the bridge between software and hardware, managing CPU scheduling, memory, device drivers, and system calls."
        }
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
          explanation: "`cd -` switches back to the previous directory using the $OLDPWD environment variable."
        }
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
          explanation: "/etc contains all host-specific system configuration files and service configs."
        }
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
          explanation: "rwx = 4+2+1=7, r-x = 4+0+1=5, r-x = 4+0+1=5 -> 755."
        }
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
          question: "Which command updates the local repository package index list on Ubuntu/Debian?",
          choices: ["apt upgrade", "apt update", "apt install", "apt refresh"],
          correctIndex: 1,
          explanation: "`apt update` downloads latest package lists from repositories, while `apt upgrade` installs available updates."
        }
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
          question: "How do you configure a service to start automatically during system boot with systemd?",
          choices: ["systemctl run <service>", "systemctl enable <service>", "systemctl start <service>", "systemctl boot <service>"],
          correctIndex: 1,
          explanation: "`systemctl enable` creates symbolic links to ensure the unit starts upon booting target."
        }
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
          question: "Which signal requests a graceful shutdown of a process allowing it to save state?",
          choices: ["SIGKILL (9)", "SIGTERM (15)", "SIGSTOP (19)", "SIGHUP (1)"],
          correctIndex: 1,
          explanation: "SIGTERM (15) asks the process to shut down cleanly, while SIGKILL (9) abruptly terminates it."
        }
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
          explanation: "`ss -tulwn` displays (t)cp, (u)dp, (l)istening, (w)ide, and (n)umeric port formats."
        }
      }
    ]
  },
  {
    id: "course-cybersecurity",
    slug: "security",
    title: "Cybersecurity & Linux Hardening",
    subtitle: "Reconnaissance with Nmap, packet analysis with Wireshark, iptables/UFW firewalls, and server hardening.",
    description: "Learn offensive reconnaissance and defensive server hardening techniques on Linux. Secure SSH, configure fail2ban, audit logs, and inspect network traffic.",
    category: "Cybersecurity",
    difficulty: "intermediate",
    duration_hours: 5.0,
    rating: 4.95,
    review_count: 1680,
    learner_count: 9800,
    featured: true,
    certificate_available: true,
    learning_outcomes: [
      "Perform port scanning and vulnerability assessment using Nmap",
      "Analyze raw PCAP packet captures and detect anomalies with Wireshark & tcpdump",
      "Harden Linux servers with UFW, iptables, Fail2Ban, and SSH key policies",
      "Audit security events, authentication failures, and system integrity logs",
      "Understand the OWASP Top 10 vulnerabilities in infrastructure"
    ],
    prerequisites: ["Linux Fundamentals completion or comfort with terminal commands"],
    skills: ["Nmap Scanning", "Packet Analysis (tcpdump)", "UFW / iptables", "Fail2Ban", "SSH Hardening", "Log Auditing"],
    lessons: [
      {
        id: "cs-01",
        slug: "01-nmap-network-recon",
        title: "1. Nmap Network Scanning & Reconnaissance",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=4t4kBkMsDbY",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 1,
        content: `# Nmap Network Reconnaissance

Nmap (**Network Mapper**) is the gold standard tool for discovery and security auditing.

## Common Scan Types
- \`nmap -sS target\` — Stealth SYN Scan (default with root).
- \`nmap -sV target\` — Service Version Detection.
- \`nmap -O target\` — Operating System Fingerprinting.
- \`nmap -p- target\` — Scan all 65,535 ports.
- \`nmap -A -T4 target\` — Aggressive scan with OS, version, and default NSE scripts.
`,
        quiz: {
          question: "Which Nmap scan flag enables service version detection on open ports?",
          choices: ["-sS", "-sV", "-O", "-Pn"],
          correctIndex: 1,
          explanation: "-sV queries open ports using probes to determine what software and version is listening."
        }
      },
      {
        id: "cs-02",
        slug: "02-wireshark-tcpdump",
        title: "2. Packet Sniffing with Tcpdump & Wireshark",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Packet Capture with Tcpdump

Inspect raw packet headers entering and leaving network interfaces.

\`\`\`bash
sudo tcpdump -i eth0 -n
sudo tcpdump -i eth0 'port 80 or port 443' -w web_traffic.pcap
sudo tcpdump -r web_traffic.pcap -c 10
\`\`\`
`,
        quiz: {
          question: "Which tcpdump flag prevents resolving IP addresses to DNS names for faster inspection?",
          choices: ["-v", "-n", "-s", "-X"],
          correctIndex: 1,
          explanation: "`-n` tells tcpdump not to convert addresses to hostnames, avoiding slow DNS reverse lookups."
        }
      },
      {
        id: "cs-03",
        slug: "03-ssh-security-hardening",
        title: "3. SSH Daemon Hardening & Key Authentication",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# SSH Server Hardening (/etc/ssh/sshd_config)

## Critical Hardening Guidelines
1. Disable Root Login: \`PermitRootLogin no\`
2. Disable Password Auth: \`PasswordAuthentication no\`
3. Use Modern Keys: \`Ed25519\` or \`ECDSA\`
4. Change Default Port: \`Port 2222\`
5. Restrict Allowed Users: \`AllowUsers admin devops\`
`,
        quiz: {
          question: "Which sshd_config directive disables password authentication to enforce SSH key only access?",
          choices: ["PasswordAuthentication no", "DisablePassword yes", "PermitEmptyPasswords no", "AuthMethod keys_only"],
          correctIndex: 0,
          explanation: "`PasswordAuthentication no` prevents brute force password attacks and requires SSH keypairs."
        }
      },
      {
        id: "cs-04",
        slug: "04-firewalls-ufw-iptables",
        title: "4. Host Firewalls (UFW & Iptables)",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 4,
        content: `# Configuring UFW (Uncomplicated Firewall)

\`\`\`bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80,443/tcp comment 'Web'
sudo ufw enable
sudo ufw status verbose
\`\`\`
`,
        quiz: {
          question: "What is the recommended default inbound traffic policy for a secure server?",
          choices: ["Allow all incoming", "Deny all incoming", "Forward all", "Reject outgoing"],
          correctIndex: 1,
          explanation: "A default deny incoming policy blocks all ports by default, requiring admins to explicitly whitelist necessary services."
        }
      },
      {
        id: "cs-05",
        slug: "05-fail2ban-intrusion-defense",
        title: "5. Intrusion Prevention with Fail2Ban",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 5,
        content: `# Fail2Ban Automated Intrusion Defense

Fail2Ban monitors log files (e.g. \`/var/log/auth.log\`) for repeated failed login attempts and dynamically injects firewall rules to block attacking IP addresses.

\`\`\`bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
\`\`\`
`,
        quiz: {
          question: "What does Fail2ban do when it detects multiple failed login attempts from an IP address?",
          choices: ["Shuts down the server", "Dynamically bans the attacker's IP address in the firewall", "Deletes user accounts", "Sends an unencrypted email"],
          correctIndex: 1,
          explanation: "Fail2ban automatically adds a temporary or permanent firewall drop rule for offending IP addresses."
        }
      },
      {
        id: "cs-06",
        slug: "06-log-auditing-and-forensics",
        title: "6. Security Log Auditing & Incident Forensics",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 40,
        sort_order: 6,
        content: `# Linux Log Auditing

Inspect authentication failures, sudo attempts, and kernel alerts:
\`\`\`bash
sudo grep "Failed password" /var/log/auth.log
sudo journalctl -xe _COMM=sudo
last -n 20 # Show recent user logins
lastb      # Show bad login attempts
\`\`\`
`,
        quiz: {
          question: "Which command shows recent successful user logins and reboot events on Linux?",
          choices: ["whoami", "last", "w", "uptime"],
          correctIndex: 1,
          explanation: "`last` reads `/var/log/wtmp` to show history of user logins, logouts, and system boots."
        }
      }
    ]
  },
  {
    id: "course-devops-containers",
    slug: "devops",
    title: "DevOps, Docker & Kubernetes Engineering",
    subtitle: "Container architecture, multi-stage Dockerfiles, Docker Compose, Kubernetes Pods/Deployments, and CI/CD pipelines.",
    description: "Learn modern containerized software delivery from scratch. Build optimized lightweight containers, orchestrate multi-container services, and deploy resilient workloads on Kubernetes clusters.",
    category: "DevOps",
    difficulty: "intermediate",
    duration_hours: 5.5,
    rating: 4.92,
    review_count: 1890,
    learner_count: 11200,
    featured: true,
    certificate_available: true,
    learning_outcomes: [
      "Understand Linux namespaces, cgroups, and container isolation mechanics",
      "Author secure, multi-stage production Dockerfiles with minimal attack surfaces",
      "Orchestrate complex multi-tier applications using Docker Compose",
      "Deploy and scale microservices with Kubernetes Pods, Deployments, and Services",
      "Implement automated CI/CD test and deployment pipelines with GitHub Actions"
    ],
    prerequisites: ["Linux Fundamentals knowledge and basic command line comfort"],
    skills: ["Docker", "Kubernetes (kubectl)", "Docker Compose", "Multi-stage Builds", "CI/CD Pipelines", "Helm"],
    lessons: [
      {
        id: "do-01",
        slug: "01-container-mechanics",
        title: "1. Container Mechanics: Namespaces & Cgroups",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 1,
        content: `# Container Internals: Namespaces & Cgroups

Containers are not virtual machines. A container is simply a standard Linux process isolated by **Namespaces** and resource-constrained by **Control Groups (cgroups)**.

## Key Kernel Primitives
- **PID Namespace**: Process isolation (container process thinks it is PID 1).
- **NET Namespace**: Dedicated network interfaces, IP addresses, and routing tables.
- **MNT Namespace**: Isolated filesystem root mounts.
- **Cgroups**: Limits CPU quotas, memory ceilings, and disk I/O rates.
`,
        quiz: {
          question: "Which Linux kernel feature enforces CPU and Memory resource limits on containers?",
          choices: ["Namespaces", "Control Groups (cgroups)", "Chroot jail", "SELinux"],
          correctIndex: 1,
          explanation: "Control groups (cgroups) allocate and throttle hardware resource consumption (CPU, RAM, disk I/O) for process groups."
        }
      },
      {
        id: "do-02",
        slug: "02-dockerfile-optimization",
        title: "2. Building Optimized Multi-Stage Dockerfiles",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Multi-Stage Dockerfile Best Practices

Avoid including compilers, SDKs, and build dependencies in final production images.

\`\`\`dockerfile
# Stage 1: Build & Compile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`
`,
        quiz: {
          question: "What is the primary benefit of multi-stage Docker builds?",
          choices: [
            "Makes images drastically smaller and more secure by excluding build tools",
            "Slows down builds intentionally",
            "Allows running Windows software on Linux",
            "Automatically buys domain names"
          ],
          correctIndex: 0,
          explanation: "Multi-stage builds allow separating build tools from production runtime, shrinking image sizes by up to 90% and eliminating vulnerability surfaces."
        }
      },
      {
        id: "do-03",
        slug: "03-docker-compose-stack",
        title: "3. Multi-Container Stacks with Docker Compose",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# Multi-Container Orchestration with Docker Compose

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret_password

volumes:
  pgdata:
\`\`\`
`,
        quiz: {
          question: "How do containers in the same Docker Compose network communicate with each other?",
          choices: ["Using the service name as the DNS hostname", "By their public IP address", "Via USB cables", "Using Bluetooth"],
          correctIndex: 0,
          explanation: "Docker's embedded DNS server automatically resolves service names (e.g. `http://db:5432`) to the container's private bridge IP."
        }
      },
      {
        id: "do-04",
        slug: "04-kubernetes-architecture",
        title: "4. Kubernetes Cluster Architecture & Pods",
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=X48VuDVv0do",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 4,
        content: `# Kubernetes Architecture

## Control Plane (Master Node)
- **kube-apiserver**: REST entrypoint for all cluster management.
- **etcd**: Consistent, distributed key-value store.
- **kube-scheduler**: Assigns unscheduled Pods to suitable worker nodes.
- **kube-controller-manager**: Regulates cluster state (replicas, endpoints).

## Worker Node Components
- **kubelet**: Agent ensuring containers described in PodSpecs are running.
- **kube-proxy**: Network proxy maintaining IP routing rules.
- **Container Runtime**: Containerd / CRI-O.
`,
        quiz: {
          question: "What is the atomic, smallest deployable unit of computing in Kubernetes?",
          choices: ["A Container", "A Pod", "A Node", "A Cluster"],
          correctIndex: 1,
          explanation: "A Pod is the smallest unit in Kubernetes, encapsulating one or more co-located containers sharing storage and network IP."
        }
      },
      {
        id: "do-05",
        slug: "05-k8s-deployments-services",
        title: "5. Kubernetes Deployments, Services & Ingress",
        lesson_type: "lab",
        duration_minutes: 35,
        xp_reward: 40,
        sort_order: 5,
        content: `# Kubernetes Deployments & Services

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: afrokernel/api:v1
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 3000
\`\`\`
`,
        quiz: {
          question: "Which Kubernetes resource guarantees zero-downtime rolling updates and replica management?",
          choices: ["Deployment", "ConfigMap", "Secret", "Namespace"],
          correctIndex: 0,
          explanation: "Deployments manage ReplicaSets and orchestrate seamless rolling updates without service interruptions."
        }
      },
      {
        id: "do-06",
        slug: "06-cicd-github-actions",
        title: "6. Automated CI/CD Pipelines with GitHub Actions",
        lesson_type: "notes",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 6,
        content: `# CI/CD Workflow with GitHub Actions

Automate building, linting, testing, Docker image packaging, and deployment:
\`\`\`yaml
name: Deploy Pipeline
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Unit Tests
        run: npm test
      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: user/app:latest
\`\`\`
`,
        quiz: {
          question: "What is the primary objective of Continuous Integration (CI)?",
          choices: [
            "Automatically validate, test, and merge code frequently to prevent merge conflicts and bugs",
            "Manually write software once every year",
            "Delete old git repositories",
            "Send marketing emails"
          ],
          correctIndex: 0,
          explanation: "CI automates testing and building with every commit to detect bugs early and maintain codebase stability."
        }
      }
    ]
  },
  {
    id: "course-shell-scripting",
    slug: "scripting",
    title: "Advanced Bash Scripting & Automation",
    subtitle: "Master strict mode, regex parsing with awk/sed, exit codes, traps, and automation crons.",
    description: "Transform from typing one-off terminal commands to writing bulletproof, production-ready Bash automation scripts. Learn regex text processing, system health check daemons, and error handling.",
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
      "Automate server health reporting, backup pipelines, and cron triggers"
    ],
    prerequisites: ["Familiarity with basic Linux commands"],
    skills: ["Bash Strict Mode", "Awk & Sed", "Cron Automation", "Regex Parsing", "Exit Codes & Traps", "Jq"],
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
          choices: ["Executes the script in echo mode", "Exits immediately if any command returns a non-zero exit status", "Encrypts the script", "Enables emoji output"],
          correctIndex: 1,
          explanation: "`set -e` ensures errors are not silently ignored by stopping execution immediately upon command failure."
        }
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
          question: "Which Awk variable holds the total number of fields in the current input record/line?",
          choices: ["NR", "NF", "FS", "$0"],
          correctIndex: 1,
          explanation: "`NF` represents the Number of Fields on the current line."
        }
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
          choices: ["Only when an error occurs", "Whenever the script terminates for any reason", "Only when killed by SIGKILL", "Never"],
          correctIndex: 1,
          explanation: "The pseudo-signal EXIT runs the specified handler when the shell script exits under any condition."
        }
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
          explanation: "-c (create), -z (gzip compress), -f (specify archive filename)."
        }
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
          choices: ["At 15:00 every day", "Every 15 minutes", "On the 15th of every month", "Every 15 hours"],
          correctIndex: 1,
          explanation: "*/15 in the minute position executes the job every 15 minutes."
        }
      }
    ]
  },
  {
    id: "course-networking",
    slug: "networking",
    title: "Enterprise Linux Network Administration",
    subtitle: "TCP/IP subnetting, routing tables, DNS resolution with BIND/systemd-resolved, and socket debugging.",
    description: "Deep dive into Linux networking fundamentals: understand OSI and TCP/IP models, CIDR subnet calculation, iptables NAT masquerading, DNS troubleshooting, and packet routing.",
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
      "Manage Linux network bridges and virtual ethernet (veth) pairs"
    ],
    prerequisites: ["Linux Fundamentals completion"],
    skills: ["TCP/IP Stack", "Subnetting / CIDR", "DNS Diagnostics (dig)", "Routing Tables", "Linux Bridges", "Socket Stats"],
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
          explanation: "A /24 subnet has 256 total addresses, minus network address (0) and broadcast address (255) = 254 usable host addresses."
        }
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
          explanation: "`ip` from the `iproute2` package replaces deprecated `ifconfig` and `route` tools."
        }
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
            "Clears the DNS cache"
          ],
          correctIndex: 0,
          explanation: "`dig +trace` traces the full hierarchical resolution path from Root (.) -> TLD -> Authoritative DNS servers."
        }
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
          choices: ["A virtual bidirectional ethernet cable connecting two network namespaces", "A physical PCIe card", "A Wi-Fi antenna", "A Bluetooth receiver"],
          correctIndex: 0,
          explanation: "Virtual ethernet (veth) devices act like a software patch cable: packets transmitted on one peer arrive on the other."
        }
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
          question: "Which kernel sysctl setting must be enabled for a Linux machine to forward packets between interfaces as a router?",
          choices: ["net.ipv4.ip_forward=1", "net.ipv4.icmp_echo_ignore_all=1", "net.core.somaxconn=1024", "fs.file-max=100000"],
          correctIndex: 0,
          explanation: "`net.ipv4.ip_forward=1` allows the Linux kernel to route packets between different network interfaces."
        }
      }
    ]
  },
  {
    id: "course-cloud-infrastructure",
    slug: "cloud",
    title: "Cloud Infrastructure with Linux & Terraform",
    subtitle: "Cloud-init automation, AWS/GCP Linux instances, IAM security, S3 storage, and Infrastructure as Code.",
    description: "Build robust cloud architecture on public clouds with Linux VMs, declarative Terraform configuration, cloud-init provisioning, and object storage integrations.",
    category: "Cloud",
    difficulty: "intermediate",
    duration_hours: 4.5,
    rating: 4.89,
    review_count: 760,
    learner_count: 4800,
    featured: false,
    certificate_available: true,
    learning_outcomes: [
      "Provision Linux VMs automatically using cloud-init YAML user-data scripts",
      "Write declarative Infrastructure as Code (IaC) with Terraform",
      "Configure IAM roles, security groups, and virtual private clouds (VPC)",
      "Automate disk volume attachments and object storage syncing"
    ],
    prerequisites: ["Linux Fundamentals knowledge"],
    skills: ["Cloud-init", "Terraform", "AWS / GCP Linux", "IAM Security", "VPC & Security Groups", "S3 / Object Storage"],
    lessons: [
      {
        id: "cl-01",
        slug: "01-cloud-init-provisioning",
        title: "1. Automated VM Provisioning with Cloud-Init",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 1,
        content: `# Cloud-Init User-Data Automation

\`\`\`yaml
#cloud-config
package_update: true
packages:
  - nginx
  - fail2ban
  - htop

write_files:
  - path: /var/www/html/index.html
    content: |
      <h1>Provisioned via AfroKernel Cloud-Init</h1>

runcmd:
  - systemctl enable --now nginx
\`\`\`
`,
        quiz: {
          question: "When does cloud-init execute its user-data configuration scripts?",
          choices: ["On every user login", "During the initial boot of a new cloud instance", "When the computer shuts down", "Only on Sundays"],
          correctIndex: 1,
          explanation: "Cloud-init runs during early instance boot to configure hostnames, SSH keys, users, packages, and startup commands."
        }
      },
      {
        id: "cl-02",
        slug: "02-terraform-basics",
        title: "2. Infrastructure as Code with Terraform",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 2,
        content: `# Terraform Core Workflow

\`\`\`hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "AfroKernel-Cloud-Server"
  }
}
\`\`\`

## Commands
\`\`\`bash
terraform init
terraform plan
terraform apply -auto-approve
\`\`\`
`,
        quiz: {
          question: "Which Terraform command previews the execution plan without making actual cloud changes?",
          choices: ["terraform apply", "terraform plan", "terraform init", "terraform destroy"],
          correctIndex: 1,
          explanation: "`terraform plan` compares desired state in .tf files with current cloud state and shows proposed additions/modifications."
        }
      },
      {
        id: "cl-03",
        slug: "03-iam-roles-and-security",
        title: "3. Cloud IAM Roles, Policies & Least Privilege",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 3,
        content: `# Principle of Least Privilege in Cloud IAM

Never use root cloud accounts for daily administration. Attach scoped instance profiles instead of hardcoding API keys in code.
`,
        quiz: {
          question: "What is the recommended practice for authenticating applications running on cloud VMs to access cloud services?",
          choices: [
            "Attach IAM Instance Roles instead of hardcoding secret access keys",
            "Commit access keys to public GitHub repositories",
            "Disable all security",
            "Use plaintext passwords"
          ],
          correctIndex: 0,
          explanation: "IAM Instance Roles provide temporary, automatically rotated STS credentials with zero hardcoded secret keys."
        }
      },
      {
        id: "cl-04",
        slug: "04-object-storage-and-s3",
        title: "4. Cloud Object Storage & Automated Backup Sync",
        lesson_type: "lab",
        duration_minutes: 30,
        xp_reward: 35,
        sort_order: 4,
        content: `# S3 and Object Storage Tools (awscli / rclone)

\`\`\`bash
aws s3 ls s3://my-cloud-backup-bucket
aws s3 sync /var/backups s3://my-cloud-backup-bucket/daily --delete
\`\`\`
`,
        quiz: {
          question: "What is the key advantage of object storage (e.g. S3) compared to traditional block storage (EBS)?",
          choices: [
            "Virtually infinite scalability, high durability (99.999999999%), and accessible via HTTP API",
            "Faster boot drive access",
            "Runs Windows exe files directly",
            "Only works on local networks"
          ],
          correctIndex: 0,
          explanation: "Object storage is designed for massive scale, durability, and cost-effective unstructured data storage via REST APIs."
        }
      },
      {
        id: "cl-05",
        slug: "05-vpc-and-security-groups",
        title: "5. Virtual Private Clouds (VPC) & Security Groups",
        lesson_type: "notes",
        duration_minutes: 25,
        xp_reward: 30,
        sort_order: 5,
        content: `# Cloud Networking (VPCs & Subnets)

- **Public Subnet**: Connected to Internet Gateway (IGW) for load balancers and bastions.
- **Private Subnet**: No direct internet access; routes outbound traffic via NAT Gateway for databases and internal microservices.
`,
        quiz: {
          question: "Where should production databases be deployed inside a VPC for optimal security?",
          choices: ["Public subnet with open 0.0.0.0/0 access", "Isolated private subnet with no direct public IP", "In the Internet Gateway", "On an unencrypted USB stick"],
          correctIndex: 1,
          explanation: "Databases should always reside in private subnets with strictly limited access from application tiers only."
        }
      }
    ]
  }
];

export function getCourseBySlug(slug: string): CourseData | undefined {
  return CATALOG_COURSES.find((c) => c.slug === slug);
}

export function getAllCourses(): CourseData[] {
  return CATALOG_COURSES;
}
