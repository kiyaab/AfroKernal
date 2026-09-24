import crypto from "node:crypto";
import { prisma, isDatabaseAvailable } from "./prisma.server";

export interface SafeUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hash password securely using PBKDF2 (SHA-512, 100,000 iterations)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash.
 * Strictly rejects users whose passwordHash is null, undefined, or invalid.
 */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
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

/**
 * Generate a cryptographically secure session token (64 characters)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a persistent session in Prisma for a user (valid for 30 days)
 */
export async function createPrismaSession(
  userId: string,
): Promise<{ token: string; expiresAt: Date } | null> {
  const dbOk = await isDatabaseAvailable();
  if (!dbOk) return null;

  try {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return { token, expiresAt };
  } catch (err) {
    console.error("Failed to create session in Prisma:", err);
    return null;
  }
}

/**
 * Validate a session token from request
 */
export async function validatePrismaSession(token: string) {
  const dbOk = await isDatabaseAvailable();
  if (!dbOk) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true,
            userRoles: true,
            userStats: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check expiry
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Refresh last active timestamp asynchronously
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {});

    return session;
  } catch (err) {
    console.error("Error validating session in Prisma:", err);
    return null;
  }
}
