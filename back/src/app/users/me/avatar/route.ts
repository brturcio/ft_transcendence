import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import { users } from "../../../../db/schema";
import { extractBearerToken, verifyAccessToken } from "../../../../modules/auth/tokens";
import { AppError } from "../../../../shared/errors/app-error";
import { handleRoute } from "../../../../shared/http/route-handler";

export const runtime = "nodejs";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES = new Map([
	["image/jpeg", ".jpg"],
	["image/png", ".png"],
	["image/webp", ".webp"],
]);

export async function PATCH(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const formData = await request.formData();
		const avatar = formData.get("avatar");

		if (!(avatar instanceof File)) {
			throw new AppError("Avatar file is required", 400, "AVATAR_FILE_REQUIRED");
		}

		if (avatar.size > MAX_AVATAR_SIZE) {
			throw new AppError("Avatar file is too large", 400, "AVATAR_TOO_LARGE");
		}

		const extension = AVATAR_TYPES.get(avatar.type) ?? extname(avatar.name).toLowerCase();
		if (!AVATAR_TYPES.has(avatar.type) || ![".jpg", ".jpeg", ".png", ".webp"].includes(extension)) {
			throw new AppError("Avatar must be a PNG, JPG, or WEBP image", 400, "INVALID_AVATAR_TYPE");
		}

		const [user] = await db
			.select({
				id: users.id,
				isActive: users.isActive,
				avatarUrl: users.avatarUrl,
			})
			.from(users)
			.where(eq(users.id, claims.sub))
			.limit(1);

		if (!user || !user.isActive) {
			throw new AppError("User not found", 404, "USER_NOT_FOUND");
		}

		const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
		await mkdir(uploadsDir, { recursive: true });

		const fileName = `${claims.sub}-${randomUUID()}${extension === ".jpeg" ? ".jpg" : extension}`;
		const filePath = join(uploadsDir, fileName);
		const bytes = await avatar.arrayBuffer();
		await writeFile(filePath, Buffer.from(bytes));
		await deleteAvatarFile(user.avatarUrl);

		const avatarUrl = `${new URL(request.url).origin}/uploads/avatars/${fileName}`;
		await db
			.update(users)
			.set({
				avatarUrl,
				updatedAt: new Date(),
			})
			.where(eq(users.id, claims.sub));

		return { avatarUrl };
	});
}

async function deleteAvatarFile(avatarUrl: string | null) {
	if (!avatarUrl) {
		return;
	}
	const url = new URL(avatarUrl);
	if (!url.pathname.startsWith("/uploads/avatars/")) {
		return;
	}
	const fileName = url.pathname.split("/").at(-1);
	if (!fileName) {
		return;
	}
	const filePath = join(process.cwd(), "public", "uploads", "avatars", fileName);
	try {
		await unlink(filePath);
	} catch {}
}

export async function DELETE(request: Request) {
	return handleRoute(async () => {
		const token = extractBearerToken(request.headers.get("authorization"));
		const claims = verifyAccessToken(token);
		const [user] = await db
			.select({
				id: users.id,
				isActive: users.isActive,
				avatarUrl: users.avatarUrl,
			})
			.from(users)
			.where(eq(users.id, claims.sub))
			.limit(1);

		if (!user || !user.isActive) {
			throw new AppError("User not found", 404, "USER_NOT_FOUND");
		}

		await deleteAvatarFile(user.avatarUrl);

		await db
			.update(users)
			.set({
				avatarUrl: null,
				updatedAt: new Date(),
			})
			.where(eq(users.id, claims.sub));

		return { avatarUrl: null };
	});
}
