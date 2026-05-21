import { desc, sql } from "drizzle-orm";
import { db } from "../../../config/db";
import { users, userStats } from "../../../db/schema";
import { handleRoute } from "../../../shared/http/route-handler";

export async function GET() {
	return handleRoute(async () => {
		const leaderboard = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				soloBestScore: userStats.soloBestScore,
			})
			.from(users)
			.innerJoin(userStats, sql`${users.id} = ${userStats.userId}`)
			.orderBy(desc(userStats.soloBestScore))
			.limit(50);

		return {
			status: 200,
			data: leaderboard,
		};
	});
}
