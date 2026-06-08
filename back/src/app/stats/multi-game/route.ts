import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { achievements, userAchievements, userStats } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const multiplayerGameSchema = z.object({
	won: z.boolean(),
});

const GAME_ACHIEVEMENTS = [
	{ key: "first_game", threshold: 1 },
	{ key: "five_games", threshold: 5 },
	{ key: "ten_games", threshold: 10 },
	{ key: "fifty_games", threshold: 50 },
	{ key: "hundred_games", threshold: 100 },
];

const WIN_ACHIEVEMENTS = [
	{ key: "first_victory", threshold: 1 },
	{ key: "five_wins", threshold: 5 },
	{ key: "ten_wins", threshold: 10 },
	{ key: "fifty_wins", threshold: 50 },
];

async function updateAchievementProgress(input: {
	userId: string;
	achievementKey: string;
	progress: number;
	threshold: number;
	now: Date;
}) {
	const [achievement] = await db
		.select({ id: achievements.id, key: achievements.key })
		.from(achievements)
		.where(eq(achievements.key, input.achievementKey))
		.limit(1);

	if (!achievement) {
		return null;
	}

	const unlockedAt = input.progress >= input.threshold ? input.now : null;
	const [existing] = await db
		.select({
			id: userAchievements.id,
			unlockedAt: userAchievements.unlockedAt,
		})
		.from(userAchievements)
		.where(
			and(
				eq(userAchievements.userId, input.userId),
				eq(userAchievements.achievementId, achievement.id),
			),
		)
		.limit(1);

	if (existing) {
		await db
			.update(userAchievements)
			.set({
				progress: input.progress,
				...(existing.unlockedAt === null && unlockedAt ? { unlockedAt } : {}),
			})
			.where(eq(userAchievements.id, existing.id));

		return existing.unlockedAt === null && unlockedAt ? achievement.key : null;
	}

	await db.insert(userAchievements).values({
		id: randomUUID(),
		userId: input.userId,
		achievementId: achievement.id,
		progress: input.progress,
		unlockedAt,
	});

	return unlockedAt ? achievement.key : null;
}

export async function POST(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const payload = multiplayerGameSchema.parse(await request.json());
		const now = new Date();

		const [stats] = await db
			.select({
				id: userStats.id,
				soloGamesPlayed: userStats.soloGamesPlayed,
				multiGamesPlayed: userStats.multiGamesPlayed,
				multiGamesWon: userStats.multiGamesWon,
				multiGamesLost: userStats.multiGamesLost,
			})
			.from(userStats)
			.where(eq(userStats.userId, claims.sub))
			.limit(1);

		if (!stats) {
			throw new AppError("User stats not found", 404, "USER_STATS_NOT_FOUND");
		}

		const multiGamesPlayed = stats.multiGamesPlayed + 1;
		const multiGamesWon = stats.multiGamesWon + (payload.won ? 1 : 0);
		const multiGamesLost = stats.multiGamesLost + (payload.won ? 0 : 1);
		const multiWinRate = multiGamesPlayed > 0 ? (multiGamesWon / multiGamesPlayed) * 100 : 0;

		const updatedStats = {
			multiGamesPlayed,
			multiGamesWon,
			multiGamesLost,
			multiWinRate,
		};

		await db
			.update(userStats)
			.set({
				...updatedStats,
				updatedAt: now,
			})
			.where(eq(userStats.id, stats.id));

		const newlyUnlocked: string[] = [];
		const totalGamesPlayed = stats.soloGamesPlayed + multiGamesPlayed;

		for (const achievement of GAME_ACHIEVEMENTS) {
			const unlocked = await updateAchievementProgress({
				userId: claims.sub,
				achievementKey: achievement.key,
				progress: totalGamesPlayed,
				threshold: achievement.threshold,
				now,
			});
			if (unlocked) {
				newlyUnlocked.push(unlocked);
			}
		}

		for (const achievement of WIN_ACHIEVEMENTS) {
			const unlocked = await updateAchievementProgress({
				userId: claims.sub,
				achievementKey: achievement.key,
				progress: multiGamesWon,
				threshold: achievement.threshold,
				now,
			});
			if (unlocked) {
				newlyUnlocked.push(unlocked);
			}
		}

		return {
			stats: updatedStats,
			newlyUnlocked,
		};
	});
}
