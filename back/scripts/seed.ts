import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/config/db";
import { achievements, friendships, messages, userStats, users } from "../src/db/schema";

function loadEnvFromFile() {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const idx = trimmed.indexOf("=");
    if (idx === -1) {
      continue;
    }

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function upsertAchievement(data: {
  key: string;
  title: string;
  description: string;
  category: string;
  points: number;
}) {
  const [existing] = await db
    .select({ id: achievements.id })
    .from(achievements)
    .where(eq(achievements.key, data.key))
    .limit(1);

  const now = new Date();

  if (existing) {
    await db
      .update(achievements)
      .set({
        title: data.title,
        description: data.description,
        category: data.category,
        points: data.points,
        updatedAt: now,
      })
      .where(eq(achievements.id, existing.id));
    return;
  }

  await db.insert(achievements).values({
    id: randomUUID(),
    key: data.key,
    title: data.title,
    description: data.description,
    category: data.category,
    points: data.points,
    createdAt: now,
    updatedAt: now,
  });
}

async function upsertUser(email: string, username: string) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const now = new Date();
  const passwordHash = await bcrypt.hash("Password123!", 10);

  if (existing) {
    await db
      .update(users)
      .set({
        username,
        bio: "Seed user for local development.",
        passwordHash,
        updatedAt: now,
      })
      .where(eq(users.id, existing.id));

    await db
      .insert(userStats)
      .values({
        id: randomUUID(),
        userId: existing.id,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: userStats.userId });

    return existing.id;
  }

  const id = randomUUID();

  await db.insert(users).values({
    id,
    email,
    username,
    passwordHash,
    bio: "Seed user for local development.",
    avatarUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(userStats).values({
    id: randomUUID(),
    userId: id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

async function main() {
  loadEnvFromFile();

  await upsertAchievement({
    key: "first_game_played",
    title: "Welcome to the game",
    description: "Play your first game.",
    category: "games",
    points: 10,
  });

  await upsertAchievement({
    key: "first_game_won",
    title: "First victory",
    description: "Win your first game.",
    category: "games",
    points: 20,
  });

  await upsertAchievement({
    key: "first_chat_message",
    title: "Hello there",
    description: "Send your first chat message.",
    category: "social",
    points: 10,
  });

  const aliceId = await upsertUser("alice@example.com", "alice");
  const bobId = await upsertUser("bob@example.com", "bob");

  const now = new Date();

  await db
    .insert(friendships)
    .values({
      id: randomUUID(),
      requesterId: aliceId,
      addresseeId: bobId,
      status: "ACCEPTED",
      respondedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [friendships.requesterId, friendships.addresseeId],
      set: {
        status: "ACCEPTED",
        respondedAt: now,
        updatedAt: now,
      },
    });

  const [existingMessage] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.senderId, aliceId),
        eq(messages.recipientId, bobId),
        eq(messages.content, "Welcome to ft_transcendence dev seed."),
      ),
    )
    .limit(1);

  if (!existingMessage) {
    await db.insert(messages).values({
      id: randomUUID(),
      senderId: aliceId,
      recipientId: bobId,
      gameId: null,
      tournamentId: null,
      content: "Welcome to ft_transcendence dev seed.",
      editedAt: null,
      deletedAt: null,
      createdAt: now,
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
