import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../../../config/db";
import { achievements, userAchievements } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { handleRoute } from "../../../shared/http/route-handler";

export async function GET(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const unlockedAchievements = await db
			.select({
				id: achievements.key,
			})
			.from(userAchievements)
			.innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
			.where(and(eq(userAchievements.userId, claims.sub), isNotNull(userAchievements.unlockedAt)));
		return {
			achievements: unlockedAchievements.map((achievement) => achievement.id),
		};
	});
}
