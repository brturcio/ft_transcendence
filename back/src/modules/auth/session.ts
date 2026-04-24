import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../config/db";
import { sessions } from "../../db/schema";
import { AppError } from "../../shared/errors/app-error";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
  verifyRefreshToken,
} from "./tokens";

type TokenUser = {
  id: string;
  email: string;
  username: string;
};

export async function issueSessionTokens(user: TokenUser, metadata?: { userAgent?: string; ipAddress?: string }) {
  const sessionId = randomUUID();
  const refreshToken = createRefreshToken(user.id, sessionId);
  const now = new Date();

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
    expiresAt: refreshTokenExpiresAt(),
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    token: createAccessToken(user),
    refreshToken,
  };
}

export async function rotateSessionTokens(refreshToken: string, user: TokenUser) {
  const claims = verifyRefreshToken(refreshToken);

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, claims.sid), eq(sessions.userId, claims.sub), isNull(sessions.revokedAt)))
    .limit(1);

  if (!session) {
    throw new AppError("Refresh session not found", 401, "INVALID_REFRESH_TOKEN");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new AppError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
  }

  if (session.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const newRefreshToken = createRefreshToken(user.id, session.id);

  await db
    .update(sessions)
    .set({
      refreshTokenHash: hashToken(newRefreshToken),
      expiresAt: refreshTokenExpiresAt(),
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, session.id));

  return {
    token: createAccessToken(user),
    refreshToken: newRefreshToken,
  };
}

export async function revokeSessionFromRefreshToken(refreshToken: string): Promise<void> {
  const claims = verifyRefreshToken(refreshToken);

  await db
    .update(sessions)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(sessions.id, claims.sid), eq(sessions.userId, claims.sub)));
}
