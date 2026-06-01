import { existsSync, readFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { join } from "node:path";
import type { RealtimeUser } from "./types";

function loadLocalEnvIfNeeded() {
	if (process.env.JWT_ACCESS_SECRET) {
		return;
	}

	const envPath = join(process.cwd(), ".env");
	if (!existsSync(envPath)) {
		return;
	}

	const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}
		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex === -1) {
			continue;
		}
		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
		process.env[key] ??= value;
	}
}

function getTokenFromRequest(request: IncomingMessage) {
	const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
	const queryToken = url.searchParams.get("token");
	if (queryToken) {
		return queryToken;
	}

	const protocolHeader = request.headers["sec-websocket-protocol"];
	if (typeof protocolHeader === "string") {
		return protocolHeader
			.split(",")
			.map((value) => value.trim())
			.find(Boolean) ?? null;
	}

	return null;
}

export async function authenticateRequest(request: IncomingMessage): Promise<RealtimeUser> {
	loadLocalEnvIfNeeded();

	const token = getTokenFromRequest(request);
	if (!token) {
		throw new Error("Missing access token");
	}

	const { verifyAccessToken } = await import("../modules/auth/tokens");
	const claims = verifyAccessToken(token);

	return {
		id: claims.sub,
		email: claims.email,
		username: claims.username,
	};
}
