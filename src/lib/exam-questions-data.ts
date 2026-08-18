export interface ExamQuestion {
  id: number;
  track: "linux" | "security" | "devops" | "networking";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain: string;
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    track: "linux",
    domain: "Permissions & File System",
    question: "What permission set does the octal value '754' represent in Linux?",
    options: [
      "Owner: rwx, Group: r-x, Others: r--",
      "Owner: rwx, Group: rw-, Others: r--",
      "Owner: r-x, Group: rwx, Others: --x",
      "Owner: rwx, Group: r--, Others: r-x",
    ],
    correctIndex: 0,
    explanation:
      "7 = 4+2+1 (rwx for owner), 5 = 4+0+1 (r-x for group), 4 = 4+0+0 (r-- for others).",
  },
  {
    id: 2,
    track: "linux",
    domain: "Process Management",
    question: "Which signal is sent by the command 'kill -9 <PID>'?",
    options: [
      "SIGTERM (Graceful termination)",
      "SIGKILL (Uncatchable immediate force kill)",
      "SIGINT (Keyboard interrupt)",
      "SIGHUP (Hangup / reload config)",
    ],
    correctIndex: 1,
    explanation:
      "SIGKILL (signal 9) cannot be caught, blocked, or ignored by the target process; the kernel immediately terminates it.",
  },
  {
    id: 3,
    track: "linux",
    domain: "System Administration",
    question:
      "Which command reloads systemd manager configuration after modifying a service unit file in /etc/systemd/system/?",
    options: [
      "systemctl restart-all",
      "systemctl daemon-reload",
      "systemctl reload-system",
      "systemd --rebuild-cache",
    ],
    correctIndex: 1,
    explanation:
      "'systemctl daemon-reload' tells systemd to re-scan unit generators, re-read configuration files, and rebuild the dependency tree.",
  },
  {
    id: 4,
    track: "linux",
    domain: "Networking",
    question:
      "Which Linux file contains the mappings between hostnames and IP addresses for local static resolution?",
    options: ["/etc/resolv.conf", "/etc/hosts", "/etc/networks", "/etc/nsswitch.conf"],
    correctIndex: 1,
    explanation:
      "/etc/hosts contains static IP-to-hostname mappings queried prior to external DNS lookups.",
  },
  {
    id: 5,
    track: "linux",
    domain: "Storage & Disks",
    question: "Which command shows human-readable disk space usage for all mounted filesystems?",
    options: ["du -sh /*", "df -h", "lsblk -f", "fdisk -l"],
    correctIndex: 1,
    explanation:
      "'df -h' (disk free in human-readable units) displays total, used, and available space for all mounted filesystems.",
  },
  {
    id: 6,
    track: "security",
    domain: "Network Scanning",
    question: "What type of scan does 'nmap -sS <target>' perform?",
    options: [
      "TCP Connect Scan (completes full 3-way handshake)",
      "SYN Stealth Scan (half-open scan sending SYN and RST)",
      "UDP Port Scan",
      "ICMP Ping Sweep",
    ],
    correctIndex: 1,
    explanation:
      "-sS is the default TCP SYN scan. It sends SYN, waits for SYN-ACK, then immediately sends RST without completing the full 3-way handshake.",
  },
  {
    id: 7,
    track: "security",
    domain: "System Hardening",
    question:
      "Which SSH configuration directive in /etc/ssh/sshd_config prevents direct root logins over SSH?",
    options: [
      "AllowRootLogin no",
      "PermitRootLogin no",
      "DisableRootAccess yes",
      "RootLogin disabled",
    ],
    correctIndex: 1,
    explanation:
      "'PermitRootLogin no' ensures root cannot log in directly over SSH, forcing admins to authenticate as unprivileged users and escalate via sudo.",
  },
  {
    id: 8,
    track: "security",
    domain: "Traffic Analysis",
    question:
      "In Wireshark or tcpdump, which filter syntax matches HTTP traffic on port 80 or 8080?",
    options: [
      "port == 80 or port == 8080",
      "tcp.port in {80, 8080}",
      "protocol.http == true",
      "tcp.port == 80 || tcp.port == 8080",
    ],
    correctIndex: 3,
    explanation:
      "In Wireshark display filter syntax, 'tcp.port == 80 || tcp.port == 8080' filters packets having source or destination port 80 or 8080.",
  },
  {
    id: 9,
    track: "devops",
    domain: "Docker & Containers",
    question: "In a Dockerfile, what is the key difference between ENTRYPOINT and CMD?",
    options: [
      "ENTRYPOINT sets the default executable, while CMD provides default arguments that can be easily overridden at runtime",
      "CMD runs at build time, ENTRYPOINT runs at container startup",
      "ENTRYPOINT only accepts shell syntax, CMD only accepts JSON array syntax",
      "There is no difference; they are aliases",
    ],
    correctIndex: 0,
    explanation:
      "ENTRYPOINT defines the command that will always be executed; CMD parameters are passed as default arguments to ENTRYPOINT and can be overridden by passing arguments to 'docker run'.",
  },
  {
    id: 10,
    track: "devops",
    domain: "Kubernetes Basics",
    question: "What is the smallest deployable computing unit in Kubernetes?",
    options: ["Container", "Pod", "ReplicaSet", "Deployment"],
    correctIndex: 1,
    explanation:
      "In Kubernetes, a Pod represents a single instance of a running process and can contain one or more tightly coupled containers sharing network and storage.",
  },
];
