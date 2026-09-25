// Database Connection and Schema Verification Script for AfroKernel
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log("======================================================");
  console.log("🐘 Testing PostgreSQL Database Connection & Tables");
  console.log("======================================================\n");

  try {
    // 1. Raw connectivity ping
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as ping`;
    const latency = Date.now() - startTime;
    console.log(`  ✅ [CONNECT] Connected to PostgreSQL in ${latency}ms`);

    // 2. Query table counts
    const [userCount, courseCount, quizCount, sessionCount, roleCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.quiz.count(),
        prisma.session.count(),
        prisma.userRole.count(),
      ]);

    console.log(`  ✅ [USERS] Total registered users: ${userCount}`);
    console.log(`  ✅ [COURSES] Total curriculum courses: ${courseCount}`);
    console.log(`  ✅ [QUIZZES] Total quizzes: ${quizCount}`);
    console.log(`  ✅ [SESSIONS] Active sessions: ${sessionCount}`);
    console.log(`  ✅ [ROLES] Assigned user roles: ${roleCount}`);

    // 3. Sample check users
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          role: true,
          authProvider: true,
          createdAt: true,
        },
      });
      console.log("\n  📋 Sample Users in DB:");
      users.forEach((u) => {
        console.log(`     • ${u.email} (${u.role}) via [${u.authProvider}]`);
      });
    } else {
      console.log("\n  ℹ️ Database is clean and ready for new user registrations.");
    }

    console.log("\n======================================================");
    console.log("🎉 Database health check passed successfully!");
    console.log("======================================================");
  } catch (err) {
    console.error("\n❌ Database connection error:", err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
