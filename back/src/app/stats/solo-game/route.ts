import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { achievements, userAchievements, userStats } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const soloGameSchema = z
	.object({
		score: z.number().int().min(0),
		linesCompleted: z.number().int().min(0),
		tetrises: z.number().int().min(0),
	})
	.refine((value) => value.tetrises <= Math.floor(value.linesCompleted / 4), {
		message: "Tetrises cannot exceed completed lines",
		path: ["tetrises"],
	});

const GAME_ACHIEVEMENTS = [
	{ key: "first_game", threshold: 1 },
	{ key: "five_games", threshold: 5 },
	{ key: "ten_games", threshold: 10 },
	{ key: "fifty_games", threshold: 50 },
	{ key: "hundred_games", threshold: 100 },
];

const TETRIS_ACHIEVEMENTS = [
	{ key: "first_tetris", threshold: 1 },
	{ key: "five_tetrises", threshold: 5 },
	{ key: "ten_tetrises", threshold: 10 },
	{ key: "fifty_tetrises", threshold: 50 },
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
		const payload = soloGameSchema.parse(await request.json());
		const now = new Date();

		const [stats] = await db
			.select({
				id: userStats.id,
				soloGamesPlayed: userStats.soloGamesPlayed,
				soloBestScore: userStats.soloBestScore,
				soloLinesCompleted: userStats.soloLinesCompleted,
				soloTetrises: userStats.soloTetrises,
			})
			.from(userStats)
			.where(eq(userStats.userId, claims.sub))
			.limit(1);

		if (!stats) {
			throw new AppError("User stats not found", 404, "USER_STATS_NOT_FOUND");
		}

		const updatedStats = {
			soloGamesPlayed: stats.soloGamesPlayed + 1,
			soloLastScore: payload.score,
			soloBestScore: Math.max(stats.soloBestScore, payload.score),
			soloLinesCompleted: stats.soloLinesCompleted + payload.linesCompleted,
			soloTetrises: stats.soloTetrises + payload.tetrises,
		};

		await db
			.update(userStats)
			.set({
				...updatedStats,
				updatedAt: now,
			})
			.where(eq(userStats.id, stats.id));

		const newlyUnlocked: string[] = [];
		for (const achievement of GAME_ACHIEVEMENTS) {
			const unlocked = await updateAchievementProgress({
				userId: claims.sub,
				achievementKey: achievement.key,
				progress: updatedStats.soloGamesPlayed,
				threshold: achievement.threshold,
				now,
			});
			if (unlocked) {
				newlyUnlocked.push(unlocked);
			}
		}

		for (const achievement of TETRIS_ACHIEVEMENTS) {
			const unlocked = await updateAchievementProgress({
				userId: claims.sub,
				achievementKey: achievement.key,
				progress: updatedStats.soloTetrises,
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
