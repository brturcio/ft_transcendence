import { showAchievementNotification } from "./AchievementCard";

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type SoloGameResult = {
	score: number;
	linesCompleted: number;
	tetrises: number;
};

type SoloGameResponse = {
	newlyUnlocked: string[];
};

export const unlockAchievement = async (id: string): Promise<boolean> => {
	try {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			return false;
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
			return false;
		}
		const data: { alreadyUnlocked?: boolean } = await response.json();
		if (data.alreadyUnlocked) {
			return false;
		}
		showAchievementNotification(id);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

export const reportSoloGameResult = async (result: SoloGameResult) => {
	try {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			return;
		}
		const response = await fetch(`${API_BASE_URL}/stats/solo-game`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(result),
		});
		if (!response.ok) {
			return;
		}
		const data: SoloGameResponse = await response.json();
		for (const id of data.newlyUnlocked) {
			showAchievementNotification(id);
		}
	} catch (err) {
		console.error("Solo game report error:", err);
	}
};
