// Automated Route Audit Script for AfroKernel Platform
// Pings all public, authenticated, and tool routes against http://localhost:8080

const BASE_URL = process.env.TEST_URL || "http://localhost:8080";

const ROUTES_TO_AUDIT = [
  { path: "/", name: "Landing / Home", category: "Core" },
  { path: "/courses", name: "Courses Catalog", category: "Learning" },
  { path: "/courses/rhel", name: "RHEL Course Overview", category: "Learning" },
  { path: "/courses/rhel/rhel-01", name: "RHEL Lesson 1 Player", category: "Learning" },
  { path: "/courses/rhel/practice", name: "RHEL Practice Challenges", category: "Learning" },
  { path: "/dashboard", name: "Learner Dashboard", category: "Learner" },
  { path: "/lab", name: "Interactive Terminal Lab", category: "Interactive" },
  { path: "/exam/practice", name: "Exam Practice Center", category: "Certifications" },
  { path: "/certification", name: "Certification Hub", category: "Certifications" },
  { path: "/distros", name: "Linux Distros Matrix", category: "Ecosystem" },
  { path: "/distro-finder", name: "Distro Recommendation Quiz", category: "Ecosystem" },
  { path: "/apps", name: "App Alternatives", category: "Migration" },
  { path: "/hardware-compatibility", name: "Hardware Compatibility", category: "Hardware" },
  { path: "/gaming", name: "Linux Gaming & Proton", category: "Gaming" },
  { path: "/migration-guides", name: "Windows to Linux Migration", category: "Migration" },
  { path: "/tools/command-translator", name: "Command Translator", category: "Tools" },
  { path: "/tools/cron-builder", name: "Cron Expression Builder", category: "Tools" },
  { path: "/tools/permissions-calculator", name: "Permissions Calculator", category: "Tools" },
  { path: "/cheat-sheets", name: "Cheat Sheets Library", category: "References" },
  { path: "/docs", name: "Command Docs Reference", category: "References" },
  { path: "/docs/ls", name: "Command Doc (ls)", category: "References" },
  { path: "/tutorials", name: "Tutorials Hub", category: "Learning" },
  { path: "/resources", name: "Resources & Downloads", category: "Resources" },
  { path: "/chat", name: "AI Chat Assistant", category: "AI" },
  { path: "/profile", name: "User Profile", category: "Learner" },
  { path: "/auth", name: "Auth Portal", category: "Auth" },
  { path: "/terms", name: "Terms & Privacy", category: "Legal" },
  { path: "/admin", name: "Admin Portal Control Center", category: "Admin" },
  { path: "/admin/manage-courses", name: "Admin Course Management", category: "Admin" },
];

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Comprehensive AfroKernel Route Audit`);
  console.log(`   Target Server: ${BASE_URL}`);
  console.log(`   Total Routes:  ${ROUTES_TO_AUDIT.length}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const route of ROUTES_TO_AUDIT) {
    const url = `${BASE_URL}${route.path}`;
    const start = performance.now();
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "AfroKernel-Audit-Runner/1.0" },
        redirect: "manual",
      });
      const duration = Math.round(performance.now() - start);

      // Status 200 is healthy. 301/302/307/308 redirect for auth pages is also expected.
      const isRedirect = res.status >= 300 && res.status < 400;
      const isSuccess = res.status === 200 || (isRedirect && (route.path.startsWith("/admin") || route.path.startsWith("/dashboard") || route.path.startsWith("/profile")));

      if (isSuccess) {
        passed++;
        console.log(`  ✅ [${res.status}] ${route.path.padEnd(32)} ${route.name.padEnd(30)} (${duration}ms)`);
        results.push({ ...route, status: res.status, ok: true, duration });
      } else {
        failed++;
        console.error(`  ❌ [${res.status}] ${route.path.padEnd(32)} ${route.name.padEnd(30)} (${duration}ms)`);
        results.push({ ...route, status: res.status, ok: false, duration });
      }
    } catch (err) {
      failed++;
      const duration = Math.round(performance.now() - start);
      console.error(`  💥 [ERROR] ${route.path.padEnd(32)} ${err.message} (${duration}ms)`);
      results.push({ ...route, status: "ERROR", ok: false, error: err.message, duration });
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 Audit Results: ${passed} Passed, ${failed} Failed`);
  console.log(`   Health Rate:   ${((passed / ROUTES_TO_AUDIT.length) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit();
