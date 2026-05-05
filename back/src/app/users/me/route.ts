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
	username: string;
	email: string;
	bio: string | null;
	stats: {
		gamesPlayed: number;
		gamesWon: number;
		winRate: number;
	} | null;
}) {
	const games = input.stats?.gamesPlayed ?? 0;
	const wins = input.stats?.gamesWon ?? 0;
	const winRate = `${Math.round(input.stats?.winRate ?? 0)}%`;

	return {
		username: input.username,
		email: input.email,
		bio: input.bio ?? "",
		rank: "-",
		stats: {
			games,
			wins,
			winRate,
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
			bio: users.bio,
			isActive: users.isActive,
			statsGamesPlayed: userStats.gamesPlayed,
			statsGamesWon: userStats.gamesWon,
			statsWinRate: userStats.winRate,
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
		bio: record.bio,
		stats:
			record.statsGamesPlayed === null || record.statsGamesWon === null || record.statsWinRate === null
				? null
				: {
						gamesPlayed: record.statsGamesPlayed,
						gamesWon: record.statsGamesWon,
						winRate: record.statsWinRate,
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

