import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { users } from "../../../db/schema";
import { rotateSessionTokens } from "../../../modules/auth/session";
import { verifyRefreshToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const payload = refreshSchema.parse(await request.json());
    const claims = verifyRefreshToken(payload.refreshToken);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user || !user.isActive) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const tokens = await rotateSessionTokens(payload.refreshToken, {
      id: user.id,
      email: user.email,
      username: user.username,
    });

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
