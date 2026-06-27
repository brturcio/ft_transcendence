import { z } from "zod";
import { handleRoute } from "../../../shared/http/route-handler";
import { extractBearerToken, verifyAccessToken } from "../../../modules/auth/tokens";
import { blockUser, unblockUser } from "../../../realtime/chat";

const blockSchema = z.object({ blockedId: z.string().min(1) });

export async function POST(request: Request) {
  return handleRoute(async () => {
    const token = extractBearerToken(request.headers.get("authorization"));
    const claims = verifyAccessToken(token);
    const blockerId = claims.sub;
    const payload = blockSchema.parse(await request.json());
    const result = await blockUser(blockerId, payload.blockedId);
    return result;
  });
}

export async function DELETE(request: Request) {
  return handleRoute(async () => {
    const token = extractBearerToken(request.headers.get("authorization"));
    const claims = verifyAccessToken(token);
    const blockerId = claims.sub;
    const payload = blockSchema.parse(await request.json());
    const result = await unblockUser(blockerId, payload.blockedId);
    return result;
  });
}
