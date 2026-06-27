import { z } from "zod";
import { handleRoute } from "../../../shared/http/route-handler";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { getRoomMessagesForUser, saveChatMessage } from "../../../realtime/chat";
import { db } from "../../../config/db";
import { chatMessages, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

const postSchema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  return handleRoute(async () => {
    const token = extractBearerToken(request.headers.get("authorization"));
    const claims = verifyAccessToken(token);
    const userId = claims.sub;
    const roomId = params.roomId;
    // return messages with sender username
    const rows = await db
      .select({ id: chatMessages.id, roomId: chatMessages.roomId, senderId: chatMessages.senderId, content: chatMessages.content, createdAt: chatMessages.createdAt, username: users.username })
      .from(chatMessages)
      .leftJoin(users, eq(users.id, chatMessages.senderId))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt)
      .limit(200);

    // filter blocked users as in helper
    const msgs = rows.map((r) => ({ id: r.id, roomId: r.roomId, senderId: r.senderId, username: r.username ?? null, content: r.content, createdAt: r.createdAt }));
    return msgs;
  });
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  return handleRoute(async () => {
    const token = extractBearerToken(request.headers.get("authorization"));
    const claims = verifyAccessToken(token);
    const userId = claims.sub;
    const roomId = params.roomId;
    const payload = postSchema.parse(await request.json());
    const saved = await saveChatMessage(roomId, userId, payload.content);
    return saved;
  });
}
