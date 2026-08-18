export interface MigrationStep {
  title: string;
  desc: string;
  commands?: string[];
  warning?: string;
  tip?: string;
}

export interface MigrationGuide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  steps: MigrationStep[];
}

export const MIGRATION_GUIDES: MigrationGuide[] = [
  {
    id: "windows-to-linux",
    title: "Switching from Windows 10/11 to Linux",
    subtitle:
      "Complete safe migration guide: backup, software replacement, Live USB testing, and installation.",
    icon: "🪟",
    estimatedTime: "45 minutes",
    difficulty: "Beginner",
    steps: [
      {
        title: "1. Audit Your Daily Software & Back Up Important Files",
        desc: "List every app you use every day (browser, office, media, games). Check if there is a Linux native version or an open-source alternative in our App Directory. Back up your Documents, Pictures, Code repositories, and browser bookmarks to an external drive or cloud storage.",
        tip: "Export your browser passwords, bookmarks, and 2FA recovery keys before wiping any system.",
      },
      {
        title: "2. Prepare a Bootable Linux Live USB",
        desc: "Download an ISO for a beginner-friendly distro (Linux Mint, Ubuntu, Pop!_OS, or Zorin OS). Flash it to a USB flash drive (8GB+) using BalenaEtcher or Rufus.",
        commands: ["# In Windows: use BalenaEtcher (balena.io/etcher) or Rufus (rufus.ie)"],
        warning: "Flashing will wipe all existing data on the USB drive!",
      },
      {
        title: "3. Disable Windows Fast Startup & BitLocker (If Dual-Booting)",
        desc: "Windows Fast Startup puts NTFS partitions into a hibernated state that prevents Linux from mounting them safely. Disable 'Fast Startup' in Windows Control Panel -> Power Options. Also ensure you have your 48-digit BitLocker recovery key saved.",
        commands: ["# In Admin PowerShell to disable hibernate:\npowercfg.exe /hibernate off"],
        warning:
          "Without disabling Fast Startup, you may get 'drive is locked / read-only' errors in Linux.",
      },
      {
        title: "4. Boot from USB & Test in Live Mode",
        desc: "Restart your computer and press the BIOS/Boot Menu key (F12, F11, F2, or Del). Select your USB drive. In Live Mode, test your Wi-Fi, audio, Bluetooth, multi-monitor display, and touchpad before installing anything.",
        tip: "If everything works in Live mode without installing, it will work after installation.",
      },
      {
        title: "5. Run the Installer & Set Up Your User",
        desc: "Click 'Install OS' on the desktop. Choose 'Erase disk and install' for a dedicated Linux PC, or 'Install alongside Windows' for dual-boot. Create your username and password, then reboot when finished.",
        commands: ["# First commands after installation:\nsudo apt update && sudo apt upgrade -y"],
      },
    ],
  },
  {
    id: "macos-to-linux",
    title: "Switching from macOS to Linux",
    subtitle:
      "Transition from Apple ecosystem to Linux: keyboard shortcuts, terminal familiarity, and audio workflows.",
    icon: "🍎",
    estimatedTime: "35 minutes",
    difficulty: "Beginner",
    steps: [
      {
        title: "1. Understanding Mac vs Linux Shortcuts (Command key to Super/Ctrl)",
        desc: "In Linux, Ctrl+C / Ctrl+V are used for copy/paste in GUI apps. If you prefer the macOS Command key layout, GNOME and KDE have one-click options to map the Super key or use Kinto / Toshy shortcut managers.",
        commands: [
          "# Install Toshy for native macOS shortcuts across Linux:\ncurl -fsSL https://raw.githubusercontent.com/RedBearAK/toshy/main/setup.sh | bash",
        ],
      },
      {
        title: "2. Native Mac Apps to Linux Replacements",
        desc: "Terminal (use Alacritty / Kitty), Homebrew (Linuxbrew works natively on Linux), TextEdit (Kate / Text Editor), Preview (Evince / Okular), Logic Pro (Reaper / Ardour).",
        tip: "Homebrew works directly on Linux: /bin/bash -c '$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)'",
      },
      {
        title: "3. Intel Macs vs Apple Silicon (M1/M2/M3)",
        desc: "Older Intel MacBooks (2012-2020) work great on Linux Mint and Fedora. For Apple Silicon Macs (M1/M2/M3), use Asahi Linux / Fedora Asahi Remix for native Apple Silicon GPU acceleration.",
        commands: [
          "# For Apple Silicon M1/M2 Macs, run from macOS Terminal:\ncurl https://fedora-asahi-remix.org/install | sh",
        ],
      },
    ],
  },
  {
    id: "safe-dual-boot",
    title: "Safe Dual-Booting Guide (Windows + Linux)",
    subtitle:
      "Share your computer with both Windows and Linux without risking data loss or broken bootloaders.",
    icon: "⚡",
    estimatedTime: "40 minutes",
    difficulty: "Intermediate",
    steps: [
      {
        title: "1. Shrink Windows Partition in Disk Management",
        desc: "Open Windows Disk Management (diskmgmt.msc). Right-click your C: drive and choose 'Shrink Volume'. Allocate at least 50GB to 100GB of Unallocated space for Linux. Do NOT format this space in Windows.",
        warning:
          "Never use third-party partition tools while Windows is actively running without backups.",
      },
      {
        title: "2. Install Linux to the Free Space",
        desc: "Boot your Linux USB installer and select 'Install Alongside Windows Boot Manager' or choose manual partitioning to use the Free Space for an ext4 root partition ('/') and an EFI boot partition.",
        tip: "GRUB bootloader will automatically detect Windows and give you an OS selection menu at boot.",
      },
      {
        title: "3. Fix Windows Time Desync (UTC vs Local Time)",
        desc: "Linux sets the hardware motherboard clock to UTC, while Windows expects Local Time. Fix this by telling Linux to use Local RTC or telling Windows to use UTC via registry.",
        commands: [
          "# Run in Linux to synchronize with Windows RTC:\ntimedatectl set-local-rtc 1 --adjust-system-clock",
        ],
      },
    ],
  },
];
