export interface ExamQuestion {
  id: number;
  track: "linux" | "rhel" | "scripting";
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
    track: "scripting",
    domain: "Bash Redirection & I/O",
    question:
      "Which syntax redirects both standard output (stdout) and standard error (stderr) to a file named 'output.log' in standard Bash?",
    options: [
      "command > output.log 2>&1",
      "command 2> output.log",
      "command >> stdout.log < stderr",
      "command | tee -e output.log",
    ],
    correctIndex: 0,
    explanation:
      "In standard Bash, 'command > output.log 2>&1' redirects stdout to output.log, then duplicates file descriptor 2 (stderr) to file descriptor 1 (stdout).",
  },
  {
    id: 7,
    track: "linux",
    domain: "User & Security Administration",
    question:
      "Which command safely opens the /etc/sudoers file with syntax validation before saving?",
    options: ["nano /etc/sudoers", "visudo", "sudo-edit", "vim /etc/sudoers"],
    correctIndex: 1,
    explanation:
      "'visudo' locks the sudoers file against simultaneous edits and verifies syntax before saving to prevent corrupting the file.",
  },
  {
    id: 8,
    track: "scripting",
    domain: "Shell Scripting Variables",
    question:
      "In a Bash script, which special parameter holds the exit status of the most recently executed foreground pipeline?",
    options: ["$!", "$$", "$?", "$#"],
    correctIndex: 2,
    explanation:
      "'$?' expands to the exit status of the most recently executed foreground command, where 0 indicates success.",
  },
  {
    id: 9,
    track: "rhel",
    domain: "Enterprise Linux (RHEL 9)",
    question:
      "Which command verifies and queries all installed RPM packages matching 'nginx' on Red Hat Enterprise Linux?",
    options: [
      "rpm -qa | grep nginx",
      "apt list --installed nginx",
      "pkg_info | grep nginx",
      "pacman -Q nginx",
    ],
    correctIndex: 0,
    explanation:
      "'rpm -qa' queries all installed RPM packages on RHEL and Enterprise Linux distributions, which can be piped to grep.",
  },
  {
    id: 10,
    track: "linux",
    domain: "Archiving & Compression",
    question:
      "Which 'tar' flags create a new gzip-compressed archive named 'archive.tar.gz' from a directory '/data'?",
    options: [
      "tar -xzvf archive.tar.gz /data",
      "tar -czvf archive.tar.gz /data",
      "tar -jcvf archive.tar.gz /data",
      "tar -tzvf archive.tar.gz /data",
    ],
    correctIndex: 1,
    explanation:
      "-c creates a new archive, -z uses gzip compression, -v provides verbose progress, and -f specifies the archive file.",
  },
  {
    id: 11,
    track: "scripting",
    domain: "Text Processing",
    question:
      "Which command prints only the first column (field) of a space-delimited text file named 'users.txt'?",
    options: [
      "awk '{print $1}' users.txt",
      "sed 's/column/1/' users.txt",
      "grep -col 1 users.txt",
      "cat users.txt | head -c 1",
    ],
    correctIndex: 0,
    explanation:
      "awk defaults to whitespace separation and '{print $1}' prints the first field of each record.",
  },
  {
    id: 12,
    track: "rhel",
    domain: "SELinux & System Security",
    question:
      "Which command checks the current operational mode of SELinux (Enforcing, Permissive, or Disabled)?",
    options: ["getenforce", "selinux-status", "chkconfig selinux", "systemctl status selinux"],
    correctIndex: 0,
    explanation:
      "'getenforce' quickly displays the current operational state of Security-Enhanced Linux (SELinux) on RHEL systems.",
  },
];
