import { randomUUID } from "node:crypto";
import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { achievements, userAchievements } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";
const unlockAchievementSchema = z.object({
	achievementId: z.string().min(1),
});
export async function POST(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const payload = unlockAchievementSchema.parse(await request.json());
		const [achievement] = await db
			.select({
				id: achievements.id,
				key: achievements.key,
			})
			.from(achievements)
			.where(eq(achievements.key, payload.achievementId))
			.limit(1);
		if (!achievement) {
			throw new AppError("Achievement not found", 404, "ACHIEVEMENT_NOT_FOUND");
		}
		const [existingUnlocked] = await db
			.select({
				id: userAchievements.id,
			})
			.from(userAchievements)
			.where(
				and(
					eq(userAchievements.userId, claims.sub),
					eq(userAchievements.achievementId, achievement.id),
					isNotNull(userAchievements.unlockedAt),
				),
			)
			.limit(1);
		if (existingUnlocked) {
			return {
				success: true,
				achievementId: achievement.key,
				alreadyUnlocked: true,
			};
		}
		const now = new Date();
		await db
			.insert(userAchievements)
			.values({
				id: randomUUID(),
				userId: claims.sub,
				achievementId: achievement.id,
				progress: 1,
				unlockedAt: now,
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: {
					unlockedAt: now,
				},
			});
		return {
			success: true,
			achievementId: achievement.key,
			alreadyUnlocked: false,
		};
	});
}
