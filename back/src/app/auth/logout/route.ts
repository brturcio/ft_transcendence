import { z } from "zod";
import { revokeSessionFromRefreshToken } from "../../../modules/auth/session";
import { handleRoute } from "../../../shared/http/route-handler";

const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const payload = logoutSchema.parse(await request.json());

    if (!payload.refreshToken) {
      return { success: true };
    }

    try {
      await revokeSessionFromRefreshToken(payload.refreshToken);
    } catch {
      return { success: true };
    }

    return { success: true };
  });
}
