export interface CheatSheetEntry {
  command: string;
  description: string;
  example?: string;
  flags?: string;
}

export interface CheatSheetCategory {
  id: string;
  title: string;
  icon: string;
  summary: string;
  sections: {
    sectionTitle: string;
    items: CheatSheetEntry[];
  }[];
}

export const CHEATSHEETS_DATA: CheatSheetCategory[] = [
  {
    id: "linux-basics",
    title: "Linux Command Line",
    icon: "🐧",
    summary: "Essential navigation, file manipulation, search, and system inspection commands.",
    sections: [
      {
        sectionTitle: "Navigation & File Operations",
        items: [
          {
            command: "ls -lah",
            description: "List all files with details, human-readable sizes, and hidden files",
            example: "ls -lah /var/log",
          },
          {
            command: "cd -",
            description: "Switch back to previous working directory",
            example: "cd -",
          },
          {
            command: "mkdir -p /path/to/dir",
            description: "Create parent directories as needed without error",
            example: "mkdir -p project/src/components",
          },
          {
            command: "cp -rv source/ dest/",
            description: "Copy directory recursively with verbose progress",
            example: "cp -rv /etc/nginx /backup/nginx",
          },
          {
            command: "rsync -avzP source/ dest/",
            description: "Sync directories with compression and resumed transfer support",
            example: "rsync -avzP ./build/ server:/var/www/html/",
          },
          {
            command: "find /path -name '*.log' -mtime -7",
            description: "Find log files modified within the last 7 days",
            example: "find /var/log -type f -name '*.log' -mtime -7",
          },
          {
            command: "tar -czvf archive.tar.gz /folder",
            description: "Create compressed tar.gz archive from a folder",
            example: "tar -czvf backup.tar.gz /var/www",
          },
          {
            command: "tar -xzvf archive.tar.gz",
            description: "Extract compressed tar.gz archive to current directory",
            example: "tar -xzvf backup.tar.gz",
          },
        ],
      },
      {
        sectionTitle: "System & Resource Inspection",
        items: [
          {
            command: "df -h",
            description: "Display disk space usage for all mounted filesystems in GB/MB",
            example: "df -hT",
          },
          {
            command: "du -sh * | sort -hr | head -10",
            description: "Find top 10 largest folders/files in current directory",
            example: "du -sh /var/* | sort -hr",
          },
          {
            command: "free -h",
            description: "Display total, used, and available RAM and Swap space",
            example: "free -h",
          },
          {
            command: "uptime -p",
            description: "Display how long the system has been running in pretty format",
            example: "uptime -p",
          },
          {
            command: "sudo journalctl -u nginx -n 50 -f",
            description: "Follow last 50 log lines for a specific systemd service in real time",
            example: "sudo journalctl -u nginx -f",
          },
        ],
      },
    ],
  },
  {
    id: "bash-scripting",
    title: "Bash Scripting",
    icon: "📜",
    summary: "Bash syntax, variables, conditionals, loops, functions, and error handling.",
    sections: [
      {
        sectionTitle: "Safety & Strict Mode",
        items: [
          {
            command: "set -euo pipefail",
            description:
              "Bash strict mode: exit on error (-e), undefined var (-u), pipe failure (pipefail)",
            example: "#!/usr/bin/env bash\nset -euo pipefail",
          },
          {
            command: "trap 'cleanup' EXIT",
            description: "Execute cleanup function on script termination or error",
            example: "trap 'rm -rf $TMP_DIR' EXIT",
          },
        ],
      },
      {
        sectionTitle: "Conditionals & Loops",
        items: [
          {
            command: 'if [[ -f "$FILE" ]]; then ... fi',
            description: "Check if a regular file exists and is accessible",
            example: 'if [[ -f "/etc/hosts" ]]; then echo "Found"; fi',
          },
          {
            command: 'if [[ -d "$DIR" ]]; then ... fi',
            description: "Check if a directory exists",
            example: 'if [[ -d "/var/log" ]]; then cd /var/log; fi',
          },
          {
            command: 'if [[ -z "$VAR" ]]; then ... fi',
            description: "Check if a string variable is empty",
            example: 'if [[ -z "${API_KEY:-}" ]]; then echo "Missing API Key"; exit 1; fi',
          },
          {
            command: 'for item in "${ARRAY[@]}"; do ... done',
            description: "Iterate safely over array elements handling spaces",
            example: 'for server in "${SERVERS[@]}"; do ping -c 1 "$server"; done',
          },
        ],
      },
    ],
  },
  {
    id: "vim-cheatsheet",
    title: "Vim & Neovim",
    icon: "⚡",
    summary: "Vim modes, navigation, editing shortcuts, search/replace, and registers.",
    sections: [
      {
        sectionTitle: "Modes & Navigation",
        items: [
          {
            command: "i / a / o",
            description:
              "Enter Insert mode: before cursor (i), after cursor (a), new line below (o)",
          },
          { command: "Esc / Ctrl+[", description: "Return to Normal Mode" },
          {
            command: "gg / G",
            description: "Jump to first line of file (gg) / jump to last line (G)",
          },
          {
            command: ":%s/old/new/gc",
            description:
              "Search and replace 'old' with 'new' throughout entire file with confirmation",
          },
          {
            command: "yy / dd / p",
            description: "Yank (copy) line (yy), delete (cut) line (dd), paste below (p)",
          },
          { command: ":wq  or  :x  or  ZZ", description: "Save file and exit Vim" },
          { command: ":q!", description: "Force quit without saving changes" },
        ],
      },
    ],
  },
  {
    id: "ssh-cheatsheet",
    title: "SSH & Remote Access",
    icon: "🔑",
    summary: "SSH keys generation, config file syntax, tunneling, and file transfers.",
    sections: [
      {
        sectionTitle: "Keys & Connections",
        items: [
          {
            command: "ssh-keygen -t ed25519 -C 'user@email.com'",
            description: "Generate modern, high-security Ed25519 SSH keypair",
          },
          {
            command: "ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server",
            description: "Copy public SSH key to remote server's authorized_keys in 1 step",
          },
          {
            command: "ssh -L 8080:localhost:80 user@remote-server",
            description:
              "Local port forward: access remote server port 80 locally at http://localhost:8080",
          },
          {
            command: "scp -P 22 -r /local/dir user@remote:/remote/dir",
            description: "Securely copy files to remote server over SSH",
          },
        ],
      },
    ],
  },
  {
    id: "docker-cheatsheet",
    title: "Docker & Containers",
    icon: "🐳",
    summary: "Docker containers, images, volumes, networks, compose, and cleanup commands.",
    sections: [
      {
        sectionTitle: "Containers & Lifecycle",
        items: [
          {
            command:
              "docker run -d --name web -p 80:80 -v ./html:/usr/share/nginx/html:ro nginx:alpine",
            description: "Run container detached with port mapping and read-only volume mount",
          },
          {
            command: "docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'",
            description: "List all containers in clean formatted table",
          },
          {
            command: "docker exec -it <container> /bin/sh",
            description: "Open interactive shell inside a running container",
          },
          {
            command: "docker logs -f --tail 100 <container>",
            description: "Follow live container log output starting from last 100 lines",
          },
          {
            command: "docker system prune -af --volumes",
            description: "Wipe all unused containers, images, build cache, and unused volumes",
          },
        ],
      },
    ],
  },
  {
    id: "systemd-cheatsheet",
    title: "Systemd & Services",
    icon: "⚙️",
    summary: "Service management, log analysis with journalctl, and system timers.",
    sections: [
      {
        sectionTitle: "Service Control",
        items: [
          {
            command: "sudo systemctl enable --now <service>",
            description: "Enable service to start on boot AND start it immediately right now",
          },
          {
            command: "sudo systemctl restart <service>",
            description: "Restart a running service daemon",
          },
          {
            command: "sudo systemctl status <service>",
            description: "Inspect active status, memory usage, PID, and recent log snippets",
          },
          {
            command: "sudo systemctl daemon-reload",
            description:
              "Reload systemd configuration after editing unit file in /etc/systemd/system/",
          },
          {
            command: "sudo journalctl -xeu <service>",
            description: "Inspect extended error logs with explanations for a failed service",
          },
        ],
      },
    ],
  },
];
