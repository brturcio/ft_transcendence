import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AchievementCard } from "./AchievementCard";
import { type Achievement, getAchievement } from "../constants/achievements";
import { API_BASE_URL, resolveMediaUrl } from "../config/network";
import { useGlobalPresence, type UserStatus } from "../realtime/useGlobalPresence";

const AUTH_TOKEN_KEY = "ft_auth_token";

type LeaderboardEntry = {
	id: string;
	username: string;
	avatarUrl: string | null;
	soloBestScore: number;
	status?: UserStatus;
};

type PlayerModalProps = {
	player: LeaderboardEntry | null;
	onClose: () => void;
};

type PlayerProfile = {
	username: string;
	avatarUrl: string | null;
	bio: string;
	status?: UserStatus;
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

const statusConfig: Record<UserStatus, { dot: string; text: string; labelKey: string }> = {
	ONLINE: { dot: "bg-green-500", text: "text-green-500", labelKey: "profile.friends.status.online"  },
	OFFLINE: { dot: "bg-red-500", text: "text-red-500", labelKey: "profile.friends.status.offline" },
	INGAME: { dot: "bg-purple-500", text: "text-purple-400", labelKey: "profile.friends.status.inGame" },
};

export default function PlayerModal({ player, onClose }: PlayerModalProps) {
	// All hooks must be declared at the top, unconditionally
	const { t } = useTranslation();
	const [profile, setProfile] = useState<PlayerProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [isSendingRequest, setIsSendingRequest] = useState(false);
	const [requestSent, setRequestSent] = useState(false);
	const [requestError, setRequestError] = useState("");
	const [myId, setMyId] = useState<string | null>(null);

	const avatarSrc = resolveMediaUrl(profile?.avatarUrl ?? null);
	const realtimeStatuses = useGlobalPresence();
	const getFriendRequestErrorMessage = (errorCode?: string) => {
		if (errorCode === "INVALID_FRIEND_REQUEST") return t("profile.playerModal.errors.invalidRequest");
		if (errorCode === "USER_NOT_FOUND") return t("profile.playerModal.errors.userNotFound");
		if (errorCode === "FRIENDSHIP_BLOCKED") return t("profile.playerModal.errors.blocked");
		if (errorCode === "FRIENDSHIP_EXISTS") return t("profile.playerModal.errors.alreadyFriends");
		if (errorCode === "FRIEND_REQUEST_EXISTS") return t("profile.playerModal.errors.requestExists");
		return t("profile.playerModal.sendError");
	};

	// Fetch player profile
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
		setRequestSent(false);
		setRequestError("");
	}, [player]);

	// Load current user ID
	useEffect(() => {
		const userData = localStorage.getItem("ft_user");
		if (userData) {
			try {
				const parsed = JSON.parse(userData);
				setMyId(parsed.id);
			} catch (e) {
				console.error("Erreur lecture utilisateur:", e);
			}
		}
	}, []);

	// Return early only after all hooks are called
	if (!player) return null;

	const handleAddFriend = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) return;

		setIsSendingRequest(true);
		setRequestError("");

		try {
			const response = await fetch(`${API_BASE_URL}/friends/requests`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ addresseeId: player.id }),
			});
			let data;
			try {
				data = await response.json();
			} catch (e) {
				data = {};
			}

			if (response.ok) setRequestSent(true);
			else setRequestError(getFriendRequestErrorMessage(data?.error));
		} catch (error) {
			console.error("Add friend error", error);
			setRequestError(t("profile.playerModal.networkError"));
		} finally {
			setIsSendingRequest(false);
		}
	};

	const unlockedAchievementItems = (profile?.unlockedAchievements ?? [])
		.map((achievementId) => getAchievement(achievementId))
		.filter((achievement): achievement is Achievement => Boolean(achievement));

	const currentStatusId = player?.id || "";
	const displayStatus = (realtimeStatuses.statuses[currentStatusId] ?? profile?.status ?? "OFFLINE") as UserStatus;
	const config = statusConfig[displayStatus];
	return (
		<div
			className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 overflow-y-auto"
			onClick={onClose}
		>
			<div
				className="bg-[rgba(9,18,40,0.95)] border border-[rgba(110, 209, 255, 0.51)] rounded-lg p-8 max-w-2xl w-full animate-[intro-up_300ms_ease]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-[var(--glow-cyan)] text-xl font-['Orbitron',sans-serif] uppercase tracking-[0.06rem]">
						{t("profile.title")}
					</h2>
					<button
						onClick={onClose}
						className="text-[var(--txt-soft)] hover:text-[var(--glow-cyan)] text-2xl transition-colors"
					>
						×
					</button>
				</div>

				{loading ? (
					<div className="text-center text-[var(--txt-soft)] py-12">{t("profile.messages.loading")}</div>
				) : profile ? (
					<div className="space-y-6">
						<div className="flex items-center gap-6">
							<div className="relative">
								{avatarSrc ? (
									<img
										src={avatarSrc}
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
								<span
									className={`absolute bottom-0 right-1 w-5 h-5 rounded-full border-4 border-[rgba(9,18,40,0.95)] ${config.dot}`}
								></span>
							</div>

							<div className="flex-1">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-white font-bold text-2xl mb-1 flex items-center gap-3">
											{profile.username}
											<span
												className={`text-[12px] font-bold tracking-wider uppercase ${config.text}`}
											>
												{t(config.labelKey)}
											</span>
										</h3>
										<p className="text-[var(--glow-cyan)] text-sm">
											{t("profile.level")} {profile.stats.gamification.level}
										</p>
									</div>

									{myId && player.id !== myId && (
										<div className="flex flex-col items-end">
											<button
												onClick={handleAddFriend}
												disabled={isSendingRequest || requestSent}
												className={`px-4 py-2 rounded-lg font-['Orbitron',sans-serif] text-sm uppercase tracking-wider font-bold transition-all ${
													requestSent
														? "bg-[rgba(0,229,255,0.1)] text-[var(--glow-cyan)] border border-[var(--glow-cyan)] opacity-70 cursor-not-allowed"
														: "bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
												}`}
											>
												{requestSent
													? t("profile.playerModal.requestSent")
													: isSendingRequest
														? t("profile.playerModal.sending")
														: t("profile.playerModal.addFriend")}
											</button>
											{requestError && (
												<span className="text-red-400 text-xs mt-1">{requestError}</span>
											)}
										</div>
									)}
								</div>

								{profile.bio && (
									<p className="text-[var(--txt-soft)] text-sm italic mt-2">{profile.bio}</p>
								)}
							</div>
						</div>

						<div className="border-t border-[rgba(110,210,255,0.18)] pt-4">
							<h4 className="text-[var(--glow-cyan)] font-bold mb-3 text-sm uppercase">
								{t("profile.stats.soloTitle")}
							</h4>
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-[rgba(0,229,255,0.05)] p-3 rounded">
									<p className="text-[var(--txt-soft)] text-xs">{t("profile.stats.bestScore")}</p>
									<p className="text-[var(--glow-pink)] font-bold text-lg">
										{profile.stats.solo.bestScore}
									</p>
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
							className="w-full mt-6 h-[42px] bg-transparent border border-[var(--glow-cyan)] text-[var(--glow-cyan)] font-bold rounded-lg font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] hover:bg-[rgba(0,229,255,0.1)] transition-colors"
						>
							{t("profile.actions.close")}
						</button>
					</div>
				) : (
					<div className="text-center text-[var(--txt-soft)] py-12">{t("profile.messages.notFound")}</div>
				)}
			</div>
		</div>
	);
}
