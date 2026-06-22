export type Achievement = {
	id: string;
	image: string;
};

export const ACHIEVEMENTS: Record<string, Achievement> = {
	first_game: {
		id: "first_game",
		image: "/src/assets/achievements/first-game.png",
	},
	five_games: {
		id: "five_games",
		image: "/src/assets/achievements/five-games.png",
	},
	ten_games: {
		id: "ten_games",
		image: "/src/assets/achievements/ten-games.png",
	},
	fifty_games: {
		id: "fifty_games",
		image: "/src/assets/achievements/fifty-games.png",
	},
	hundred_games: {
		id: "hundred_games",
		image: "/src/assets/achievements/hundred-games.png",
	},
	first_victory: {
		id: "first_victory",
		image: "/src/assets/achievements/first-victory.png",
	},
	five_wins: {
		id: "five_wins",
		image: "/src/assets/achievements/five-wins.png",
	},
	ten_wins: {
		id: "ten_wins",
		image: "/src/assets/achievements/ten-wins.png",
	},
	fifty_wins: {
		id: "fifty_wins",
		image: "/src/assets/achievements/fifty-wins.png",
	},
	first_tetris: {
		id: "first_tetris",
		image: "/src/assets/achievements/first-tetris.png",
	},
	five_tetrises: {
		id: "five_tetrises",
		image: "/src/assets/achievements/five-tetrises.png",
	},
	ten_tetrises: {
		id: "ten_tetrises",
		image: "/src/assets/achievements/ten-tetrises.png",
	},
	fifty_tetrises: {
		id: "fifty_tetrises",
		image: "/src/assets/achievements/fifty-tetrises.png",
	},
	curious: {
		id: "curious",
		image: "/src/assets/achievements/curious.png",
	},
	first_message: {
		id: "first_message",
		image: "/src/assets/achievements/first-message.png",
	},
	hundred_messages: {
		id: "hundred_messages",
		image: "/src/assets/achievements/hundred-messages.png",
	},
	host_tournament: {
		id: "host_tournament",
		image: "/src/assets/achievements/host-tournament.png",
	},
	host_full_tournament: {
		id: "host_full_tournament",
		image: "/src/assets/achievements/host-full-tournament.png",
	},
	win_tournament: {
		id: "win_tournament",
		image: "/src/assets/achievements/win-tournament.png",
	},
	win_medium_tournament: {
		id: "win_medium_tournament",
		image: "/src/assets/achievements/win-medium-tournament.png",
	},
	win_large_tournament: {
		id: "win_large_tournament",
		image: "/src/assets/achievements/win-large-tournament.png",
	},
	win_max_tournament: {
		id: "win_max_tournament",
		image: "/src/assets/achievements/win-max-tournament.png",
	},
	finish_last_tournament: {
		id: "finish_last_tournament",
		image: "/src/assets/achievements/finish-last-tournament.png",
	},
	change_nickname: {
		id: "change_nickname",
		image: "/src/assets/achievements/change-nickname.png",
	},
};

export const getAchievement = (id: string): Achievement | undefined => {
	return ACHIEVEMENTS[id];
};

export const getAllAchievements = (): Achievement[] => {
	return Object.values(ACHIEVEMENTS);
};
