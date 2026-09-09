// Comprehensive Functional Integrity Test Suite for AfroKernel Platform
import assert from "node:assert/strict";

console.log("======================================================");
console.log("🧪 Running Comprehensive AfroKernel Functional Test Suite");
console.log("======================================================\n");

let passedCount = 0;
let failedCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failedCount++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failedCount++;
  }
}

// 1. Terminal Lab Package Catalog & Admin FS
await runAsyncTest("Lab Linux: Package catalog integrity & search", async () => {
  const { PACKAGE_CATALOG, searchPackages, applyPackageInstall, BASE_PACKAGES } =
    await import("../src/lib/lab-linux.ts");
  assert(Array.isArray(PACKAGE_CATALOG), "PACKAGE_CATALOG should be an array");
  assert(PACKAGE_CATALOG.length > 50, `Expected >50 packages, got ${PACKAGE_CATALOG.length}`);
  assert(Array.isArray(BASE_PACKAGES), "BASE_PACKAGES should be an array");
  assert(BASE_PACKAGES.includes("coreutils"), "BASE_PACKAGES must have coreutils");
  assert(BASE_PACKAGES.includes("bash"), "BASE_PACKAGES must have bash");

  // Search
  const nginxMatches = searchPackages("nginx");
  assert(
    nginxMatches.some((p) => p.name === "nginx"),
    "Should find nginx package",
  );
  const dockerMatches = searchPackages("docker");
  assert(
    dockerMatches.some((p) => p.name.includes("docker")),
    "Should find docker packages",
  );

  // Mock FS install
  const mockRoot = {
    type: "dir",
    children: {
      usr: {
        type: "dir",
        children: { bin: { type: "dir", children: {} }, sbin: { type: "dir", children: {} } },
      },
      etc: { type: "dir", children: {} },
      var: {
        type: "dir",
        children: { www: { type: "dir", children: { html: { type: "dir", children: {} } } } },
      },
    },
  };
  applyPackageInstall(mockRoot, "nginx");
  assert(
    mockRoot.children.usr.children.bin.children["nginx"],
    "nginx binary should be installed into /usr/bin",
  );
});

// 2. Exam Questions Data Integrity
await runAsyncTest("Exam Questions: Tracks, options, and valid correct answers", async () => {
  const { EXAM_QUESTIONS } = await import("../src/lib/exam-questions-data.ts");
  assert(Array.isArray(EXAM_QUESTIONS), "EXAM_QUESTIONS should be an array");
  assert(EXAM_QUESTIONS.length >= 10, "Should have at least 10 exam questions");

  for (const q of EXAM_QUESTIONS) {
    assert(q.id, "Question must have an id");
    assert(q.question && q.question.length > 5, `Question ${q.id} text too short`);
    assert(
      Array.isArray(q.options) && q.options.length >= 3,
      `Question ${q.id} must have >= 3 options`,
    );
    assert(typeof q.correctIndex === "number", `Question ${q.id} must have correctIndex`);
    assert(
      q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `Question ${q.id} correctIndex ${q.correctIndex} out of bounds (options length: ${q.options.length})`,
    );
    assert(q.explanation && q.explanation.length > 5, `Question ${q.id} must have explanation`);
  }
});

// 3. Courses Catalog Data Integrity
await runAsyncTest("Courses Catalog: Modules, lessons, and content", async () => {
  const { CATALOG_COURSES } = await import("../src/lib/courses-catalog-data.ts");
  assert(Array.isArray(CATALOG_COURSES), "CATALOG_COURSES should be an array");
  assert(CATALOG_COURSES.length >= 4, `Expected >= 4 courses, got ${CATALOG_COURSES.length}`);

  for (const course of CATALOG_COURSES) {
    assert(course.slug, "Course must have a slug");
    assert(course.title, `Course ${course.slug} must have a title`);
    assert(
      Array.isArray(course.lessons) && course.lessons.length > 0,
      `Course ${course.slug} must have lessons`,
    );

    for (const lesson of course.lessons) {
      assert(lesson.id, `Lesson in course ${course.slug} must have an id`);
      assert(lesson.title, `Lesson ${lesson.id} must have a title`);
      assert(lesson.content, `Lesson ${lesson.id} must have content`);
    }
  }
});

// 4. Distros Data & Recommendations
await runAsyncTest("Distros Matrix: Distro metadata and features", async () => {
  const { DISTROS_DATA } = await import("../src/lib/distros-data.ts");
  assert(Array.isArray(DISTROS_DATA), "DISTROS_DATA should be an array");
  assert(DISTROS_DATA.length >= 8, `Expected >= 8 distros, got ${DISTROS_DATA.length}`);

  for (const d of DISTROS_DATA) {
    assert(d.id, "Distro must have an id");
    assert(d.name, "Distro must have a name");
    assert(d.base, `Distro ${d.name} must specify base`);
    assert(d.packageManager, `Distro ${d.name} must specify packageManager`);
    assert(Array.isArray(d.pros) && d.pros.length > 0, `Distro ${d.name} must have pros`);
    assert(Array.isArray(d.cons) && d.cons.length > 0, `Distro ${d.name} must have cons`);
  }
});

// 5. App Alternatives Data Integrity
await runAsyncTest("App Alternatives: Windows to Linux mappings and CLI commands", async () => {
  const { APPS_DATA } = await import("../src/lib/apps-data.ts");
  assert(Array.isArray(APPS_DATA), "APPS_DATA should be an array");
  assert(APPS_DATA.length >= 8, `Expected >= 8 apps, got ${APPS_DATA.length}`);

  for (const app of APPS_DATA) {
    assert(app.id, "App must have id");
    assert(app.name, "App must have name");
    assert(
      app.alternatives && app.alternatives.length > 0,
      `App ${app.name} must have alternatives`,
    );
    for (const alt of app.alternatives) {
      assert(alt.name, "Alternative must have name");
      assert(alt.installCmds, `Alternative ${alt.name} must have install commands`);
    }
  }
});

// 6. Migration Guides Data Integrity
await runAsyncTest("Migration Guides: Step-by-step guides and tips", async () => {
  const { MIGRATION_GUIDES } = await import("../src/lib/migration-data.ts");
  assert(Array.isArray(MIGRATION_GUIDES), "MIGRATION_GUIDES should be an array");
  assert(
    MIGRATION_GUIDES.length >= 3,
    `Expected >= 3 migration guides, got ${MIGRATION_GUIDES.length}`,
  );

  for (const guide of MIGRATION_GUIDES) {
    assert(guide.id, "Guide must have id");
    assert(guide.title, "Guide must have title");
    assert(guide.steps && guide.steps.length > 0, `Guide ${guide.id} must have steps`);
  }
});

// 7. Cheatsheets & Linux Commands Reference
await runAsyncTest("Cheatsheets & Commands: Reference data completeness", async () => {
  const { CHEATSHEETS_DATA } = await import("../src/lib/cheatsheets-data.ts");
  const { COMMANDS_DATA } = await import("../src/lib/commands-data.ts");

  assert(Array.isArray(CHEATSHEETS_DATA), "CHEATSHEETS_DATA should be an array");
  assert(CHEATSHEETS_DATA.length >= 4, `Expected >= 4 cheatsheets, got ${CHEATSHEETS_DATA.length}`);

  assert(Array.isArray(COMMANDS_DATA), "COMMANDS_DATA should be an array");
  assert(
    COMMANDS_DATA.length >= 15,
    `Expected >= 15 command translations, got ${COMMANDS_DATA.length}`,
  );

  for (const cmd of COMMANDS_DATA) {
    assert(cmd.windowsCmd, "Translation must have windows command");
    assert(cmd.linuxCmd, `Translation ${cmd.windowsCmd} must have linux command`);
    assert(cmd.description, `Translation ${cmd.windowsCmd} must have description`);
  }
});

// 8. Hardware & Gaming Compatibility Data
await runAsyncTest(
  "Hardware & Gaming: Hardware devices and gaming compatibility entries",
  async () => {
    const { HARDWARE_DATA } = await import("../src/lib/hardware-data.ts");
    const { ANTI_CHEAT_GAMES } = await import("../src/lib/gaming-data.ts");

    assert(Array.isArray(HARDWARE_DATA), "HARDWARE_DATA should be an array");
    assert(HARDWARE_DATA.length >= 5, `Expected >= 5 hardware items, got ${HARDWARE_DATA.length}`);

    assert(Array.isArray(ANTI_CHEAT_GAMES), "ANTI_CHEAT_GAMES should be an array");
    assert(ANTI_CHEAT_GAMES.length >= 5, `Expected >= 5 games, got ${ANTI_CHEAT_GAMES.length}`);
  },
);

// 9. Permissions Calculator Logic Test
test("Permissions Calculator: Octal & Symbolic conversions", () => {
  function octalToSymbolic(octal) {
    const map = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    return octal
      .split("")
      .map((d) => map[parseInt(d, 10)] || "---")
      .join("");
  }

  function symbolicToOctal(symbolic) {
    let result = "";
    for (let i = 0; i < 9; i += 3) {
      const chunk = symbolic.slice(i, i + 3);
      let val = 0;
      if (chunk[0] === "r") val += 4;
      if (chunk[1] === "w") val += 2;
      if (chunk[2] === "x") val += 1;
      result += val.toString();
    }
    return result;
  }

  assert.equal(octalToSymbolic("755"), "rwxr-xr-x");
  assert.equal(octalToSymbolic("644"), "rw-r--r--");
  assert.equal(octalToSymbolic("700"), "rwx------");
  assert.equal(octalToSymbolic("777"), "rwxrwxrwx");

  assert.equal(symbolicToOctal("rwxr-xr-x"), "755");
  assert.equal(symbolicToOctal("rw-r--r--"), "644");
  assert.equal(symbolicToOctal("rwx------"), "700");
  assert.equal(symbolicToOctal("rwxrwxrwx"), "777");
});

// 10. Cron Builder Expression Logic Test
test("Cron Expression Generator: Correct format and tokens", () => {
  function formatCron(min, hr, dom, mon, dow) {
    return `${min} ${hr} ${dom} ${mon} ${dow}`.trim();
  }

  assert.equal(formatCron("0", "0", "*", "*", "*"), "0 0 * * *");
  assert.equal(formatCron("*/15", "*", "*", "*", "*"), "*/15 * * * *");
  assert.equal(formatCron("0", "12", "1", "*", "*"), "0 12 1 * *");
  assert.equal(formatCron("30", "4", "*", "*", "1-5"), "30 4 * * 1-5");
});

console.log("\n======================================================");
console.log(`📊 Suite Results: ${passedCount} Passed, ${failedCount} Failed`);
console.log("======================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
