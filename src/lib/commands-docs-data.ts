import { COMMANDS_DATA } from "./commands-data";

export interface LinuxCommandDoc {
  slug: string;
  name: string;
  category: string;
  short_desc: string;
  syntax: string;
  description: string;
  examples: Array<{ cmd: string; out?: string }>;
  common_mistakes: string[];
  related: string[];
}

export const FALLBACK_COMMANDS_DOCS: LinuxCommandDoc[] = [
  {
    slug: "ls",
    name: "ls",
    category: "Files & Navigation",
    short_desc: "List directory contents with file attributes and permissions",
    syntax: "ls [OPTIONS]... [FILE]...",
    description:
      "List information about the FILEs (the current directory by default). Sort entries alphabetically if neither -cftuvSUX nor --sort is specified. Common flags include -l for long listing format, -a for all files including hidden ones, and -h for human readable file sizes.",
    examples: [
      { cmd: "ls -la", out: "total 32K\ndrwxr-xr-x  5 root root 4.0K Sep 03 10:00 .\ndrwxr-xr-x 22 root root 4.0K Sep 03 09:30 ..\n-rw-r--r--  1 user user  220 Sep 03 10:00 .bashrc" },
      { cmd: "ls -lh /var/log", out: "-rw-r----- 1 syslog adm 1.2M Sep 03 12:00 syslog" },
      { cmd: "ls -lt --time=atime", out: "Sorts directory contents by access time, newest first" },
    ],
    common_mistakes: [
      "Forgetting the -a flag and thinking hidden configuration files (.bashrc, .env) do not exist.",
      "Parsing ls output with shell scripts; use find or globbing instead for filenames with spaces.",
    ],
    related: ["cd", "pwd", "tree", "find", "stat"],
  },
  {
    slug: "cd",
    name: "cd",
    category: "Files & Navigation",
    short_desc: "Change the current working directory",
    syntax: "cd [DIR]",
    description:
      "Change the current shell working directory to DIR. The default DIR is the value of the HOME shell variable. Use '-' to switch to previous working directory, and '..' to navigate up one level.",
    examples: [
      { cmd: "cd /etc/nginx", out: "Switches working directory to /etc/nginx" },
      { cmd: "cd ~", out: "Switches to user's home directory (/home/username)" },
      { cmd: "cd -", out: "Switches back to previously active working directory" },
      { cmd: "cd ../..", out: "Moves two directory levels up in hierarchy" },
    ],
    common_mistakes: [
      "Using Windows backslashes (\\) instead of Linux forward slashes (/).",
      "Forgetting quotes around directory names that contain spaces (e.g. cd 'My Documents').",
    ],
    related: ["pwd", "ls", "pushd", "popd"],
  },
  {
    slug: "grep",
    name: "grep",
    category: "Files & Navigation",
    short_desc: "Print lines that match regular expression patterns",
    syntax: "grep [OPTIONS] PATTERN [FILE...]",
    description:
      "grep searches for PATTERN in each FILE. A PATTERN is one or more lines separated by newline characters. grep prints each line that matches a pattern.",
    examples: [
      { cmd: "grep -rn 'ERROR' /var/log/nginx/", out: "/var/log/nginx/error.log:42: [crit] 1234#0: connection failed" },
      { cmd: "grep -i 'failed' auth.log", out: "Case-insensitive search for authentication failure lines" },
      { cmd: "ps aux | grep node", out: "Filters active processes for NodeJS instances" },
    ],
    common_mistakes: [
      "Not escaping special regex characters like brackets or periods.",
      "Forgetting -r (recursive) flag when scanning directories of logs.",
    ],
    related: ["find", "awk", "sed", "rg"],
  },
  {
    slug: "chmod",
    name: "chmod",
    category: "Permissions & Security",
    short_desc: "Change file mode bits and read/write/execute permissions",
    syntax: "chmod [OPTIONS] MODE[,MODE]... FILE...",
    description:
      "chmod changes the file mode bits of each given file according to mode, which can be either a symbolic representation of changes to make, or an octal number representing the bit pattern for the new mode bits (4=read, 2=write, 1=execute).",
    examples: [
      { cmd: "chmod 755 script.sh", out: "Owner gets rwx, group & others get r-x" },
      { cmd: "chmod 600 ~/.ssh/id_rsa", out: "Owner gets read/write only; required by SSH clients" },
      { cmd: "chmod +x run.sh", out: "Grants execute permission to all classes" },
      { cmd: "chmod -R 750 /var/www", out: "Recursively applies permissions to directory tree" },
    ],
    common_mistakes: [
      "Using chmod 777 in production environments, creating massive security vulnerabilities.",
      "Leaving private keys (~/.ssh/id_ed25519) accessible to group or others.",
    ],
    related: ["chown", "chgrp", "umask", "ls"],
  },
  {
    slug: "systemctl",
    name: "systemctl",
    category: "Process Management",
    short_desc: "Control the systemd system and service manager",
    syntax: "systemctl [COMMAND] [UNIT...]",
    description:
      "systemctl may be used to introspect and control the state of the systemd system and service manager. Common commands include start, stop, restart, enable, disable, and status.",
    examples: [
      { cmd: "systemctl status nginx", out: "● nginx.service - A high performance web server\n   Active: active (running)" },
      { cmd: "sudo systemctl restart docker", out: "Restarts docker container daemon" },
      { cmd: "sudo systemctl enable --now postgresql", out: "Enables service at boot and starts it immediately" },
    ],
    common_mistakes: [
      "Forgetting 'sudo' when altering system services (start, restart, stop).",
      "Confusing 'enable' (runs at startup) with 'start' (runs right now in current session).",
    ],
    related: ["journalctl", "service", "ps", "top"],
  },
  {
    slug: "find",
    name: "find",
    category: "Files & Navigation",
    short_desc: "Search for files in a directory hierarchy",
    syntax: "find [-H] [-L] [-P] [path...] [expression]",
    description:
      "find searches the directory tree rooted at each given file name by evaluating the given expression from left to right, according to the rules of precedence, until the outcome is known.",
    examples: [
      { cmd: "find /var/log -type f -name '*.log' -mtime -7", out: "Finds log files modified within the last 7 days" },
      { cmd: "find . -type f -size +100M", out: "Finds files larger than 100 megabytes in current tree" },
      { cmd: "find . -name '*.bak' -exec rm -f {} \\;", out: "Finds and deletes all backup files" },
    ],
    common_mistakes: [
      "Forgetting to quote glob patterns like '*.log', causing shell expansion before find executes.",
      "Omitting the ending '\\;' or '+' when using -exec.",
    ],
    related: ["grep", "locate", "which", "whereis"],
  },
  {
    slug: "tar",
    name: "tar",
    category: "Disks & Storage",
    short_desc: "Archive utility for creating and extracting tape archives",
    syntax: "tar [OPTIONS] [ARCHIVE] [FILE/DIR...]",
    description:
      "GNU tar is an archiving program designed to store multiple files in a single archive file, and to manipulate such archives. Flags: c=create, x=extract, v=verbose, z=gzip, f=file.",
    examples: [
      { cmd: "tar -czvf archive.tar.gz /path/to/folder", out: "Creates gzipped tarball archive of specified folder" },
      { cmd: "tar -xzvf archive.tar.gz", out: "Extracts gzipped tarball into current directory" },
      { cmd: "tar -tvf backup.tar.gz", out: "Lists files inside archive without extracting" },
    ],
    common_mistakes: [
      "Forgetting the -f flag or putting flags after -f (e.g. -fz instead of -zf).",
      "Extracting untrusted archives without checking the destination directory.",
    ],
    related: ["gzip", "bzip2", "zip", "unzip"],
  },
  {
    slug: "curl",
    name: "curl",
    category: "Networking",
    short_desc: "Transfer data from or to a server using supported protocols",
    syntax: "curl [options...] <url>",
    description:
      "curl is a tool for transferring data from or to a server using HTTP, HTTPS, FTP, and many other protocols. It supports HTTP POST, cookies, user authentication, and SSL connections.",
    examples: [
      { cmd: "curl -I https://example.com", out: "HTTP/2 200\ncontent-type: text/html; charset=UTF-8" },
      { cmd: "curl -O https://example.com/file.zip", out: "Downloads file saving it with remote name" },
      { cmd: "curl -s https://api.ipify.org", out: "Prints public IP address silently" },
    ],
    common_mistakes: [
      "Not using -L flag when the URL redirects (HTTP 301/302).",
      "Blindly piping curl output to bash (e.g. curl | bash) without verifying contents.",
    ],
    related: ["wget", "ping", "netstat", "ip"],
  },
];

// Dynamically augment with any other commands from COMMANDS_DATA
export function getStaticCommandsList(): Array<{
  slug: string;
  name: string;
  category: string;
  short_desc: string;
}> {
  const map = new Map<string, { slug: string; name: string; category: string; short_desc: string }>();

  // Add all rich docs first
  FALLBACK_COMMANDS_DOCS.forEach((d) => {
    map.set(d.slug, {
      slug: d.slug,
      name: d.name,
      category: d.category,
      short_desc: d.short_desc,
    });
  });

  // Add commands from COMMANDS_DATA
  COMMANDS_DATA.forEach((item) => {
    const rawCmd = item.linuxCmd.split(" ")[0].trim();
    if (rawCmd && !map.has(rawCmd) && /^[a-zA-Z0-9_-]+$/.test(rawCmd)) {
      map.set(rawCmd, {
        slug: rawCmd,
        name: rawCmd,
        category: item.category,
        short_desc: item.description,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getStaticCommandDoc(slug: string): LinuxCommandDoc | null {
  const norm = slug.toLowerCase().trim();
  const direct = FALLBACK_COMMANDS_DOCS.find((d) => d.slug === norm);
  if (direct) return direct;

  const translation = COMMANDS_DATA.find((item) => {
    const raw = item.linuxCmd.split(" ")[0].trim().toLowerCase();
    return raw === norm;
  });

  if (translation) {
    return {
      slug: norm,
      name: norm,
      category: translation.category,
      short_desc: translation.description,
      syntax: `${norm} [OPTIONS] [ARGUMENTS]`,
      description: `${translation.description}\n\nLinux Equivalent of Windows: \`${translation.windowsCmd}\`\n\nNotes: ${translation.notes || "Standard GNU/Linux core utility."}`,
      examples: [
        { cmd: translation.linuxExample, out: `Demonstration of ${norm} in terminal.` },
      ],
      common_mistakes: [
        `Assuming arguments are identical to Windows '${translation.windowsCmd}'.`,
        `Forgetting Linux command line arguments are case-sensitive.`,
      ],
      related: ["ls", "cd", "grep", "chmod"],
    };
  }

  return null;
}
