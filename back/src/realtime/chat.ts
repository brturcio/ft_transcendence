import { randomUUID } from "node:crypto";
import { db, pool } from "../config/db";
import type { Pool } from "pg";
import { chatMessages, userBlocks } from "../db/schema";
import { and, eq, notIn, sql } from "drizzle-orm";

export async function initChatTables() {
  const createChat = `
    CREATE TABLE IF NOT EXISTS "ChatMessage" (
      id TEXT PRIMARY KEY,
      "roomId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      content TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "UserBlock" (
      id TEXT PRIMARY KEY,
      "blockerId" TEXT NOT NULL,
      "blockedId" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE ("blockerId", "blockedId")
    );
  `;

  await pool.query(createChat);
}

export async function saveChatMessage(roomId: string, senderId: string, content: string) {
  const id = randomUUID();
  const createdAt = new Date();
  await db.insert(chatMessages).values({ id, roomId, senderId, content, createdAt });
  return { id, roomId, senderId, content, createdAt };
}

export async function getRoomMessagesForUser(userId: string, roomId: string, limit = 100) {
  // Exclude messages sent by users that the requester blocked or that blocked the requester
  const blockedRows = await db.select({ blockedId: userBlocks.blockedId }).from(userBlocks).where(eq(userBlocks.blockerId, userId));
  const blockersRows = await db.select({ blockerId: userBlocks.blockerId }).from(userBlocks).where(eq(userBlocks.blockedId, userId));

  const blockedIds = blockedRows.map((r) => r.blockedId);
  const blockerIds = blockersRows.map((r) => r.blockerId);

  const rows = await db
    .select({ id: chatMessages.id, roomId: chatMessages.roomId, senderId: chatMessages.senderId, content: chatMessages.content, createdAt: chatMessages.createdAt })
    .from(chatMessages)
    .where(and(eq(chatMessages.roomId, roomId)))
    .orderBy(chatMessages.createdAt)
    .limit(limit);

  // filter in JS to remove blocked senders
  return rows.filter((r) => !blockedIds.includes(r.senderId) && !blockerIds.includes(r.senderId));
}

export async function blockUser(blockerId: string, blockedId: string) {
  const id = randomUUID();
  const createdAt = new Date();
  await db.insert(userBlocks).values({ id, blockerId, blockedId, createdAt });
  return { id, blockerId, blockedId, createdAt };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await db.delete(userBlocks).where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)));
  return { success: true };
}

export async function isBlockedBetween(a: string, b: string) {
  const [one] = await db.select().from(userBlocks).where(and(eq(userBlocks.blockerId, a), eq(userBlocks.blockedId, b))).limit(1);
  const [two] = await db.select().from(userBlocks).where(and(eq(userBlocks.blockerId, b), eq(userBlocks.blockedId, a))).limit(1);
  return Boolean(one || two);
}

export default {};
