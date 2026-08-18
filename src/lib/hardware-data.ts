export interface HardwareItem {
  category:
    "GPUs" | "Wi-Fi & Bluetooth" | "Laptops" | "Printers & Scanners" | "Audio & Peripherals";
  name: string;
  compatibility:
    | "Platinum (Out-of-the-box)"
    | "Gold (Driver install required)"
    | "Silver (Minor tweaks needed)"
    | "Unsupported / Problematic";
  kernelDriver: string;
  notes: string;
  testedDistros: string[];
}

export const HARDWARE_DATA: HardwareItem[] = [
  {
    category: "Wi-Fi & Bluetooth",
    name: "Intel Wi-Fi 6 / 6E / 7 (AX200, AX210, BE200)",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "iwlwifi (in-tree kernel driver)",
    notes:
      "Flawless Linux support. Works out of the box on all modern distributions without installing extra packages.",
    testedDistros: ["Ubuntu", "Fedora", "Arch", "Debian", "Pop!_OS"],
  },
  {
    category: "Wi-Fi & Bluetooth",
    name: "Realtek RTL8821CE / RTL8812AU USB Wi-Fi",
    compatibility: "Gold (Driver install required)",
    kernelDriver: "rtl8821ce-dkms / 8812au-dkms",
    notes:
      "Requires DKMS module installation on older distros. Modern Ubuntu & Mint driver managers auto-detect and install it in 1 click.",
    testedDistros: ["Ubuntu", "Linux Mint", "Arch (AUR)"],
  },
  {
    category: "Wi-Fi & Bluetooth",
    name: "Broadcom BCM4360 / BCM43142",
    compatibility: "Gold (Driver install required)",
    kernelDriver: "broadcom-sta-dkms (wl)",
    notes:
      "Requires proprietary broadcom driver. Need ethernet connection or offline USB driver package during first install.",
    testedDistros: ["Ubuntu", "Debian (non-free)", "Fedora (RPM Fusion)"],
  },
  {
    category: "GPUs",
    name: "AMD Radeon RX 7000 / 6000 Series (RDNA 3 & 2)",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "amdgpu + Mesa RADV",
    notes:
      "Zero proprietary driver setup. Full Vulkan 1.3, Wayland, FreeSync, and HDR support in upstream Mesa.",
    testedDistros: ["All modern Linux distributions"],
  },
  {
    category: "GPUs",
    name: "NVIDIA GeForce RTX 4090 / 4080 / 4070 / 3060",
    compatibility: "Gold (Driver install required)",
    kernelDriver: "nvidia (proprietary) / nvidia-open kernel module",
    notes:
      "Requires proprietary nvidia-driver-550+. Flawless Wayland support with explicit sync enabled in recent drivers.",
    testedDistros: ["Pop!_OS", "Ubuntu", "Fedora", "Arch Linux"],
  },
  {
    category: "Laptops",
    name: "Lenovo ThinkPad (T14, P14s, X1 Carbon Gen 9-12)",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "thinkpad_acpi",
    notes:
      "Official tier-1 Linux hardware partner with Lenovo. TrackPoint, power profiles, battery thresholds, and suspend work out of the box.",
    testedDistros: ["Fedora (Official)", "Ubuntu (Certified)", "Arch", "Debian"],
  },
  {
    category: "Laptops",
    name: "Framework Laptop 13 / 16 (Intel & AMD)",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "cros_ec / standard Linux ACPI",
    notes: "Engineered specifically for Linux with open-source firmware updates via LVFS / fwupd.",
    testedDistros: ["Fedora", "Ubuntu", "Arch", "openSUSE"],
  },
  {
    category: "Laptops",
    name: "Dell XPS 13 / 15 (Developer Edition)",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "dell_laptop / intel_pmc_core",
    notes:
      "Certified for Ubuntu Linux. HiDPI scaling, Thunderbolt 4 docks, and sleep modes fully functional.",
    testedDistros: ["Ubuntu Certified", "Fedora", "Pop!_OS"],
  },
  {
    category: "Printers & Scanners",
    name: "HP LaserJet & OfficeJet Printers",
    compatibility: "Platinum (Out-of-the-box)",
    kernelDriver: "hplip / CUPS",
    notes:
      "HPLIP (HP Linux Imaging and Printing) is pre-installed in almost all Linux distributions. Auto-discovers network printers via mDNS/Avahi.",
    testedDistros: ["Ubuntu", "Mint", "Fedora", "Debian"],
  },
  {
    category: "Printers & Scanners",
    name: "Brother Network Laser Printers (HL-L2350DW, etc.)",
    compatibility: "Gold (Driver install required)",
    kernelDriver: "CUPS IPP Everywhere / brother-lpr-drivers",
    notes:
      "Modern models support driverless IPP printing out of the box. Older USB printers require deb/rpm from Brother website.",
    testedDistros: ["Ubuntu", "Linux Mint", "Arch"],
  },
];

export const DIAGNOSTIC_COMMANDS = [
  {
    cmd: "lspci -k | grep -EA3 'VGA|3D|Display'",
    title: "Check GPU Model & Active Kernel Driver",
    desc: "Identifies whether your graphics card is running on the open-source driver (amdgpu, nouveau) or proprietary nvidia driver.",
  },
  {
    cmd: "lspci -k | grep -EA3 'Network|Ethernet|Wireless'",
    title: "Check Wi-Fi & Ethernet Chipset",
    desc: "Displays PCI Wi-Fi chipset vendor (Intel, Realtek, Broadcom, MediaTek) and loaded kernel driver module.",
  },
  {
    cmd: "lsusb",
    title: "List Connected USB Devices",
    desc: "Identifies USB webcams, drawing tablets, Bluetooth adapters, fingerprint sensors, and audio interfaces.",
  },
  {
    cmd: "inxi -Fz",
    title: "Full Hardware Summary",
    desc: "Prints a clean, filtered summary of CPU, GPU, Audio, Network, Drives, Sensors, and Desktop Environment.",
  },
  {
    cmd: "sudo dmesg | grep -iE 'error|fail|warn'",
    title: "Inspect Kernel Hardware Boot Errors",
    desc: "Scans kernel ring buffer for firmware missing errors or hardware ACPI warnings.",
  },
];
