/** Full Linux Fundamentals lesson payloads for seeding */
export const LINUX_FUNDAMENTALS_LESSONS = [
  {
    slug: "01-welcome-to-linux",
    title: "1. Welcome to Linux",
    lesson_type: "video",
    video_url: "https://www.youtube.com/watch?v=Wgi-OfbP2Gw" as string | null,
    content: `# Welcome to Linux

Linux powers servers, cloud, phones, and DevOps tools worldwide.

## What you will learn
- Using the terminal confidently
- Files, folders, and permissions
- Users and packages
- Services with systemd
- Basic networking

## Try this
Open the **Lab** and run:

\`\`\`bash
uname -a
whoami
pwd
\`\`\`

Then mark this lesson complete and continue to the next page.`,
    xp_reward: 15,
    sort_order: 1,
  },
  {
    slug: "02-terminal-basics",
    title: "2. Terminal Basics",
    lesson_type: "video",
    video_url: "https://www.youtube.com/watch?v=ROjZy1WbCIA",
    content: `# Terminal Basics

The shell is how admins talk to Linux.

## Essential commands
| Command | Meaning |
|---------|---------|
| \`pwd\` | Print working directory |
| \`ls -la\` | List files (detailed) |
| \`cd /path\` | Change directory |
| \`clear\` | Clear the screen |
| \`history\` | Show past commands |

## Practice in the Lab
\`\`\`bash
pwd
ls -la
cd /home/learner
echo "Hello AfroKernel"
\`\`\``,
    xp_reward: 20,
    sort_order: 2,
  },
  {
    slug: "03-files-and-folders",
    title: "3. Files & Folders",
    lesson_type: "notes",
    video_url: null,
    content: `# Files and Folders

Everything in Linux is a file — including devices.

## Create and manage
\`\`\`bash
mkdir -p /home/learner/projects/demo
cd /home/learner/projects/demo
touch notes.txt
echo "day 1" > notes.txt
cat notes.txt
cp notes.txt notes.bak
mv notes.bak archive.txt
\`\`\`

## Important paths
- \`/home/learner\` — your home
- \`/etc\` — configuration
- \`/var/log\` — logs
- \`/mnt/c\` — mounted disk (in AfroKernel Lab)`,
    xp_reward: 20,
    sort_order: 3,
  },
  {
    slug: "04-users-and-permissions",
    title: "4. Users & Permissions",
    lesson_type: "notes",
    video_url: null,
    content: `# Users and Permissions

Security starts with who can do what.

## Users
\`\`\`bash
whoami
id
cat /etc/passwd
useradd -m alice
passwd alice
\`\`\`

## Permissions
\`\`\`bash
chmod 755 script.sh
chmod u+x script.sh
ls -l
\`\`\`

Practice: create user \`student\` in the Lab and verify with \`cat /etc/passwd\`.`,
    xp_reward: 25,
    sort_order: 4,
  },
  {
    slug: "05-packages",
    title: "5. Package Management",
    lesson_type: "notes",
    video_url: null,
    content: `# Package Management

Install software the admin way.

## Debian / Ubuntu (apt)
\`\`\`bash
apt update
apt install nginx
apt list
which nginx
\`\`\`

## Alpine / RHEL-style
\`\`\`bash
apk add curl
yum install vim
\`\`\`

Practice: install \`nginx\` and \`htop\` in the Lab.`,
    xp_reward: 25,
    sort_order: 5,
  },
  {
    slug: "06-systemd-services",
    title: "6. Services with systemd",
    lesson_type: "notes",
    video_url: null,
    content: `# systemd Services

Modern Linux uses systemd to start and supervise services.

\`\`\`bash
systemctl status nginx
systemctl start nginx
systemctl restart nginx
systemctl enable nginx
journalctl
\`\`\`

Practice: check nginx status, restart it, then read logs.`,
    xp_reward: 25,
    sort_order: 6,
  },
  {
    slug: "07-networking",
    title: "7. Networking Basics",
    lesson_type: "notes",
    video_url: null,
    content: `# Networking Basics

Every sysadmin needs to read interfaces and test connectivity.

\`\`\`bash
ip addr
ping 8.8.8.8
curl https://afrokernel.dev
ss
df -h
\`\`\`

Practice: show your Lab IP, ping Google DNS, and fetch a page with curl.`,
    xp_reward: 20,
    sort_order: 7,
  },
  {
    slug: "08-course-capstone",
    title: "8. Capstone Challenge",
    lesson_type: "notes",
    video_url: null,
    content: `# Capstone Challenge

Put it all together in the AfroKernel Lab:

1. \`mkdir -p /opt/afrokernel/app\`
2. \`useradd -m deploy\`
3. \`apt install nginx\`
4. \`systemctl status nginx\`
5. \`echo "ready" > /opt/afrokernel/app/STATUS.txt\`
6. \`cat /opt/afrokernel/app/STATUS.txt\`

## Next steps
- Take the **Practice Quiz**
- Ask the **AI Tutor** to review your commands

Congratulations — you finished Linux Fundamentals!`,
    xp_reward: 40,
    sort_order: 8,
  },
];
