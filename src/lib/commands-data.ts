export interface CommandTranslation {
  windowsCmd: string;
  linuxCmd: string;
  category:
    | "Files & Navigation"
    | "Networking"
    | "Process Management"
    | "System Info"
    | "Disks & Storage"
    | "User Management"
    | "Permissions & Security";
  description: string;
  windowsExample: string;
  linuxExample: string;
  notes?: string;
}

export const COMMANDS_DATA: CommandTranslation[] = [
  {
    windowsCmd: "dir",
    linuxCmd: "ls -la",
    category: "Files & Navigation",
    description: "List directory contents including hidden files and detailed permissions.",
    windowsExample: "dir /a",
    linuxExample: "ls -la",
    notes:
      "In Linux, files starting with '.' are hidden. Use '-la' for long listing and hidden files.",
  },
  {
    windowsCmd: "cd",
    linuxCmd: "cd",
    category: "Files & Navigation",
    description: "Change current directory.",
    windowsExample: "cd C:\\Users\\Name\\Documents",
    linuxExample: "cd /home/user/documents  or  cd ~",
    notes:
      "Linux uses forward slashes '/' instead of backslashes '\\'. '~' refers to the home directory.",
  },
  {
    windowsCmd: "copy / xcopy / robocopy",
    linuxCmd: "cp -r",
    category: "Files & Navigation",
    description: "Copy files and directories recursively.",
    windowsExample: "robocopy C:\\source D:\\backup /E",
    linuxExample: "cp -r /source /backup  or  rsync -avz /source/ /backup/",
    notes: "Use 'rsync -avz' for robust backup and progress sync.",
  },
  {
    windowsCmd: "move",
    linuxCmd: "mv",
    category: "Files & Navigation",
    description: "Move or rename files and directories.",
    windowsExample: "move old.txt new.txt",
    linuxExample: "mv old.txt new.txt",
    notes: "'mv' handles both moving files to another path and renaming them.",
  },
  {
    windowsCmd: "del / rmdir / erase",
    linuxCmd: "rm -rf",
    category: "Files & Navigation",
    description: "Remove files or directories recursively.",
    windowsExample: "rmdir /s /q folder",
    linuxExample: "rm -rf folder",
    notes: "Be careful with 'rm -rf' as Linux has no Recycle Bin on the command line!",
  },
  {
    windowsCmd: "mkdir / md",
    linuxCmd: "mkdir -p",
    category: "Files & Navigation",
    description: "Create directories, including parent directories if they do not exist.",
    windowsExample: "mkdir parent\\child\\sub",
    linuxExample: "mkdir -p parent/child/sub",
    notes: "The '-p' flag creates intermediate parent folders automatically.",
  },
  {
    windowsCmd: "type",
    linuxCmd: "cat / less / bat",
    category: "Files & Navigation",
    description: "Display contents of a text file in the terminal.",
    windowsExample: "type config.txt",
    linuxExample: "cat config.txt  or  less config.txt",
    notes: "Use 'less' for paging large files (press 'q' to exit).",
  },
  {
    windowsCmd: "findstr",
    linuxCmd: "grep -rn",
    category: "Files & Navigation",
    description: "Search for patterns in files or standard input using regex.",
    windowsExample: "findstr /s /i 'error' *.log",
    linuxExample: "grep -rni 'error' *.log",
    notes: "Grep is vastly faster and supports full PCRE regex.",
  },
  {
    windowsCmd: "ipconfig /all",
    linuxCmd: "ip addr / ifconfig",
    category: "Networking",
    description: "Display network adapter configurations, IP addresses, and MAC addresses.",
    windowsExample: "ipconfig /all",
    linuxExample: "ip -br addr  or  ip a",
    notes: "'ip' is the modern standard replacing legacy 'ifconfig'.",
  },
  {
    windowsCmd: "ping",
    linuxCmd: "ping -c 4",
    category: "Networking",
    description: "Send ICMP ECHO_REQUEST packets to network hosts.",
    windowsExample: "ping 8.8.8.8",
    linuxExample: "ping -c 4 8.8.8.8",
    notes: "In Linux, ping runs indefinitely by default unless you pass '-c <count>'.",
  },
  {
    windowsCmd: "tracert",
    linuxCmd: "traceroute / mtr",
    category: "Networking",
    description: "Trace packet route to network host.",
    windowsExample: "tracert google.com",
    linuxExample: "traceroute google.com  or  mtr google.com",
    notes: "'mtr' provides a continuous real-time interactive traceroute.",
  },
  {
    windowsCmd: "netstat -ano",
    linuxCmd: "ss -tulpn",
    category: "Networking",
    description: "Display active listening network sockets, ports, and associated process IDs.",
    windowsExample: "netstat -ano | findstr :80",
    linuxExample: "sudo ss -tulpn | grep :80",
    notes: "'ss' (socket statistics) is the fast modern replacement for netstat.",
  },
  {
    windowsCmd: "nslookup",
    linuxCmd: "dig / nslookup",
    category: "Networking",
    description: "Query DNS name servers for DNS records.",
    windowsExample: "nslookup google.com",
    linuxExample: "dig google.com +short",
    notes: "'dig' provides cleaner, more detailed DNS query breakdowns.",
  },
  {
    windowsCmd: "curl / Invoke-WebRequest",
    linuxCmd: "curl -I / wget",
    category: "Networking",
    description: "Transfer data from or to a server using HTTP/HTTPS/FTP.",
    windowsExample: "curl -Uri https://api.site.com",
    linuxExample: "curl -sL https://api.site.com",
    notes: "cURL is standard on all Linux distributions.",
  },
  {
    windowsCmd: "tasklist",
    linuxCmd: "ps aux / top / htop",
    category: "Process Management",
    description: "Display currently running processes and system resource usage.",
    windowsExample: "tasklist",
    linuxExample: "ps aux | grep nginx  or  htop",
    notes: "'htop' or 'btop' provides a visual interactive process manager.",
  },
  {
    windowsCmd: "taskkill /F /PID 1234",
    linuxCmd: "kill -9 1234 / killall nginx",
    category: "Process Management",
    description: "Terminate process by Process ID (PID) or process name.",
    windowsExample: "taskkill /F /IM chrome.exe",
    linuxExample: "killall -9 chrome  or  kill -9 1234",
    notes: "'kill -15' sends graceful SIGTERM, 'kill -9' sends force SIGKILL.",
  },
  {
    windowsCmd: "systeminfo",
    linuxCmd: "uname -a / neofetch / inxi -Fz",
    category: "System Info",
    description: "Display detailed system hardware, kernel, OS, and uptime info.",
    windowsExample: "systeminfo",
    linuxExample: "uname -a && uptime && inxi -Fz",
    notes: "'hostnamectl' and 'uname -r' give OS and kernel release.",
  },
  {
    windowsCmd: "cls / clear-host",
    linuxCmd: "clear / Ctrl+L",
    category: "System Info",
    description: "Clear terminal screen output.",
    windowsExample: "cls",
    linuxExample: "clear",
    notes: "Pressing 'Ctrl + L' works in any bash/zsh shell immediately.",
  },
  {
    windowsCmd: "whoami",
    linuxCmd: "whoami / id",
    category: "User Management",
    description: "Display current active user and group memberships (UID/GID).",
    windowsExample: "whoami /all",
    linuxExample: "id",
    notes: "'id' shows UID, GID, and secondary groups.",
  },
  {
    windowsCmd: "icacls / attrib",
    linuxCmd: "chmod / chown",
    category: "Permissions & Security",
    description: "Change file permissions (read, write, execute) and file ownership.",
    windowsExample: "icacls file.txt /grant Users:F",
    linuxExample: "chmod 755 file.sh && chown user:group file.sh",
    notes: "Linux uses 3 octal digits: Owner, Group, Others (e.g., 755).",
  },
  {
    windowsCmd: "schtasks / taskschd.msc",
    linuxCmd: "crontab -e / systemd timers",
    category: "System Info",
    description: "Schedule automated background tasks and jobs.",
    windowsExample: "schtasks /create /sc daily /tn Backup /tr script.bat",
    linuxExample: "crontab -e",
    notes: "Use cron syntax e.g., '0 2 * * * /path/to/backup.sh'.",
  },
  {
    windowsCmd: "services.msc / net start",
    linuxCmd: "systemctl status / start / enable",
    category: "System Info",
    description: "Manage background system services and daemons.",
    windowsExample: "net start nginx",
    linuxExample: "sudo systemctl enable --now nginx",
    notes: "'enable --now' starts the service immediately and configures auto-start on boot.",
  },
];
