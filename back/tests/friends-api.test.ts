import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { eq, or } from "drizzle-orm";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if (!hasDatabaseUrl) {
  test("friends API flow (skipped)", { skip: "DATABASE_URL not set" }, () => {});
} else {
  process.env.NODE_ENV ??= "test";
  process.env.PORT ??= "8000";
  process.env.CORS_ALLOWED_ORIGINS ??= "http://localhost:3000";
  process.env.LOG_LEVEL ??= "error";
  process.env.JWT_ACCESS_SECRET ??= "test-access-secret-32-characters-long!!!!";
  process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-32-characters-long!!!";
  process.env.JWT_ACCESS_TTL ??= "1h";
  process.env.JWT_REFRESH_TTL ??= "1h";
  process.env.BCRYPT_ROUNDS ??= "10";

  test("friends request flow", async () => {
    const { db } = await import("../src/config/db");
    const { users, friendships } = await import("../src/db/schema");
    const { createAccessToken } = await import("../src/modules/auth/tokens");
    const friendsRoute = await import("../src/app/friends/route");
    const requestsRoute = await import("../src/app/friends/requests/route");
    const acceptRoute = await import("../src/app/friends/requests/[id]/accept/route");
    const removeRoute = await import("../src/app/friends/[id]/route");

    const now = new Date();
    const userA = {
      id: randomUUID(),
      email: `userA-${randomUUID()}@example.com`,
      username: `userA_${randomUUID().slice(0, 8)}`,
      passwordHash: "hashed",
      avatarUrl: null,
      bio: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const userB = {
      id: randomUUID(),
      email: `userB-${randomUUID()}@example.com`,
      username: `userB_${randomUUID().slice(0, 8)}`,
      passwordHash: "hashed",
      avatarUrl: null,
      bio: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values([userA, userB]);

    const tokenA = createAccessToken({ id: userA.id, email: userA.email, username: userA.username });
    const tokenB = createAccessToken({ id: userB.id, email: userB.email, username: userB.username });

    try {
      const createResponse = await requestsRoute.POST(
        new Request("http://localhost/friends/requests", {
          method: "POST",
          headers: {
            authorization: `Bearer ${tokenA}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ addresseeId: userB.id }),
        }),
      );

      assert.equal(createResponse.status, 200);
      const created = await createResponse.json();
      assert.ok(created.id);

      const incomingResponse = await requestsRoute.GET(
        new Request("http://localhost/friends/requests", {
          headers: { authorization: `Bearer ${tokenB}` },
        }),
      );
      const incomingPayload = await incomingResponse.json();
      assert.equal(incomingPayload.incoming.length, 1);
      assert.equal(incomingPayload.incoming[0].user.id, userA.id);

      const acceptResponse = await acceptRoute.POST(
        new Request(`http://localhost/friends/requests/${created.id}/accept`, {
          method: "POST",
          headers: { authorization: `Bearer ${tokenB}` },
        }),
        { params: Promise.resolve({ id: created.id }) },
      );
      assert.equal(acceptResponse.status, 200);

      const friendsResponse = await friendsRoute.GET(
        new Request("http://localhost/friends", {
          headers: { authorization: `Bearer ${tokenA}` },
        }),
      );
      const friendsPayload = await friendsResponse.json();
      assert.equal(friendsPayload.friends.length, 1);
      assert.equal(friendsPayload.friends[0].id, userB.id);

      const removeResponse = await removeRoute.DELETE(
        new Request(`http://localhost/friends/${userB.id}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${tokenA}` },
        }),
        { params: Promise.resolve({ id: userB.id }) },
      );
      assert.equal(removeResponse.status, 200);

      const friendsAfterResponse = await friendsRoute.GET(
        new Request("http://localhost/friends", {
          headers: { authorization: `Bearer ${tokenA}` },
        }),
      );
      const friendsAfter = await friendsAfterResponse.json();
      assert.equal(friendsAfter.friends.length, 0);
    } finally {
      await db
        .delete(friendships)
        .where(
          or(
            eq(friendships.requesterId, userA.id),
            eq(friendships.addresseeId, userA.id),
            eq(friendships.requesterId, userB.id),
            eq(friendships.addresseeId, userB.id),
          ),
        );
      await db
        .delete(users)
        .where(or(eq(users.id, userA.id), eq(users.id, userB.id)));
    }
  });
}
