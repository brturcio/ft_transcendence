import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { users } from "../../../db/schema";
import { verifyPassword } from "../../../modules/auth/password";
import { issueSessionTokens } from "../../../modules/auth/session";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const payload = loginSchema.parse(await request.json());

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user || !user.isActive) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const validPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const tokens = await issueSessionTokens(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      {
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      },
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  });
}
