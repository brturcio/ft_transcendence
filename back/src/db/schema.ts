import { pgEnum, pgTable, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";

export const friendshipStatusEnum = pgEnum("FriendshipStatus", ["PENDING", "ACCEPTED", "BLOCKED"]);
export const matchResultEnum = pgEnum("MatchResult", ["WIN", "LOSS", "DRAW"]);

export const users = pgTable("User", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	username: text("username").notNull(),
	passwordHash: text("passwordHash").notNull(),
	avatarUrl: text("avatarUrl"),
	bio: text("bio"),
	isActive: boolean("isActive").notNull().default(true),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const sessions = pgTable("Session", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull(),
	refreshTokenHash: text("refreshTokenHash").notNull(),
	userAgent: text("userAgent"),
	ipAddress: text("ipAddress"),
	expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
	revokedAt: timestamp("revokedAt", { mode: "date" }),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const userStats = pgTable("UserStat", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull(),
	gamesPlayed: integer("gamesPlayed").notNull().default(0),
	gamesWon: integer("gamesWon").notNull().default(0),
	gamesLost: integer("gamesLost").notNull().default(0),
	winRate: doublePrecision("winRate").notNull().default(0),
	linesCompleted: integer("linesCompleted").notNull().default(0),
	linesSent: integer("linesSent").notNull().default(0),
	linesReceived: integer("linesReceived").notNull().default(0),
	tetrises: integer("tetrises").notNull().default(0),
	tournamentsPlayed: integer("tournamentsPlayed").notNull().default(0),
	tournamentsWon: integer("tournamentsWon").notNull().default(0),
	xp: integer("xp").notNull().default(0),
	level: integer("level").notNull().default(1),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const achievements = pgTable("Achievement", {
	id: text("id").primaryKey(),
	key: text("key").notNull(),
	title: text("title").notNull(),
	description: text("description"),
	category: text("category"),
	points: integer("points").notNull().default(0),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const friendships = pgTable("Friendship", {
	id: text("id").primaryKey(),
	requesterId: text("requesterId").notNull(),
	addresseeId: text("addresseeId").notNull(),
	status: friendshipStatusEnum("status").notNull().default("PENDING"),
	respondedAt: timestamp("respondedAt", { mode: "date" }),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const messages = pgTable("Message", {
	id: text("id").primaryKey(),
	senderId: text("senderId").notNull(),
	recipientId: text("recipientId"),
	gameId: text("gameId"),
	tournamentId: text("tournamentId"),
	content: text("content").notNull(),
	editedAt: timestamp("editedAt", { mode: "date" }),
	deletedAt: timestamp("deletedAt", { mode: "date" }),
	createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const userAchievements = pgTable("UserAchievement", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull(),
	achievementId: text("achievementId").notNull(),
	progress: integer("progress").notNull().default(0),
	unlockedAt: timestamp("unlockedAt", { mode: "date" }),
});
