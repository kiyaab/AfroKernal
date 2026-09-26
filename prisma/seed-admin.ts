import { prisma } from "../src/lib/prisma.server.ts";
import { hashPassword } from "../src/lib/auth.server.ts";

async function main() {
  const adminEmails = ["admin@ak.com", "admin@afrokernel.com", "admin@admin.com"];
  const password = "admin1234";
  const passwordHash = hashPassword(password);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: "admin",
      },
      create: {
        email,
        passwordHash,
        displayName: "Admin",
        role: "admin",
        emailVerified: true,
        authProvider: "email",
        profile: {
          create: {
            displayName: "Admin",
            xp: 0,
            level: 1,
            streakDays: 0,
          },
        },
        userRoles: { create: [{ role: "admin" }] },
        userStats: { create: {} },
      },
      include: { profile: true, userRoles: true },
    });
  }

  console.log("✅ Admin users seeded (admin@ak.com, admin@afrokernel.com, admin@admin.com)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
