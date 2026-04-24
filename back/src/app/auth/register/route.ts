import { randomUUID } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { users, userStats } from "../../../db/schema";
import { hashPassword } from "../../../modules/auth/password";
import { issueSessionTokens } from "../../../modules/auth/session";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscore"),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const payload = registerSchema.parse(await request.json());

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, payload.email), eq(users.username, payload.username)))
      .limit(1);

    if (existingUser) {
      throw new AppError("Email or username already in use", 409, "USER_ALREADY_EXISTS");
    }

    const userId = randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id: userId,
      email: payload.email,
      username: payload.username,
      passwordHash: await hashPassword(payload.password),
      bio: null,
      avatarUrl: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(userStats).values({
      id: randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    });

    const tokens = await issueSessionTokens(
      {
        id: userId,
        email: payload.email,
        username: payload.username,
      },
      {
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      },
    );

    return {
      ...tokens,
      user: {
        id: userId,
        email: payload.email,
        username: payload.username,
      },
    };
  });
}
