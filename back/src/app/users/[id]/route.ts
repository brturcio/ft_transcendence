import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../../../config/db";
import { achievements, userAchievements, userStats, users } from "../../../db/schema";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

type RouteParams = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_request: Request, { params }: RouteParams) {
	return handleRoute(async () => {
		const { id } = await params;
		const userId = id?.trim();
		if (!userId) {
			throw new AppError("User id is required", 400, "USER_ID_REQUIRED");
		}

		const [record] = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				bio: users.bio,
				isActive: users.isActive,
				statsSoloGamesPlayed: userStats.soloGamesPlayed,
				statsSoloLastScore: userStats.soloLastScore,
				statsSoloBestScore: userStats.soloBestScore,
				statsSoloLinesCompleted: userStats.soloLinesCompleted,
				statsSoloTetrises: userStats.soloTetrises,
				statsMultiGamesPlayed: userStats.multiGamesPlayed,
				statsMultiGamesWon: userStats.multiGamesWon,
				statsMultiGamesLost: userStats.multiGamesLost,
				statsMultiWinRate: userStats.multiWinRate,
				statsMultiLinesSent: userStats.multiLinesSent,
				statsMultiLinesReceived: userStats.multiLinesReceived,
				statsTournamentsPlayed: userStats.tournamentsPlayed,
				statsTournamentsWon: userStats.tournamentsWon,
				statsXp: userStats.xp,
				statsLevel: userStats.level,
			})
			.from(users)
			.leftJoin(userStats, eq(userStats.userId, users.id))
			.where(eq(users.id, userId))
			.limit(1);

		if (!record || !record.isActive) {
			throw new AppError("User not found", 404, "USER_NOT_FOUND");
		}

		const unlockedAchievements = await db
			.select({
				id: achievements.key,
			})
			.from(userAchievements)
			.innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
			.where(and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt)));

		return {
			data: {
				username: record.username,
				avatarUrl: record.avatarUrl,
				bio: record.bio ?? "",
				stats: {
					solo: {
						gamesPlayed: record.statsSoloGamesPlayed ?? 0,
						lastScore: record.statsSoloLastScore ?? 0,
						bestScore: record.statsSoloBestScore ?? 0,
						linesCompleted: record.statsSoloLinesCompleted ?? 0,
						tetrises: record.statsSoloTetrises ?? 0,
					},
					multi: {
						gamesPlayed: record.statsMultiGamesPlayed ?? 0,
						wins: record.statsMultiGamesWon ?? 0,
						losses: record.statsMultiGamesLost ?? 0,
						winRate: `${Math.round(record.statsMultiWinRate ?? 0)}%`,
						linesSent: record.statsMultiLinesSent ?? 0,
						linesReceived: record.statsMultiLinesReceived ?? 0,
					},
					tournaments: {
						played: record.statsTournamentsPlayed ?? 0,
						won: record.statsTournamentsWon ?? 0,
					},
					gamification: {
						xp: record.statsXp ?? 0,
						level: record.statsLevel ?? 1,
					},
				},
				unlockedAchievements: unlockedAchievements.map((achievement) => achievement.id),
			},
		};
	});
}
