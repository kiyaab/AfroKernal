import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string" || storedHash.trim() === "") {
    return false;
  }
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(originalHash), Buffer.from(computedHash));
  } catch {
    return false;
  }
}

async function testLogin() {
  const email = "admin@ak.com";
  const password = "admin1234";

  console.log(`Testing admin login for: ${email}`);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, userRoles: true, userStats: true },
  });

  if (!user) {
    console.error("❌ User not found!");
    process.exit(1);
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    console.error("❌ Password verification failed!");
    process.exit(1);
  }

  console.log("✅ Admin user found and password verified successfully!");
  console.log("User details:", {
    id: user.id,
    email: user.email,
    role: user.role,
    roles: user.userRoles.map(r => r.role),
    displayName: user.displayName,
    authProvider: user.authProvider,
  });

  await prisma.$disconnect();
}

testLogin().catch(e => {
  console.error(e);
  process.exit(1);
});
