import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

// Ensure DATABASE_URL is populated from .env if needed
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, "utf-8");
      const match = raw.match(/DATABASE_URL=(.*)/);
      if (match?.[1]) {
        process.env.DATABASE_URL = match[1].trim().replace(/['"]/g, "");
      }
    }
  } catch {
    /* ignore fallback */
  }
}

declare global {
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" && process.env.PRISMA_LOG === "true"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient = global.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = prisma;
}

let _dbConnectedCache: boolean | null = null;
let _lastCheckTime = 0;

/**
 * Checks if the PostgreSQL database is reachable via Prisma with a short timeout.
 * Cached for 10 seconds to avoid repeating checks on every request.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_dbConnectedCache !== null && now - _lastCheckTime < 10000) {
    return _dbConnectedCache;
  }

  try {
    const checkPromise = prisma.$queryRaw`SELECT 1 as connected`;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB check timed out")), 2500),
    );

    await Promise.race([checkPromise, timeoutPromise]);
    _dbConnectedCache = true;
    _lastCheckTime = now;
    return true;
  } catch {
    _dbConnectedCache = false;
    _lastCheckTime = now;
    return false;
  }
}
