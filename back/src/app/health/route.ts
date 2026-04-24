import { NextRequest } from "next/server";
import { z } from "zod";
import { handleRoute } from "../../shared/http/route-handler";
import { env } from "../../config/env";

const healthQuerySchema = z.object({
  verbose: z.enum(["true", "false"]).optional(),
});

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const query = healthQuerySchema.parse({
      verbose: request.nextUrl.searchParams.get("verbose") ?? undefined,
    });

    const payload = {
      status: "ok",
      service: "ft-transcendence-backend",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    if (query.verbose === "true") {
      return {
        ...payload,
        env: {
          nodeEnv: env.NODE_ENV,
          port: env.PORT,
          corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS,
          logLevel: env.LOG_LEVEL,
        },
      };
    }

    return payload;
  });
}
