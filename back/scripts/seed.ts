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
	const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

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

	const achievementSeeds = [
		{
			key: "first_game",
			title: "Welcome to the game",
			description: "Play your first game.",
			category: "games",
			points: 10,
		},
		{
			key: "five_games",
			title: "Getting the hang of it",
			description: "Play 5 games.",
			category: "games",
			points: 20,
		},
		{
			key: "ten_games",
			title: "You don't want to stop ?",
			description: "Play ten games.",
			category: "games",
			points: 30,
		},
		{
			key: "fifty_games",
			title: "Glued to the game",
			description: "Play 50 games.",
			category: "games",
			points: 50,
		},
		{
			key: "hundred_games",
			title: "You're a regular now",
			description: "Play 100 games.",
			category: "games",
			points: 100,
		},
		{
			key: "first_victory",
			title: "First victory",
			description: "Win your first game.",
			category: "wins",
			points: 20,
		},
		{
			key: "five_wins",
			title: "Winning streak",
			description: "Win five games.",
			category: "wins",
			points: 40,
		},
		{
			key: "ten_wins",
			title: "He should go pro",
			description: "Win 10 games.",
			category: "wins",
			points: 60,
		},
		{
			key: "fifty_wins",
			title: "Heres your crown king",
			description: "Win 50 games.",
			category: "wins",
			points: 100,
		},
		{
			key: "first_tetris",
			title: "The name of the game",
			description: "Complete your first tetris.",
			category: "tetris",
			points: 10,
		},
		{
			key: "five_tetrises",
			title: "Understanding the game",
			description: "Complete 5 tetrises.",
			category: "tetris",
			points: 30,
		},
		{
			key: "ten_tetrises",
			title: "His getting gooood",
			description: "Complete 10 tetrises.",
			category: "tetris",
			points: 50,
		},
		{
			key: "fifty_tetrises",
			title: "Can someone stop him ????",
			description: "Complete 50 tetrises.",
			category: "tetris",
			points: 100,
		},
		{
			key: "curious",
			title: "Curious",
			description: "Click on this badge.",
			category: "hidden",
			points: 5,
		},
		{
			key: "first_message",
			title: "Hello there",
			description: "Send your first message in the chat.",
			category: "social",
			points: 10,
		},
		{
			key: "hundred_messages",
			title: "Social confident",
			description: "Send 100 messages in the chat.",
			category: "social",
			points: 50,
		},
		{
			key: "host_tournament",
			title: "Anyone want to join ?",
			description: "Host a tournament.",
			category: "tournaments",
			points: 20,
		},
		{
			key: "host_full_tournament",
			title: "SORRY NO MORE PLACE",
			description: "Host a tournament that is full.",
			category: "tournaments",
			points: 50,
		},
		{
			key: "win_tournament",
			title: "Champion",
			description: "Win a tournament.",
			category: "tournaments",
			points: 50,
		},
		{
			key: "win_medium_tournament",
			title: "The best of the best",
			description: "Win a tournament with 8 to 15 players.",
			category: "tournaments",
			points: 75,
		},
		{
			key: "win_large_tournament",
			title: "The king of the world",
			description: "Win a tournament with more than 15 players.",
			category: "tournaments",
			points: 100,
		},
		{
			key: "win_max_tournament",
			title: "The god of the world",
			description: "Win a tournament with maximum players.",
			category: "tournaments",
			points: 150,
		},
		{
			key: "finish_last_tournament",
			title: "L'important c'est de participer",
			description: "Finish last in a tournament.",
			category: "tournaments",
			points: 5,
		},
		{
			key: "change_nickname",
			title: "New name, who dis ?",
			description: "Change your nickname.",
			category: "profile",
			points: 10,
		},
	];
	for (const achievement of achievementSeeds) {
		await upsertAchievement(achievement);
	}

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
