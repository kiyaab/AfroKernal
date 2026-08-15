export interface AppAlternative {
  name: string;
  category: string;
  license: "Free & Open Source" | "Free / Proprietary" | "Commercial";
  description: string;
  website: string;
  votes: number;
  featured?: boolean;
  packageTypes: ("Flatpak" | "Snap" | "APT" | "Pacman" | "DNF" | "AppImage")[];
  installCmds: {
    flatpak?: string;
    apt?: string;
    pacman?: string;
    dnf?: string;
    snap?: string;
  };
}

export interface WindowsApp {
  id: string;
  name: string;
  category: "Graphics" | "Office" | "Media" | "Development" | "Communication" | "Utilities" | "Gaming" | "Security";
  icon: string;
  summary: string;
  alternatives: AppAlternative[];
}

export const APPS_DATA: WindowsApp[] = [
  {
    id: "photoshop",
    name: "Adobe Photoshop",
    category: "Graphics",
    icon: "🎨",
    summary: "Industry-standard raster graphics editor and photo manipulation suite.",
    alternatives: [
      {
        name: "GIMP",
        category: "Graphics",
        license: "Free & Open Source",
        description: "The GNU Image Manipulation Program. High-powered raster graphics editor with layered editing, scripting, and Photoshop-like keyboard plugin packs (PhotoGIMP).",
        website: "https://www.gimp.org",
        votes: 1420,
        featured: true,
        packageTypes: ["Flatpak", "APT", "Pacman", "DNF"],
        installCmds: {
          flatpak: "flatpak install flathub org.gimp.GIMP",
          apt: "sudo apt install gimp",
          pacman: "sudo pacman -S gimp",
          dnf: "sudo dnf install gimp"
        }
      },
      {
        name: "Krita",
        category: "Graphics",
        license: "Free & Open Source",
        description: "Professional digital painting and 2D illustration application with advanced brush engines, CMYK support, and stabilizer tools.",
        website: "https://krita.org",
        votes: 980,
        packageTypes: ["Flatpak", "APT", "Pacman", "AppImage"],
        installCmds: {
          flatpak: "flatpak install flathub org.kde.krita",
          apt: "sudo apt install krita",
          pacman: "sudo pacman -S krita"
        }
      },
      {
        name: "Photopea",
        category: "Graphics",
        license: "Free / Proprietary",
        description: "In-browser Photoshop replica that opens and saves native .PSD files with layers, smart objects, and filters.",
        website: "https://photopea.com",
        votes: 750,
        packageTypes: ["Flatpak"],
        installCmds: {
          flatpak: "flatpak install flathub com.github.vikdevelop.photopea-app"
        }
      }
    ]
  },
  {
    id: "msoffice",
    name: "Microsoft Office (Word, Excel, PowerPoint)",
    category: "Office",
    icon: "📄",
    summary: "Office productivity suite for word processing, spreadsheets, and presentations.",
    alternatives: [
      {
        name: "LibreOffice",
        category: "Office",
        license: "Free & Open Source",
        description: "The gold standard open-source office suite. Full compatibility with .docx, .xlsx, and .pptx formats without telemetry.",
        website: "https://www.libreoffice.org",
        votes: 1890,
        featured: true,
        packageTypes: ["Flatpak", "APT", "Pacman", "DNF"],
        installCmds: {
          flatpak: "flatpak install flathub org.libreoffice.LibreOffice",
          apt: "sudo apt install libreoffice",
          pacman: "sudo pacman -S libreoffice-fresh",
          dnf: "sudo dnf install libreoffice"
        }
      },
      {
        name: "OnlyOffice Desktop Editors",
        category: "Office",
        license: "Free & Open Source",
        description: "Modern, tabbed office suite with 100% direct native OOXML Microsoft format fidelity and collaborative editing.",
        website: "https://www.onlyoffice.com",
        votes: 1240,
        packageTypes: ["Flatpak", "Snap", "AppImage"],
        installCmds: {
          flatpak: "flatpak install flathub org.onlyoffice.desktopeditors",
          snap: "sudo snap install onlyoffice-desktopeditors"
        }
      }
    ]
  },
  {
    id: "premiere-pro",
    name: "Adobe Premiere Pro",
    category: "Media",
    icon: "🎬",
    summary: "Timeline-based non-linear video editing software.",
    alternatives: [
      {
        name: "DaVinci Resolve",
        category: "Media",
        license: "Free / Proprietary",
        description: "Hollywood-grade video editing, color grading, visual effects (Fusion), and audio post-production (Fairlight) running natively on Linux.",
        website: "https://www.blackmagicdesign.com/products/davinciresolve",
        votes: 1650,
        featured: true,
        packageTypes: ["Pacman", "APT"],
        installCmds: {
          pacman: "yay -S davinci-resolve"
        }
      },
      {
        name: "Kdenlive",
        category: "Media",
        license: "Free & Open Source",
        description: "Powerful multi-track open-source video editor built on MLT and KDE frameworks with proxy clips, keyframes, and motion tracking.",
        website: "https://kdenlive.org",
        votes: 1120,
        packageTypes: ["Flatpak", "APT", "Pacman", "AppImage"],
        installCmds: {
          flatpak: "flatpak install flathub org.kde.kdenlive",
          apt: "sudo apt install kdenlive",
          pacman: "sudo pacman -S kdenlive"
        }
      }
    ]
  },
  {
    id: "visual-studio",
    name: "Visual Studio / Notepad++",
    category: "Development",
    icon: "💻",
    summary: "Integrated development environments and text editors.",
    alternatives: [
      {
        name: "VS Code / VSCodium",
        category: "Development",
        license: "Free & Open Source",
        description: "Code editing redefined. VSCodium is 100% telemetry-free binaries of Microsoft's VS Code with full extensions marketplace.",
        website: "https://vscodium.com",
        votes: 2100,
        featured: true,
        packageTypes: ["Flatpak", "APT", "Pacman", "DNF"],
        installCmds: {
          flatpak: "flatpak install flathub com.vscodium.codium",
          apt: "sudo apt install codium",
          pacman: "sudo pacman -S vscodium"
        }
      },
      {
        name: "Notepadqq / Kate",
        category: "Development",
        license: "Free & Open Source",
        description: "Notepadqq is a Notepad++ clone for Linux with syntax highlighting for 100+ languages, regex search, and multi-cursors.",
        website: "https://notepadqq.com",
        votes: 840,
        packageTypes: ["Flatpak", "APT", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub com.notepadqq.Notepadqq",
          apt: "sudo apt install notepadqq"
        }
      }
    ]
  },
  {
    id: "discord",
    name: "Discord & Slack",
    category: "Communication",
    icon: "💬",
    summary: "Team and community voice, video, and text communication platform.",
    alternatives: [
      {
        name: "Discord (Native / Vesktop)",
        category: "Communication",
        license: "Free / Proprietary",
        description: "Vesktop is a custom Discord client that gives Linux users working Wayland screen sharing with audio and Vencord plugins.",
        website: "https://github.com/Vencord/Vesktop",
        votes: 1490,
        featured: true,
        packageTypes: ["Flatpak", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub dev.vencord.Vesktop",
          pacman: "yay -S vesktop"
        }
      },
      {
        name: "Matrix / Element",
        category: "Communication",
        license: "Free & Open Source",
        description: "Decentralized, end-to-end encrypted messaging network and secure team collaboration client.",
        website: "https://element.io",
        votes: 910,
        packageTypes: ["Flatpak", "APT", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub im.riot.Riot",
          apt: "sudo apt install element-desktop"
        }
      }
    ]
  },
  {
    id: "winrar",
    name: "WinRAR / 7-Zip",
    category: "Utilities",
    icon: "📦",
    summary: "File archiver and compression utilities (.zip, .rar, .7z, .tar.gz).",
    alternatives: [
      {
        name: "PeaZip",
        category: "Utilities",
        license: "Free & Open Source",
        description: "Free file archiver supporting over 200 archive formats with strong encryption, file splitting, and duplicate finders.",
        website: "https://peazip.github.io",
        votes: 820,
        featured: true,
        packageTypes: ["Flatpak", "APT", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub io.github.peazip.PeaZip",
          pacman: "yay -S peazip-qt-bin"
        }
      },
      {
        name: "Ark / File Roller",
        category: "Utilities",
        license: "Free & Open Source",
        description: "Native KDE and GNOME desktop archive managers integrated right into your file manager right-click context menu.",
        website: "https://apps.kde.org/ark",
        votes: 710,
        packageTypes: ["APT", "Pacman", "DNF"],
        installCmds: {
          apt: "sudo apt install ark file-roller p7zip-full unrar",
          pacman: "sudo pacman -S ark p7zip unrar"
        }
      }
    ]
  },
  {
    id: "steam",
    name: "Steam & Epic Games Launcher",
    category: "Gaming",
    icon: "🎮",
    summary: "Game store and launcher clients for purchasing and running PC games.",
    alternatives: [
      {
        name: "Heroic Games Launcher",
        category: "Gaming",
        license: "Free & Open Source",
        description: "Native Linux launcher for Epic Games, GOG, and Prime Gaming with built-in Proton and Wine prefix management.",
        website: "https://heroicgameslauncher.com",
        votes: 1720,
        featured: true,
        packageTypes: ["Flatpak", "Pacman", "AppImage"],
        installCmds: {
          flatpak: "flatpak install flathub com.heroicgameslauncher.hgl",
          pacman: "yay -S heroic-games-launcher-bin"
        }
      },
      {
        name: "Lutris",
        category: "Gaming",
        license: "Free & Open Source",
        description: "Open gaming platform for Linux that installs and manages games from GOG, Steam, Battle.net, Origin, Ubisoft, and emulators.",
        website: "https://lutris.net",
        votes: 1540,
        packageTypes: ["Flatpak", "APT", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub net.lutris.Lutris",
          apt: "sudo apt install lutris",
          pacman: "sudo pacman -S lutris"
        }
      }
    ]
  },
  {
    id: "1password",
    name: "1Password / LastPass",
    category: "Security",
    icon: "🔑",
    summary: "Password manager and encrypted credential vault.",
    alternatives: [
      {
        name: "Bitwarden",
        category: "Security",
        license: "Free & Open Source",
        description: "End-to-end encrypted password manager with cross-platform sync, autofill, 2FA authenticator, and self-hosting options.",
        website: "https://bitwarden.com",
        votes: 1980,
        featured: true,
        packageTypes: ["Flatpak", "Snap", "AppImage", "Pacman"],
        installCmds: {
          flatpak: "flatpak install flathub com.bitwarden.desktop",
          snap: "sudo snap install bitwarden",
          pacman: "sudo pacman -S bitwarden"
        }
      },
      {
        name: "KeePassXC",
        category: "Security",
        license: "Free & Open Source",
        description: "Community fork of KeePassX for 100% offline, local database password storage with SSH agent integration and YubiKey support.",
        website: "https://keepassxc.org",
        votes: 1410,
        packageTypes: ["Flatpak", "APT", "Pacman", "DNF"],
        installCmds: {
          flatpak: "flatpak install flathub org.keepassxc.KeePassXC",
          apt: "sudo apt install keepassxc",
          pacman: "sudo pacman -S keepassxc"
        }
      }
    ]
  }
];
