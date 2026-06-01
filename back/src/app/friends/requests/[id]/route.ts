import { eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import { friendships } from "../../../../db/schema";
import { requireActiveUser } from "../../../../modules/users/guards";
import { AppError } from "../../../../shared/errors/app-error";
import { handleRoute } from "../../../../shared/http/route-handler";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const authUser = await requireActiveUser(request.headers.get("authorization"));
    const { id } = await params;
    const requestId = id?.trim();

    if (!requestId) {
      throw new AppError("Friend request id is required", 400, "FRIEND_REQUEST_ID_REQUIRED");
    }

    const [record] = await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        status: friendships.status,
      })
      .from(friendships)
      .where(eq(friendships.id, requestId))
      .limit(1);

    if (!record) {
      throw new AppError("Friend request not found", 404, "FRIEND_REQUEST_NOT_FOUND");
    }

    if (record.requesterId !== authUser.id) {
      throw new AppError("Not allowed", 403, "FORBIDDEN");
    }

    if (record.status !== "PENDING") {
      throw new AppError("Friend request is not pending", 409, "FRIEND_REQUEST_NOT_PENDING");
    }

    await db.delete(friendships).where(eq(friendships.id, record.id));

    return { success: true };
  });
}
