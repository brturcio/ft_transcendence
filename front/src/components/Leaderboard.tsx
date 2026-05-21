import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PlayerModal from "./PlayerModal";

type LeaderboardEntry = {
	id: string;
	username: string;
	avatarUrl: string | null;
	soloBestScore: number;
};

const leaderboardRow =
	"flex items-center gap-4 p-3 border-b border-[rgba(110,210,255,0.1)] hover:bg-[rgba(0,229,255,0.05)] cursor-pointer transition-all duration-200 hover:border-[var(--glow-cyan)]";

export default function Leaderboard() {
	const { t } = useTranslation();
	const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);
	const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/users/leaderboard`);
				if (response.ok) {
					const result = await response.json();
					setPlayers(result.data || []);
				}
			} catch (error) {
				console.error("Failed to fetch leaderboard:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, []);

	return (
		<header>
			{/* Header */}
			<div className="flex items-center p-3 pb-2 mb-2 border-b-2 border-[var(--glow-cyan)]">
				<div className="shrink-0 w-8 text-center">
					<span className="text-[var(--glow-cyan)] font-bold text-xs uppercase tracking-widest">
						#
					</span>
				</div>

				<div className="flex-1 px-4 min-w-max">
					<span className="text-[var(--glow-cyan)] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
						{t("landing.leaderboard.player") || "Joueur"}
					</span>
				</div>

				<div className="shrink-0 px-2 text-right min-w-max">
					<span className="text-[var(--glow-cyan)] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
						{t("landing.leaderboard.score") || "Score"}
					</span>
				</div>
			</div>

			{/* Rows */}
				{loading ? (
					<div className="text-(--txt-soft) text-center p-5 italic">
						{t("landing.dashboard.leaderboard.loading")}
					</div>
				) : players.length === 0 ? (
					<div className="text-(--txt-soft) text-center p-5 italic">
						{t("landing.dashboard.leaderboard.empty") || "Pas de joueurs"}
					</div>
				) : (
					players.map((player, index) => (
						<div
							key={player.id}
							className={leaderboardRow}
							onClick={() => setSelectedPlayer(player)}
						>
							{/* Rang */}
							<div className="w-8 text-center">
								<span className="text-[var(--glow-cyan)] font-bold">#{index + 1}</span>
							</div>

							{/* Avatar */}
							<div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
								{player.avatarUrl ? (
									<img
										src={player.avatarUrl}
										alt={player.username}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-[rgba(0,229,255,0.2)] flex items-center justify-center">
										<span className="text-sm text-[var(--glow-cyan)] font-bold">
											{player.username[0]?.toUpperCase()}
										</span>
									</div>
								)}
							</div>

							{/* Pseudo */}
							<div className="flex-1 min-w-0">
								<p className="text-white truncate font-['Orbitron',sans-serif] font-semibold">
									{player.username}
								</p>
							</div>

							{/* Score */}
							<div className="text-right flex-shrink-0">
								<span className="text-[var(--glow-pink)] font-bold text-lg">
									{player.soloBestScore}
								</span>
							</div>
						</div>
					))
				)}

			<PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
		</header>
	);
}
