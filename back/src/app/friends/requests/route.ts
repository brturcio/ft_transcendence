import { randomUUID } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../config/db";
import { friendships, users } from "../../../db/schema";
import { requireActiveUser } from "../../../modules/users/guards";
import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

const createRequestSchema = z.object({
  addresseeId: z.string().trim().min(1),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const authUser = await requireActiveUser(request.headers.get("authorization"));

    const incoming = await db
      .select({
        requestId: friendships.id,
        createdAt: friendships.createdAt,
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.requesterId))
      .where(
        and(
          eq(friendships.addresseeId, authUser.id),
          eq(friendships.status, "PENDING"),
          eq(users.isActive, true),
        ),
      );

    const outgoing = await db
      .select({
        requestId: friendships.id,
        createdAt: friendships.createdAt,
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.addresseeId))
      .where(
        and(
          eq(friendships.requesterId, authUser.id),
          eq(friendships.status, "PENDING"),
          eq(users.isActive, true),
        ),
      );

    return {
      incoming: incoming.map((request) => ({
        id: request.requestId,
        createdAt: request.createdAt,
        user: {
          id: request.userId,
          username: request.username,
          avatarUrl: request.avatarUrl,
        },
      })),
      outgoing: outgoing.map((request) => ({
        id: request.requestId,
        createdAt: request.createdAt,
        user: {
          id: request.userId,
          username: request.username,
          avatarUrl: request.avatarUrl,
        },
      })),
    };
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const authUser = await requireActiveUser(request.headers.get("authorization"));
    const payload = createRequestSchema.parse(await request.json());

    if (payload.addresseeId === authUser.id) {
      throw new AppError("Cannot send a friend request to yourself", 400, "INVALID_FRIEND_REQUEST");
    }

    const [target] = await db
      .select({
        id: users.id,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.addresseeId))
      .limit(1);

    if (!target || !target.isActive) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const [existing] = await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        addresseeId: friendships.addresseeId,
        status: friendships.status,
      })
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, authUser.id), eq(friendships.addresseeId, payload.addresseeId)),
          and(eq(friendships.requesterId, payload.addresseeId), eq(friendships.addresseeId, authUser.id)),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.status === "BLOCKED") {
        throw new AppError("Friendship is blocked", 403, "FRIENDSHIP_BLOCKED");
      }
      if (existing.status === "ACCEPTED") {
        throw new AppError("Already friends", 409, "FRIENDSHIP_EXISTS");
      }
      if (existing.requesterId === authUser.id) {
        throw new AppError("Friend request already sent", 409, "FRIEND_REQUEST_EXISTS");
      }
      throw new AppError("Incoming friend request already exists", 409, "FRIEND_REQUEST_INCOMING");
    }

    const now = new Date();
    const requestId = randomUUID();

    await db.insert(friendships).values({
      id: requestId,
      requesterId: authUser.id,
      addresseeId: payload.addresseeId,
      status: "PENDING",
      respondedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: requestId,
      status: "PENDING",
    };
  });
}
