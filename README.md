# 🐧 AfroKernal

<div align="center">

# Learn Linux. Master Administration. Build Your Future.

**AfroKernal** is a modern, interactive Linux Administration Learning Platform designed to help beginners, students, and IT professionals master Linux through structured courses, hands-on labs, real-world server administration, and AI-powered learning assistance.

---

![Platform](https://img.shields.io/badge/Platform-Linux%20Learning-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)

</div>

---

# 🌍 About AfroKernal

AfroKernal is an AI-powered Linux Administration Learning Platform built to make Linux education practical, interactive, and accessible.

Instead of simply reading documentation, learners gain real-world experience by completing guided lessons, practicing commands in interactive terminals, solving system administration challenges, and receiving AI-powered explanations and feedback.

Whether you're preparing for your first Linux job, DevOps, cloud engineering, cybersecurity, or RHCSA/Linux+ certifications, AfroKernal provides a structured path from beginner to advanced administrator.

---

# 🎯 Mission

To empower Africa and the global technology community by providing high-quality, hands-on Linux education that bridges the gap between theory and real-world system administration.

---

# ✨ Features

## 📚 Learning Platform

- Beginner to Advanced Linux Courses
- Structured Learning Paths
- Interactive Lessons
- Progress Tracking
- Learning Dashboard
- Course Certificates

---

## 💻 Hands-on Labs

- Interactive Linux Terminal
- Real Command Practice
- Guided Lab Exercises
- Virtual Linux Environment
- File System Challenges
- Shell Scripting Exercises

---

## 🤖 AI Learning Assistant

- AI Linux Tutor
- Command Explanations
- Error Diagnosis
- Step-by-Step Guidance
- Server Troubleshooting
- Instant Q&A

---

## 🖥 Linux Administration Topics

- Linux Fundamentals
- File System Management
- User & Group Administration
- Permissions & Ownership
- Bash Shell
- Shell Scripting
- Package Management
- Process Management
- System Monitoring
- Networking
- SSH Administration
- Firewall Configuration
- Storage Management
- LVM
- RAID
- Cron Jobs
- Services (systemd)
- Log Management
- Apache & Nginx
- DNS
- DHCP
- Docker
- Virtualization
- Backup & Recovery
- Security Hardening

---

## 🔐 Authentication

- Secure Login
- User Profiles
- Role-Based Access
- Progress Synchronization

---

## 📊 Dashboard

- Learning Progress
- Completed Courses
- Certificates
- Recent Activities
- XP & Achievements
- Learning Statistics

---

## 🏆 Gamification

- Badges
- XP Points
- Leaderboards
- Daily Challenges
- Weekly Missions

---

## 📱 Platform Features

- Responsive Design
- Dark Mode
- Mobile Friendly
- Fast Performance
- Modern UI
- Offline Learning Support

---

# 🛠 Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- TanStack Query

### Backend

- Node.js
- REST API

### Database

- PostgreSQL / MySQL

### Authentication

- JWT
- OAuth

### Deployment

- Docker
- Nginx
- GitHub

---

# 📂 Project Structure

```text
AfroKernal/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── features/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── assets/
│   └── styles/
│
├── package.json
├── vite.config.ts
├── README.md
└── LICENSE
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/kiyaab/AfroKernal.git
```

Go to the project

```bash
cd AfroKernal
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Create production build

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# 🐳 Docker & Containerization

AfroKernal comes with production-ready multi-stage Dockerfiles and Docker Compose configurations.

### 1. Run with Docker Compose (Production)

```bash
# Copy and configure environment variables
cp .env.example .env

# Build and start container in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

Access the application at `http://localhost:3000`.

### 2. Run with Docker Compose (Local Development with Hot-Reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 3. Build & Run Docker Image Directly

```bash
# Build the image
docker build -t afrokernel:latest .

# Run the container
docker run -d -p 3000:3000 --name afrokernel-app --env-file .env afrokernel:latest
```

---

# 🔄 CI/CD Pipelines (GitHub Actions)

AfroKernal includes automated GitHub Actions workflows for continuous integration and delivery.

### 1. Continuous Integration (`.github/workflows/ci.yml`)

Runs automatically on every Pull Request and push to `main`, `master`, and `develop`:

- **Code Quality & Linting**: ESLint checks
- **Type Validation**: TypeScript compiler check (`tsc --noEmit`)
- **Build Verification**: Production Vite/TanStack build verification
- **Docker Validation**: Multi-stage Docker build verification with layer caching

### 2. Continuous Delivery (`.github/workflows/cd.yml`)

Runs on pushes to `main`/`master` or release tags (`v*`):

- **GHCR Container Registry**: Automatically builds and publishes multi-platform container images to `ghcr.io/<username>/afrokernal`
- **Automated Tagging**: Generates `latest`, `sha-<commit>`, and semantic version tags (`v1.0.0`, `1.0`)
- **Deployment Trigger**: Extensible deployment hook for automated deployment rollouts

#### Required GitHub Repository Secrets (Optional for Custom Supabase Config)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `DEPLOY_WEBHOOK_URL` (optional, for triggering webhook deployment)

---

# 🎓 Learning Roadmap

- Linux Basics
- Linux Commands
- File Systems
- Bash Scripting
- Users & Groups
- Networking
- Services
- Storage
- Security
- Containers
- DevOps Essentials
- Cloud Linux Administration

---

# 🚀 Future Features

- AI Command Generator
- AI Terminal Assistant
- Live Linux Sandbox
- Multi-Distribution Support
- Certification Exams
- Virtual Machines
- Kubernetes Labs
- Cloud Labs
- Community Forum
- Instructor Dashboard
- Team Learning
- Enterprise Training

---

# 🤝 Contributing

We welcome contributions from developers, educators, and Linux enthusiasts.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

**Endegena Abebe (Kiya)**

Full-Stack Developer • Linux Enthusiast • AI Engineer

GitHub: https://github.com/kiyaab

---

<div align="center">

## ⭐ Star this repository if you find it useful!

### Empowering the next generation of Linux System Administrators.

**Made with ❤️ in Ethiopia**

</div>
