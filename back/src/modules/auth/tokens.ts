import { createHash } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

export type AccessTokenClaims = JwtPayload & {
  sub: string;
  email: string;
  username: string;
  type: "access";
};

export type RefreshTokenClaims = JwtPayload & {
  sub: string;
  sid: string;
  type: "refresh";
};

type TokenUser = {
  id: string;
  email: string;
  username: string;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createAccessToken(user: TokenUser): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      type: "access",
      email: user.email,
      username: user.username,
    },
    env.JWT_ACCESS_SECRET,
    {
      ...options,
      subject: user.id,
    },
  );
}

export function createRefreshToken(userId: string, sessionId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_TTL as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      type: "refresh",
      sid: sessionId,
    },
    env.JWT_REFRESH_SECRET,
    {
      ...options,
      subject: userId,
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof decoded === "string") {
      throw new AppError("Invalid access token", 401, "INVALID_TOKEN");
    }

    if (decoded.type !== "access" || !decoded.sub || !decoded.email || !decoded.username) {
      throw new AppError("Invalid access token", 401, "INVALID_TOKEN");
    }

    return decoded as AccessTokenClaims;
  } catch {
    throw new AppError("Invalid access token", 401, "INVALID_TOKEN");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (typeof decoded === "string") {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    if (decoded.type !== "refresh" || !decoded.sub || !decoded.sid) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    return decoded as RefreshTokenClaims;
  } catch {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
}

export function refreshTokenExpiresAt(): Date {
  const ttl = env.JWT_REFRESH_TTL.trim().toLowerCase();
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}

export function extractBearerToken(authorizationHeader: string | null): string {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new AppError("Missing bearer token", 401, "MISSING_TOKEN");
  }

  return authorizationHeader.slice(7).trim();
}
