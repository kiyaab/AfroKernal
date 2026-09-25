import { execSync, spawn } from "node:child_process";
import fs from "node:fs";

const PG_BIN = "D:\\postgress\\bin";
const PG_DATA = "D:\\postgress\\data";

function isPgRunning() {
  try {
    const out = execSync(`"${PG_BIN}\\pg_isready.exe" -h localhost -p 5432`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return out.includes("accepting connections");
  } catch {
    return false;
  }
}

async function ensureDb() {
  if (isPgRunning()) {
    console.log("✅ PostgreSQL is already running and accepting connections on localhost:5432");
    return;
  }

  console.log("⏳ Starting local PostgreSQL server...");

  // Clean stale postmaster.pid if process is not alive
  const pidFile = `${PG_DATA}\\postmaster.pid`;
  if (fs.existsSync(pidFile)) {
    try {
      const content = fs.readFileSync(pidFile, "utf-8");
      const pid = parseInt(content.split("\n")[0].trim(), 10);
      try {
        process.kill(pid, 0); // check if alive
      } catch {
        // Not running, safe to remove
        fs.unlinkSync(pidFile);
        console.log("🧹 Cleaned stale postmaster.pid");
      }
    } catch {
      /* ignore */
    }
  }

  // Spawn postgres detached
  const pgProc = spawn(`"${PG_BIN}\\postgres.exe"`, ["-D", `"${PG_DATA}"`], {
    shell: true,
    detached: true,
    stdio: "ignore",
  });
  pgProc.unref();

  // Wait up to 10 seconds for pg to be ready
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (isPgRunning()) {
      ready = true;
      break;
    }
  }

  if (ready) {
    console.log("✅ PostgreSQL started successfully on localhost:5432");
  } else {
    console.warn("⚠️ PostgreSQL startup attempt initiated. Run npm run test:db to verify.");
  }
}

ensureDb().catch((e) => {
  console.error("Database check warning:", e.message);
});
