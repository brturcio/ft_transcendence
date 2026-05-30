import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AchievementCard } from "./AchievementCard";
import { type Achievement, getAchievement } from "../constants/achievements";

type LeaderboardEntry = {
	id: string;
	username: string;
	avatarUrl: string | null;
	soloBestScore: number;
};

type PlayerModalProps = {
	player: LeaderboardEntry | null;
	onClose: () => void;
};

type PlayerProfile = {
	username: string;
	avatarUrl: string | null;
	bio: string;
	stats: {
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
	unlockedAchievements: string[];
};

export default function PlayerModal({ player, onClose }: PlayerModalProps) {
	const { t } = useTranslation();
	const [profile, setProfile] = useState<PlayerProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

	useEffect(() => {
		if (!player) return;

		const fetchProfile = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/users/${player.id}`);
				if (response.ok) {
					const result = await response.json();
					setProfile(result.data);
				}
			} catch (error) {
				console.error("Failed to fetch player profile:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [player]);

	if (!player) return null;

	const unlockedAchievementItems = (profile?.unlockedAchievements ?? [])
		.map((achievementId) => getAchievement(achievementId))
		.filter((achievement): achievement is Achievement => Boolean(achievement));

	return (
		<div
			className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 overflow-y-auto"
			onClick={onClose}
		>
			<div
				className="bg-[rgba(9,18,40,0.95)] border border-[rgba(110, 209, 255, 0.51)] rounded-lg p-8 max-w-2xl w-full mx-4 my-8 animate-[intro-up_300ms_ease]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-[var(--glow-cyan)] text-xl font-['Orbitron',sans-serif] uppercase tracking-[0.06rem]">
						{t("profile.title") || "Profil"}
					</h2>
					<button
						onClick={onClose}
						className="text-[var(--txt-soft)] hover:text-[var(--glow-cyan)] text-2xl transition-colors"
					>
						×
					</button>
				</div>

				{loading ? (
					<div className="text-center text-[var(--txt-soft)] py-12">
						{t("profile.messages.loading")}
					</div>
				) : profile ? (
					<div className="space-y-6">
						{/* Avatar et pseudo */}
						<div className="flex items-center gap-6">
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.username}
									className="w-20 h-20 rounded-full object-cover flex-shrink-0"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-[rgba(0,229,255,0.2)] flex items-center justify-center flex-shrink-0">
									<span className="text-3xl text-[var(--glow-cyan)] font-bold">
										{profile.username[0]?.toUpperCase()}
									</span>
								</div>
							)}
							<div className="flex-1">
								<h3 className="text-white font-bold text-2xl mb-1">{profile.username}</h3>
								<p className="text-[var(--glow-cyan)] text-sm">
									{t("profile.level")} {profile.stats.gamification.level}
								</p>
								{profile.bio && (
									<p className="text-[var(--txt-soft)] text-sm italic mt-2">{profile.bio}</p>
								)}
							</div>
						</div>

						{/* Solo Stats */}
						<div className="border-t border-[rgba(110,210,255,0.18)] pt-4">
							<h4 className="text-[var(--glow-cyan)] font-bold mb-3 text-sm uppercase">
								{t("profile.stats.soloTitle")}
							</h4>
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-[rgba(0,229,255,0.05)] p-3 rounded">
									<p className="text-[var(--txt-soft)] text-xs">{t("profile.stats.bestScore")}</p>
									<p className="text-[var(--glow-pink)] font-bold text-lg">{profile.stats.solo.bestScore}</p>
								</div>
								<div className="bg-[rgba(0,229,255,0.05)] p-3 rounded">
									<p className="text-[var(--txt-soft)] text-xs">{t("profile.stats.games")}</p>
									<p className="text-white font-bold">{profile.stats.solo.gamesPlayed}</p>
								</div>
								<div className="bg-[rgba(0,229,255,0.05)] p-3 rounded">
									<p className="text-[var(--txt-soft)] text-xs">{t("profile.stats.lines")}</p>
									<p className="text-white font-bold">{profile.stats.solo.linesCompleted}</p>
								</div>
								<div className="bg-[rgba(0,229,255,0.05)] p-3 rounded">
									<p className="text-[var(--txt-soft)] text-xs">{t("profile.stats.tetrises")}</p>
									<p className="text-white font-bold">{profile.stats.solo.tetrises}</p>
								</div>
							</div>
						</div>

						{/* Gamification */}
						<div className="border-t border-[rgba(110,210,255,0.18)] pt-4">
							<div className="flex gap-4">
								<div className="flex-1 bg-[rgba(0,229,255,0.05)] p-4 rounded">
									<p className="text-[var(--txt-soft)] text-xs mb-1">{t("profile.xp")}</p>
									<p className="text-[var(--glow-cyan)] font-bold text-xl">{profile.stats.gamification.xp}</p>
								</div>
								<div className="flex-1 bg-[rgba(255,62,136,0.05)] p-4 rounded">
									<p className="text-[var(--txt-soft)] text-xs mb-1">{t("profile.level")}</p>
									<p className="text-[var(--glow-pink)] font-bold text-xl">{profile.stats.gamification.level}</p>
								</div>
							</div>
						</div>

						{/* Achievements */}
						{unlockedAchievementItems.length > 0 && (
							<div className="border-t border-[rgba(110,210,255,0.18)] pt-4">
								<h4 className="text-[var(--glow-cyan)] font-bold mb-3 text-sm uppercase">
									{t("profile.achievements.title")} ({unlockedAchievementItems.length})
								</h4>
								<div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 max-h-56 overflow-auto pr-2">
									{unlockedAchievementItems.map((achievement) => (
										<AchievementCard key={achievement.id} achievement={achievement} unlocked />
									))}
								</div>
							</div>
						)}

						<button
							onClick={onClose}
							className="w-full mt-6 h-[42px] bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] font-bold rounded-lg font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] hover:shadow-[0_0_24px_rgba(0,229,255,0.5)] transition-shadow"
						>
							{t("profile.actions.close")}
						</button>
					</div>
				) : (
					<div className="text-center text-[var(--txt-soft)] py-12">
						{t("profile.messages.notFound")}
					</div>
				)}
			</div>
		</div>
	);
}
