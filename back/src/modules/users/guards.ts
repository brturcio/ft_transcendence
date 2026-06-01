import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../auth/tokens";
import { AppError } from "../../shared/errors/app-error";

export async function requireActiveUser(authorizationHeader: string | null) {
  const token = extractBearerToken(authorizationHeader);
  const claims = verifyAccessToken(token);

  const [user] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, claims.sub))
    .limit(1);

  if (!user || !user.isActive) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return { id: user.id };
}
