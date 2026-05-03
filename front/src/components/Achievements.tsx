import { showAchievementNotification } from "./AchievementCard";

const STORAGE_KEY = "unlocked_achievements";
const TETRIS_COUNT_KEY = "tetris_count"; //a changer pour le stocker dans la bdd

export function getUnlockedAchievements(): string[] {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
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
		const existing = localStorage.getItem(STORAGE_KEY);
		const unlocked: string[] = existing ? JSON.parse(existing) : [];

		if (unlocked.includes(id)) return;

		const updated = [...unlocked, id];

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

		showAchievementNotification(id);

		window.dispatchEvent(new Event("achievements_updated"));

		await fetch("/api/achievements/unlock", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ achievementId: id }),
		});
	} catch (err) {
		console.error(err);
	}
};

export const unlockTetrisAchievement = async () => {
	try {
		const stored = localStorage.getItem(TETRIS_COUNT_KEY);
		let count = stored ? parseInt(stored, 10) : 0;

		count++;

		console.log("tetris: ", count);

		localStorage.setItem(TETRIS_COUNT_KEY, count.toString());

		if (count == 1) {
			unlockAchievement("first_tetris");
		}

		if (count == 5) {
			unlockAchievement("five_tetrises");
		}

		if (count == 10) {
			unlockAchievement("ten_tetrises");
		}

		if (count == 50) {
			unlockAchievement("fifty_tetrises");
		}

	} catch (err) {
		console.error("Tetris achievement error:", err);
	}
};