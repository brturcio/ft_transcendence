import { showAchievementNotification } from "./AchievementCard";

const AUTH_TOKEN_KEY = "ft_auth_token";
const STORAGE_KEY = "unlocked_achievements";
const USER_STORAGE_KEY = "ft_user";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type TetrisProgressResponse = {
	tetrises: number;
	newlyUnlocked: string[];
};

function getAchievementStorageKey() {
	try {
		const storedUser = localStorage.getItem(USER_STORAGE_KEY);
		if (!storedUser) {
			return STORAGE_KEY;
		}

		const user = JSON.parse(storedUser);
		return typeof user?.id === "string" ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;
	} catch {
		return STORAGE_KEY;
	}
}

function saveUnlockedAchievements(ids: string[]) {
	const current = getUnlockedAchievements();
	const updated = Array.from(new Set([...current, ...ids]));
	localStorage.setItem(getAchievementStorageKey(), JSON.stringify(updated));
	for (const id of ids) {
		if (!current.includes(id)) {
			showAchievementNotification(id);
		}
	}
	window.dispatchEvent(new Event("achievements_updated"));
}

export function getUnlockedAchievements(): string[] {
	try {
		const data = localStorage.getItem(getAchievementStorageKey());
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export function isAchievementUnlocked(id: string): boolean {
	return getUnlockedAchievements().includes(id);
}

export const unlockAchievement = async (id: string) => {
	try {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			saveUnlockedAchievements([id]);
			return;
		}
		const response = await fetch(`${API_BASE_URL}/achievements/unlock`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ achievementId: id }),
		});
		if (!response.ok) {
			saveUnlockedAchievements([id]);
			return;
		}
		const data: { alreadyUnlocked?: boolean } = await response.json();
		if (!data.alreadyUnlocked) {
			saveUnlockedAchievements([id]);
		}
	} catch (err) {
		console.error(err);
		saveUnlockedAchievements([id]);
	}
};

export const unlockTetrisAchievement = async () => {
	try {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			return;
		}
		const response = await fetch(`${API_BASE_URL}/achievements/tetris-progress`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			return;
		}
		const data: TetrisProgressResponse = await response.json();
		if (data.newlyUnlocked.length > 0) {
			saveUnlockedAchievements(data.newlyUnlocked);
		}
	} catch (err) {
		console.error("Tetris achievement error:", err);
	}
};
