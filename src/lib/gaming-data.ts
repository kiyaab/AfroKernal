export interface AntiCheatGame {
  name: string;
  antiCheat: "Easy Anti-Cheat" | "BattlEye" | "Easy Anti-Cheat / BattlEye" | "Ricochet" | "Vanguard" | "VAC" | "None / Custom" | string;
  status: "Supported" | "Playable (Tweaks Required)" | "Unsupported (Blocked by Anti-Cheat)";
  protonTier: "Native" | "Platinum" | "Gold" | "Silver" | "Borked";
  notes: string;
  launchOptions?: string;
}

export interface GamingGuideSection {
  title: string;
  category: "Setup" | "Performance" | "Troubleshooting";
  content: string;
  commands?: string[];
}

export const ANTI_CHEAT_GAMES: AntiCheatGame[] = [
  {
    name: "Counter-Strike 2",
    antiCheat: "VAC",
    status: "Supported",
    protonTier: "Native",
    notes: "Native Linux client built by Valve on Vulkan. Runs flawlessly with maximum performance.",
    launchOptions: "-novid -high"
  },
  {
    name: "Apex Legends",
    antiCheat: "Easy Anti-Cheat",
    status: "Supported",
    protonTier: "Platinum",
    notes: "EAC Linux module enabled by EA/Respawn. Works out of the box with Proton Experimental.",
    launchOptions: "gamemoderun %command%"
  },
  {
    name: "Elden Ring",
    antiCheat: "Easy Anti-Cheat",
    status: "Supported",
    protonTier: "Platinum",
    notes: "Valve patched shader stuttering on Linux before Windows received the fix. Runs smooth 60fps.",
    launchOptions: "PROTON_ENABLE_NVAPI=1 %command%"
  },
  {
    name: "Cyberpunk 2077",
    antiCheat: "None / Custom",
    status: "Supported",
    protonTier: "Platinum",
    notes: "Full ray tracing, DLSS / FSR 3, and Phantom Liberty support via Proton GE.",
    launchOptions: "PROTON_ENABLE_NVAPI=1 VKD3D_CONFIG=dxr11 %command%"
  },
  {
    name: "Helldivers 2",
    antiCheat: "None / Custom",
    status: "Supported",
    protonTier: "Gold",
    notes: "nProtect GameGuard anti-cheat was updated to support Proton. Fully playable in co-op.",
    launchOptions: "gamemoderun %command%"
  },
  {
    name: "Fortnite",
    antiCheat: "Easy Anti-Cheat / BattlEye",
    status: "Unsupported (Blocked by Anti-Cheat)",
    protonTier: "Borked",
    notes: "Epic Games explicitly refuses to enable the Linux EAC toggle. Playable only via Xbox Cloud Gaming / GeForce NOW.",
  },
  {
    name: "Valorant",
    antiCheat: "Vanguard",
    status: "Unsupported (Blocked by Anti-Cheat)",
    protonTier: "Borked",
    notes: "Riot Vanguard requires kernel-level ring 0 Windows drivers with TPM 2.0. Incompatible with Linux.",
  },
  {
    name: "Call of Duty: Warzone",
    antiCheat: "Ricochet",
    status: "Unsupported (Blocked by Anti-Cheat)",
    protonTier: "Borked",
    notes: "Ricochet anti-cheat kernel driver blocks Linux/Wine executions.",
  },
  {
    name: "Destiny 2",
    antiCheat: "BattlEye",
    status: "Unsupported (Blocked by Anti-Cheat)",
    protonTier: "Borked",
    notes: "Bungie bans accounts attempting to play via Proton. Do not attempt on live servers.",
  },
  {
    name: "Warframe",
    antiCheat: "None / Custom",
    status: "Supported",
    protonTier: "Platinum",
    notes: "Digital Extremes actively tests and supports Steam Deck and Linux Proton.",
    launchOptions: "gamemoderun %command%"
  },
  {
    name: "Dota 2",
    antiCheat: "VAC",
    status: "Supported",
    protonTier: "Native",
    notes: "100% native Linux support using Source 2 engine on Vulkan.",
  },
  {
    name: "Grand Theft Auto V / GTA Online",
    antiCheat: "BattlEye",
    status: "Supported",
    protonTier: "Gold",
    notes: "Rockstar enabled BattlEye Proton support. Story mode and online lobbies functional.",
    launchOptions: "gamemoderun %command%"
  }
];

export const GPU_DRIVER_GUIDES = [
  {
    gpu: "NVIDIA GeForce (RTX 40/30/20, GTX 16/10 Series)",
    description: "Install proprietary Nvidia drivers with NVENC, CUDA, and Vulkan support.",
    ubuntu: "sudo ubuntu-drivers install  # or: sudo apt install nvidia-driver-550",
    fedora: "sudo dnf install akmod-nvidia xorg-x11-drv-nvidia-cuda",
    arch: "sudo pacman -S nvidia nvidia-utils nvidia-settings lib32-nvidia-utils",
    notes: "Ensure Secure Boot is either disabled or custom MOK keys are enrolled during driver compilation."
  },
  {
    gpu: "AMD Radeon (RX 7000, 6000, 5000, Vega, Polaris)",
    description: "AMD drivers (AMDGPU + Mesa RADV) are built directly into the Linux kernel and Mesa.",
    ubuntu: "sudo apt install mesa-vulkan-drivers libvulkan1 vulkan-tools",
    fedora: "sudo dnf install mesa-vulkan-drivers.x86_64 mesa-vulkan-drivers.i686",
    arch: "sudo pacman -S vulkan-radeon lib32-vulkan-radeon mesa lib32-mesa",
    notes: "AMD gives the smoothest out-of-the-box Linux experience with zero proprietary driver hassles."
  },
  {
    gpu: "Intel Arc & Iris Xe Graphics",
    description: "Intel provides open-source ANV Vulkan driver built into Mesa.",
    ubuntu: "sudo apt install intel-media-va-driver-non-free mesa-vulkan-drivers",
    fedora: "sudo dnf install mesa-vulkan-drivers.x86_64 intel-media-driver",
    arch: "sudo pacman -S vulkan-intel lib32-vulkan-intel intel-media-driver",
    notes: "Requires modern kernel 6.6+ for optimal Arc A770/A750 power management."
  }
];
