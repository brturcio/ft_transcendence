import { and, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { friendships, users } from "../../db/schema";
import { requireActiveUser } from "../../modules/users/guards";
import { handleRoute } from "../../shared/http/route-handler";

export async function GET(request: Request) {
	return handleRoute(async () => {
		const authUser = await requireActiveUser(request.headers.get("authorization"));

		const outgoing = await db
			.select({
				friendshipId: friendships.id,
				userId: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				status: users.status,
				since: friendships.respondedAt,
			})
			.from(friendships)
			.innerJoin(users, eq(users.id, friendships.addresseeId))
			.where(
				and(
					eq(friendships.requesterId, authUser.id),
					eq(friendships.status, "ACCEPTED"),
					eq(users.isActive, true),
				),
			);

		const incoming = await db
			.select({
				friendshipId: friendships.id,
				userId: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				status: users.status,
				since: friendships.respondedAt,
			})
			.from(friendships)
			.innerJoin(users, eq(users.id, friendships.requesterId))
			.where(
				and(
					eq(friendships.addresseeId, authUser.id),
					eq(friendships.status, "ACCEPTED"),
					eq(users.isActive, true),
				),
			);

		const friends = [...outgoing, ...incoming]
			.map((friend) => ({
				id: friend.userId,
				username: friend.username,
				avatarUrl: friend.avatarUrl,
				friendshipId: friend.friendshipId,
				status: friend.status,
				since: friend.since,
			}))
			.sort((left, right) => left.username.localeCompare(right.username));

		return { friends };
	});
}