export type Achievement = {
	id: string;
	title: string;
	description: string;
	image: string;
};

export const ACHIEVEMENTS: Record<string, Achievement> = {
	first_game: {
		id: "first_game",
		title: "Welcome to the game",
		description: "Play your first game.",
		image: "/src/assets/achievements/first-game.png",
	},
	five_games: {
		id: "five_games",
		title: "Getting the hang of it",
		description: "Play 5 games.",
		image: "/src/assets/achievements/five-games.png",
	},
	ten_games: {
		id: "ten_games",
		title: "You don't want to stop ?",
		description: "Play ten games.",
		image: "/src/assets/achievements/ten-games.png",
	},
	fifty_games: {
		id: "fifty_games",
		title: "Glued to the game",
		description: "Play 50 games.",
		image: "/src/assets/achievements/fifty-games.png",
	},
	hundred_games: {
		id: "hundred_games",
		title: "You're a regular now",
		description: "Play 100 games.",
		image: "/src/assets/achievements/hundred-games.png",
	},
	first_victory: {
		id: "first_victory",
		title: "First victory",
		description: "Win your first game.",
		image: "/src/assets/achievements/first-victory.png",
	},
	five_wins: {
		id: "five_wins",
		title: "Winning streak",
		description: "Win five games.",
		image: "/src/assets/achievements/five-wins.png",
	},
	ten_wins: {
		id: "ten_wins",
		title: "He should go pro",
		description: "Win 10 games.",
		image: "/src/assets/achievements/ten-wins.png",
	},
	fifty_wins: {
		id: "fifty_wins",
		title: "Heres your crown king",
		description: "Win 50 games.",
		image: "/src/assets/achievements/fifty-wins.png",
	},
	first_tetris: {
		id: "first_tetris",
		title: "The name of the game",
		description: "Complete your first tetris.",
		image: "/src/assets/achievements/first-tetris.png",
	},
	five_tetrises: {
		id: "five_tetrises",
		title: "Understanding the game",
		description: "Complete 5 tetrises.",
		image: "/src/assets/achievements/five-tetrises.png",
	},
	ten_tetrises: {
		id: "ten_tetrises",
		title: "His getting gooood",
		description: "Complete 10 tetrises.",
		image: "/src/assets/achievements/ten-tetrises.png",
	},
	fifty_tetrises: {
		id: "fifty_tetrises",
		title: "Can someone stop him ????",
		description: "Complete 50 tetrises.",
		image: "/src/assets/achievements/fifty-tetrises.png",
	},
	curious: {
		id: "curious",
		title: "Curious",
		description: "Click on this badge.",
		image: "/src/assets/achievements/curious.png",
	},
	first_message: {
		id: "first_message",
		title: "Hello there",
		description: "Send your first message in the chat.",
		image: "/src/assets/achievements/first-message.png",
	},
	hundred_messages: {
		id: "hundred_messages",
		title: "Social confident",
		description: "Send 100 messages in the chat.",
		image: "/src/assets/achievements/hundred-messages.png",
	},
	host_tournament: {
		id: "host_tournament",
		title: "Anyone want to join ?",
		description: "Host a tournament.",
		image: "/src/assets/achievements/host-tournament.png",
	},
	host_full_tournament: {
		id: "host_full_tournament",
		title: "SORRY NO MORE PLACE",
		description: "Host a tournament that is full.",
		image: "/src/assets/achievements/host-full-tournament.png",
	},
	win_tournament: {
		id: "win_tournament",
		title: "Champion",
		description: "Win a tournament.",
		image: "/src/assets/achievements/win-tournament.png",
	},
	win_medium_tournament: {
		id: "win_medium_tournament",
		title: "The best of the best",
		description: "Win a tournament with 8 to 15 players.",
		image: "/src/assets/achievements/win-medium-tournament.png",
	},
	win_large_tournament: {
		id: "win_large_tournament",
		title: "The king of the world",
		description: "Win a tournament with more than 15 players.",
		image: "/src/assets/achievements/win-large-tournament.png",
	},
	win_max_tournament: {
		id: "win_max_tournament",
		title: "The god of the world",
		description: "Win a tournament with maximum players.",
		image: "/src/assets/achievements/win-max-tournament.png",
	},
	finish_last_tournament: {
		id: "finish_last_tournament",
		title: "L'important c'est de participer",
		description: "Finish last in a tournament.",
		image: "/src/assets/achievements/finish-last-tournament.png",
	},
	change_nickname: {
		id: "change_nickname",
		title: "New name, who dis ?",
		description: "Change your nickname.",
		image: "/src/assets/achievements/change-nickname.png",
	},
};

export const getAchievement = (id: string): Achievement | undefined => {
	return ACHIEVEMENTS[id];
};

export const getAllAchievements = (): Achievement[] => {
	return Object.values(ACHIEVEMENTS);
};
