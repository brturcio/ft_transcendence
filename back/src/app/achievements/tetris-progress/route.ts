
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../../../config/db";
import { achievements, userAchievements, userStats } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const TETRIS_ACHIEVEMENTS = [
	{ key: "first_tetris", threshold: 1 },
	{ key: "five_tetrises", threshold: 5 },
	{ key: "ten_tetrises", threshold: 10 },
	{ key: "fifty_tetrises", threshold: 50 },
];

export async function POST(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const now = new Date();
		const [stats] = await db
			.select({
				id: userStats.id,
				tetrises: userStats.tetrises,
			})
			.from(userStats)
			.where(eq(userStats.userId, claims.sub))
			.limit(1);
		if (!stats) {
			throw new AppError("User stats not found", 404, "USER_STATS_NOT_FOUND");
		}
		const tetrises = stats.tetrises + 1;
		await db
			.update(userStats)
			.set({
				tetrises,
				updatedAt: now,
			})
			.where(eq(userStats.id, stats.id));
		const achievementRows = await db
			.select({
				id: achievements.id,
				key: achievements.key,
			})
			.from(achievements);
		const newlyUnlocked: string[] = [];
		for (const tetrisAchievement of TETRIS_ACHIEVEMENTS) {
			const achievement = achievementRows.find((row) => row.key === tetrisAchievement.key);
			if (!achievement) {
				continue;
			}
			const unlockedAt = tetrises >= tetrisAchievement.threshold ? now : null;
			const [existing] = await db
				.select({
					id: userAchievements.id,
					unlockedAt: userAchievements.unlockedAt,
				})
				.from(userAchievements)
				.where(
					and(
						eq(userAchievements.userId, claims.sub),
						eq(userAchievements.achievementId, achievement.id),
					),
				)
				.limit(1);
			if (existing) {
				await db
					.update(userAchievements)
					.set({
						progress: tetrises,
						...(existing.unlockedAt === null && unlockedAt ? { unlockedAt } : {}),
					})
					.where(eq(userAchievements.id, existing.id));
				if (existing.unlockedAt === null && unlockedAt) {
					newlyUnlocked.push(tetrisAchievement.key);
				}
				continue;
			}
			await db.insert(userAchievements).values({
				id: randomUUID(),
				userId: claims.sub,
				achievementId: achievement.id,
				progress: tetrises,
				unlockedAt,
			});
			if (unlockedAt) {
				newlyUnlocked.push(tetrisAchievement.key);
			}
		}
		return {
			tetrises,
			newlyUnlocked,
		};
	});
}
