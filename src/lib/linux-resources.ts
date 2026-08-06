export type ResourceLink = { name: string; url: string; desc?: string };
export type ResourceGroup = { title: string; blurb: string; links: ResourceLink[] };

export const linuxResources: ResourceGroup[] = [
  {
    title: "Enterprise & RPM Distros",
    blurb: "Red Hat family — the backbone of production Linux in banks, telcos and cloud.",
    links: [
      { name: "Red Hat Enterprise Linux", url: "https://docs.redhat.com", desc: "Official RHEL product documentation." },
      { name: "Rocky Linux", url: "https://docs.rockylinux.org", desc: "RHEL-compatible community rebuild." },
      { name: "AlmaLinux Wiki", url: "https://wiki.almalinux.org", desc: "Free enterprise-grade OS." },
      { name: "Fedora Docs", url: "https://docs.fedoraproject.org", desc: "Upstream of RHEL — bleeding edge stable." },
      { name: "Oracle Linux", url: "https://docs.oracle.com/en/operating-systems/oracle-linux/", desc: "Oracle's RHEL-compatible distro." },
      { name: "CentOS Docs", url: "https://docs.centos.org", desc: "CentOS Stream documentation." },
    ],
  },
  {
    title: "Debian Family",
    blurb: "The most-deployed Linux family in the world — Ubuntu, Debian, Mint, Kali.",
    links: [
      { name: "Ubuntu Documentation", url: "https://documentation.ubuntu.com", desc: "Server, Desktop, Core, LXD, MAAS." },
      { name: "Debian Documentation", url: "https://www.debian.org/doc/", desc: "The universal operating system." },
      { name: "Linux Mint User Guide", url: "https://linuxmint-user-guide.readthedocs.io", desc: "Beginner-friendly Ubuntu derivative." },
      { name: "Kali Linux Docs", url: "https://www.kali.org/docs/", desc: "Penetration testing distribution." },
    ],
  },
  {
    title: "SUSE Family",
    blurb: "openSUSE and SLES — huge in European enterprise and SAP shops.",
    links: [
      { name: "openSUSE Documentation", url: "https://doc.opensuse.org", desc: "Leap and Tumbleweed." },
      { name: "SUSE Documentation", url: "https://documentation.suse.com", desc: "SUSE Linux Enterprise Server." },
    ],
  },
  {
    title: "Rolling & Source-Based",
    blurb: "For power users who want the latest — Arch, Gentoo, Slackware.",
    links: [
      { name: "Arch Wiki", url: "https://wiki.archlinux.org", desc: "The best Linux wiki on the internet — even non-Arch users use it." },
      { name: "Gentoo Wiki", url: "https://wiki.gentoo.org", desc: "Source-based Linux distribution." },
      { name: "Slackware Docs", url: "https://docs.slackware.com", desc: "The oldest surviving Linux distribution." },
    ],
  },
  {
    title: "The Kernel & GNU",
    blurb: "The foundational documentation of the entire Linux universe.",
    links: [
      { name: "Linux Kernel Docs", url: "https://docs.kernel.org", desc: "Official kernel documentation." },
      { name: "The Linux Documentation Project (TLDP)", url: "https://www.tldp.org", desc: "HOWTOs, guides and FAQs." },
      { name: "GNU Manuals", url: "https://www.gnu.org/manual/manual.html", desc: "Every GNU tool's official manual." },
      { name: "OpenSSH Manual", url: "https://www.openssh.com/manual.html", desc: "The de-facto SSH implementation." },
      { name: "systemd", url: "https://systemd.io", desc: "The service manager on modern Linux." },
    ],
  },
  {
    title: "DevOps, Containers & Automation",
    blurb: "The tools every Linux admin lives inside daily.",
    links: [
      { name: "Ansible", url: "https://docs.ansible.com", desc: "Agentless automation and config management." },
      { name: "Podman", url: "https://docs.podman.io", desc: "Rootless daemonless container engine." },
      { name: "Docker", url: "https://docs.docker.com", desc: "The container standard." },
      { name: "Kubernetes", url: "https://kubernetes.io/docs", desc: "Production-grade container orchestration." },
      { name: "Git", url: "https://git-scm.com/doc", desc: "Distributed version control." },
      { name: "Cockpit", url: "https://cockpit-project.org/documentation.html", desc: "Web-based server admin UI." },
    ],
  },
  {
    title: "Servers, Databases & DNS",
    blurb: "The services you'll be administering in production.",
    links: [
      { name: "NGINX", url: "https://nginx.org/en/docs/", desc: "High-performance web server & reverse proxy." },
      { name: "Apache HTTPD", url: "https://httpd.apache.org/docs/", desc: "The classic web server." },
      { name: "MariaDB", url: "https://mariadb.org/documentation/", desc: "MySQL-compatible relational database." },
      { name: "PostgreSQL", url: "https://www.postgresql.org/docs/", desc: "The world's most advanced open source database." },
      { name: "BIND 9", url: "https://bind9.readthedocs.io", desc: "The most widely used DNS server." },
    ],
  },
  {
    title: "Monitoring & Observability",
    blurb: "Because a system you can't see is a system you can't fix.",
    links: [
      { name: "Prometheus", url: "https://prometheus.io/docs/", desc: "Metrics and alerting toolkit." },
      { name: "Grafana", url: "https://grafana.com/docs/", desc: "Dashboards for anything." },
      { name: "Zabbix", url: "https://www.zabbix.com/documentation/", desc: "Enterprise monitoring platform." },
      { name: "Nagios Core", url: "https://assets.nagios.com/downloads/nagioscore/docs/", desc: "The classic monitoring tool." },
    ],
  },
];
