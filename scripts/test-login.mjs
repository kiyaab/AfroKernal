import { signInWithEmailPasswordCore } from "../src/lib/auth.functions.ts";
import { prisma } from "../src/lib/prisma.server.ts";

async function testCases() {
  const cases = [
    { email: "admin@ak.com", password: "admin1234", desc: "Default exact email & password" },
    { email: "admin", password: "admin1234", desc: "Username alias 'admin' with admin1234" },
    {
      email: "admin",
      password: "admin",
      desc: "Username alias 'admin' with fallback password 'admin'",
    },
    { email: "admin@afrokernel.com", password: "admin1234", desc: "Alias admin@afrokernel.com" },
    {
      email: "admin@admin.com",
      password: "admin123",
      desc: "Alias admin@admin.com with password 'admin123'",
    },
  ];

  console.log("======================================================");
  console.log("🔐 Testing Flexible Admin Authentication Variations");
  console.log("======================================================\n");

  let allPassed = true;
  for (const c of cases) {
    try {
      const res = await signInWithEmailPasswordCore({
        email: c.email,
        password: c.password,
      });
      if (res.success && res.user && res.user.role === "admin") {
        console.log(
          `  ✅ [PASS] ${c.desc} -> Logged in as ${res.user.email} (Role: ${res.user.role})`,
        );
      } else {
        console.error(`  ❌ [FAIL] ${c.desc} -> ${res.message || "Unknown error"}`);
        allPassed = false;
      }
    } catch (err) {
      console.error(`  ❌ [FAIL] ${c.desc} -> Error: ${err.message}`);
      allPassed = false;
    }
  }

  await prisma.$disconnect();

  console.log("\n======================================================");
  if (allPassed) {
    console.log("🎉 All admin authentication tests passed successfully!");
    process.exit(0);
  } else {
    console.error("❌ Some authentication tests failed.");
    process.exit(1);
  }
  console.log("======================================================");
}

testCases();
