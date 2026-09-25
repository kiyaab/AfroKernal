import { prisma } from "../src/lib/prisma.server.ts";
import { hashPassword } from "../src/lib/auth.server.ts";

async function main() {
  const email = "admin@ak.com";
  const password = "admin1234";
  const passwordHash = hashPassword(password);

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

  console.log("✅ Admin user seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
