/** Built-in quizzes so every lesson has practice even before admin seeds DB quizzes. */

export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation?: string;
};

export type BuiltInLessonQuiz = {
  title: string;
  passing_score: number;
  xp_reward: number;
  questions: LessonQuizQuestion[];
};

const DEFAULT_QUIZ: BuiltInLessonQuiz = {
  title: "Lesson check",
  passing_score: 70,
  xp_reward: 15,
  questions: [
    {
      id: "default-1",
      prompt: "Which command prints your current working directory?",
      choices: ["ls", "pwd", "cd", "cat"],
      correct_index: 1,
      explanation: "`pwd` means Print Working Directory.",
    },
    {
      id: "default-2",
      prompt: "What does `ls -la` show?",
      choices: ["Only hidden files", "Detailed listing including hidden files", "Disk usage only", "Running processes"],
      correct_index: 1,
      explanation: "`-l` is long format; `-a` includes hidden (dot) files.",
    },
    {
      id: "default-3",
      prompt: "Where do user home folders usually live on Linux?",
      choices: ["/etc", "/var", "/home", "/boot"],
      correct_index: 2,
      explanation: "User homes are typically under `/home`.",
    },
  ],
};

export const LESSON_QUIZZES: Record<string, BuiltInLessonQuiz> = {
  "01-welcome-to-linux": {
    title: "Welcome to Linux — quiz",
    passing_score: 70,
    xp_reward: 15,
    questions: [
      {
        id: "w1",
        prompt: "Linux is commonly used for…",
        choices: ["Servers and cloud only", "Servers, cloud, phones, and DevOps tools", "Windows desktops only", "Printer firmware only"],
        correct_index: 1,
        explanation: "Linux runs servers, Android phones, cloud VMs, containers, and more.",
      },
      {
        id: "w2",
        prompt: "Which command shows your username?",
        choices: ["pwd", "whoami", "mkdir", "echo"],
        correct_index: 1,
        explanation: "`whoami` prints the current user name.",
      },
      {
        id: "w3",
        prompt: "What does `uname -a` help you see?",
        choices: ["Only file sizes", "Kernel and system information", "Your password", "Git remotes"],
        correct_index: 1,
        explanation: "`uname -a` prints kernel and system details.",
      },
    ],
  },
  "02-terminal-basics": {
    title: "Terminal Basics — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "t1",
        prompt: "Which command lists files in the current directory?",
        choices: ["pwd", "ls", "cd", "rm"],
        correct_index: 1,
        explanation: "`ls` lists directory contents.",
      },
      {
        id: "t2",
        prompt: "How do you change into `/home/learner`?",
        choices: ["ls /home/learner", "cd /home/learner", "pwd /home/learner", "cat /home/learner"],
        correct_index: 1,
        explanation: "`cd` changes the current directory.",
      },
      {
        id: "t3",
        prompt: "What does `history` show?",
        choices: ["Disk partitions", "Past shell commands", "Running services", "User passwords"],
        correct_index: 1,
        explanation: "`history` lists previously entered commands.",
      },
    ],
  },
  "03-files-and-folders": {
    title: "Files & Folders — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "f1",
        prompt: "Which command creates a directory (and parents if needed)?",
        choices: ["touch -p", "mkdir -p", "rm -rf", "cat >"],
        correct_index: 1,
        explanation: "`mkdir -p` creates nested folders as needed.",
      },
      {
        id: "f2",
        prompt: "Which path usually holds system configuration files?",
        choices: ["/home", "/etc", "/tmp", "/mnt"],
        correct_index: 1,
        explanation: "`/etc` is the classic config directory.",
      },
      {
        id: "f3",
        prompt: "What does `cp notes.txt notes.bak` do?",
        choices: ["Deletes notes.txt", "Copies notes.txt to notes.bak", "Moves notes.txt", "Renames the folder"],
        correct_index: 1,
        explanation: "`cp` copies a file to a new name/path.",
      },
    ],
  },
  "04-users-and-permissions": {
    title: "Users & Permissions — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "u1",
        prompt: "What does permission bit `x` mean on a file?",
        choices: ["Readable", "Writable", "Executable", "Hidden"],
        correct_index: 2,
        explanation: "`x` allows execution (or enter for directories).",
      },
      {
        id: "u2",
        prompt: "Which command shows your user id and groups?",
        choices: ["whoami", "id", "passwd", "sudo"],
        correct_index: 1,
        explanation: "`id` prints uid, gid, and groups.",
      },
      {
        id: "u3",
        prompt: "What does `chmod 755 script.sh` typically allow?",
        choices: ["No one can run it", "Owner rwx; group/others rx", "World-writable only", "Delete the file"],
        correct_index: 1,
        explanation: "755 = rwxr-xr-x.",
      },
    ],
  },
  "05-packages": {
    title: "Packages — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "p1",
        prompt: "On Debian/Ubuntu, which tool installs packages?",
        choices: ["yum", "apt", "pacman only", "brew"],
        correct_index: 1,
        explanation: "`apt` is the common package manager on Debian/Ubuntu.",
      },
      {
        id: "p2",
        prompt: "Why update package indexes before installing?",
        choices: ["To wipe /home", "To fetch latest package lists", "To reboot", "To change hostname"],
        correct_index: 1,
        explanation: "`apt update` refreshes package metadata.",
      },
      {
        id: "p3",
        prompt: "What is a package?",
        choices: ["A kernel panic", "Bundled software ready to install", "A user password", "A partition table"],
        correct_index: 1,
        explanation: "Packages bundle apps/libraries for the package manager.",
      },
    ],
  },
  "06-systemd-services": {
    title: "systemd Services — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "s1",
        prompt: "Which command restarts a systemd service?",
        choices: ["systemctl restart <service>", "service kill <service>", "apt restart", "chmod restart"],
        correct_index: 0,
        explanation: "`systemctl restart` stops and starts the unit.",
      },
      {
        id: "s2",
        prompt: "How do you check if a service is running?",
        choices: ["systemctl status <service>", "ls /etc", "pwd", "whoami"],
        correct_index: 0,
        explanation: "`systemctl status` shows unit state.",
      },
      {
        id: "s3",
        prompt: "What does `systemctl enable` do?",
        choices: ["Deletes logs", "Starts the service on boot", "Formats disks", "Changes shell"],
        correct_index: 1,
        explanation: "Enable links the unit to start at boot.",
      },
    ],
  },
  "07-networking": {
    title: "Networking — quiz",
    passing_score: 70,
    xp_reward: 20,
    questions: [
      {
        id: "n1",
        prompt: "Which command often shows IP addresses on modern Linux?",
        choices: ["ip addr", "mkdir", "chmod", "history"],
        correct_index: 0,
        explanation: "`ip addr` (or `ip a`) shows interface addresses.",
      },
      {
        id: "n2",
        prompt: "What does `ping` test?",
        choices: ["Disk space", "Reachability of a host", "User passwords", "Package versions"],
        correct_index: 1,
        explanation: "`ping` checks network reachability via ICMP.",
      },
      {
        id: "n3",
        prompt: "Port 22 is commonly used by…",
        choices: ["HTTP", "SSH", "DNS", "SMTP"],
        correct_index: 1,
        explanation: "SSH typically listens on port 22.",
      },
    ],
  },
  "08-course-capstone": {
    title: "Course Capstone — quiz",
    passing_score: 70,
    xp_reward: 25,
    questions: [
      {
        id: "c1",
        prompt: "A solid Linux admin workflow often includes…",
        choices: ["Guessing only", "Terminal skills, files, users, packages, services, networking", "Avoiding logs", "Disabling all networking"],
        correct_index: 1,
        explanation: "Those are the core foundations covered in this course.",
      },
      {
        id: "c2",
        prompt: "Where should you practice commands safely in AfroKernel?",
        choices: ["Production root only", "The Linux Lab", "Delete /etc first", "Never practice"],
        correct_index: 1,
        explanation: "Use the in-browser Lab to practice safely.",
      },
      {
        id: "c3",
        prompt: "After finishing lessons, a good next step is…",
        choices: ["Ignore quizzes", "Take the practice quiz and keep using the Lab", "Uninstall Linux", "Disable the terminal"],
        correct_index: 1,
        explanation: "Practice quizzes and Lab drills lock in the skills.",
      },
    ],
  },
};

export function getBuiltInQuiz(lessonSlug: string): BuiltInLessonQuiz {
  return LESSON_QUIZZES[lessonSlug] ?? DEFAULT_QUIZ;
}
