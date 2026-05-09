export type ProfileStats = {
	solo: {
		gamesPlayed: number;
		lastScore: number;
		bestScore: number;
		linesCompleted: number;
		tetrises: number;
	};
	multi: {
		gamesPlayed: number;
		wins: number;
		losses: number;
		winRate: string;
		linesSent: number;
		linesReceived: number;
	};
	tournaments: {
		played: number;
		won: number;
	};
	gamification: {
		xp: number;
		level: number;
	};
};

export type ProfileData = {
	username: string;
	email: string;
	avatarUrl: string | null;
	bio: string;
	rank: string;
	stats: ProfileStats;
	unlockedAchievements?: string[];
};
