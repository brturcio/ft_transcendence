import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AchievementsGrid } from "../components/AchievementCard.tsx";
import { unlockAchievement } from "../components/Achievements.tsx";
import { useTranslation } from "react-i18next";

const card = "bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.18)] rounded-[14px] p-5 shadow-none";
const label =
	"font-['Rajdhani',sans-serif] text-[0.95rem] text-[var(--txt-soft)] font-semibold uppercase tracking-[0.05rem]";
const field =
	"bg-[rgba(14,22,48,0.78)] border border-[rgba(110,210,255,0.24)] rounded-xl py-[14px] px-4 text-[var(--txt-main)] font-['Rajdhani',sans-serif] text-base resize-y focus:outline-none focus:border-[var(--glow-cyan)] focus:shadow-[0_0_18px_rgba(0,229,255,0.18)]";
const actionButton =
	"border-0 rounded-xl py-4 px-6 text-[#021318] font-['Orbitron',sans-serif] text-[0.95rem] font-bold uppercase tracking-[0.04rem] cursor-pointer transition-all duration-300 flex-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const PROFILE_ENDPOINT = `${API_BASE_URL}/users/me`;
const ACHIEVEMENTS_ENDPOINT = `${API_BASE_URL}/achievements/me`;

type ProfileStats = {
	games: number;
	wins: number;
	winRate: string;
};

type ProfileData = {
	username: string;
	email: string;
	bio: string;
	rank: string;
	stats: ProfileStats;
	unlockedAchievements?: string[];
};

type BackendProfile = {
	username?: string;
	userName?: string;
	login?: string;
	email?: string;
	bio?: string;
	rank?: number | string;
	stats?: {
		games?: number;
		wins?: number;
		winRate?: number | string;
	};
	unlockedAchievements?: string[];
};

type BackendAchievements = {
	achievements?: string[];
};

const DEFAULT_PROFILE: ProfileData = {
	username: "",
	email: "",
	bio: "",
	rank: "-",
	stats: {
		games: 0,
		wins: 0,
		winRate: "0%",
	},
	unlockedAchievements: [],
};

function formatWinRate(value: number | string | undefined): string {
	if (typeof value === "number") {
		return `${Math.round(value)}%`;
	}

	if (typeof value === "string" && value.trim() !== "") {
		return value.includes("%") ? value : `${value}%`;
	}

	return "0%";
}

function mapBackendProfile(data: BackendProfile): ProfileData {
	const username = data.username ?? data.userName ?? data.login ?? "";
	const email = data.email ?? "";

	return {
		username,
		email,
		bio: data.bio ?? "",
		rank: data.rank !== undefined ? String(data.rank) : "-",
		stats: {
			games: data.stats?.games ?? 0,
			wins: data.stats?.wins ?? 0,
			winRate: formatWinRate(data.stats?.winRate),
		},
		unlockedAchievements: data.unlockedAchievements ?? [],
	};
}

function getAvatarInitial(username: string, email: string): string {
	if (username.trim()) {
		return username[0].toUpperCase();
	}

	if (email.trim()) {
		return email[0].toUpperCase();
	}

	return "?";
}

type ProfileProps = {
	onLogout: () => void;
};

export default function Profile({ onLogout }: ProfileProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
	const [savedUsername, setSavedUsername] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [saveMessage, setSaveMessage] = useState("");

	const getBackendError = async (response: Response) => {
		try {
			const data = await response.json();
			return typeof data?.error === "string" ? data.error : undefined;
		} catch {
			return undefined;
		}
	};

	const handleInvalidSession = () => {
		onLogout();
		navigate("/login", { replace: true });
	};

	const refreshAchievements = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			return;
		}
		const achievementsResponse = await fetch(ACHIEVEMENTS_ENDPOINT, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
		if (!achievementsResponse.ok) {
			return;
		}
		const achievementsData: BackendAchievements = await achievementsResponse.json();
		setProfile((current) => ({
			...current,
			unlockedAchievements: achievementsData.achievements ?? [],
		}));
	};

	useEffect(() => {
		const controller = new AbortController();
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		async function fetchProfile() {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const response = await fetch(PROFILE_ENDPOINT, {
					headers: {
						"Content-Type": "application/json",
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					const backendError = await getBackendError(response);
					if (
						backendError === "MISSING_TOKEN" ||
						backendError === "INVALID_TOKEN" ||
						backendError === "USER_NOT_FOUND"
					) {
						handleInvalidSession();
						return;
					}
					setErrorMessage(t("profile.messages.loadError"));
					return;
				}

				const data: BackendProfile = await response.json();
				const mappedProfile = mapBackendProfile(data);
				setSavedUsername(mappedProfile.username);
				const achievementsResponse = await fetch(ACHIEVEMENTS_ENDPOINT, {
					headers: {
						"Content-Type": "application/json",
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: controller.signal,
				});
				if (achievementsResponse.ok) {
					const achievementsData: BackendAchievements = await achievementsResponse.json();
					setProfile({
						...mappedProfile,
						unlockedAchievements: achievementsData.achievements ?? [],
					});
					return;
				}
				setProfile(mappedProfile);
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				if (error instanceof TypeError) {
					setErrorMessage(t("profile.messages.networkError"));
					return;
				}
				setErrorMessage(t("profile.messages.loadError"));
			} finally {
				setIsLoading(false);
			}
		}

		void fetchProfile();

		return () => controller.abort();
	}, []);

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		setIsSaving(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const response = await fetch(PROFILE_ENDPOINT, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					username: profile.username,
					bio: profile.bio,
				}),
			});

			if (!response.ok) {
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				if (backendError === "VALIDATION_ERROR") {
					setErrorMessage(t("profile.messages.validationError"));
					return;
				}
				if (backendError === "USERNAME_TAKEN") {
					setErrorMessage(t("profile.messages.usernameTaken"));
					return;
				}
				setErrorMessage(t("profile.messages.saveError"));
				return;
			}
			const data: BackendProfile = await response.json();
			const updatedProfile = mapBackendProfile(data);
			setProfile((current) => ({
				...updatedProfile,
				unlockedAchievements: current.unlockedAchievements ?? [],
			}));
			setSaveMessage(t("profile.messages.updated"));
			if (savedUsername !== "" && savedUsername !== updatedProfile.username) {
				const unlocked = await unlockAchievement("change_nickname");
				if (unlocked) {
					await refreshAchievements();
				}
			}
			setSavedUsername(updatedProfile.username);
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.saveError"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		if (!window.confirm(t("profile.messages.deleteConfirm"))) {
			return;
		}

		setIsDeleting(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const response = await fetch(PROFILE_ENDPOINT, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});

			if (!response.ok) {
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				setErrorMessage(t("profile.messages.deleteError"));
				return;
			}
			onLogout();
			navigate("/login", { replace: true });
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.deleteError"));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="profile-page ">
			<main className="pt-14 px-6 pb-0 flex flex-col max-w-215 mx-auto gap-5 max-[980px]:pt-8 max-[980px]:px-2">
				<section className="max-w-160 grid gap-2.5">
					<h1 className="font-['Orbitron',sans-serif] text-[clamp(1.9rem,4vw,3rem)] uppercase text-shadow:none">
						{t("profile.title")}
					</h1>
				</section>

				<section className={`${card} flex items-center gap-4.5 max-w-full max-[720px]:items-start`}>
					<div className="w-18 h-18 rounded-full grid place-items-center bg-[rgba(255,255,255,0.12)] text-(--txt-main) font-['Orbitron',sans-serif] text-[1.7rem] font-bold">
						{getAvatarInitial(profile.username, profile.email)}
					</div>
					<div className="grid gap-1">
						<h2 className="font-['Orbitron',sans-serif] text-[1.35rem] text-(--txt-main) m-0">
							{profile.username || t("profile.fallback.username")}
						</h2>
						<p className="text-(--txt-soft) text-[0.98rem]">
							{profile.email || t("profile.fallback.email")}
						</p>
						<span className="text-(--txt-soft) text-[0.98rem]">
							{t("profile.summary.rankPrefix")}
							{profile.rank}
						</span>
					</div>
				</section>

				<form className={`${card} grid gap-4`} onSubmit={handleSave}>
					<div className="flex flex-col gap-2">
						<label className={label} htmlFor="profile-username">
							{t("profile.fields.username")}
						</label>
						<input
							className={field}
							id="profile-username"
							type="text"
							placeholder={t("profile.fields.username")}
							value={profile.username}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									username: event.target.value,
								}))
							}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label className={label} htmlFor="profile-bio">
							{t("profile.fields.bio")}
						</label>
						<textarea
							className={field}
							id="profile-bio"
							rows={4}
							placeholder={t("profile.fields.bioPlaceholder")}
							value={profile.bio}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									bio: event.target.value,
								}))
							}
						/>
					</div>

					<div className="flex justify-center p-2.5">
						<button
							type="submit"
							className={`${actionButton} mr-2.5 bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)]`}
							disabled={isSaving || isDeleting}
						>
							{isSaving ? t("profile.actions.saving") : t("profile.actions.save")}
						</button>

						<button
							type="button"
							className={`${actionButton} bg-[linear-gradient(95deg,#ff4d4f,#ff1744)] shadow-[0_0_15px_rgba(255,62,136,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,62,136,0.4)]`}
							onClick={handleDeleteAccount}
							disabled={isSaving || isDeleting}
						>
							{isDeleting ? t("profile.actions.deleting") : t("profile.actions.delete")}
						</button>
					</div>

					{saveMessage && <p>{saveMessage}</p>}
					{errorMessage && <p>{errorMessage}</p>}
				</form>

				{isLoading && <p>{t("profile.messages.loading")}</p>}

				<section className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
					<div className="bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.14)] rounded-[14px] p-4 text-center grid gap-1.5">
						<strong className="font-['Orbitron',sans-serif] text-2xl text-(--txt-main)">
							{profile.stats.games}
						</strong>
						<span className="text-(--txt-soft) text-[0.95rem]">{t("profile.stats.games")}</span>
					</div>
					<div className="bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.14)] rounded-[14px] p-4 text-center grid gap-1.5">
						<strong className="font-['Orbitron',sans-serif] text-2xl text-(--txt-main)">
							{profile.stats.wins}
						</strong>
						<span className="text-(--txt-soft) text-[0.95rem]">{t("profile.stats.wins")}</span>
					</div>
					<div className="bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.14)] rounded-[14px] p-4 text-center grid gap-1.5">
						<strong className="font-['Orbitron',sans-serif] text-2xl text-(--txt-main)">
							{profile.stats.winRate}
						</strong>
						<span className="text-(--txt-soft) text-[0.95rem]">{t("profile.stats.winRate")}</span>
					</div>
				</section>

				<section className={card}>
					<h2 className="font-['Orbitron',sans-serif] text-(--txt-main) mb-4">
						{t("profile.achievements.title")}
					</h2>
					<AchievementsGrid
						backendUnlockedIds={profile.unlockedAchievements ?? []}
						onAchievementUnlocked={refreshAchievements}
					/>
				</section>
			</main>
		</div>
	);
}
