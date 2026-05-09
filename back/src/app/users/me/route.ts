import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { sessions, users, userStats } from "../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const updateProfileSchema = z
	.object({
		username: z
			.string()
			.trim()
			.min(3)
			.max(24)
			.regex(/^[a-zA-Z0-9_]+$/)
			.optional(),
		bio: z.string().trim().max(280).optional(),
	})
	.refine((value) => value.username !== undefined || value.bio !== undefined, {
		message: "At least one field must be provided",
	});

function toProfileResponse(input: {
	id: string;
	username: string;
	email: string;
	avatarUrl: string | null;
	bio: string | null;
	stats: {
		soloGamesPlayed: number;
		soloLastScore: number;
		soloBestScore: number;
		soloLinesCompleted: number;
		soloTetrises: number;
		multiGamesPlayed: number;
		multiGamesWon: number;
		multiGamesLost: number;
		multiWinRate: number;
		multiLinesSent: number;
		multiLinesReceived: number;
		tournamentsPlayed: number;
		tournamentsWon: number;
		xp: number;
		level: number;
	} | null;
}) {
	return {
		username: input.username,
		email: input.email,
		avatarUrl: input.avatarUrl,
		bio: input.bio ?? "",
		rank: "-",
		stats: {
			solo: {
				gamesPlayed: input.stats?.soloGamesPlayed ?? 0,
				lastScore: input.stats?.soloLastScore ?? 0,
				bestScore: input.stats?.soloBestScore ?? 0,
				linesCompleted: input.stats?.soloLinesCompleted ?? 0,
				tetrises: input.stats?.soloTetrises ?? 0,
			},
			multi: {
				gamesPlayed: input.stats?.multiGamesPlayed ?? 0,
				wins: input.stats?.multiGamesWon ?? 0,
				losses: input.stats?.multiGamesLost ?? 0,
				winRate: `${Math.round(input.stats?.multiWinRate ?? 0)}%`,
				linesSent: input.stats?.multiLinesSent ?? 0,
				linesReceived: input.stats?.multiLinesReceived ?? 0,
			},
			tournaments: {
				played: input.stats?.tournamentsPlayed ?? 0,
				won: input.stats?.tournamentsWon ?? 0,
			},
			gamification: {
				xp: input.stats?.xp ?? 0,
				level: input.stats?.level ?? 1,
			},
		},
	};
}

async function getAuthenticatedUser(authorizationHeader: string | null) {
	const token = extractBearerToken(authorizationHeader);
	const claims = verifyAccessToken(token);

	const [record] = await db
		.select({
			id: users.id,
			email: users.email,
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
		.where(eq(users.id, claims.sub))
		.limit(1);

	if (!record) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}
	if (!record.isActive) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	return {
		id: record.id,
		email: record.email,
		username: record.username,
		avatarUrl: record.avatarUrl,
		bio: record.bio,
		stats:
			record.statsSoloGamesPlayed === null ||
			record.statsSoloLastScore === null ||
			record.statsSoloBestScore === null ||
			record.statsSoloLinesCompleted === null ||
			record.statsSoloTetrises === null ||
			record.statsMultiGamesPlayed === null ||
			record.statsMultiGamesWon === null ||
			record.statsMultiGamesLost === null ||
			record.statsMultiWinRate === null ||
			record.statsMultiLinesSent === null ||
			record.statsMultiLinesReceived === null ||
			record.statsTournamentsPlayed === null ||
			record.statsTournamentsWon === null ||
			record.statsXp === null ||
			record.statsLevel === null
				? null
				: {
						soloGamesPlayed: record.statsSoloGamesPlayed,
						soloLastScore: record.statsSoloLastScore,
						soloBestScore: record.statsSoloBestScore,
						soloLinesCompleted: record.statsSoloLinesCompleted,
						soloTetrises: record.statsSoloTetrises,
						multiGamesPlayed: record.statsMultiGamesPlayed,
						multiGamesWon: record.statsMultiGamesWon,
						multiGamesLost: record.statsMultiGamesLost,
						multiWinRate: record.statsMultiWinRate,
						multiLinesSent: record.statsMultiLinesSent,
						multiLinesReceived: record.statsMultiLinesReceived,
						tournamentsPlayed: record.statsTournamentsPlayed,
						tournamentsWon: record.statsTournamentsWon,
						xp: record.statsXp,
						level: record.statsLevel,
					},
	};
}

export async function GET(request: Request) {
	return handleRoute(async () => {
		const authUser = await getAuthenticatedUser(request.headers.get("authorization"));
		return toProfileResponse(authUser);
	});
}

export async function PATCH(request: Request) {
	return handleRoute(async () => {
		const authUser = await getAuthenticatedUser(request.headers.get("authorization"));
		const payload = updateProfileSchema.parse(await request.json());

		if (payload.username && payload.username !== authUser.username) {
			const [existing] = await db
				.select({ id: users.id })
				.from(users)
				.where(and(eq(users.username, payload.username), ne(users.id, authUser.id)))
				.limit(1);

			if (existing) {
				throw new AppError("Username already in use", 409, "USERNAME_TAKEN");
			}
		}

		await db
			.update(users)
			.set({
				...(payload.username !== undefined ? { username: payload.username } : {}),
				...(payload.bio !== undefined ? { bio: payload.bio } : {}),
				updatedAt: new Date(),
			})
			.where(eq(users.id, authUser.id));

		const updated = await getAuthenticatedUser(request.headers.get("authorization"));
		return toProfileResponse(updated);
	});
}

export async function DELETE(request: Request) {
	return handleRoute(async () => {
		const authUser = await getAuthenticatedUser(request.headers.get("authorization"));
		const deletedUserId = randomUUID();
		const now = new Date();
		await db
			.update(users)
			.set({
				email: `deleted_${deletedUserId}@deleted.local`,
				username: `deleted_${deletedUserId.slice(0, 16)}`,
				passwordHash: "",
				bio: null,
				avatarUrl: null,
				isActive: false,
				updatedAt: now,
			})
			.where(eq(users.id, authUser.id));
		await db
			.update(sessions)
			.set({
				revokedAt: now,
				updatedAt: now,
			})
			.where(eq(sessions.userId, authUser.id));
		return { success: true };
	});
}
