import { and, eq, or } from "drizzle-orm";
import { db } from "../../../config/db";
import { friendships } from "../../../db/schema";
import { requireActiveUser } from "../../../modules/users/guards";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const authUser = await requireActiveUser(request.headers.get("authorization"));
    const { id } = await params;
    const friendId = id?.trim();

    if (!friendId) {
      throw new AppError("Friend id is required", 400, "FRIEND_ID_REQUIRED");
    }

    if (friendId === authUser.id) {
      throw new AppError("Invalid friend id", 400, "INVALID_FRIEND_ID");
    }

    const [friendship] = await db
      .select({
        id: friendships.id,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "ACCEPTED"),
          or(
            and(eq(friendships.requesterId, authUser.id), eq(friendships.addresseeId, friendId)),
            and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, authUser.id)),
          ),
        ),
      )
      .limit(1);

    if (!friendship) {
      throw new AppError("Friendship not found", 404, "FRIENDSHIP_NOT_FOUND");
    }

    await db.delete(friendships).where(eq(friendships.id, friendship.id));

    return { success: true };
  });
}
